import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA2TRN8W2887EX0uINr9A7fAY_MbNZj0cU';
const ai = new GoogleGenAI({ apiKey });

/**
 * Wraps raw PCM audio data (from Gemini TTS) in a proper WAV header
 * so browsers can play it. Gemini TTS returns 24kHz, mono, 16-bit PCM.
 */
function wrapPcmInWav(pcmBase64: string, sampleRate = 24000, numChannels = 1, bitsPerSample = 16, maxSeconds = 8): string {
  const fullPcm = Buffer.from(pcmBase64, 'base64');
  // Trim to maxSeconds worth of audio (24kHz × 2 bytes × maxSeconds)
  const maxBytes = sampleRate * (bitsPerSample / 8) * numChannels * maxSeconds;
  const pcmBytes = fullPcm.length > maxBytes ? fullPcm.subarray(0, maxBytes) : fullPcm;
  const dataLength = pcmBytes.length;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);

  // WAV header is 44 bytes
  const header = Buffer.alloc(44);

  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataLength, 4); // File size - 8
  header.write('WAVE', 8);

  // fmt sub-chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);             // Sub-chunk size (16 for PCM)
  header.writeUInt16LE(1, 20);              // Audio format (1 = PCM)
  header.writeUInt16LE(numChannels, 22);    // Number of channels
  header.writeUInt32LE(sampleRate, 24);     // Sample rate
  header.writeUInt32LE(byteRate, 28);       // Byte rate
  header.writeUInt16LE(blockAlign, 32);     // Block align
  header.writeUInt16LE(bitsPerSample, 34);  // Bits per sample

  // data sub-chunk
  header.write('data', 36);
  header.writeUInt32LE(dataLength, 40);     // Data size

  const wavBuffer = Buffer.concat([header, pcmBytes]);
  return wavBuffer.toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: `Whisper this very slowly in 5 words or fewer: ${prompt}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      // Wrap raw PCM in WAV header so browsers can play it
      const wavBase64 = wrapPcmInWav(base64Audio);
      const dataUrl = `data:audio/wav;base64,${wavBase64}`;
      return NextResponse.json({ audioUrl: dataUrl });
    }

    return NextResponse.json({ error: 'No audio generated' }, { status: 500 });
  } catch (error) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate audio' },
      { status: 500 }
    );
  }
}
