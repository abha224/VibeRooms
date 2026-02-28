import {
  VibeProfile,
  VibeVector,
  ModalityAffinity,
  InteractionEvent,
  RoomSlug,
  CardType,
} from './types';

const STORAGE_KEY = 'viberooms_profile';

// ─── Room → Emotion Axis Mapping ────────────────────────────

const ROOM_EMOTION_MAP: Record<RoomSlug, keyof VibeVector> = {
  'echo-chamber': 'melancholy',
  'neon-solitude': 'longing',
  'overgrown-library': 'peace',
  'midnight-diner': 'nostalgia',
  'glass-observatory': 'awe',
};

// ─── Compute Vibe Vector from Interactions ──────────────────

function computeVibeVector(interactions: InteractionEvent[], roomSlug: RoomSlug): VibeVector {
  const base: VibeVector = { melancholy: 0, longing: 0, peace: 0, nostalgia: 0, awe: 0 };

  // The room they were routed to gives a strong base signal
  const primaryAxis = ROOM_EMOTION_MAP[roomSlug];
  base[primaryAxis] = 0.5;

  // Each like amplifies the room's emotion; dislikes dampen it
  // Dwell time > 3s also signals engagement (curiosity / resonance)
  for (const event of interactions) {
    const axis = ROOM_EMOTION_MAP[event.roomSlug];

    if (event.action === 'like') {
      base[axis] = Math.min(1, base[axis] + 0.15);
      // Likes on art/video suggest visual-emotional resonance → boost awe
      if (event.cardType === 'art' || event.cardType === 'video') {
        base.awe = Math.min(1, base.awe + 0.05);
      }
      // Likes on text suggest introspection → boost melancholy
      if (event.cardType === 'text') {
        base.melancholy = Math.min(1, base.melancholy + 0.05);
      }
      // Likes on music suggest emotional depth → boost longing
      if (event.cardType === 'music') {
        base.longing = Math.min(1, base.longing + 0.05);
      }
    } else if (event.action === 'dislike') {
      base[axis] = Math.max(0, base[axis] - 0.1);
    }

    // High dwell time (> 4s) shows engagement
    if (event.dwellMs > 4000) {
      base[axis] = Math.min(1, base[axis] + 0.08);
    }
    // Very short dwell (< 1.5s) means they bounced
    if (event.dwellMs < 1500 && event.action === 'skip') {
      base[axis] = Math.max(0, base[axis] - 0.05);
    }
  }

  // Normalize to 0-1 range
  const maxVal = Math.max(...Object.values(base), 0.01);
  return {
    melancholy: base.melancholy / maxVal,
    longing: base.longing / maxVal,
    peace: base.peace / maxVal,
    nostalgia: base.nostalgia / maxVal,
    awe: base.awe / maxVal,
  };
}

// ─── Compute Modality Affinity ──────────────────────────────

function computeModalityAffinity(interactions: InteractionEvent[]): ModalityAffinity {
  let visual = 0, auditory = 0, textual = 0;
  let total = 0;

  for (const event of interactions) {
    if (event.action !== 'like') continue;
    total++;

    if (event.cardType === 'art' || event.cardType === 'video') {
      visual++;
    } else if (event.cardType === 'music') {
      auditory++;
    } else if (event.cardType === 'text' || event.cardType === 'combo') {
      textual++;
    }
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

  // Engagement = weighted combo of like ratio + normalized dwell
  const likeRatio = likes / interactions.length;
  const dwellScore = Math.min(1, avgDwell / 8000); // 8s = max engagement

  return likeRatio * 0.6 + dwellScore * 0.4;
}

// ─── Get Dominant Emotion ───────────────────────────────────

const EMOTION_LABELS: Record<keyof VibeVector, string> = {
  melancholy: 'Melancholy',
  longing: 'Longing',
  peace: 'Peace',
  nostalgia: 'Nostalgia',
  awe: 'Awe',
};

function getDominantEmotion(vibeVector: VibeVector): string {
  let maxKey: keyof VibeVector = 'melancholy';
  let maxVal = 0;
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
