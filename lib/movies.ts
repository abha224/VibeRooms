import { VibeVector, VibeProfile, MovieRecommendation } from './types';
import movieData from '@/data/movies.json';

// ─── Types from the processed IMDB dataset ──────────────────

export interface IMDBMovie {
  id: string;
  title: string;
  year: number;
  director: string;
  genres: string[];
  imdbRating: number;
  numVotes: number;
  runtime: number;
  cast: string[];
  vibeVector: VibeVector;
  posterPrompt: string;
  clipPrompt: string;
}

// Load movies from the processed JSON (500 curated films)
export const MOVIES: IMDBMovie[] = movieData.movies as IMDBMovie[];

// ─── Recommendation Engine ──────────────────────────────────

/** Cosine similarity between two vibe vectors */
function vibeCosineSimilarity(a: VibeVector, b: VibeVector): number {
  const keys: (keyof VibeVector)[] = ['melancholy', 'longing', 'peace', 'nostalgia', 'awe'];
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const key of keys) {
    dotProduct += a[key] * b[key];
    normA += a[key] * a[key];
    normB += b[key] * b[key];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/** Generate a human-readable match reason */
function getMatchReason(movie: IMDBMovie, profile: VibeProfile): string {
  const keys: (keyof VibeVector)[] = ['melancholy', 'longing', 'peace', 'nostalgia', 'awe'];
  const labels: Record<keyof VibeVector, string> = {
    melancholy: 'melancholic depth',
    longing: 'sense of longing',
    peace: 'peaceful atmosphere',
    nostalgia: 'nostalgic warmth',
    awe: 'sense of wonder',
  };

  // Find the strongest shared axis
  let bestAxis: keyof VibeVector = 'melancholy';
  let bestScore = 0;
  for (const key of keys) {
    const shared = Math.min(profile.vibeVector[key], movie.vibeVector[key]);
    if (shared > bestScore) {
      bestScore = shared;
      bestAxis = key;
    }
  }

  return `Matches your ${labels[bestAxis]}`;
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
