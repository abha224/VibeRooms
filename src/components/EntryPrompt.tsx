import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { getRoomFromPrompt } from '../lib/routing';
import { ROOMS_BY_CATEGORY } from '../lib/rooms';
import {
  setEntryPrompt,
  setRoutedRoom,
  startEntryTimer,
  markReturnedToEntry,
  setCategory,
} from '../lib/session';
import { Category } from '../types';

// ── Category meta ────────────────────────────────────────────────────────────

const CATEGORIES: { id: Category; label: string; accent: string }[] = [
  { id: 'travel', label: 'TRAVEL', accent: '#E8A830' },
  { id: 'movies', label: 'MOVIES', accent: '#C84040' },
  { id: 'music',  label: 'MUSIC',  accent: '#A0D830' },
];

const CATEGORY_QUESTION: Record<Category, string> = {
  travel: "where are you headed, or where did you just come from?",
  movies: "what are you carrying from the last thing you watched?",
  music:  "what's playing in your head right now?",
};

const SAMPLE_PROMPTS: Record<Category, string[]> = {
  travel: [
    "the anxiety right before departure",
    "a city that didn't feel real at first",
    "the hour before a long flight",
    "arriving somewhere you have no words for",
    "a train window in the rain",
    "places that changed how you see things",
  ],
  movies: [
    "a film that felt like it was made for you",
    "watching something alone at 2am",
    "a scene you return to without meaning to",
    "the silence after the credits roll",
    "something you can't explain to anyone else",
    "a story that made you feel less alone",
  ],
  music: [
    "a song locked to a specific memory",
    "music that only works at night",
    "the feeling before a show starts",
    "an album that felt like a whole world",
    "something you heard once and never found again",
    "sound that makes a room feel different",
  ],
};

// ── Component ────────────────────────────────────────────────────────────────

export default function EntryPrompt() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [prompt, setPrompt]       = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const [hoverSlug, setHoverSlug] = useState<string | null>(null);
  const navigate  = useNavigate();
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    startEntryTimer();
  }, []);

  useEffect(() => {
    if (isExiting) markReturnedToEntry();
  }, [isExiting]);

  // Focus textarea when category is selected
  useEffect(() => {
    if (selectedCategory) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [selectedCategory]);

  const activeAccent = selectedCategory
    ? CATEGORIES.find(c => c.id === selectedCategory)!.accent
    : '#FFFFFF';

  const submit = () => {
    if (!selectedCategory || !prompt.trim()) return;

    const slug = getRoomFromPrompt(prompt, selectedCategory);
    setEntryPrompt(prompt.trim());
    setCategory(selectedCategory);
    setRoutedRoom(slug);
    setIsExiting(true);

    setTimeout(() => navigate(`/rooms/${slug}`), 600);
  };

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleSampleClick = (p: string) => {
    setPrompt(p);
    inputRef.current?.focus();
  };

  const canSubmit = !!selectedCategory && !!prompt.trim();

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white vibe-mono overflow-hidden">
      <div className="scanline-overlay" />

      <AnimatePresence>
        {!isExiting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col justify-between h-full w-full px-10 md:px-20 py-12"
          >
            {/* ── Top: wordmark + title ─────────────────────────── */}
            <div>
              <div className="text-[11px] tracking-[0.6em] text-white/20 mb-4">VIBE[NYU]ROOMS</div>
              <div className="text-[clamp(56px,10vw,120px)] leading-none tracking-[0.15em] vibe-display vibe-flicker text-white">
                TUNE IN
              </div>
            </div>

            {/* ── Middle: category + prompts + textarea ─────────── */}
            <form onSubmit={handleEnter} className="w-full">

              {/* Category buttons */}
              <div className="flex gap-6 mb-10">
                {CATEGORIES.map(cat => {
                  const selected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className="text-[11px] tracking-[0.45em] uppercase pb-2 transition-all duration-200 border-b-2"
                      style={{
                        color:       selected ? cat.accent : 'rgba(255,255,255,0.25)',
                        borderColor: selected ? cat.accent : 'transparent',
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Sample prompts */}
              <AnimatePresence>
                {selectedCategory && (
                  <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="mb-8"
                  >
                    <div className="text-[10px] tracking-[0.5em] uppercase mb-4" style={{ color: `${activeAccent}66` }}>
                      try one of these
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {SAMPLE_PROMPTS[selectedCategory].map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => handleSampleClick(p)}
                          className="text-left text-[12px] leading-snug tracking-wide px-3 py-2 transition-all duration-150 border border-transparent rounded-sm"
                          style={{
                            color:           prompt === p ? activeAccent : 'rgba(255,255,255,0.35)',
                            borderColor:     prompt === p ? `${activeAccent}55` : 'transparent',
                            backgroundColor: prompt === p ? `${activeAccent}10` : 'transparent',
                          }}
                          onMouseEnter={e => {
                            if (prompt !== p) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)';
                          }}
                          onMouseLeave={e => {
                            if (prompt !== p) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)';
                          }}
                        >
                          ▸ {p}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Prompt question + textarea */}
              <div className="mb-10">
                <div className="text-[13px] text-white/35 mb-5 tracking-wide transition-all duration-300">
                  {selectedCategory
                    ? `▸ ${CATEGORY_QUESTION[selectedCategory]}`
                    : '▸ select a category to begin'}
                </div>
                <textarea
                  ref={inputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      submit();
                    }
                  }}
                  placeholder={selectedCategory ? 'or type anything...' : 'type anything...'}
                  rows={2}
                  disabled={!selectedCategory}
                  className="w-full bg-transparent border-b focus:outline-none transition-all duration-300 text-[clamp(17px,2.2vw,24px)] leading-relaxed tracking-[0.02em] text-white/80 placeholder:text-white/15 resize-none py-3 disabled:opacity-30"
                  style={{
                    borderColor: prompt.trim() && selectedCategory
                      ? `${activeAccent}88`
                      : 'rgba(255,255,255,0.12)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="text-[11px] tracking-[0.35em] uppercase py-3 flex items-center gap-2 transition-all duration-200 disabled:text-white/20"
                style={{ color: canSubmit ? activeAccent : undefined }}
              >
                <span>find my room</span>
                <span className="text-[18px]">→</span>
              </button>
            </form>

            {/* ── Bottom: room quick-links ──────────────────────── */}
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {CATEGORIES.map(cat =>
                ROOMS_BY_CATEGORY[cat.id].map((room) => {
                  const isHov = hoverSlug === room.slug;
                  return (
                    <button
                      key={room.slug}
                      type="button"
                      onClick={() => navigate(`/rooms/${room.slug}`)}
                      onMouseEnter={() => setHoverSlug(room.slug)}
                      onMouseLeave={() => setHoverSlug(null)}
                      className="text-[10px] tracking-[0.2em] uppercase transition-colors"
                      style={{ color: isHov ? room.theme.accent : '#2A2A2A' }}
                    >
                      {room.name}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
