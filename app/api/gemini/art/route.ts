import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyA2TRN8W2887EX0uINr9A7fAY_MbNZj0cU';
const ai = new GoogleGenAI({ apiKey });

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

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
