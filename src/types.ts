export type Category = 'travel' | 'movies' | 'music';

export type RoomSlug =
  | 'the-departure'
  | 'the-transit'
  | 'the-last-row'
  | 'the-projector'
  | 'the-rehearsal'
  | 'the-vinyl';

export interface RoomConfig {
  slug: RoomSlug;
  name: string;
  emotion: string;
  category: Category;
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

export type CardType = 'text' | 'image' | 'video' | 'sound' | 'recommendation';

// ── Recommendation engine types ─────────────────────────────────────────────

export interface EmotionalState {
  /** 0 = quiet / calm, 1 = intense / activated */
  intensity: number;
  /** 0 = light / hopeful, 1 = dark / melancholic */
  darkness: number;
  /** 0 = simple / narrative, 1 = layered / ambiguous */
  complexity: number;
  /** 0 = solitary, 1 = communal */
  sociality: number;
}

/** Sourced from IMDb Non-Commercial Datasets (datasets.imdbws.com) */
export interface IMDbTitle {
  tconst: string;
  primaryTitle: string;
  startYear: number;
  runtimeMinutes: number;
  genres: string[];
  averageRating: number;
  numVotes: number;
  /** 0–1 mood axes used for matching against emotional state */
  mood: {
    intensity: number;
    darkness: number;
    complexity: number;
    sociality: number;
  };
}

export interface FilmRecommendation {
  tconst: string;
  title: string;
  year: number;
  runtime: number;
  genres: string[];
  rating: number;
  votes: number;
  /** Cosine-ish relevance score 0–1 */
  score: number;
  match_reason: string;
}

export type TimeBucket = 'morning' | 'afternoon' | 'evening' | 'late-night';

/** Fired on every like / dislike / skip */
export interface CardEvent {
  card_type: CardType;
  room_slug: string;
  card_index: number;
  action: 'like' | 'dislike' | 'skip';
  timestamp: number;
  time_of_day: TimeBucket;
  day_of_week: string;
  dwell_time_ms: number;
  session_time_ms: number;
}

// ── Behavioral engine types ──────────────────────────────────────────────────

export type DecisionConfidence = 'high' | 'medium' | 'low';
export type EngagementLevel   = 'absorbed' | 'present' | 'glancing';
export type Trajectory        = 'absorbing' | 'settling' | 'searching' | 'disengaging';
export type DecisionStyle     = 'reflexive' | 'deliberate' | 'ambiguous';
export type AnomalyType       = 'pause' | 'rush' | 'stall' | 'drop-off' | 're-entry';

export interface Anomaly {
  type: AnomalyType;
  description: string;
  event_index: number;
  timestamp: number;
}

export interface ContentAffinities {
  text: number;
  image: number;
  video: number;
  sound: number;
}

export interface BehavioralProfile {
  /** 0 = drained / distracted, 1 = activated */
  energy_level: number;
  /** 0 = glancing, 1 = absorbed */
  present_depth: number;
  /** 0 = accepting everything, 1 = rejecting most */
  selectivity: number;
  content_affinities: ContentAffinities;
  room_fit: number;
  /** How confident the routing algorithm was: 0–1 */
  routing_confidence: number;
  trajectory: Trajectory;
  decision_style: DecisionStyle;
  anomalies: Anomaly[];
}

/** A `CardEvent` with all behavior-engine fields attached */
export interface EnrichedCardEvent extends CardEvent {
  session_index: number;
  dwell_score: number;           // actual_ms / EXPECTED_MS[type]
  confidence: DecisionConfidence;
  engagement_depth: number;
  engagement_level: EngagementLevel;
}

/** Derived once per session (on demand) */
export interface SessionSummary {
  category: Category | null;
  prompt_answer: string;
  routed_room: string;
  entry_time_ms: number;
  rooms_visited: string[];
  cards_seen: number;
  cards_liked: number;
  cards_disliked: number;
  cards_skipped: number;
  preferred_card_types: CardType[];
  avoided_card_types: CardType[];
  avg_dwell_ms: number;
  completion_rate: number;
  returned_to_entry: boolean;
  events: EnrichedCardEvent[];
  behavior: BehavioralProfile;
}

/** Legacy — kept so existing call-sites don't break */
export interface Interaction {
  cardId: string;
  type: 'like' | 'dislike' | 'skip';
  timestamp: number;
}
