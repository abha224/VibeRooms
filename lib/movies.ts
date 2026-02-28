import { Movie, VibeVector, VibeProfile, MovieRecommendation } from './types';

// ─── Curated IMDB-style Movie Dataset with Vibe Vectors ────

export const MOVIES: Movie[] = [
  // ── High Melancholy ─────────────────────
  {
    id: 'eternal-sunshine',
    title: 'Eternal Sunshine of the Spotless Mind',
    year: 2004,
    director: 'Michel Gondry',
    genres: ['Drama', 'Romance', 'Sci-Fi'],
    imdbRating: 8.3,
    tagline: 'You can erase someone from your mind. Getting them out of your heart is another story.',
    synopsis: 'A couple undergoes a medical procedure to erase each other from their memories after a painful breakup.',
    vibeVector: { melancholy: 0.95, longing: 0.8, peace: 0.2, nostalgia: 0.7, awe: 0.4 },
    posterPrompt: 'Surreal melting memories in blue and orange, a couple dissolving into light',
    clipPrompt: 'Memories fading like watercolors dissolving in rain, intimate and melancholic',
    runtime: 108,
    cast: ['Jim Carrey', 'Kate Winslet'],
  },
  {
    id: 'her',
    title: 'Her',
    year: 2013,
    director: 'Spike Jonze',
    genres: ['Drama', 'Romance', 'Sci-Fi'],
    imdbRating: 8.0,
    tagline: 'A Spike Jonze Love Story.',
    synopsis: 'A lonely writer develops an unlikely relationship with an operating system designed to meet his every need.',
    vibeVector: { melancholy: 0.85, longing: 0.9, peace: 0.3, nostalgia: 0.5, awe: 0.6 },
    posterPrompt: 'Warm pastel cityscape, solitary figure with earpiece, soft golden light',
    clipPrompt: 'A lonely figure walking through a warm-toned futuristic city at sunset, thoughtful',
    runtime: 126,
    cast: ['Joaquin Phoenix', 'Scarlett Johansson'],
  },
  {
    id: 'lost-in-translation',
    title: 'Lost in Translation',
    year: 2003,
    director: 'Sofia Coppola',
    genres: ['Drama', 'Comedy'],
    imdbRating: 7.7,
    tagline: 'Everyone wants to be found.',
    synopsis: 'Two lonely Americans meet in Tokyo and form an unexpected bond amid their shared isolation.',
    vibeVector: { melancholy: 0.8, longing: 0.85, peace: 0.4, nostalgia: 0.3, awe: 0.3 },
    posterPrompt: 'Neon Tokyo streets at night seen through a hotel window, reflective mood',
    clipPrompt: 'Blurred neon lights of Tokyo at night reflected in glass, lonely and beautiful',
    runtime: 102,
    cast: ['Bill Murray', 'Scarlett Johansson'],
  },
  // ── High Longing ────────────────────────
  {
    id: 'blade-runner-2049',
    title: 'Blade Runner 2049',
    year: 2017,
    director: 'Denis Villeneuve',
    genres: ['Sci-Fi', 'Drama', 'Thriller'],
    imdbRating: 8.0,
    tagline: 'The key to the future is finally unearthed.',
    synopsis: 'A new blade runner unearths a long-buried secret that leads him to track down former blade runner Rick Deckard.',
    vibeVector: { melancholy: 0.7, longing: 0.95, peace: 0.1, nostalgia: 0.4, awe: 0.85 },
    posterPrompt: 'Vast orange desert with a tiny silhouette, cyberpunk ruins in the haze',
    clipPrompt: 'Slow pan across a fog-drenched cyberpunk city with holographic advertisements, atmospheric',
    runtime: 164,
    cast: ['Ryan Gosling', 'Harrison Ford'],
  },
  {
    id: 'drive',
    title: 'Drive',
    year: 2011,
    director: 'Nicolas Winding Refn',
    genres: ['Crime', 'Drama', 'Action'],
    imdbRating: 7.8,
    tagline: 'There are no clean getaways.',
    synopsis: 'A mysterious Hollywood stuntman and mechanic moonlights as a getaway driver and finds himself in trouble.',
    vibeVector: { melancholy: 0.6, longing: 0.8, peace: 0.1, nostalgia: 0.5, awe: 0.3 },
    posterPrompt: 'Neon-soaked LA night, scorpion jacket, headlights on an empty road',
    clipPrompt: 'A car driving through neon-lit LA streets at night, synthwave atmosphere',
    runtime: 100,
    cast: ['Ryan Gosling', 'Carey Mulligan'],
  },
  {
    id: 'in-the-mood-for-love',
    title: 'In the Mood for Love',
    year: 2000,
    director: 'Wong Kar-wai',
    genres: ['Drama', 'Romance'],
    imdbRating: 8.1,
    tagline: 'Feel the heat, keep the feeling burning.',
    synopsis: 'Two neighbors discover their spouses are having an affair and develop a deep emotional connection.',
    vibeVector: { melancholy: 0.85, longing: 0.95, peace: 0.3, nostalgia: 0.9, awe: 0.2 },
    posterPrompt: 'Rain-soaked Hong Kong alley, two figures almost touching, warm red and green tones',
    clipPrompt: 'Slow-motion rain in a narrow alley with warm light and soft jazz',
    runtime: 98,
    cast: ['Tony Leung', 'Maggie Cheung'],
  },
  // ── High Peace ──────────────────────────
  {
    id: 'my-neighbor-totoro',
    title: 'My Neighbor Totoro',
    year: 1988,
    director: 'Hayao Miyazaki',
    genres: ['Animation', 'Family', 'Fantasy'],
    imdbRating: 8.1,
    tagline: "He's not scary. He's just big.",
    synopsis: 'Two sisters move to the countryside and discover friendly forest spirits.',
    vibeVector: { melancholy: 0.1, longing: 0.1, peace: 0.95, nostalgia: 0.7, awe: 0.6 },
    posterPrompt: 'Lush green forest with a giant friendly creature, two children, magical sunlight',
    clipPrompt: 'Wind blowing through a sunlit rice field with a giant tree in the background, Ghibli-esque',
    runtime: 86,
    cast: ['Noriko Hidaka', 'Chika Sakamoto'],
  },
  {
    id: 'the-secret-life-of-walter-mitty',
    title: 'The Secret Life of Walter Mitty',
    year: 2013,
    director: 'Ben Stiller',
    genres: ['Adventure', 'Comedy', 'Drama'],
    imdbRating: 7.3,
    tagline: 'Stop dreaming. Start living.',
    synopsis: 'A daydreaming magazine employee embarks on a global adventure to find a missing photograph.',
    vibeVector: { melancholy: 0.2, longing: 0.5, peace: 0.85, nostalgia: 0.3, awe: 0.9 },
    posterPrompt: 'Vast Icelandic landscape with a tiny longboarder, epic mountain backdrop',
    clipPrompt: 'A lone figure skateboarding on an endless empty road through green Icelandic mountains',
    runtime: 114,
    cast: ['Ben Stiller', 'Kristen Wiig'],
  },
  {
    id: 'spirited-away',
    title: 'Spirited Away',
    year: 2001,
    director: 'Hayao Miyazaki',
    genres: ['Animation', 'Adventure', 'Fantasy'],
    imdbRating: 8.6,
    tagline: 'The tunnel led Chihiro to a mysterious town.',
    synopsis: 'A young girl trapped in a spirit world must find a way to free herself and her parents.',
    vibeVector: { melancholy: 0.3, longing: 0.3, peace: 0.7, nostalgia: 0.5, awe: 0.95 },
    posterPrompt: 'An ethereal bathhouse over dark water at night, floating lanterns, magical atmosphere',
    clipPrompt: 'A train gliding silently across an infinite flooded plain at dusk, dreamlike and beautiful',
    runtime: 125,
    cast: ['Rumi Hiiragi', 'Miyu Irino'],
  },
  // ── High Nostalgia ──────────────────────
  {
    id: 'cinema-paradiso',
    title: 'Cinema Paradiso',
    year: 1988,
    director: 'Giuseppe Tornatore',
    genres: ['Drama', 'Romance'],
    imdbRating: 8.5,
    tagline: 'A celebration of youth, friendship, and the magic of the movies.',
    synopsis: 'A filmmaker returns home and recalls his childhood friendship with the projectionist at the local cinema.',
    vibeVector: { melancholy: 0.6, longing: 0.5, peace: 0.4, nostalgia: 0.95, awe: 0.3 },
    posterPrompt: 'Vintage Italian cinema interior with projected light beams and film reels, warm sepia',
    clipPrompt: 'Warm light from a film projector illuminating dust particles in a dark theater',
    runtime: 155,
    cast: ['Philippe Noiret', 'Salvatore Cascio'],
  },
  {
    id: 'the-grand-budapest-hotel',
    title: 'The Grand Budapest Hotel',
    year: 2014,
    director: 'Wes Anderson',
    genres: ['Adventure', 'Comedy', 'Crime'],
    imdbRating: 8.1,
    tagline: 'A murder mystery set in a famous hotel.',
    synopsis: 'A writer encounters the owner of an aging hotel who tells of his adventures with a legendary concierge.',
    vibeVector: { melancholy: 0.4, longing: 0.3, peace: 0.3, nostalgia: 0.9, awe: 0.5 },
    posterPrompt: 'Symmetrical pastel pink hotel facade in the mountains, Wes Anderson color palette',
    clipPrompt: 'A grand pastel-colored hotel lobby with perfectly arranged vintage furniture, whimsical',
    runtime: 99,
    cast: ['Ralph Fiennes', 'Tony Revolori'],
  },
  {
    id: 'midnight-in-paris',
    title: 'Midnight in Paris',
    year: 2011,
    director: 'Woody Allen',
    genres: ['Comedy', 'Fantasy', 'Romance'],
    imdbRating: 7.7,
    tagline: 'At midnight in Paris, anything is possible.',
    synopsis: 'A nostalgic screenwriter traveling in Paris finds himself mysteriously going back to the 1920s every night.',
    vibeVector: { melancholy: 0.3, longing: 0.6, peace: 0.5, nostalgia: 0.95, awe: 0.4 },
    posterPrompt: 'Paris streets at midnight with golden street lamps and cobblestones, romantic and timeless',
    clipPrompt: 'Rain-glistened Parisian cobblestone streets under golden lamplight at midnight',
    runtime: 94,
    cast: ['Owen Wilson', 'Rachel McAdams'],
  },
  // ── High Awe ────────────────────────────
  {
    id: 'interstellar',
    title: 'Interstellar',
    year: 2014,
    director: 'Christopher Nolan',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    imdbRating: 8.7,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    synopsis: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    vibeVector: { melancholy: 0.6, longing: 0.5, peace: 0.2, nostalgia: 0.4, awe: 0.95 },
    posterPrompt: 'A massive black hole bending light around it, tiny spaceship approaching, cosmic scale',
    clipPrompt: 'Stars stretching into lines as a ship enters a wormhole, awe-inspiring cosmic visuals',
    runtime: 169,
    cast: ['Matthew McConaughey', 'Anne Hathaway'],
  },
  {
    id: '2001-space-odyssey',
    title: '2001: A Space Odyssey',
    year: 1968,
    director: 'Stanley Kubrick',
    genres: ['Sci-Fi', 'Adventure'],
    imdbRating: 8.3,
    tagline: 'An epic drama of adventure and exploration.',
    synopsis: 'After discovering a mysterious artifact on the Moon, humanity sets off on a quest to Jupiter.',
    vibeVector: { melancholy: 0.5, longing: 0.4, peace: 0.3, nostalgia: 0.2, awe: 0.95 },
    posterPrompt: 'A monolith floating in space with Jupiter in the background, stark and mysterious',
    clipPrompt: 'A lone astronaut floating in the silence of deep space with stars in every direction',
    runtime: 149,
    cast: ['Keir Dullea', 'Gary Lockwood'],
  },
  {
    id: 'arrival',
    title: 'Arrival',
    year: 2016,
    director: 'Denis Villeneuve',
    genres: ['Sci-Fi', 'Drama', 'Mystery'],
    imdbRating: 7.9,
    tagline: 'Why are they here?',
    synopsis: 'A linguist is recruited to help communicate with alien visitors and discovers a profound truth about time.',
    vibeVector: { melancholy: 0.7, longing: 0.4, peace: 0.5, nostalgia: 0.3, awe: 0.9 },
    posterPrompt: 'A massive alien ship hovering over misty mountains, eerie calm, cinematic wide shot',
    clipPrompt: 'Fog rolling over a field with an enormous dark shape hovering above, mysterious and serene',
    runtime: 116,
    cast: ['Amy Adams', 'Jeremy Renner'],
  },
  // ── Crime/Thriller (the "Crime 101" vibe) ─────────────────
  {
    id: 'se7en',
    title: 'Se7en',
    year: 1995,
    director: 'David Fincher',
    genres: ['Crime', 'Drama', 'Mystery'],
    imdbRating: 8.6,
    tagline: 'Seven deadly sins. Seven ways to die.',
    synopsis: 'Two detectives hunt a serial killer who uses the seven deadly sins as his motives.',
    vibeVector: { melancholy: 0.9, longing: 0.3, peace: 0.0, nostalgia: 0.2, awe: 0.4 },
    posterPrompt: 'Rain-drenched dark city, noir shadows, detective silhouette in harsh fluorescent light',
    clipPrompt: 'Heavy rain on a dark urban street with a single swinging overhead light, noir tension',
    runtime: 127,
    cast: ['Brad Pitt', 'Morgan Freeman'],
  },
  {
    id: 'the-departed',
    title: 'The Departed',
    year: 2006,
    director: 'Martin Scorsese',
    genres: ['Crime', 'Drama', 'Thriller'],
    imdbRating: 8.5,
    tagline: 'Lies. Betrayal. Sacrifice. How far will you take it?',
    synopsis: 'An undercover cop and a mole in the police attempt to identify each other while infiltrating a Boston crime syndicate.',
    vibeVector: { melancholy: 0.6, longing: 0.4, peace: 0.0, nostalgia: 0.3, awe: 0.3 },
    posterPrompt: 'Split face portrait, one side in light one in shadow, Boston skyline behind',
    clipPrompt: 'A tense meeting in a dark bar, cigarette smoke, overhead fluorescent buzz',
    runtime: 151,
    cast: ['Leonardo DiCaprio', 'Matt Damon', 'Jack Nicholson'],
  },
  {
    id: 'no-country-for-old-men',
    title: 'No Country for Old Men',
    year: 2007,
    director: 'Joel Coen, Ethan Coen',
    genres: ['Crime', 'Drama', 'Thriller'],
    imdbRating: 8.2,
    tagline: 'There are no clean getaways.',
    synopsis: 'A hunter stumbles upon a drug deal gone wrong and is pursued by a psychopathic killer.',
    vibeVector: { melancholy: 0.7, longing: 0.2, peace: 0.1, nostalgia: 0.4, awe: 0.3 },
    posterPrompt: 'Vast empty Texas desert highway, solitary figure, harsh sunlight, oppressive silence',
    clipPrompt: 'A coin spinning on a gas station counter in dead silence, tension building',
    runtime: 122,
    cast: ['Javier Bardem', 'Josh Brolin', 'Tommy Lee Jones'],
  },
  {
    id: 'heat',
    title: 'Heat',
    year: 1995,
    director: 'Michael Mann',
    genres: ['Crime', 'Drama', 'Action'],
    imdbRating: 8.3,
    tagline: 'A Los Angeles crime saga.',
    synopsis: 'A group of professional bank robbers start to feel the heat from a dedicated detective closing in on their trail.',
    vibeVector: { melancholy: 0.5, longing: 0.6, peace: 0.1, nostalgia: 0.3, awe: 0.4 },
    posterPrompt: 'LA downtown at night, blue steel tones, two men on opposite sides of a street',
    clipPrompt: 'Night cityscape of Los Angeles from a rooftop, cold blue tones, distant sirens',
    runtime: 170,
    cast: ['Al Pacino', 'Robert De Niro'],
  },
  // ── Mixed / Balanced Vibes ────────────────────────────────
  {
    id: 'moonlight',
    title: 'Moonlight',
    year: 2016,
    director: 'Barry Jenkins',
    genres: ['Drama'],
    imdbRating: 7.4,
    tagline: 'This is the story of a lifetime.',
    synopsis: 'A young African-American man grapples with his identity and sexuality while growing up in Miami.',
    vibeVector: { melancholy: 0.8, longing: 0.7, peace: 0.4, nostalgia: 0.6, awe: 0.3 },
    posterPrompt: 'Blue and purple moonlit beach, a silhouette looking at the ocean, intimate and vast',
    clipPrompt: 'Moonlight reflecting on gentle ocean waves, a figure standing at the water edge, blue tones',
    runtime: 111,
    cast: ['Trevante Rhodes', 'Ashton Sanders', 'Mahershala Ali'],
  },
  {
    id: 'the-tree-of-life',
    title: 'The Tree of Life',
    year: 2011,
    director: 'Terrence Malick',
    genres: ['Drama', 'Fantasy'],
    imdbRating: 6.8,
    tagline: 'Where were you when I laid the earth\'s foundation?',
    synopsis: 'A Texas family navigates loss and the passage of time against the backdrop of the universe\'s creation.',
    vibeVector: { melancholy: 0.6, longing: 0.5, peace: 0.7, nostalgia: 0.8, awe: 0.9 },
    posterPrompt: 'Golden sunlight through a tree with a child running beneath, cosmic nebula in the sky',
    clipPrompt: 'Golden hour light filtering through old trees, children playing in a yard, timeless and warm',
    runtime: 139,
    cast: ['Brad Pitt', 'Sean Penn', 'Jessica Chastain'],
  },
  {
    id: 'the-shawshank-redemption',
    title: 'The Shawshank Redemption',
    year: 1994,
    director: 'Frank Darabont',
    genres: ['Drama'],
    imdbRating: 9.3,
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    vibeVector: { melancholy: 0.5, longing: 0.7, peace: 0.4, nostalgia: 0.6, awe: 0.5 },
    posterPrompt: 'A man standing in the rain with arms outstretched, prison walls behind, freedom ahead',
    clipPrompt: 'Rain falling on an upturned face, arms outstretched, the moment of freedom',
    runtime: 142,
    cast: ['Tim Robbins', 'Morgan Freeman'],
  },
  {
    id: 'parasite',
    title: 'Parasite',
    year: 2019,
    director: 'Bong Joon-ho',
    genres: ['Comedy', 'Drama', 'Thriller'],
    imdbRating: 8.5,
    tagline: 'Act like you own the place.',
    synopsis: 'Greed and class discrimination threaten the symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    vibeVector: { melancholy: 0.6, longing: 0.3, peace: 0.1, nostalgia: 0.2, awe: 0.5 },
    posterPrompt: 'Split-level house, one half luxurious, one half flooded basement, rain pouring',
    clipPrompt: 'Rain flooding down stone stairs from a bright mansion into a dark basement, contrast',
    runtime: 132,
    cast: ['Song Kang-ho', 'Choi Woo-shik'],
  },
  {
    id: 'amelie',
    title: 'Amélie',
    year: 2001,
    director: 'Jean-Pierre Jeunet',
    genres: ['Comedy', 'Romance'],
    imdbRating: 8.3,
    tagline: 'She\'ll change your life.',
    synopsis: 'A shy Parisian waitress decides to change the lives of those around her, discovering love along the way.',
    vibeVector: { melancholy: 0.2, longing: 0.4, peace: 0.7, nostalgia: 0.8, awe: 0.5 },
    posterPrompt: 'Whimsical Parisian cafe with warm golden tones, a curious woman with a knowing smile',
    clipPrompt: 'A stone skipping on the Canal Saint-Martin in warm afternoon light, playful and dreamy',
    runtime: 122,
    cast: ['Audrey Tautou', 'Mathieu Kassovitz'],
  },
];

// ─── Recommendation Engine ──────────────────────────────────

/** Cosine similarity between two vibe vectors */
function vibeDistance(a: VibeVector, b: VibeVector): number {
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
function getMatchReason(movie: Movie, profile: VibeProfile): string {
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
export function getRecommendations(profile: VibeProfile, count: number = 10): MovieRecommendation[] {
  const scored = MOVIES.map(movie => ({
    movie,
    vibeMatchScore: vibeDistance(profile.vibeVector, movie.vibeVector),
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
  count: number = 10,
): MovieRecommendation[] {
  const filtered = MOVIES.filter(m => m.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
  const scored = filtered.map(movie => ({
    movie,
    vibeMatchScore: vibeDistance(profile.vibeVector, movie.vibeVector),
    matchReason: getMatchReason(movie, profile),
  }));
  scored.sort((a, b) => b.vibeMatchScore - a.vibeMatchScore);
  return scored.slice(0, count);
}
