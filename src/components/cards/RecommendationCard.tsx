import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RoomConfig, FilmRecommendation, EnrichedCardEvent } from '../../types';
import { getRecommendations } from '../../lib/recommendations';
import { buildBehavioralProfile } from '../../lib/behavior';
import { ChevronLeft, ChevronRight, Star, Clock, Film } from 'lucide-react';

interface RecommendationCardProps {
  room: RoomConfig;
  events: EnrichedCardEvent[];
}

export default function RecommendationCard({ room, events }: RecommendationCardProps) {
  const [filmIdx, setFilmIdx] = useState(0);

  const films = useMemo(() => {
    const profile = buildBehavioralProfile(events);
    return getRecommendations(profile, room.slug, 5);
  }, [events, room.slug]);

  const dim   = `${room.theme.text}55`;
  const film  = films[filmIdx] as FilmRecommendation | undefined;

  const prev = () => setFilmIdx(i => Math.max(0, i - 1));
  const next = () => setFilmIdx(i => Math.min(films.length - 1, i + 1));

  if (!film) {
    return (
      <div className="h-full w-full flex items-center justify-center vibe-mono">
        <span className="text-[13px]" style={{ color: dim }}>[ no recommendations ]</span>
      </div>
    );
  }

  const matchPct = Math.round(film.score * 100);

  return (
    <div className="h-full w-full relative overflow-hidden vibe-mono">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 80%, ${room.theme.accent}18 0%, ${room.theme.bg} 70%)`,
        }}
      />

      {/* Label */}
      <div
        className="absolute top-6 left-8 z-20 text-[11px] tracking-[0.35em] uppercase opacity-70"
        style={{ color: room.theme.accent }}
      >
        {room.name} / matched for you
      </div>

      {/* Score badge */}
      <div
        className="absolute top-6 right-8 z-20 text-[32px] vibe-display tracking-wide leading-none"
        style={{ color: `${room.theme.accent}66` }}
      >
        {matchPct}%
      </div>

      {/* Film content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={film.tconst}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            {/* Title */}
            <h2
              className="text-[clamp(32px,5vw,56px)] leading-[1.05] vibe-display tracking-[0.08em] mb-3"
              style={{ color: room.theme.text }}
            >
              {film.title}
            </h2>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-6">
              <span className="text-[14px] tracking-wide" style={{ color: dim }}>
                {film.year}
              </span>

              <span className="flex items-center gap-1 text-[13px]" style={{ color: room.theme.accent }}>
                <Star className="w-3.5 h-3.5 fill-current" />
                {film.rating.toFixed(1)}
              </span>

              <span className="flex items-center gap-1.5 text-[12px]" style={{ color: dim }}>
                <Clock className="w-3 h-3" />
                {film.runtime} min
              </span>

              <span className="flex items-center gap-1.5 text-[12px]" style={{ color: dim }}>
                <Film className="w-3 h-3" />
                {film.genres.join(' / ')}
              </span>
            </div>

            {/* IMDb link */}
            <div className="mb-6">
              <a
                href={`https://www.imdb.com/title/${film.tconst}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] tracking-[0.25em] uppercase transition-opacity hover:opacity-100 opacity-50"
                style={{ color: room.theme.accent }}
              >
                view on imdb →
              </a>
            </div>

            {/* Separator */}
            <div
              className="w-16 h-px mb-5"
              style={{ backgroundColor: `${room.theme.accent}44` }}
            />

            {/* Match reason */}
            <div
              className="text-[10px] tracking-[0.35em] uppercase leading-relaxed"
              style={{ color: `${room.theme.accent}88` }}
            >
              {film.match_reason}
            </div>

            {/* Vote count */}
            <div className="mt-3 text-[10px] tracking-wide" style={{ color: `${room.theme.text}33` }}>
              {film.votes.toLocaleString()} IMDb votes
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {films.length > 1 && (
        <div className="absolute bottom-16 left-8 z-20 flex items-center gap-4">
          <button
            onClick={prev}
            disabled={filmIdx === 0}
            className="transition-opacity disabled:opacity-15"
            style={{ color: dim }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-2">
            {films.map((_, i) => (
              <button
                key={i}
                onClick={() => setFilmIdx(i)}
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  backgroundColor: i === filmIdx ? room.theme.accent : `${room.theme.text}33`,
                  transform:       i === filmIdx ? 'scale(1.5)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={filmIdx === films.length - 1}
            className="transition-opacity disabled:opacity-15"
            style={{ color: dim }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Bottom label */}
      <div className="absolute bottom-5 left-8 z-20 text-[11px] tracking-[0.25em]" style={{ color: `${room.theme.text}33` }}>
        imdb · vibe-matched
      </div>
      <div className="absolute bottom-5 right-8 z-20 text-[11px] tracking-[0.25em]" style={{ color: `${room.theme.text}33` }}>
        {filmIdx + 1}/{films.length}
      </div>
    </div>
  );
}
