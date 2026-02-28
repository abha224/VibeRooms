import {
  VibeProfile,
  VibeVector,
  ModalityAffinity,
  InteractionEvent,
  RoomSlug,
  CardType,
} from './types';

const STORAGE_KEY = 'viberooms_profile';

// ─── Constants ──────────────────────────────────────────────

const VIBE_AXES: (keyof VibeVector)[] = [
  'melancholy', 'wonder', 'nostalgia', 'tension',
  'energy', 'serenity', 'romance', 'rebellion',
];

const ZERO_VIBE: VibeVector = {
  melancholy: 0, wonder: 0, nostalgia: 0, tension: 0,
  energy: 0, serenity: 0, romance: 0, rebellion: 0,
};

// ─── Room → Primary + Secondary Emotion Axes ────────────────
// Each room maps to a primary axis and secondary axes with
// weight for more nuanced profiling.

interface RoomAxes {
  primary: keyof VibeVector;
  secondary: [keyof VibeVector, number][]; // [axis, weight]
}

const ROOM_AXES: Record<RoomSlug, RoomAxes> = {
  // Legacy rooms
  'echo-chamber':      { primary: 'melancholy', secondary: [['serenity', 0.3], ['romance', 0.2]] },
  'neon-solitude':     { primary: 'romance',    secondary: [['melancholy', 0.3], ['tension', 0.2]] },
  'overgrown-library': { primary: 'serenity',   secondary: [['wonder', 0.3], ['nostalgia', 0.2]] },
  'midnight-diner':    { primary: 'nostalgia',  secondary: [['romance', 0.3], ['serenity', 0.2]] },
  'glass-observatory': { primary: 'wonder',     secondary: [['serenity', 0.3], ['energy', 0.2]] },
  // Travel
  'the-departure':     { primary: 'energy',     secondary: [['wonder', 0.4], ['tension', 0.2]] },
  'the-transit':       { primary: 'serenity',   secondary: [['melancholy', 0.3], ['romance', 0.2]] },
  // Movies
  'the-last-row':      { primary: 'melancholy', secondary: [['tension', 0.4], ['romance', 0.2]] },
  'the-projector':     { primary: 'nostalgia',  secondary: [['romance', 0.3], ['serenity', 0.2]] },
  'the-chase':         { primary: 'tension',    secondary: [['energy', 0.5], ['rebellion', 0.3]] },
  'the-neon-marquee':  { primary: 'energy',     secondary: [['wonder', 0.4], ['rebellion', 0.2]] },
  'the-rewind':        { primary: 'nostalgia',  secondary: [['melancholy', 0.3], ['romance', 0.3]] },
  'the-fever-dream':   { primary: 'rebellion',  secondary: [['wonder', 0.4], ['tension', 0.3]] },
  // Demo showcase rooms
  'last-summer':       { primary: 'nostalgia',  secondary: [['romance', 0.4], ['wonder', 0.3]] },
  'neo-noir':          { primary: 'tension',    secondary: [['rebellion', 0.4], ['energy', 0.3]] },
  'the-signal':        { primary: 'wonder',     secondary: [['melancholy', 0.4], ['serenity', 0.3]] },
  // Music
  'the-rehearsal':     { primary: 'wonder',     secondary: [['energy', 0.3], ['rebellion', 0.2]] },
  'the-vinyl':         { primary: 'nostalgia',  secondary: [['romance', 0.4], ['serenity', 0.2]] },
};

// ─── Card-type → vibe axis cross-signals ─────────────────────
// What does liking a certain content type suggest about your vibe?

const CARD_TYPE_SIGNALS: Record<CardType, Partial<Record<keyof VibeVector, number>>> = {
  art:   { wonder: 0.06, serenity: 0.04 },
  music: { romance: 0.05, nostalgia: 0.04, melancholy: 0.03 },
  video: { energy: 0.05, tension: 0.04, wonder: 0.03 },
  text:  { melancholy: 0.06, nostalgia: 0.04 },
  combo: { wonder: 0.04, rebellion: 0.03 },
};

// ─── Opposite emotion pairs (dislike X → slight boost to Y) ─

const OPPOSITES: Partial<Record<keyof VibeVector, keyof VibeVector>> = {
  tension: 'serenity',
  energy: 'melancholy',
  rebellion: 'nostalgia',
  melancholy: 'energy',
  serenity: 'tension',
  romance: 'rebellion',
  nostalgia: 'energy',
  wonder: 'nostalgia',
};

// ─── Compute Vibe Vector from Interactions ──────────────────

