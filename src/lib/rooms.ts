import { RoomConfig } from '../types';

export const ROOMS: RoomConfig[] = [

  // ── TRAVEL ──────────────────────────────────────────────────────────────────
  {
    slug:     'the-departure',
    name:     'The Departure',
    emotion:  'Anticipatory restlessness',
    category: 'travel',
    theme:    { bg: '#0A0804', accent: '#E8A830', text: '#DDCCAA' },
    cards: {
      quote: "you packed everything except the feeling that you're ready.",
      ghost: "gate B7, 45 minutes to boarding — 5:12am",
    },
    prompts: {
      image: "empty international airport terminal at golden hour, warm amber light flooding through floor-to-ceiling windows, single figure with luggage",
      video: "slow descent on airport escalator into vast empty departure hall, early morning quiet, amber light",
      audio: "distant gate announcements echoing, rolling luggage on marble floor, ambient terminal hum, anticipatory tension",
    },
  },

  {
    slug:     'the-transit',
    name:     'The Transit',
    emotion:  'Suspended between places',
    category: 'travel',
    theme:    { bg: '#050810', accent: '#7BA8C4', text: '#AABBCC' },
    cards: {
      quote: "somewhere between here and there, nothing is required of you.",
      ghost: "window seat 14F, somewhere over the clouds — hour 4",
    },
    prompts: {
      image: "train window at night, city lights blurring past, face reflected faintly in dark glass, blue-grey tones",
      video: "dark landscape moving past train window, hypnotic rhythm, late blue light streaking",
      audio: "train wheels on rails, steady rhythmic pulse, white noise of motion, suspended time",
    },
  },

  // ── MOVIES ──────────────────────────────────────────────────────────────────
  {
    slug:     'the-last-row',
    name:     'The Last Row',
    emotion:  'Absorbed silence',
    category: 'movies',
    theme:    { bg: '#0A0404', accent: '#C84040', text: '#CCAAAA' },
    cards: {
      quote: "you forgot you were watching. then the credits came.",
      ghost: "row J seat 7 — the only one who stayed",
    },
    prompts: {
      image: "empty cinema from the very back row, single screen glow in total darkness, one silhouette in the front",
      video: "projector beam cutting through dark theatre air, slow pan, dust floating in light",
      audio: "film score swelling in empty theatre, complete silence around it, perfect absorption",
    },
  },

  {
    slug:     'the-projector',
    name:     'The Projector',
    emotion:  'Flickering nostalgia',
    category: 'movies',
    theme:    { bg: '#0A0804', accent: '#C8904A', text: '#DDC8AA' },
    cards: {
      quote: "the film remembered things you forgot you knew.",
      ghost: "projection booth — 11:42pm, second screening",
    },
    prompts: {
      image: "vintage film projector in dark projection booth, warm amber beam cutting through darkness, grain and warmth",
      video: "close up of film reel spinning, flickering light and shadow, warm celluloid texture",
      audio: "projector hum and reel click, film grain crackle, a score fading to silence, nostalgic warmth",
    },
  },

  // ── MUSIC ───────────────────────────────────────────────────────────────────
  {
    slug:     'the-rehearsal',
    name:     'The Rehearsal',
    emotion:  'Restless focus',
    category: 'music',
    theme:    { bg: '#050A02', accent: '#A0D830', text: '#C8DDAA' },
    cards: {
      quote: "the same eight bars, over and over, until they mean something.",
      ghost: "studio B — 2:17am, still going",
    },
    prompts: {
      image: "empty rehearsal room at night, instruments leaning against walls, harsh fluorescent light, cables on floor",
      video: "close up of hands on guitar frets, restless repetition, fluorescent flicker, late night energy",
      audio: "lone instrument in reverberant empty room, repeated phrase, late night silence between notes",
    },
  },

  {
    slug:     'the-vinyl',
    name:     'The Vinyl',
    emotion:  'Worn familiarity',
    category: 'music',
    theme:    { bg: '#080508', accent: '#9060C8', text: '#BBAACC' },
    cards: {
      quote: "you know every skip and crackle. that's the song now.",
      ghost: "side B track 4 — played until the grooves wore thin",
    },
    prompts: {
      image: "vinyl record on turntable, needle in groove, warm lamp light, close shallow depth of field",
      video: "record spinning slowly, label blurring into smooth rotation, hypnotic close up",
      audio: "vinyl surface crackle and hiss, warm familiar melody underneath, worn groove texture",
    },
  },

];

export const ROOMS_BY_CATEGORY = {
  travel: ROOMS.filter(r => r.category === 'travel'),
  movies: ROOMS.filter(r => r.category === 'movies'),
  music:  ROOMS.filter(r => r.category === 'music'),
};
