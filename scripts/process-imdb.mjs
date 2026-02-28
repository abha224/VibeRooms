#!/usr/bin/env node
/**
 * IMDB Dataset Processor for VibeRooms
 * 
 * Reads the raw IMDB TSV.gz files, filters to quality movies,
 * joins ratings/crew/cast, computes vibe vectors from genres,
 * and outputs a compact JSON file for the app.
 *
 * Usage: node scripts/process-imdb.mjs
 */

import { createReadStream } from 'fs';
import { writeFile } from 'fs/promises';
import { createGunzip } from 'zlib';
import { createInterface } from 'readline';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = join(__dirname, '..', 'data', 'raw');
const OUT_FILE = join(__dirname, '..', 'data', 'movies.json');

// ─── Configuration ──────────────────────────────────────────
const MIN_RATING = 6.5;
const MIN_VOTES = 15000;
const MAX_MOVIES = 500;   // Keep the top N after scoring

// ─── Genre → Vibe Vector Mapping ────────────────────────────
// Each genre contributes to the 5 vibe axes (melancholy, longing, peace, nostalgia, awe)
const GENRE_VIBE_MAP = {
  'Drama':       { melancholy: 0.7, longing: 0.5, peace: 0.2, nostalgia: 0.4, awe: 0.1 },
  'Romance':     { melancholy: 0.4, longing: 0.9, peace: 0.3, nostalgia: 0.5, awe: 0.2 },
  'Sci-Fi':      { melancholy: 0.3, longing: 0.6, peace: 0.1, nostalgia: 0.1, awe: 0.9 },
  'Thriller':    { melancholy: 0.5, longing: 0.3, peace: 0.0, nostalgia: 0.1, awe: 0.6 },
  'Crime':       { melancholy: 0.6, longing: 0.3, peace: 0.0, nostalgia: 0.2, awe: 0.4 },
  'Mystery':     { melancholy: 0.5, longing: 0.4, peace: 0.1, nostalgia: 0.3, awe: 0.7 },
  'Action':      { melancholy: 0.1, longing: 0.2, peace: 0.0, nostalgia: 0.2, awe: 0.7 },
  'Adventure':   { melancholy: 0.1, longing: 0.4, peace: 0.3, nostalgia: 0.3, awe: 0.8 },
  'Comedy':      { melancholy: 0.1, longing: 0.2, peace: 0.5, nostalgia: 0.6, awe: 0.2 },
  'Animation':   { melancholy: 0.2, longing: 0.3, peace: 0.7, nostalgia: 0.5, awe: 0.6 },
  'Fantasy':     { melancholy: 0.2, longing: 0.5, peace: 0.5, nostalgia: 0.4, awe: 0.8 },
  'Family':      { melancholy: 0.1, longing: 0.1, peace: 0.8, nostalgia: 0.6, awe: 0.4 },
  'Horror':      { melancholy: 0.6, longing: 0.2, peace: 0.0, nostalgia: 0.1, awe: 0.5 },
  'War':         { melancholy: 0.9, longing: 0.4, peace: 0.1, nostalgia: 0.5, awe: 0.3 },
  'History':     { melancholy: 0.4, longing: 0.3, peace: 0.3, nostalgia: 0.8, awe: 0.4 },
  'Biography':   { melancholy: 0.4, longing: 0.3, peace: 0.3, nostalgia: 0.6, awe: 0.4 },
  'Music':       { melancholy: 0.3, longing: 0.5, peace: 0.4, nostalgia: 0.7, awe: 0.3 },
  'Musical':     { melancholy: 0.1, longing: 0.3, peace: 0.5, nostalgia: 0.8, awe: 0.4 },
  'Western':     { melancholy: 0.5, longing: 0.4, peace: 0.2, nostalgia: 0.7, awe: 0.3 },
  'Documentary': { melancholy: 0.3, longing: 0.2, peace: 0.5, nostalgia: 0.3, awe: 0.6 },
  'Film-Noir':   { melancholy: 0.9, longing: 0.7, peace: 0.0, nostalgia: 0.6, awe: 0.3 },
  'Sport':       { melancholy: 0.2, longing: 0.3, peace: 0.2, nostalgia: 0.4, awe: 0.5 },
  'News':        { melancholy: 0.3, longing: 0.1, peace: 0.1, nostalgia: 0.2, awe: 0.3 },
};

// ─── Utility: Stream a gzipped TSV ─────────────────────────

async function streamTsv(filename, callback) {
  const filePath = join(RAW_DIR, filename);
  const stream = createReadStream(filePath).pipe(createGunzip());
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let headers = null;
  let count = 0;

  for await (const line of rl) {
    if (!headers) {
      headers = line.split('\t');
      continue;
    }
    const fields = line.split('\t');
    const row = {};
    headers.forEach((h, i) => { row[h] = fields[i] || '\\N'; });
    callback(row);
    count++;
    if (count % 500000 === 0) {
      process.stdout.write(`  ...${(count / 1000000).toFixed(1)}M rows\r`);
    }
  }
  console.log(`  ✓ ${filename}: ${count.toLocaleString()} rows`);
}

