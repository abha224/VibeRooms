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

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        durationSeconds: 8,
        resolution: '720p',
        aspectRatio: '9:16',
      },
    });

    // Poll until done (max ~60s)
    let attempts = 0;
    while (!operation.done && attempts < 12) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
      attempts++;
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
      return NextResponse.json({ error: 'Video generation timed out or failed' }, { status: 500 });
    }

    // Fetch the video and return as base64
    const videoResponse = await fetch(downloadLink, {
      method: 'GET',
      headers: { 'x-goog-api-key': apiKey },
    });

    const buffer = await videoResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:video/mp4;base64,${base64}`;

    return NextResponse.json({ videoUrl: dataUrl });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate video' },
      { status: 500 }
    );
  }
}
