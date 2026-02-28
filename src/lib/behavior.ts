/**
 * Behavioral Understanding Engine
 * Layers 1–5: signal normalization, engagement, confidence, trajectory,
 * room fit, content affinity, and anomaly detection.
 */

import {
  Anomaly,
  AnomalyType,
  BehavioralProfile,
  CardType,
  ContentAffinities,
  DecisionConfidence,
  DecisionStyle,
  EngagementLevel,
  EnrichedCardEvent,
  Trajectory,
} from '../types';

// ── Layer 1 — Expected dwell per card type ────────────────────────────────────

export const EXPECTED_DWELL_MS: Record<CardType, number> = {
  text:           8_000,
  image:          5_000,
  video:          12_000,
  sound:          10_000,
  recommendation: 15_000,
};

/** Normalise actual dwell against card-type expectation.
 *  < 0.5 = rushed  |  0.5–1.5 = normal  |  > 1.5 = absorbed */
export function dwellScore(actual_ms: number, card_type: CardType): number {
  return actual_ms / EXPECTED_DWELL_MS[card_type];
}

// ── Layer 2 — P1: Engagement depth ───────────────────────────────────────────

export function engagementDepth(dwell_score: number, action: EnrichedCardEvent['action']): number {
  const action_weight = action === 'like' ? 1 : action === 'dislike' ? 0.6 : 0.2;
  return dwell_score * action_weight;
}

export function engagementLevel(depth: number): EngagementLevel {
  if (depth > 1.2) return 'absorbed';
  if (depth >= 0.6) return 'present';
  return 'glancing';
}

// ── Layer 2 — P2: Decision confidence ────────────────────────────────────────

/** Fast (<20% of expected) or very slow (>200%) = high confidence.
 *  The ambiguous middle zone = low confidence — discount it. */
export function decisionConfidence(dwell_score: number): DecisionConfidence {
  if (dwell_score < 0.2 || dwell_score > 2.0) return 'high';
  if (dwell_score < 0.5 || dwell_score > 1.5) return 'medium';
  return 'low';
}

// ── Layer 2 — P3: Session trajectory ─────────────────────────────────────────

export function computeTrajectory(events: EnrichedCardEvent[]): Trajectory {
  if (events.length < 3) return 'searching';

  const recent = events.slice(-Math.min(6, events.length));
  const dwells  = recent.map(e => e.dwell_score);
  const mid     = Math.floor(dwells.length / 2);
  const avgFirst  = avg(dwells.slice(0, mid));
  const avgSecond = avg(dwells.slice(mid));
  const trend     = avgSecond - avgFirst;

  const likeRate = recent.filter(e => e.action === 'like').length / recent.length;
  const skipRate = recent.filter(e => e.action === 'skip').length / recent.length;

  if (trend > 0.3 && likeRate > 0.3)              return 'absorbing';
  if (trend > 0.2)                                 return 'settling';
  if (skipRate > 0.5 || (trend < -0.3 && likeRate < 0.2)) return 'disengaging';
  return 'searching';
}

// ── Layer 2 — P4: Room fit score ─────────────────────────────────────────────

/** > 1.0 = good fit  |  0.5–1.0 = partial  |  < 0.5 = wrong room */
export function roomFitScore(events: EnrichedCardEvent[]): number {
  if (events.length === 0) return 0;
  const liked   = events.filter(e => e.action === 'like').length;
  const skipped = events.filter(e => e.action === 'skip').length;
  const avgDwell = avg(events.map(e => e.dwell_score));
  return (liked * 2 + avgDwell - skipped * 1.5) / events.length;
}

// ── Layer 2 — P5: Content affinity ───────────────────────────────────────────

function affinityScore(events: EnrichedCardEvent[]): number {
  if (events.length === 0) return 0;
  const total = events.reduce((sum, e) => {
    const action_w     = e.action === 'like' ? 1 : e.action === 'dislike' ? -1 : 0;
    const confidence_w = e.confidence === 'high' ? 1.5 : e.confidence === 'medium' ? 1.0 : 0.5;
    return sum + e.dwell_score * action_w * confidence_w;
  }, 0);
  return total / events.length;
}

export function computeAffinities(events: EnrichedCardEvent[]): ContentAffinities {
  return {
    text:  affinityScore(events.filter(e => e.card_type === 'text')),
    image: affinityScore(events.filter(e => e.card_type === 'image')),
    video: affinityScore(events.filter(e => e.card_type === 'video')),
    sound: affinityScore(events.filter(e => e.card_type === 'sound')),
  };
}

// ── Decision style ────────────────────────────────────────────────────────────

