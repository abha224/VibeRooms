import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA2TRN8W2887EX0uINr9A7fAY_MbNZj0cU';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a short atmospheric art image for a movie recommendation.
 * Used on the discover page to visualize the movie's vibe.
 * Tries Imagen 4 first, then falls back to Gemini Flash Image.
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, movieTitle } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const enhancedPrompt = `Cinematic movie poster atmosphere for "${movieTitle || 'a film'}": ${prompt}. Dark, moody, atmospheric, dramatic lighting, film grain, masterpiece quality, 4K`;

    // ── Try Imagen 4 first ────────────────────────────────────
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4-generate',
        prompt: enhancedPrompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '9:16',
        },
      });

      const imageData = (response as any).generatedImages?.[0]?.image?.imageBytes;
      if (imageData) {
        return NextResponse.json({ imageUrl: `data:image/png;base64,${imageData}` });
      }
    } catch (e) {
      console.log('Imagen 4 unavailable for atmosphere, falling back...');
    }

    // ── Fallback: Gemini Flash Image ──────────────────────────
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: enhancedPrompt }] }],
      config: {
        imageConfig: {
          aspectRatio: '9:16',
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return NextResponse.json({ imageUrl: `data:image/png;base64,${part.inlineData.data}` });
      }
    }
    return NextResponse.json({ error: 'No image generated' }, { status: 500 });
  } catch (error) {
    console.error('Atmosphere generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate atmosphere' },
      { status: 500 }
    );
  }
}
