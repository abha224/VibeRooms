'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, Star, Clock, Film, Sparkles, RotateCcw } from 'lucide-react';
import { VibeProfile, VibeVector, MovieRecommendation } from '@/lib/types';
import { loadVibeProfile, clearVibeProfile } from '@/lib/vibe-metrics';
import { getRecommendations } from '@/lib/movies';
import { cn } from '@/lib/cn';

const VIBE_COLORS: Record<keyof VibeVector, string> = {
  melancholy: '#38bdf8',
  longing: '#f472b6',
  peace: '#4ade80',
  nostalgia: '#f59e0b',
  awe: '#e2e8f0',
};

const VIBE_LABELS: Record<keyof VibeVector, string> = {
  melancholy: 'Melancholy',
  longing: 'Longing',
  peace: 'Peace',
  nostalgia: 'Nostalgia',
  awe: 'Awe',
};

export default function DiscoverPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<VibeProfile | null>(null);
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>([]);
  const [showProfile, setShowProfile] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [expandedMovie, setExpandedMovie] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadVibeProfile();
    if (!loaded) {
      router.push('/');
      return;
    }
    setProfile(loaded);
    setRecommendations(getRecommendations(loaded, 12));

    // Reveal recommendations after profile display
    const timer = setTimeout(() => setShowProfile(false), 4000);
    return () => clearTimeout(timer);
  }, [router]);

  const genres = useMemo(() => {
    if (!recommendations.length) return [];
    const all = new Set<string>();
    recommendations.forEach(r => r.movie.genres.forEach(g => all.add(g)));
    return Array.from(all).sort();
  }, [recommendations]);

  const filteredRecs = useMemo(() => {
    if (!selectedGenre) return recommendations;
    return recommendations.filter(r =>
      r.movie.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase())
    );
  }, [recommendations, selectedGenre]);

  const handleRetake = () => {
    clearVibeProfile();
    router.push('/');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">Loading your vibe...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Vibe Profile Reveal */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-8"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-[0.5em] text-zinc-500 mb-8"
            >
              Your Vibe Profile
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-5xl font-light serif italic mb-4"
            >
              {profile.dominantEmotion}
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="w-32 h-[1px] bg-white/20 mb-8"
            />

            {/* Vibe Bars */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="w-full max-w-xs space-y-3"
            >
              {(Object.keys(profile.vibeVector) as (keyof VibeVector)[]).map((key, i) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 w-20 text-right">
                    {VIBE_LABELS[key]}
                  </span>
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${profile.vibeVector[key] * 100}%` }}
                      transition={{ delay: 1.2 + i * 0.15, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: VIBE_COLORS[key] }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-600 w-8">
                    {Math.round(profile.vibeVector[key] * 100)}%
                  </span>
                </div>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 2.5 }}
              className="mt-8 text-xs text-zinc-600 uppercase tracking-widest"
            >
              Finding your movies...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-light">
                <span className="serif italic">Discover</span>
                <span className="text-zinc-500 ml-2 text-sm">— matched to your vibe</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <Sparkles className="w-3 h-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">{profile.dominantEmotion}</span>
              <span className="text-xs text-zinc-600">• {profile.totalInteractions} signals</span>
            </div>
            <button
              onClick={handleRetake}
              className="p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
              title="Retake vibe quiz"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Mini Vibe Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: showProfile ? 4.5 : 0 }}
          className="mb-8 flex flex-wrap items-center gap-2"
        >
          {(Object.keys(profile.vibeVector) as (keyof VibeVector)[]).map(key => (
            <div
              key={key}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5"
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: VIBE_COLORS[key] }} />
              <span className="text-xs text-zinc-400">{VIBE_LABELS[key]}</span>
              <span className="text-xs text-zinc-600">{Math.round(profile.vibeVector[key] * 100)}%</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/5">
            <span className="text-xs text-zinc-400">Engagement</span>
            <span className="text-xs text-zinc-600">{Math.round(profile.engagementScore * 100)}%</span>
          </div>
        </motion.div>

        {/* Genre Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: showProfile ? 4.8 : 0.2 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          <button
            onClick={() => setSelectedGenre(null)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs uppercase tracking-widest transition-all border",
              !selectedGenre
                ? "bg-white text-black border-white"
                : "border-white/10 text-zinc-500 hover:text-white hover:border-white/30"
            )}
          >
            All
          </button>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs uppercase tracking-widest transition-all border",
                selectedGenre === genre
                  ? "bg-white text-black border-white"
                  : "border-white/10 text-zinc-500 hover:text-white hover:border-white/30"
              )}
            >
              {genre}
            </button>
          ))}
        </motion.div>

        {/* Movie Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: showProfile ? 5 : 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredRecs.map((rec, i) => (
            <MovieCard
              key={rec.movie.id}
              rec={rec}
              index={i}
              isExpanded={expandedMovie === rec.movie.id}
              onToggle={() => setExpandedMovie(
                expandedMovie === rec.movie.id ? null : rec.movie.id
              )}
              delayBase={showProfile ? 5.2 : 0.5}
            />
          ))}
        </motion.div>

        {filteredRecs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-sm italic">No movies match this filter with your vibe.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Movie Card Component ───────────────────────────────────

function MovieCard({ rec, index, isExpanded, onToggle, delayBase }: {
  rec: MovieRecommendation;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  delayBase: number;
}) {
  const { movie, vibeMatchScore, matchReason } = rec;
  const matchPercent = Math.round(vibeMatchScore * 100);
  const [atmosphereUrl, setAtmosphereUrl] = useState<string | null>(null);
  const [loadingAtmosphere, setLoadingAtmosphere] = useState(false);

  const generateAtmosphere = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (atmosphereUrl || loadingAtmosphere) return;
    setLoadingAtmosphere(true);
    try {
      const res = await fetch('/api/gemini/atmosphere', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: movie.posterPrompt, movieTitle: movie.title }),
      });
      const data = await res.json();
      if (data.imageUrl) setAtmosphereUrl(data.imageUrl);
    } catch (err) {
      console.error('Atmosphere gen error:', err);
    }
    setLoadingAtmosphere(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delayBase + index * 0.08 }}
      onClick={onToggle}
      className={cn(
        "group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04]",
        isExpanded && "border-white/20 bg-white/[0.04]"
      )}
    >
      {/* Color Bar based on dominant vibe */}
      <div className="h-1 w-full flex">
        {(Object.keys(movie.vibeVector) as (keyof VibeVector)[]).map(key => (
          <div
            key={key}
            className="h-full transition-all"
            style={{
              width: `${movie.vibeVector[key] * 100}%`,
              backgroundColor: VIBE_COLORS[key],
              opacity: movie.vibeVector[key] * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-light leading-tight group-hover:text-white transition-colors">
              {movie.title}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              {movie.year} · {movie.director}
            </p>
          </div>
          <div className="ml-3 flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">{matchPercent}%</span>
          </div>
        </div>

        {/* Match reason */}
        <p className="text-xs text-zinc-500 italic mb-3">{matchReason}</p>

        {/* Genres */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {movie.genres.map(genre => (
            <span key={genre} className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] text-zinc-400 uppercase tracking-widest">
              {genre}
            </span>
          ))}
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            <span>{movie.imdbRating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{movie.runtime}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Film className="w-3 h-3" />
            <span>{movie.cast[0]}</span>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
                <p className="text-sm text-zinc-300 font-light italic">&ldquo;{movie.tagline}&rdquo;</p>
                <p className="text-xs text-zinc-500 leading-relaxed">{movie.synopsis}</p>

                {/* Vibe Breakdown */}
                <div className="space-y-1.5 pt-2">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">Vibe Breakdown</p>
                  {(Object.keys(movie.vibeVector) as (keyof VibeVector)[]).map(key => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-600 w-16 text-right">{VIBE_LABELS[key]}</span>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${movie.vibeVector[key] * 100}%`,
                            backgroundColor: VIBE_COLORS[key],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cast */}
                <div className="pt-2">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Cast</p>
                  <p className="text-xs text-zinc-400">{movie.cast.join(', ')}</p>
                </div>

                {/* Atmosphere Image */}
                {atmosphereUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 200 }}
                    className="rounded-xl overflow-hidden mt-2"
                  >
                    <img src={atmosphereUrl} alt={`${movie.title} atmosphere`} className="w-full h-full object-cover" />
                  </motion.div>
                )}

                {/* CTA */}
                <button
                  onClick={generateAtmosphere}
                  disabled={loadingAtmosphere}
                  className="w-full mt-2 py-3 rounded-xl bg-white text-black text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loadingAtmosphere ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                        <Sparkles className="w-4 h-4" />
                      </motion.div>
                      Generating Atmosphere...
                    </>
                  ) : atmosphereUrl ? (
                    <>
                      <Play className="w-4 h-4" />
                      Stream on AMC / Netflix
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Generate Atmosphere
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