export function computeDecisionStyle(events: EnrichedCardEvent[]): DecisionStyle {
  if (events.length === 0) return 'ambiguous';
  const highCount = events.filter(e => e.confidence === 'high').length;
  const lowCount  = events.filter(e => e.confidence === 'low').length;

  if (highCount / events.length > 0.55) {
    const reflexive  = events.filter(e => e.dwell_score < 0.2).length;
    const deliberate = events.filter(e => e.dwell_score > 2.0).length;
    return reflexive > deliberate ? 'reflexive' : 'deliberate';
  }
  if (lowCount / events.length > 0.5) return 'ambiguous';
  return 'deliberate';
}

// ── Layer 5 — Anomaly detection ──────────────────────────────────────────────

export function detectAnomalies(
  event: EnrichedCardEvent,
  allEvents: EnrichedCardEvent[],
): Anomaly[] {
  const anomalies: Anomaly[] = [];
  const idx = allEvents.length - 1;

  // The Pause — long dwell then skip (wanted to like it, couldn't commit)
  if (event.action === 'skip' && event.dwell_score > 3) {
    push(anomalies, 'pause', idx, event.timestamp,
      `${sec(event.dwell_time_ms)}s on ${event.card_type} then skipped — ambivalent, couldn't commit`);
  }

  // The Stall — extreme dwell on any action (absorbed or distracted)
  if (event.dwell_score > 5) {
    push(anomalies, 'stall', idx, event.timestamp,
      `${sec(event.dwell_time_ms)}s on ${event.card_type} — absorbed or distracted`);
  }

  // The Rush — 3 skips in < 5 s total
  if (allEvents.length >= 3) {
    const last3     = allEvents.slice(-3);
    const allSkips  = last3.every(e => e.action === 'skip');
    const totalTime = last3[last3.length - 1].timestamp - last3[0].timestamp;
    if (allSkips && totalTime < 5_000) {
      push(anomalies, 'rush', idx, event.timestamp,
        '3 skips in < 5 s — actively searching, not finding it');
    }
  }

  // The Drop-off signal — skip rate > 75% over last 4 cards
  if (allEvents.length >= 4) {
    const last4    = allEvents.slice(-4);
    const skipRate = last4.filter(e => e.action === 'skip').length / 4;
    if (skipRate >= 0.75) {
      push(anomalies, 'drop-off', idx, event.timestamp,
        '75%+ skip rate over last 4 cards — disengaging');
    }
  }

  return anomalies;
}

// ── Layer 3 — Composite behavioral profile ───────────────────────────────────

export function buildBehavioralProfile(events: EnrichedCardEvent[]): BehavioralProfile {
  if (events.length === 0) {
    return {
      energy_level: 0.5, present_depth: 0.5, selectivity: 0.5,
      content_affinities: { text: 0, image: 0, video: 0, sound: 0 },
      room_fit: 0, routing_confidence: 0,
      trajectory: 'searching', decision_style: 'ambiguous',
      anomalies: [],
    };
  }

  const avgDepth  = avg(events.map(e => e.engagement_depth));
  const likeRate  = events.filter(e => e.action === 'like').length  / events.length;
  const skipRate  = events.filter(e => e.action === 'skip').length  / events.length;

  // energy_level — driven by dwell trend in recent events
  const recentDwells = events.slice(-5).map(e => e.dwell_score);
  const dwellTrend   = recentDwells.length > 1
    ? recentDwells[recentDwells.length - 1] - recentDwells[0]
    : 0;
  const energy_level = clamp(0.5 + dwellTrend * 0.25);

  // present_depth — scaled from average engagement depth
  const present_depth = clamp(avgDepth * 0.55);

  // selectivity — high skip + low like = highly selective
  const selectivity = clamp(skipRate * 0.65 + (1 - likeRate) * 0.35);

  const fit = roomFitScore(events);

  // Collect all anomalies across the full event stream
  const anomalies: Anomaly[] = [];
  for (let i = 1; i < events.length; i++) {
    anomalies.push(...detectAnomalies(events[i], events.slice(0, i + 1)));
  }
  // Deduplicate by type+event_index
  const seen = new Set<string>();
  const uniqueAnomalies = anomalies.filter(a => {
    const key = `${a.type}-${a.event_index}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    energy_level,
    present_depth,
    selectivity,
    content_affinities: computeAffinities(events),
    room_fit:           Math.max(0, fit),
    routing_confidence: clamp(Math.abs(fit - 0.5) * 2),
    trajectory:         computeTrajectory(events),
    decision_style:     computeDecisionStyle(events),
    anomalies:          uniqueAnomalies,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function avg(nums: number[]): number {
  return nums.length === 0 ? 0 : nums.reduce((s, v) => s + v, 0) / nums.length;
}

function clamp(v: number, lo = 0, hi = 1): number {
  return Math.max(lo, Math.min(hi, v));
}

function sec(ms: number): number {
  return Math.round(ms / 1000);
}

function push(
  list: Anomaly[],
  type: AnomalyType,
  event_index: number,
  timestamp: number,
  description: string,
) {
  list.push({ type, description, event_index, timestamp });
}
