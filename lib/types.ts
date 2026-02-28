export type RoomSlug = 'echo-chamber' | 'neon-solitude' | 'overgrown-library' | 'midnight-diner' | 'glass-observatory';

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
