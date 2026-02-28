import { RoomConfig, SessionPrefs } from './types';

export const ROOMS: Record<string, RoomConfig> = {
  'echo-chamber': {
    slug: 'echo-chamber',
    name: 'The Echo Chamber',
    emotion: 'Melancholy',
    colorTheme: {
      primary: '#1e293b',
      secondary: '#475569',
      accent: '#38bdf8',
      bg: '#020617',
    },
    ghostTraces: [
      "I think I left something behind in the silence.",
      "The walls remember the sounds we forgot.",
      "Every whisper eventually finds its way back here.",
      "Do you hear the space between the notes?",
      "It was quieter when you were here."
    ],
    prompts: {
      art: "A minimalist, melancholic abstract painting with shades of deep blue and grey, suggesting empty spaces and fading memories, cinematic lighting, 4k",
      music: "A slow, haunting piano melody with heavy reverb and distant echoes, melancholic and atmospheric",
      video: "Slow motion dust motes dancing in a single beam of light in a dark, empty room, atmospheric, grainy film texture"
    }
  },
  'neon-solitude': {
    slug: 'neon-solitude',
    name: 'Neon Solitude',
    emotion: 'Longing',
    colorTheme: {
      primary: '#4c1d95',
      secondary: '#7c3aed',
      accent: '#f472b6',
      bg: '#0f172a',
    },
    ghostTraces: [
      "The city is loudest when you're alone.",
      "Searching for a face in the rain-slicked streets.",
      "Electric dreams in a digital desert.",
      "Waiting for a signal that never comes.",
      "The neon light doesn't feel warm."
    ],
    prompts: {
      art: "Cyberpunk city street at night, heavy rain, glowing neon signs in pink and purple, lonely figure in the distance, cinematic, blade runner aesthetic",
      music: "Synthwave melody with a lonely, longing tone, echoing electronic pulses, night city vibes",
      video: "Raindrops hitting a window with neon city lights blurred in the background, looping, atmospheric"
    }
  },
  'overgrown-library': {
    slug: 'overgrown-library',
    name: 'The Overgrown Library',
    emotion: 'Peace',
    colorTheme: {
      primary: '#064e3b',
      secondary: '#065f46',
      accent: '#fbbf24',
      bg: '#022c22',
    },
    ghostTraces: [
      "Nature is reclaiming the stories we told.",
      "The books are breathing now.",
      "Silence grows like ivy here.",
      "A thousand lives resting in the moss.",
      "The sun found a way through the ceiling."
    ],
    prompts: {
      art: "An ancient library with vines and flowers growing over bookshelves, sunlight streaming through a broken roof, peaceful, ethereal, studio ghibli style",
      music: "Soft acoustic guitar with birds chirping in the distance, peaceful and organic",
      video: "Slow pan across old books covered in moss with small white flowers blooming between them, sunlight flickering"
    }
  },
  'midnight-diner': {
    slug: 'midnight-diner',
    name: 'Midnight Diner',
    emotion: 'Nostalgia',
    colorTheme: {
      primary: '#451a03',
      secondary: '#78350f',
      accent: '#f59e0b',
      bg: '#1c1917',
    },
    ghostTraces: [
      "The coffee is cold, but the memory is warm.",
      "Everyone here is running from tomorrow.",
      "A jukebox playing songs from a year that never happened.",
      "The smell of rain and old leather.",
      "We were happy here, weren't we?"
    ],
    prompts: {
      art: "A cozy, dimly lit 1950s diner at 3 AM, steam rising from a coffee cup, warm amber lighting, nostalgic, cinematic",
      music: "Low-fi jazz with the sound of rain against a window, warm and nostalgic",
      video: "Steam rising from a cup of coffee on a diner counter, soft focus, warm lighting, looping"
    }
  },
  'glass-observatory': {
    slug: 'glass-observatory',
    name: 'The Glass Observatory',
    emotion: 'Awe',
    colorTheme: {
      primary: '#1e1b4b',
      secondary: '#312e81',
      accent: '#e2e8f0',
      bg: '#030712',
    },
    ghostTraces: [
      "The stars are closer than they look.",
      "We are just fragments of a larger light.",
      "Watching the universe breathe.",
      "The silence of the cosmos is a song.",
      "Infinite space, yet I feel held."
    ],
    prompts: {
      art: "A massive glass dome looking out into a vibrant nebula, stars reflecting on the floor, awe-inspiring, cosmic, 8k",
      music: "Ambient space music with deep drones and shimmering high notes, ethereal and vast",
      video: "A slow-moving nebula with swirling colors and twinkling stars, seen through a glass pane"
    }
  }
};

export const INITIAL_SESSION_PREFS: SessionPrefs = {
  art: 0,
  music: 0,
  video: 0,
  text: 0,
  combo: 0,
};

export const CARD_CYCLE_TYPES: CardType[] = [
  'art', 'text', 'music', 'art', 'text', 'video', 'combo', 'text', 'music', 'art'
];

// Re-export CardType for convenience
import { CardType } from './types';