// ─── Step 1: Load Ratings ───────────────────────────────────

async function loadRatings() {
  console.log('\n📊 Loading ratings...');
  const ratings = new Map();
  await streamTsv('title.ratings.tsv.gz', (row) => {
    const votes = parseInt(row.numVotes) || 0;
    const rating = parseFloat(row.averageRating) || 0;
    if (votes >= MIN_VOTES && rating >= MIN_RATING) {
      ratings.set(row.tconst, { rating, votes });
    }
  });
  console.log(`  → ${ratings.size.toLocaleString()} titles with rating ≥ ${MIN_RATING} & votes ≥ ${MIN_VOTES.toLocaleString()}`);
  return ratings;
}

// ─── Step 2: Load Basics (movies only) ──────────────────────

async function loadBasics(ratings) {
  console.log('\n🎬 Loading title basics (movies only)...');
  const movies = new Map();
  await streamTsv('title.basics.tsv.gz', (row) => {
    // Only movies that passed our ratings filter
    if (row.titleType !== 'movie') return;
    if (!ratings.has(row.tconst)) return;
    if (row.isAdult === '1') return;

    const genres = row.genres !== '\\N' ? row.genres.split(',') : [];
    const year = parseInt(row.startYear) || 0;
    if (year < 1960) return; // Focus on modern cinema

    const runtime = parseInt(row.runtimeMinutes) || 0;
    if (runtime < 60 || runtime > 300) return; // Skip shorts and ultra-long

    movies.set(row.tconst, {
      id: row.tconst,
      title: row.primaryTitle,
      year,
      genres,
      runtime,
      ...ratings.get(row.tconst),
    });
  });
  console.log(`  → ${movies.size.toLocaleString()} qualifying movies`);
  return movies;
}

// ─── Step 3: Load Directors from Crew ───────────────────────

async function loadDirectors(movies) {
  console.log('\n🎥 Loading crew (directors)...');
  const directorIds = new Map(); // tconst → [nconst]
  const allDirectorNconsts = new Set();
  await streamTsv('title.crew.tsv.gz', (row) => {
    if (!movies.has(row.tconst)) return;
    if (row.directors === '\\N') return;
    const dirs = row.directors.split(',');
    directorIds.set(row.tconst, dirs);
    dirs.forEach(d => allDirectorNconsts.add(d));
  });
  console.log(`  → ${directorIds.size.toLocaleString()} movies with directors, ${allDirectorNconsts.size.toLocaleString()} unique directors`);
  return { directorIds, allDirectorNconsts };
}

// ─── Step 4: Load Principals (top cast) ─────────────────────

async function loadPrincipals(movies) {
  console.log('\n🎭 Loading principals (cast)...');
  const castIds = new Map(); // tconst → [nconst] (max 3 actors)
  const allCastNconsts = new Set();
  await streamTsv('title.principals.tsv.gz', (row) => {
    if (!movies.has(row.tconst)) return;
    if (row.category !== 'actor' && row.category !== 'actress') return;

    if (!castIds.has(row.tconst)) castIds.set(row.tconst, []);
    const arr = castIds.get(row.tconst);
    if (arr.length < 3) {
      arr.push(row.nconst);
      allCastNconsts.add(row.nconst);
    }
  });
  console.log(`  → ${castIds.size.toLocaleString()} movies with cast, ${allCastNconsts.size.toLocaleString()} unique actors`);
  return { castIds, allCastNconsts };
}

// ─── Step 5: Resolve Names ──────────────────────────────────

async function loadNames(nconsts) {
  console.log('\n👤 Loading names...');
  const names = new Map();
  await streamTsv('name.basics.tsv.gz', (row) => {
    if (nconsts.has(row.nconst)) {
      names.set(row.nconst, row.primaryName);
    }
  });
  console.log(`  → ${names.size.toLocaleString()} names resolved`);
  return names;
}

// ─── Step 6: Compute Vibe Vectors ───────────────────────────

function computeVibeVector(genres) {
  const vibe = { melancholy: 0, longing: 0, peace: 0, nostalgia: 0, awe: 0 };
  let genresMatched = 0;

  for (const genre of genres) {
    const mapping = GENRE_VIBE_MAP[genre];
    if (mapping) {
      genresMatched++;
      for (const axis of Object.keys(vibe)) {
        vibe[axis] += mapping[axis];
      }
    }
  }

  // Average across matched genres
  if (genresMatched > 0) {
    for (const axis of Object.keys(vibe)) {
      vibe[axis] = Math.round((vibe[axis] / genresMatched) * 100) / 100;
    }
  }

  return vibe;
}

// ─── Step 7: Generate Prompts from Genre/Title ──────────────

function generatePosterPrompt(movie) {
  const genreStr = movie.genres.join(', ').toLowerCase();
  return `Cinematic atmospheric poster for "${movie.title}" (${movie.year}), genres: ${genreStr}. Dark, moody, high-quality, dramatic lighting, film still aesthetic`;
}

