'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { VibeCategory, RoomSlug } from '@/lib/types';
import { CATEGORIES, ROOMS } from '@/lib/constants';
import { cn } from '@/lib/cn';

export default function EntryExperience() {
  const [activeCategory, setActiveCategory] = useState<VibeCategory>('movies');
  const [answer, setAnswer] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetRoom, setTargetRoom] = useState<string | null>(null);
  const router = useRouter();

  const category = CATEGORIES.find(c => c.id === activeCategory)!;

  // ─── Routing Logic ──────────────────────────────────────

  const routeToRoom = (input: string) => {
    const text = input.toLowerCase();

    // Score each room in this category by keyword matches
    let bestRoom: RoomSlug = category.rooms[0];
    let bestScore = 0;

    for (const roomSlug of category.rooms) {
      const keywords = category.keywords[roomSlug] || [];
      let score = 0;
      for (const kw of keywords) {
        if (text.includes(kw)) score++;
      }
      if (score > bestScore) {
        bestScore = score;
        bestRoom = roomSlug;
      }
    }

    // If no keyword matches, pick a random room from the category
    if (bestScore === 0) {
      bestRoom = category.rooms[Math.floor(Math.random() * category.rooms.length)];
    }

    return bestRoom;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    submitAnswer(answer);
  };

  const submitAnswer = (text: string) => {
    if (!text.trim()) return;

    sessionStorage.setItem('viberooms_entry_answer', text);
    sessionStorage.setItem('viberooms_category', activeCategory);

    const slug = routeToRoom(text);
    setTargetRoom(ROOMS[slug]?.name || slug);
    setIsTransitioning(true);

    setTimeout(() => {
      router.push(`/rooms/${slug}`);
    }, 2200);
  };

  const handleSampleClick = (prompt: string) => {
    setAnswer(prompt);
    submitAnswer(prompt);
  };

  // Room names for the bottom bar
  const allRoomNames = CATEGORIES.flatMap(c =>
    c.rooms.map(slug => ROOMS[slug]?.name || slug)
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col relative overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-rose-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-8"
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm uppercase tracking-[0.3em] font-light text-zinc-400"
            >
              Finding your room...
            </motion.p>
            {targetRoom && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1 }}
                className="mt-3 text-xs text-zinc-600 font-light tracking-widest"
              >
                {targetRoom}
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-6 sm:px-10 py-12 sm:py-16 relative z-10">
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10 sm:mb-16"
        >
          <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-600 font-medium mb-6">
            Vibe Rooms
          </p>
          <h1 className="text-6xl sm:text-8xl font-bold tracking-tighter leading-[0.85] text-white">
            TUNE IN
          </h1>
        </motion.div>

        {/* Category Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-8 mb-10 sm:mb-14"
        >
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setAnswer(''); }}
              className="relative group"
            >
              <span className={cn(
                "text-xs sm:text-sm uppercase tracking-[0.3em] font-medium transition-colors duration-300",
                activeCategory === cat.id ? "text-white" : "text-zinc-600 hover:text-zinc-400"
              )}>
                {cat.label}
              </span>
              {activeCategory === cat.id && (
                <motion.div
                  layoutId="categoryUnderline"
                  className="absolute -bottom-2 left-0 right-0 h-[2px] bg-rose-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Sample Prompts */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[10px] uppercase tracking-[0.35em] text-rose-500/80 font-medium mb-5">
              Try one of these
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-3 mb-8">
              {category.samplePrompts.map((prompt, i) => (
                <motion.button
                  key={prompt}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * i }}
                  onClick={() => handleSampleClick(prompt)}
                  className="text-left group flex items-start gap-2 py-1"
                >
                  <span className="text-zinc-600 text-sm mt-0.5 group-hover:text-rose-500/60 transition-colors">›</span>
                  <span className="text-sm text-zinc-500 font-light group-hover:text-zinc-200 transition-colors duration-200 leading-relaxed">
                    {prompt}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Full question */}
            <p className="text-sm text-zinc-500 font-light mb-10">
              › {category.question}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Free Text Input */}
        <form onSubmit={handleSubmit} className="mt-auto">
          <div className="relative mb-6">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="or type anything..."
              className="w-full bg-transparent border-b border-white/10 py-4 text-lg sm:text-xl font-light text-white focus:outline-none focus:border-white/30 transition-colors placeholder:text-zinc-700 tracking-wide"
            />
          </div>

          <button
            type="submit"
            disabled={!answer.trim()}
            className={cn(
              "group flex items-center gap-3 text-sm uppercase tracking-[0.25em] font-medium transition-all duration-300",
              answer.trim()
                ? "text-white hover:text-zinc-300"
                : "text-zinc-700 cursor-not-allowed"
            )}
          >
            Find my room
            <ArrowRight className={cn(
              "w-4 h-4 transition-transform",
              answer.trim() && "group-hover:translate-x-1"
            )} />
          </button>
        </form>

        {/* Room Names Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 sm:mt-16 flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          {allRoomNames.map(name => (
            <span
              key={name}
              className="text-[10px] uppercase tracking-[0.3em] text-zinc-700 font-medium"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
