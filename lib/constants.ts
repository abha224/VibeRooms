import { RoomConfig, SessionPrefs, VibeCategory, RoomSlug } from './types';
import { CardType } from './types';

// ─── Category Configuration ─────────────────────────────────

export interface CategoryConfig {
  id: VibeCategory;
  label: string;
  question: string;
  samplePrompts: string[];
  rooms: RoomSlug[];
  keywords: Record<RoomSlug, string[]>; // keyword → room routing
}

export const CATEGORIES: CategoryConfig[] = [
  {
    id: 'travel',
    label: 'Travel',
    question: 'what are you carrying from the last place you left?',
    samplePrompts: [
      'a place that changed you without warning',
      'the quiet before departure',
      'somewhere you left a piece of yourself',
      'getting lost in a city where you don\'t speak the language',
      'the view from a train window at dawn',
      'a stranger who felt like home',
    ],
    rooms: ['the-departure', 'the-transit'],
    keywords: {
      'the-departure': ['leave', 'go', 'flight', 'airport', 'departure', 'adventure', 'new', 'unknown', 'wander', 'explore', 'lost', 'city', 'stranger', 'change'],
      'the-transit': ['wait', 'between', 'train', 'window', 'dawn', 'quiet', 'pause', 'station', 'passing', 'place', 'piece', 'carry', 'left'],
    } as Record<RoomSlug, string[]>,
  },
  {
    id: 'movies',
    label: 'Movies',
    question: 'what are you carrying from the last thing you watched?',
    samplePrompts: [
      'a film that felt like it was made for you',
      'watching something alone at 2am',
      'a scene you return to without meaning to',
      'the adrenaline of a chase you can still feel',
      'a cult classic nobody else seems to get',
      'rewinding the same VHS tape from your childhood',
    ],
    rooms: ['the-last-row', 'the-projector', 'the-chase', 'the-neon-marquee', 'the-rewind', 'the-fever-dream'],
    keywords: {
      'the-last-row': ['alone', '2am', 'night', 'silence', 'dark', 'quiet', 'solitude', 'explain', 'cry', 'heavy', 'end', 'empty'],
      'the-projector': ['film', 'made', 'scene', 'return', 'story', 'warm', 'light', 'remember', 'less alone', 'credits', 'feeling', 'love'],
      'the-chase': ['chase', 'run', 'thriller', 'tension', 'edge', 'heart', 'fast', 'danger', 'escape', 'crime', 'adrenaline', 'pulse'],
      'the-neon-marquee': ['big', 'premiere', 'excitement', 'blockbuster', 'epic', 'action', 'spectacle', 'hero', 'adventure', 'opening', 'crowd'],
      'the-rewind': ['rewind', 'old', 'classic', 'vintage', 'again', 'tape', 'vhs', 'childhood', 'used to', 'growing up', 'retro', 'comfort'],
      'the-fever-dream': ['dream', 'surreal', 'weird', 'wild', 'unexpected', 'abstract', 'indie', 'strange', 'cult', 'nobody', 'trip', 'bizarre'],
    } as Record<RoomSlug, string[]>,
  },
  {
    id: 'music',
    label: 'Music',
    question: 'what are you carrying from the last thing you heard?',
    samplePrompts: [
      'a song that knows something about you',
      'the first note that made you cry',
      'hearing it again years later',
      'a melody you can\'t place but can\'t forget',
      'the quiet between tracks',
      'a voice that felt like it was speaking only to you',
    ],
    rooms: ['the-rehearsal', 'the-vinyl'],
    keywords: {
      'the-rehearsal': ['note', 'cry', 'voice', 'speak', 'first', 'raw', 'new', 'discover', 'create', 'feel', 'hear'],
      'the-vinyl': ['song', 'again', 'years', 'melody', 'place', 'forget', 'quiet', 'between', 'tracks', 'old', 'warm', 'remember'],
    } as Record<RoomSlug, string[]>,
  },
];

// ─── Room Configurations ────────────────────────────────────

