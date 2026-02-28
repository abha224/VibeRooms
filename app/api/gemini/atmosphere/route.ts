import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA2TRN8W2887EX0uINr9A7fAY_MbNZj0cU';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates a short atmospheric art image for a movie recommendation.
 * Used on the discover page to visualize the movie's vibe.
 */
export async function POST(request: NextRequest) {
  try {
    const { prompt, movieTitle } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const enhancedPrompt = `Cinematic movie poster atmosphere: ${prompt}. Film: ${movieTitle || 'unknown'}. Dark, moody, atmospheric, 9:16 aspect ratio, high quality`;

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
