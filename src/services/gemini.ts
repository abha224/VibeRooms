import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is missing");
  return new GoogleGenAI({ apiKey });
};

// ── Text (Quote + Ghost Trace) ───────────────────────────────────────────────

export interface RoomText {
  quote: string;
  ghost: string;
}

export const generateRoomText = async (
  roomName: string,
  emotion: string,
  userPrompt: string,
  category: string,
): Promise<RoomText> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You generate short, atmospheric text fragments for a generative mood app called VibeRooms.
The user picked the category "${category}" and typed: "${userPrompt}".
The room they entered is "${roomName}" with emotional tone "${emotion}".

Produce exactly two things:
1. "quote" — a single evocative sentence (under 15 words), lowercase, no punctuation except a final period. Raw, honest, poetic. Must reflect both the user's prompt and the room mood.
2. "ghost" — a short ghost trace (under 10 words): a specific location + a time, e.g. "found it under the stairs — 2:17am". Lowercase.

Respond ONLY with valid JSON: { "quote": "...", "ghost": "..." }`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.95,
        maxOutputTokens: 120,
      },
    });

    const raw = response.text ?? "{}";
    const parsed = JSON.parse(raw) as Partial<RoomText>;
    return {
      quote: parsed.quote ?? "something stayed. something left.",
      ghost: parsed.ghost ?? "unnamed place — unknown time",
    };
  } catch (error) {
    console.error("Text generation failed:", error);
    return {
      quote: "something stayed. something left.",
      ghost: "unnamed place — unknown time",
    };
  }
};

// ── Image ────────────────────────────────────────────────────────────────────

export const generateRoomImage = async (
  prompt: string,
  roomName: string,
  emotion: string
): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            text: `A highly atmospheric, abstract digital art piece representing "${roomName}". The mood is "${emotion}". Style: Ethereal, cinematic, minimalist. Prompt: ${prompt}`,
          },
        ],
      },
      config: {
        imageConfig: { aspectRatio: "1:1" },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned");
  } catch (error) {
    console.error("Image generation failed:", error);
    return "FALLBACK";
  }
};

// ── Video (Veo 2 with operation polling) ─────────────────────────────────────

export const generateRoomVideo = async (
  prompt: string,
  roomName: string,
  emotion: string
): Promise<string> => {
  try {
    const ai = getAI();
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

    let operation = await ai.models.generateVideos({
      model: "veo-2.0-generate-001",
      prompt: `Seamlessly loopable atmospheric cinematic clip. No people. Room: "${roomName}", mood: "${emotion}". ${prompt}`,
      config: {
        aspectRatio: "16:9",
        numberOfVideos: 1,
        durationSeconds: 5,
        personGeneration: "dont_allow",
      },
    });

    // Poll every 10 s — Veo 2 typically takes 30–120 s
    const deadline = Date.now() + 3 * 60_000;
    while (!operation.done) {
      if (Date.now() > deadline) throw new Error("Video generation timed out");
      await new Promise((r) => setTimeout(r, 10_000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) throw new Error("No video URI returned");

    // Append key so the browser can fetch the media without an OAuth token
    const res = await fetch(`${uri}&key=${apiKey}`);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video generation failed:", error);
    return "FALLBACK";
  }
};

// ── Audio (Gemini TTS → PCM → WAV blob URL) ──────────────────────────────────

export const generateRoomAudio = async (
  prompt: string,
  roomName: string,
  emotion: string
): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          parts: [
            {
              text: `Speak slowly and softly, like ambient narration. Describe these sounds as if you are inside the space, pausing between phrases. Room: "${roomName}". Emotion: "${emotion}". Sounds: ${prompt}.`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

    const inlineData =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inlineData?.data) throw new Error("No audio data returned");

    const blob = pcmToWav(inlineData.data, 24_000, 1);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Audio generation failed:", error);
    return "FALLBACK";
  }
};

// ── PCM → WAV helper ─────────────────────────────────────────────────────────
// Gemini TTS returns raw 16-bit little-endian PCM at 24 kHz mono.
// Browsers can't play raw PCM directly, so we prepend a WAV header.

function pcmToWav(
  base64pcm: string,
  sampleRate: number,
  numChannels: number
): Blob {
  const pcm = Uint8Array.from(atob(base64pcm), (c) => c.charCodeAt(0));
  const wavBuffer = new ArrayBuffer(44 + pcm.byteLength);
  const v = new DataView(wavBuffer);

  const str = (offset: number, s: string) =>
    [...s].forEach((c, i) => v.setUint8(offset + i, c.charCodeAt(0)));

  const bps = 16;
  const byteRate = sampleRate * numChannels * (bps / 8);
  const blockAlign = numChannels * (bps / 8);

  str(0, "RIFF");
  v.setUint32(4, 36 + pcm.byteLength, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);        // chunk size
  v.setUint16(20, 1, true);         // PCM format
  v.setUint16(22, numChannels, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, byteRate, true);
  v.setUint16(32, blockAlign, true);
  v.setUint16(34, bps, true);
  str(36, "data");
  v.setUint32(40, pcm.byteLength, true);
  new Uint8Array(wavBuffer, 44).set(pcm);

  return new Blob([wavBuffer], { type: "audio/wav" });
}
