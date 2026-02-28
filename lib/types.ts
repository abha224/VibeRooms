export type RoomSlug =
  // Legacy rooms
  | 'echo-chamber' | 'neon-solitude' | 'overgrown-library' | 'midnight-diner' | 'glass-observatory'
  // Travel rooms
  | 'the-departure' | 'the-transit'
  // Movie rooms
  | 'the-last-row' | 'the-projector' | 'the-chase' | 'the-neon-marquee' | 'the-rewind' | 'the-fever-dream'
  // Music rooms
  | 'the-rehearsal' | 'the-vinyl';

export type VibeCategory = 'travel' | 'movies' | 'music';

export type CardType = 'art' | 'music' | 'video' | 'text' | 'combo';

export interface RoomConfig {
  slug: RoomSlug;
  name: string;
  emotion: string;
  colorTheme: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
  };
  ghostTraces: string[];
  prompts: {
    art: string;
    music: string;
    video: string;
  };
}

export interface CardData {
  id: string;
  type: CardType;
  content?: string;
  mediaUrl?: string;
  isGhost?: boolean;
  timestamp?: string;
  author?: string;
  liked?: boolean;
}

export interface SessionPrefs {
  art: number;
  music: number;
  video: number;
  text: number;
  combo: number;
}

// ─── Vibe Metrics ───────────────────────────────────────────

/** 8-axis emotional vibe vector (0-1 each) */
export interface VibeVector {
  melancholy: number;   // sadness, depth, introspection
  wonder: number;       // awe, discovery, curiosity
  nostalgia: number;    // warmth, memory, comfort
  tension: number;      // suspense, edge, intensity
  energy: number;       // excitement, adventure, rhythm
  serenity: number;     // peace, calm, stillness
  romance: number;      // longing, love, intimacy
  rebellion: number;    // defiance, rawness, independence
}

/** Content modality affinity (0-1 each) */
export interface ModalityAffinity {
  visual: number;   // art + video preference
  auditory: number; // music preference
  textual: number;  // text + combo preference
}

/** Single interaction event for tracking */
export interface InteractionEvent {
  cardId: string;
  cardType: CardType;
  action: 'like' | 'dislike' | 'skip';
  roomSlug: RoomSlug;
  dwellMs: number;      // how long they looked at the card
  timestamp: number;
}

/** Full vibe profile computed from interactions */
export interface VibeProfile {
  vibeVector: VibeVector;
  modalityAffinity: ModalityAffinity;
  dominantEmotion: string;
  engagementScore: number;   // 0-1, how engaged they were overall
  totalInteractions: number;
  entryAnswer: string;       // their original prompt
  roomVisited: RoomSlug;
  interactions: InteractionEvent[];
}

// ─── Movie / Recommendation Types ──────────────────────────

export interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  genres: string[];
  imdbRating: number;
  numVotes?: number;
  tagline: string;
  synopsis: string;
  vibeVector: VibeVector;
  posterPrompt: string;       // prompt to generate atmosphere art
  clipPrompt: string;         // prompt to generate short mood clip
  runtime: number;            // minutes
  cast: string[];
}

export interface MovieRecommendation {
  movie: Movie;
  vibeMatchScore: number;     // 0-1, how well it matches
  matchReason: string;        // human-readable reason
}