function generateClipPrompt(movie) {
  const vibeWords = [];
  const v = movie.vibeVector;
  if (v.melancholy > 0.5) vibeWords.push('melancholic');
  if (v.longing > 0.5) vibeWords.push('yearning');
  if (v.peace > 0.5) vibeWords.push('serene');
  if (v.nostalgia > 0.5) vibeWords.push('nostalgic');
  if (v.awe > 0.5) vibeWords.push('awe-inspiring');
  
  const mood = vibeWords.length > 0 ? vibeWords.join(', ') : 'atmospheric';
  return `A ${mood} 8-second cinematic mood clip inspired by the film "${movie.title}". Slow, atmospheric, ${movie.genres[0]?.toLowerCase() || 'dramatic'} tone`;
}

// ─── Main Pipeline ──────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  VibeRooms IMDB Dataset Processor');
  console.log('═══════════════════════════════════════════');

  // Step 1: Ratings
  const ratings = await loadRatings();

  // Step 2: Basics
  const movies = await loadBasics(ratings);

  // Step 3: Directors
  const { directorIds, allDirectorNconsts } = await loadDirectors(movies);

  // Step 4: Cast
  const { castIds, allCastNconsts } = await loadPrincipals(movies);

  // Step 5: Names
  const allNconsts = new Set([...allDirectorNconsts, ...allCastNconsts]);
  const names = await loadNames(allNconsts);

  // Step 6: Assemble & Score
  console.log('\n🧮 Computing vibe vectors & assembling data...');
  const assembled = [];

  for (const [tconst, movie] of movies) {
    const vibeVector = computeVibeVector(movie.genres);

    // Resolve director names
    const dirNconsts = directorIds.get(tconst) || [];
    const director = dirNconsts
      .map(nc => names.get(nc))
      .filter(Boolean)
      .join(', ') || 'Unknown';

    // Resolve cast names
    const castNconsts = castIds.get(tconst) || [];
    const cast = castNconsts
      .map(nc => names.get(nc))
      .filter(Boolean);

    const entry = {
      id: tconst,
      title: movie.title,
      year: movie.year,
      director,
      genres: movie.genres,
      imdbRating: movie.rating,
      numVotes: movie.votes,
      runtime: movie.runtime,
      cast,
      vibeVector,
      posterPrompt: '', // will be set after
      clipPrompt: '',   // will be set after
    };

    entry.posterPrompt = generatePosterPrompt(entry);
    entry.clipPrompt = generateClipPrompt(entry);

    assembled.push(entry);
  }

  // Sort by a quality score: rating * log(votes) to balance quality + popularity
  assembled.sort((a, b) => {
    const scoreA = a.imdbRating * Math.log10(a.numVotes);
    const scoreB = b.imdbRating * Math.log10(b.numVotes);
    return scoreB - scoreA;
  });

  // Take top N
  const final = assembled.slice(0, MAX_MOVIES);

  console.log(`  → ${final.length} movies in final dataset`);

  // Step 7: Write output
  console.log(`\n💾 Writing to ${OUT_FILE}...`);

  const output = {
    _meta: {
      generatedAt: new Date().toISOString(),
      source: 'IMDb Non-Commercial Datasets (https://datasets.imdbws.com/)',
      license: 'For personal and non-commercial use only',
      filters: { minRating: MIN_RATING, minVotes: MIN_VOTES, yearFrom: 1960, maxMovies: MAX_MOVIES },
      totalMovies: final.length,
    },
    movies: final,
  };

  await writeFile(OUT_FILE, JSON.stringify(output, null, 2), 'utf-8');

  const fileSizeKB = JSON.stringify(output).length / 1024;
  console.log(`  → ${fileSizeKB.toFixed(0)}KB written`);

  // Print some stats
  console.log('\n═══════════════════════════════════════════');
  console.log('  📈 Dataset Statistics');
  console.log('═══════════════════════════════════════════');
  console.log(`  Movies: ${final.length}`);
  console.log(`  Year range: ${Math.min(...final.map(m => m.year))} - ${Math.max(...final.map(m => m.year))}`);
  console.log(`  Rating range: ${Math.min(...final.map(m => m.imdbRating)).toFixed(1)} - ${Math.max(...final.map(m => m.imdbRating)).toFixed(1)}`);

  // Genre distribution
  const genreCounts = {};
  final.forEach(m => m.genres.forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; }));
  const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  console.log('  Top genres:');
  sortedGenres.slice(0, 10).forEach(([g, c]) => console.log(`    ${g}: ${c}`));

  // Vibe distribution
  const vibeAvg = { melancholy: 0, longing: 0, peace: 0, nostalgia: 0, awe: 0 };
  final.forEach(m => {
    for (const k of Object.keys(vibeAvg)) {
      vibeAvg[k] += m.vibeVector[k];
    }
  });
  console.log('  Average vibe vector:');
  for (const k of Object.keys(vibeAvg)) {
    console.log(`    ${k}: ${(vibeAvg[k] / final.length).toFixed(2)}`);
  }

  console.log('\n✅ Done! Dataset ready at data/movies.json');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
