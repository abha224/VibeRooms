export type RoomSlug = 'the-stairwell' | 'the-greenhouse' | 'the-archive' | 'the-observatory' | 'the-terminal';

export interface RoomConfig {
  slug: RoomSlug;
  name: string;
  emotion: string;
  theme: {
    bg: string;
    accent: string;
    text: string;
  };
  cards: {
    quote: string;
    ghost: string;
  };
  prompts: {
    image: string;
    video: string;
    audio: string;
  };
}

export type CardType = 'text' | 'image' | 'video' | 'sound';

export interface Interaction {
  cardId: string;
  type: 'like' | 'dislike' | 'skip';
  timestamp: number;
}
