import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || 'API_KEY';
const ai = new GoogleGenAI({ apiKey });

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // ── Try Imagen 4 Ultra first (best image quality available) ──
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4-ultra-generate',
        prompt: prompt,
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
      console.log('Imagen 4 Ultra unavailable, trying Imagen 4...');
    }

    // ── Try Imagen 4 standard ────────────────────────────────────
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4-generate',
        prompt: prompt,
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
      console.log('Imagen 4 unavailable, falling back to Gemini Flash Image');
    }

    // ── Fallback: Gemini 2.5 Flash Image (reliable) ──────────────
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: '9:16',
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const dataUrl = `data:image/png;base64,${part.inlineData.data}`;
        return NextResponse.json({ imageUrl: dataUrl });
      }
    }

    return NextResponse.json({ error: 'No image generated' }, { status: 500 });
  } catch (error) {
    console.error('Art generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate art' },
      { status: 500 }
    );
  }
}
