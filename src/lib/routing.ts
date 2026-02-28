import { Category, RoomSlug } from '../types';
import { ROOMS_BY_CATEGORY } from './rooms';

// ── Keyword maps per category ─────────────────────────────────────────────────

const TRAVEL_KEYWORDS: Record<string, RoomSlug> = {
  // → the-departure
  departure: 'the-departure', airport: 'the-departure', gate:     'the-departure',
  flight:    'the-departure', leaving:  'the-departure', packing:  'the-departure',
  nervous:   'the-departure', anxious:  'the-departure', waiting:  'the-departure',
  early:     'the-departure', morning:  'the-departure', boarding: 'the-departure',
  // → the-transit
  transit:   'the-transit',   train:    'the-transit',   window:   'the-transit',
  between:   'the-transit',   journey:  'the-transit',   moving:   'the-transit',
  floating:  'the-transit',   night:    'the-transit',   alone:    'the-transit',
  hours:     'the-transit',   long:     'the-transit',   clouds:   'the-transit',
};

const MOVIES_KEYWORDS: Record<string, RoomSlug> = {
  // → the-last-row
  cinema:    'the-last-row',  theatre:  'the-last-row',  watching: 'the-last-row',
  alone:     'the-last-row',  silence:  'the-last-row',  credits:  'the-last-row',
  absorbed:  'the-last-row',  dark:     'the-last-row',  stayed:   'the-last-row',
  // → the-projector
  memory:    'the-projector', nostalgic:'the-projector', remember: 'the-projector',
  film:      'the-projector', scene:    'the-projector', feeling:  'the-projector',
  old:       'the-projector', grain:    'the-projector', warmth:   'the-projector',
};

const MUSIC_KEYWORDS: Record<string, RoomSlug> = {
  // → the-rehearsal
  practice:  'the-rehearsal', playing:  'the-rehearsal', writing:  'the-rehearsal',
  making:    'the-rehearsal', restless: 'the-rehearsal', stuck:    'the-rehearsal',
  loop:      'the-rehearsal', repeat:   'the-rehearsal', bars:     'the-rehearsal',
  // → the-vinyl
  album:     'the-vinyl',     record:   'the-vinyl',     familiar: 'the-vinyl',
  always:    'the-vinyl',     comfort:  'the-vinyl',     favourite:'the-vinyl',
  memory:    'the-vinyl',     worn:     'the-vinyl',     know:     'the-vinyl',
};

const CATEGORY_KEYWORDS: Record<Category, Record<string, RoomSlug>> = {
  travel: TRAVEL_KEYWORDS,
  movies: MOVIES_KEYWORDS,
  music:  MUSIC_KEYWORDS,
};

// ── Routing function ─────────────────────────────────────────────────────────

export const getRoomFromPrompt = (prompt: string, category: Category): RoomSlug => {
  const lower    = prompt.toLowerCase();
  const keywords = CATEGORY_KEYWORDS[category];

  for (const [kw, slug] of Object.entries(keywords)) {
    if (lower.includes(kw)) return slug;
  }

  // Time-based tiebreaker within category
  const hour     = new Date().getHours();
  const rooms    = ROOMS_BY_CATEGORY[category];
  const lateNight = hour >= 0 && hour < 6;
  return lateNight ? rooms[1].slug : rooms[Math.floor(Math.random() * rooms.length)].slug;
};
