/**
 * Vibe → Movie Recommendation Engine
 *
 * behavioral profile → emotional state vector → score each film → ranked list
 *
 * Film data sourced from IMDb Non-Commercial Datasets (datasets.imdbws.com).
 */

import {
  BehavioralProfile,
  EmotionalState,
  FilmRecommendation,
  IMDbTitle,
  RoomSlug,
} from '../types';
import { FILM_CATALOG } from './movies';

// ── Step 1 — Behavioral Profile → Emotional State ──────────────────────────

const ROOM_SOCIAL_SCORES: Record<RoomSlug, number> = {
  'the-departure':  0.25,
  'the-transit':    0.1,
  'the-last-row':   0.15,
  'the-projector':  0.1,
  'the-rehearsal':  0.35,
  'the-vinyl':      0.15,
};

export function deriveEmotionalState(
  profile: BehavioralProfile,
  roomSlug: string,
): EmotionalState {
  const sociality = ROOM_SOCIAL_SCORES[roomSlug as RoomSlug] ?? 0.3;
  return {
    intensity:  profile.energy_level,
    darkness:   1 - profile.present_depth,
    complexity: profile.selectivity,
    sociality,
  };
}

// ── Step 2 — Emotional State → Mood Tags (for match_reason display) ────────

export function moodToGenreTags(state: EmotionalState): string[] {
  const tags: string[] = [];

  if (state.intensity < 0.3)  tags.push('slow-cinema', 'meditative');
  if (state.intensity > 0.7)  tags.push('kinetic', 'visceral');

  if (state.darkness < 0.3)   tags.push('hopeful', 'warm');
  if (state.darkness > 0.6)   tags.push('melancholy', 'noir');

  if (state.complexity > 0.7) tags.push('nonlinear', 'layered');
  if (state.complexity < 0.3) tags.push('straightforward');

  if (state.sociality < 0.3)  tags.push('solitary');
  if (state.sociality > 0.6)  tags.push('ensemble');

  if (tags.length === 0) tags.push('contemplative');
  return tags;
}

// ── Step 3 — Score a film against the emotional state ──────────────────────

function moodDistance(a: EmotionalState, b: IMDbTitle['mood']): number {
  const di = a.intensity  - b.intensity;
  const dd = a.darkness   - b.darkness;
  const dc = a.complexity - b.complexity;
  const ds = a.sociality  - b.sociality;
  return Math.sqrt(di * di + dd * dd + dc * dc + ds * ds);
}

/** Max possible distance in 4D unit cube = sqrt(4) ≈ 2.0 */
const MAX_DIST = 2.0;

function scoreFilm(state: EmotionalState, film: IMDbTitle): number {
  const dist   = moodDistance(state, film.mood);
  const proximity = 1 - dist / MAX_DIST;

  // Slight boost for higher-rated films
  const ratingBoost = (film.averageRating - 6.5) * 0.05;

  return Math.max(0, Math.min(1, proximity + ratingBoost));
}

// ── Step 4 — Build a human-readable match reason ───────────────────────────

export function buildMatchReason(
  tags: string[],
  roomSlug: string,
  score: number,
): string {
  const parts: string[] = [];

  if (tags.length > 0) {
    parts.push(tags.slice(0, 2).join(' + '));
  }

  const roomName = roomSlug.replace('the-', '').replace(/-/g, ' ');
  parts.push(roomName + ' vibe');
  parts.push(`${Math.round(score * 100)}% match`);

  return parts.join(' · ');
}

// ── Step 5 — Main recommendation function ──────────────────────────────────

export function getRecommendations(
  profile: BehavioralProfile,
  roomSlug: string,
  count = 5,
): FilmRecommendation[] {
  const emotionalState = deriveEmotionalState(profile, roomSlug);
  const tags           = moodToGenreTags(emotionalState);

  console.groupCollapsed(
    '%c[recs] scoring films against emotional state',
    'color: #C8904A',
  );
  console.table(emotionalState);
  console.log('mood tags:', tags.join(', '));

  const scored = FILM_CATALOG
    .map(film => ({
      film,
      score: scoreFilm(emotionalState, film),
    }))
    .sort((a, b) => b.score - a.score);

  console.table(scored.map(s => ({
    title: s.film.primaryTitle,
    score: +s.score.toFixed(3),
    rating: s.film.averageRating,
  })));
  console.groupEnd();

  return scored.slice(0, count).map(({ film, score }) => ({
    tconst:       film.tconst,
    title:        film.primaryTitle,
    year:         film.startYear,
    runtime:      film.runtimeMinutes,
    genres:       film.genres,
    rating:       film.averageRating,
    votes:        film.numVotes,
    score,
    match_reason: buildMatchReason(tags, roomSlug, score),
  }));
}