export const ROOMS: Record<string, RoomConfig> = {
  // ── Legacy Rooms (still accessible via URL) ────────────────
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
  },

  // ── Travel Rooms ───────────────────────────────────────────

  'the-departure': {
    slug: 'the-departure',
    name: 'The Departure',
    emotion: 'Wanderlust',
    colorTheme: {
      primary: '#1e3a5f',
      secondary: '#2563eb',
      accent: '#f97316',
      bg: '#0c1524',
    },
    ghostTraces: [
      "The gate is closing. You haven't moved.",
      "Some journeys start the moment you stop looking back.",
      "You packed everything except the reason you're leaving.",
      "The unknown is the only honest destination.",
      "The last thing you hear is your own footsteps."
    ],
    prompts: {
      art: "An empty airport terminal at golden hour, long shadows, a single traveler silhouetted against floor-to-ceiling windows overlooking the tarmac, cinematic, warm and cold tones, masterpiece quality",
      music: "Ambient electronic music with a sense of forward motion, distant airport announcements, hopeful yet melancholic, emotionally rich",
      video: "A plane lifting off at sunset seen through rain-streaked glass, warm orange and deep blue, atmospheric, smooth cinematic camera"
    }
  },
  'the-transit': {
    slug: 'the-transit',
    name: 'The Transit',
    emotion: 'Liminal',
    colorTheme: {
      primary: '#374151',
      secondary: '#6b7280',
      accent: '#a78bfa',
      bg: '#111827',
    },
    ghostTraces: [
      "You are between the places you call yours.",
      "The platform is empty. The next train is always coming.",
      "Time moves differently when you're passing through.",
      "Someone left a book on this seat. You open it.",
      "The window shows a world you'll never enter."
    ],
    prompts: {
      art: "A moody atmospheric train station at night, wet platforms reflecting fluorescent lights, fog rolling in, a lone figure waiting, cinematic noir, masterpiece quality",
      music: "Lo-fi ambient with distant train sounds, rhythmic clicking on rails, meditative and suspended, high production quality",
      video: "Landscape rushing past a rain-streaked train window at twilight, blurred lights and forests, hypnotic and serene, smooth camera"
    }
  },

  // ── Movie Rooms ────────────────────────────────────────────

  'the-last-row': {
    slug: 'the-last-row',
    name: 'The Last Row',
    emotion: 'Solitude',
    colorTheme: {
      primary: '#1c1917',
      secondary: '#292524',
      accent: '#dc2626',
      bg: '#0a0a0a',
    },
    ghostTraces: [
      "The screen is the only light left.",
      "You came here to feel something you couldn't name.",
      "The empty seats are listening too.",
      "Some films are letters to the version of you that exists at 2am.",
      "The projection flickers. So does the memory."
    ],
    prompts: {
      art: "The back row of an empty cinema, a single figure illuminated by the screen's blue glow, dark and intimate, dramatic chiaroscuro, masterpiece, 4K",
      music: "A slow brooding ambient score with deep bass and distant reverb, film noir atmosphere, solitary, emotionally deep",
      video: "Flickering film projector light casting shadows in an empty theater, dust particles visible in the beam, atmospheric, cinematic loop"
    }
  },
  'the-projector': {
    slug: 'the-projector',
    name: 'The Projector',
    emotion: 'Nostalgia',
    colorTheme: {
      primary: '#451a03',
      secondary: '#92400e',
      accent: '#fbbf24',
      bg: '#1a1008',
    },
    ghostTraces: [
      "The reel keeps spinning even after the story ends.",
      "You remember this scene differently every time.",
      "Film burns at 24 frames of someone's truth per second.",
      "The best part was the feeling, not the plot.",
      "Someone made this so you could feel less alone."
    ],
    prompts: {
      art: "A vintage film projector casting warm golden light onto a wall, dust particles dancing in the beam, old movie posters fading in the background, warm sepia tones, nostalgic, masterpiece",
      music: "Warm piano and strings like a classic film score, gentle and full of memory, golden age of cinema atmosphere, emotionally resonant",
      video: "Old film countdown leader with scratches and grain transitioning into a warm amber glow, vintage cinema aesthetic, seamless loop"
    }
  },

  // ── NEW Movie Rooms ────────────────────────────────────────

  'the-chase': {
    slug: 'the-chase',
    name: 'The Chase',
    emotion: 'Tension',
    colorTheme: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      accent: '#e94560',
      bg: '#0a0a12',
    },
    ghostTraces: [
      "Don't look back. They already know.",
      "The footsteps behind you are your own.",
      "Some stories only make sense at full speed.",
      "The exit sign flickers. So does your courage.",
      "You're not running from the film. You're running from what it showed you."
    ],
    prompts: {
      art: "A tense film noir chase scene through rain-soaked streets, long dramatic shadows on wet pavement, a figure running through a tunnel of harsh light, cinematic chiaroscuro, dark thriller aesthetic, 4K masterpiece",
      music: "Tense pulsing electronic soundtrack with staccato strings building suspense, racing heartbeat rhythm, dark thriller atmosphere, high production",
      video: "Fast tracking shot through a dark corridor with flickering fluorescent lights, moving shadows, heart-pounding atmosphere, cinematic, smooth loop"
    }
  },

  'the-neon-marquee': {
    slug: 'the-neon-marquee',
    name: 'The Neon Marquee',
    emotion: 'Energy',
    colorTheme: {
      primary: '#2d1b2e',
      secondary: '#462255',
      accent: '#ff6b35',
      bg: '#120a13',
    },
    ghostTraces: [
      "The biggest screen in the world still can't contain this feeling.",
      "Opening night. Every seat taken. Every heart open.",
      "The lights dim and a hundred strangers become one audience.",
      "This is the film everyone will be talking about tomorrow.",
      "You didn't buy a ticket. You bought an experience."
    ],
    prompts: {
      art: "A grand art deco movie palace facade at night with blazing neon marquee lights, vibrant reds golds and electric oranges, crowds of silhouettes on the sidewalk, cinematic energy, masterpiece, 4K",
      music: "Bold triumphant orchestral theme with driving percussion and brass fanfares, blockbuster movie energy, exciting and grand, cinematic",
      video: "Cascading neon lights flickering on a vintage movie theater marquee, reflections glowing on wet sidewalk, energetic and vibrant, cinematic loop"
    }
  },

  'the-rewind': {
    slug: 'the-rewind',
    name: 'The Rewind',
    emotion: 'Wistful',
    colorTheme: {
      primary: '#2c2416',
      secondary: '#4a3d2c',
      accent: '#7eb8da',
      bg: '#151208',
    },
    ghostTraces: [
      "Be kind, rewind. Be honest, remember.",
      "The tracking lines are just time making itself visible.",
      "You've watched this a hundred times. It changes every time.",
      "The pause button holds the moment hostage.",
      "Somewhere between play and stop is where you actually live."
    ],
    prompts: {
      art: "A VHS tape rewinding in a dimly lit living room, blue TV glow illuminating the wall, retro 90s setup with carpet and old sofa, film grain and static texture, nostalgic and wistful, warm tones, masterpiece",
      music: "Lo-fi synth melody layered with VHS tape hiss and subtle crackle, warm and melancholic, 80s nostalgia, dreamy and distant, emotionally rich",
      video: "VHS tracking lines and static slowly dissolving into a warm blurry childhood memory, soft pastel colors fading in and out, nostalgic, seamless loop"
    }
  },

  'the-fever-dream': {
    slug: 'the-fever-dream',
    name: 'The Fever Dream',
    emotion: 'Rebellion',
    colorTheme: {
      primary: '#1a0a2e',
      secondary: '#2d1655',
      accent: '#00ff88',
      bg: '#0a0512',
    },
    ghostTraces: [
      "The director didn't understand it either. That's the point.",
      "Rules are just suggestions with better PR.",
      "The cult classic doesn't need your approval.",
      "This film broke every convention. Including your expectations.",
      "You don't watch this kind of film. You survive it."
    ],
    prompts: {
      art: "A surreal psychedelic movie scene with distorted perspectives, bold clashing neon colors, David Lynch meets Gaspar Noe aesthetic, abstract faces melting into patterns, indie arthouse film still, masterpiece, 4K",
      music: "Experimental electronic music with distorted vocal fragments, glitchy textures and unexpected tempo changes, rebellious and unpredictable, underground film soundtrack",
      video: "Kaleidoscopic visual patterns morphing into faces and abstract shapes, psychedelic colors pulsing and shifting, surreal and disorienting, art film aesthetic, seamless loop"
    }
  },

  // ── Music Rooms ────────────────────────────────────────────

  'the-rehearsal': {
    slug: 'the-rehearsal',
    name: 'The Rehearsal',
    emotion: 'Discovery',
    colorTheme: {
      primary: '#1e1b4b',
      secondary: '#4338ca',
      accent: '#22d3ee',
      bg: '#0f0d1a',
    },
    ghostTraces: [
      "The first note is always the bravest.",
      "You don't find the song. The song finds you.",
      "Play it wrong enough times and it becomes something new.",
      "The silence before the music is part of the music.",
      "This sound didn't exist until you needed it."
    ],
    prompts: {
      art: "A dimly lit rehearsal room with instruments scattered around, a single spotlight on a microphone, moody blue and cyan tones, raw and intimate, cinematic, masterpiece",
      music: "Raw intimate acoustic sound, a single voice warming up in an empty room, reverb echoing off bare walls, discovery and vulnerability, emotionally resonant",
      video: "Hands moving across piano keys in low blue light, close-up shallow depth of field, dust particles in a cyan spotlight, atmospheric, cinematic loop"
    }
  },
  'the-vinyl': {
    slug: 'the-vinyl',
    name: 'The Vinyl',
    emotion: 'Warmth',
    colorTheme: {
      primary: '#44403c',
      secondary: '#78716c',
      accent: '#e11d48',
      bg: '#1c1917',
    },
    ghostTraces: [
      "The crackle before the song is the sound of time traveling.",
      "Someone pressed this groove decades ago. You're the first to hear it in years.",
      "Analog warmth in a digital world.",
      "The B-side is where the artist hid their truth.",
      "You forgot this existed. It didn't forget you."
    ],
    prompts: {
      art: "A vintage turntable with a spinning vinyl record, warm amber light from a desk lamp, album covers scattered around, cozy and nostalgic, warm color palette, cinematic, masterpiece",
      music: "Warm vintage vinyl crackle with a slow soul melody, bass guitar and soft drums, nostalgic and comforting, analog warmth, emotionally rich",
      video: "A vinyl record spinning on a turntable, needle in the groove, warm lamplight creating amber glow, close-up shallow depth of field, seamless loop"
    }
  },
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
