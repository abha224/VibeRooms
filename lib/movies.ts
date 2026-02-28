import { VibeVector, VibeProfile, MovieRecommendation } from './types';
import movieData from '@/data/movies.json';

// ─── Types from the processed IMDB dataset ──────────────────
// The JSON has old 5-axis vibe vectors. We map them to 8-axis.

interface OldVibeVector {
  melancholy: number;
  longing: number;
  peace: number;
  nostalgia: number;
  awe: number;
}

interface RawIMDBMovie {
  id: string;
  title: string;
  year: number;
  director: string;
  genres: string[];
  imdbRating: number;
  numVotes: number;
  runtime: number;
  cast: string[];
  vibeVector: OldVibeVector;
  posterPrompt: string;
  clipPrompt: string;
}

// ─── 5-axis → 8-axis expansion ──────────────────────────────
// Maps the old vibe vector + genre signals to the expanded 8-axis space

function expandVibeVector(old: OldVibeVector, genres: string[]): VibeVector {
  const g = new Set(genres.map(x => x.toLowerCase()));

  // Direct mappings
  const v: VibeVector = {
    melancholy: old.melancholy,
    wonder: old.awe,
    nostalgia: old.nostalgia,
    serenity: old.peace,
    romance: old.longing,
    // Derived from genre signals
    tension: 0,
    energy: 0,
    rebellion: 0,
  };

  // Genre-based derivations for the 3 new axes
  if (g.has('thriller'))    { v.tension += 0.6; v.energy += 0.2; }
  if (g.has('crime'))       { v.tension += 0.5; v.rebellion += 0.4; }
  if (g.has('horror'))      { v.tension += 0.7; v.rebellion += 0.2; }
  if (g.has('mystery'))     { v.tension += 0.4; v.wonder += 0.1; }
  if (g.has('action'))      { v.energy += 0.6; v.tension += 0.3; }
  if (g.has('adventure'))   { v.energy += 0.5; v.wonder += 0.2; }
  if (g.has('comedy'))      { v.energy += 0.4; v.rebellion += 0.1; }
  if (g.has('animation'))   { v.wonder += 0.2; v.energy += 0.2; }
  if (g.has('sci-fi'))      { v.wonder += 0.3; v.rebellion += 0.3; }
  if (g.has('fantasy'))     { v.wonder += 0.3; v.energy += 0.2; }
  if (g.has('war'))         { v.tension += 0.3; v.rebellion += 0.5; }
  if (g.has('western'))     { v.rebellion += 0.4; v.tension += 0.2; }
  if (g.has('romance'))     { v.romance += 0.3; }
  if (g.has('music'))       { v.serenity += 0.2; v.nostalgia += 0.1; }
  if (g.has('biography'))   { v.nostalgia += 0.2; v.wonder += 0.1; }
  if (g.has('history'))     { v.nostalgia += 0.3; }
  if (g.has('documentary')) { v.wonder += 0.2; v.serenity += 0.1; }
  if (g.has('sport'))       { v.energy += 0.5; v.tension += 0.2; }
  if (g.has('musical'))     { v.energy += 0.3; v.romance += 0.2; }
  if (g.has('film-noir'))   { v.tension += 0.5; v.melancholy += 0.3; }

  // Clamp all to [0, 1]
  for (const axis of Object.keys(v) as (keyof VibeVector)[]) {
    v[axis] = Math.min(1, Math.max(0, v[axis]));
  }

  return v;
}

// Load and expand movies from the processed JSON
const rawMovies = movieData.movies as RawIMDBMovie[];

export interface ProcessedMovie {
  id: string;
  title: string;
  year: number;
  director: string;
  genres: string[];
  imdbRating: number;
  numVotes: number;
  runtime: number;
  cast: string[];
  vibeVector: VibeVector; // now 8-axis
  posterPrompt: string;
  clipPrompt: string;
}

export const MOVIES: ProcessedMovie[] = rawMovies.map(m => ({
  ...m,
  vibeVector: expandVibeVector(m.vibeVector, m.genres),
}));

// ─── Recommendation Engine ──────────────────────────────────

const VIBE_AXES: (keyof VibeVector)[] = [
  'melancholy', 'wonder', 'nostalgia', 'tension',
  'energy', 'serenity', 'romance', 'rebellion',
];

/** Cosine similarity between two 8-axis vibe vectors */
function vibeCosineSimilarity(a: VibeVector, b: VibeVector): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key of VIBE_AXES) {
    dotProduct += a[key] * b[key];
    normA += a[key] * a[key];
    normB += b[key] * b[key];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/** Generate a human-readable match reason */
function getMatchReason(movie: ProcessedMovie, profile: VibeProfile): string {
  const labels: Record<keyof VibeVector, string> = {
    melancholy: 'melancholic depth',
    wonder: 'sense of wonder',
    nostalgia: 'nostalgic warmth',
    tension: 'edge of tension',
    energy: 'vibrant energy',
    serenity: 'peaceful serenity',
    romance: 'romantic longing',
    rebellion: 'rebellious spirit',
  };

  // Find the two strongest shared axes
  const sharedScores = VIBE_AXES.map(key => ({
    key,
    score: Math.min(profile.vibeVector[key], movie.vibeVector[key]),
  })).sort((a, b) => b.score - a.score);

  const primary = labels[sharedScores[0].key];
  const secondary = labels[sharedScores[1].key];

  if (sharedScores[0].score > 0.5 && sharedScores[1].score > 0.3) {
    return `Matches your ${primary} and ${secondary}`;
  }
  return `Matches your ${primary}`;
}

/** Get top N movie recommendations for a vibe profile */
export function getRecommendations(profile: VibeProfile, count: number = 12): MovieRecommendation[] {
  const scored = MOVIES.map(movie => ({
    movie: {
      ...movie,
      tagline: `${movie.genres.join(' · ')} — ${movie.year}`,
      synopsis: `Directed by ${movie.director}. Starring ${movie.cast.slice(0, 3).join(', ')}.`,
    },
    vibeMatchScore: vibeCosineSimilarity(profile.vibeVector, movie.vibeVector),
    matchReason: getMatchReason(movie, profile),
  }));

  // Sort by match score descending
  scored.sort((a, b) => b.vibeMatchScore - a.vibeMatchScore);

  return scored.slice(0, count);
}

/** Get movies filtered by genre */
export function getRecommendationsByGenre(
  profile: VibeProfile,
  genre: string,
  count: number = 12,
): MovieRecommendation[] {
  const filtered = MOVIES.filter(m => m.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
  const scored = filtered.map(movie => ({
    movie: {
      ...movie,
      tagline: `${movie.genres.join(' · ')} — ${movie.year}`,
      synopsis: `Directed by ${movie.director}. Starring ${movie.cast.slice(0, 3).join(', ')}.`,
    },
    vibeMatchScore: vibeCosineSimilarity(profile.vibeVector, movie.vibeVector),
    matchReason: getMatchReason(movie, profile),
  }));
  scored.sort((a, b) => b.vibeMatchScore - a.vibeMatchScore);
  return scored.slice(0, count);
}

/** Get all unique genres from the dataset */
export function getAllGenres(): string[] {
  const genreSet = new Set<string>();
  MOVIES.forEach(m => m.genres.forEach(g => genreSet.add(g)));
  return Array.from(genreSet).sort();
}