function computeVibeVector(interactions: InteractionEvent[], roomSlug: RoomSlug): VibeVector {
  const v: VibeVector = { ...ZERO_VIBE };

  // The room they were routed to gives a base signal
  const roomAxes = ROOM_AXES[roomSlug];
  if (roomAxes) {
    v[roomAxes.primary] = 0.4;
    for (const [axis, weight] of roomAxes.secondary) {
      v[axis] = Math.min(1, v[axis] + 0.4 * weight);
    }
  }

  // Process each interaction
  for (const event of interactions) {
    const eventAxes = ROOM_AXES[event.roomSlug];
    if (!eventAxes) continue;

    const primaryAxis = eventAxes.primary;

    if (event.action === 'like') {
      // Like amplifies the room's primary and secondary axes
      v[primaryAxis] = Math.min(1, v[primaryAxis] + 0.12);
      for (const [axis, weight] of eventAxes.secondary) {
        v[axis] = Math.min(1, v[axis] + 0.12 * weight);
      }
      // Card type cross-signals
      const signals = CARD_TYPE_SIGNALS[event.cardType];
      if (signals) {
        for (const [axis, boost] of Object.entries(signals)) {
          v[axis as keyof VibeVector] = Math.min(1, v[axis as keyof VibeVector] + (boost as number));
        }
      }
    } else if (event.action === 'dislike') {
      // Dislike dampens the primary axis
      v[primaryAxis] = Math.max(0, v[primaryAxis] - 0.08);
      // Slightly boost the opposite emotion
      const opp = OPPOSITES[primaryAxis];
      if (opp) v[opp] = Math.min(1, v[opp] + 0.04);
    }

    // Dwell time signals
    if (event.dwellMs > 5000) {
      // Long dwell = deep engagement with this vibe
      v[primaryAxis] = Math.min(1, v[primaryAxis] + 0.06);
    } else if (event.dwellMs < 1500 && event.action === 'skip') {
      // Quick skip = not vibing
      v[primaryAxis] = Math.max(0, v[primaryAxis] - 0.04);
    }
  }

  // Normalize: scale so the max axis = 1.0
  const maxVal = Math.max(...Object.values(v), 0.01);
  for (const axis of VIBE_AXES) {
    v[axis] = Math.round((v[axis] / maxVal) * 100) / 100;
  }

  return v;
}

// ─── Compute Modality Affinity ──────────────────────────────

function computeModalityAffinity(interactions: InteractionEvent[]): ModalityAffinity {
  let visual = 0, auditory = 0, textual = 0;
  let total = 0;

  for (const event of interactions) {
    if (event.action !== 'like') continue;
    total++;
    if (event.cardType === 'art' || event.cardType === 'video') visual++;
    else if (event.cardType === 'music') auditory++;
    else if (event.cardType === 'text' || event.cardType === 'combo') textual++;
  }

  if (total === 0) {
    // Fallback: use dwell time distribution
    let vDwell = 0, aDwell = 0, tDwell = 0, totalDwell = 0;
    for (const event of interactions) {
      totalDwell += event.dwellMs;
      if (event.cardType === 'art' || event.cardType === 'video') vDwell += event.dwellMs;
      else if (event.cardType === 'music') aDwell += event.dwellMs;
      else tDwell += event.dwellMs;
    }
    if (totalDwell > 0) {
      return {
        visual: vDwell / totalDwell,
        auditory: aDwell / totalDwell,
        textual: tDwell / totalDwell,
      };
    }
    return { visual: 0.33, auditory: 0.33, textual: 0.34 };
  }

  return {
    visual: visual / total,
    auditory: auditory / total,
    textual: textual / total,
  };
}

// ─── Compute Engagement Score ───────────────────────────────

function computeEngagement(interactions: InteractionEvent[]): number {
  if (interactions.length === 0) return 0;

  const likes = interactions.filter(e => e.action === 'like').length;
  const avgDwell = interactions.reduce((sum, e) => sum + e.dwellMs, 0) / interactions.length;

  const likeRatio = likes / interactions.length;
  const dwellScore = Math.min(1, avgDwell / 8000); // 8s = max engagement

  return likeRatio * 0.6 + dwellScore * 0.4;
}

// ─── Get Dominant Emotion ───────────────────────────────────

const EMOTION_LABELS: Record<keyof VibeVector, string> = {
  melancholy: 'Melancholy',
  wonder: 'Wonder',
  nostalgia: 'Nostalgia',
  tension: 'Tension',
  energy: 'Energy',
  serenity: 'Serenity',
  romance: 'Romance',
  rebellion: 'Rebellion',
};

function getDominantEmotion(vibeVector: VibeVector): string {
  let maxKey: keyof VibeVector = 'wonder'; // sensible default
  let maxVal = -1;
  for (const [key, val] of Object.entries(vibeVector)) {
    if (val > maxVal) {
      maxVal = val;
      maxKey = key as keyof VibeVector;
    }
  }
  return EMOTION_LABELS[maxKey];
}

// ─── Build Full Vibe Profile ────────────────────────────────

export function buildVibeProfile(
  interactions: InteractionEvent[],
  roomSlug: RoomSlug,
  entryAnswer: string,
): VibeProfile {
  const vibeVector = computeVibeVector(interactions, roomSlug);
  const modalityAffinity = computeModalityAffinity(interactions);
  const engagementScore = computeEngagement(interactions);

  return {
    vibeVector,
    modalityAffinity,
    dominantEmotion: getDominantEmotion(vibeVector),
    engagementScore,
    totalInteractions: interactions.length,
    entryAnswer,
    roomVisited: roomSlug,
    interactions,
  };
}

// ─── Persistence ────────────────────────────────────────────

export function saveVibeProfile(profile: VibeProfile): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
}

export function loadVibeProfile(): VibeProfile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as VibeProfile;
  } catch {
    return null;
  }
}

export function clearVibeProfile(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}
