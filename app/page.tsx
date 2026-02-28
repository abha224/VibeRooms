'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';
import { RoomSlug } from '@/lib/types';

export default function EntryExperience() {
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  };

  const handleStart = () => {
    setStep(1);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    // Rules-based routing
    const hour = currentTime.getHours();
    const input = answer.toLowerCase();

    let slug: RoomSlug = 'echo-chamber'; // Default

    if (input.includes('neon') || input.includes('city') || input.includes('light') || input.includes('rain')) {
      slug = 'neon-solitude';
    } else if (input.includes('forest') || input.includes('book') || input.includes('nature') || input.includes('green') || input.includes('tree')) {
      slug = 'overgrown-library';
    } else if (input.includes('coffee') || input.includes('food') || input.includes('old') || input.includes('warm') || input.includes('home')) {
      slug = 'midnight-diner';
    } else if (input.includes('star') || input.includes('space') || input.includes('universe') || input.includes('sky') || input.includes('moon')) {
      slug = 'glass-observatory';
    } else {
      // Time-based fallback
      if (hour >= 22 || hour < 4) slug = 'midnight-diner';
      else if (hour >= 4 && hour < 10) slug = 'overgrown-library';
      else if (hour >= 10 && hour < 16) slug = 'glass-observatory';
      else if (hour >= 16 && hour < 22) slug = 'neon-solitude';
    }

    setStep(2);
    setTimeout(() => {
      router.push(`/rooms/${slug}`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Atmospheric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '700ms' }} />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center z-10 max-w-md"
          >
            <h1 className="text-5xl font-light tracking-tighter mb-4 serif italic">Ghost Traces</h1>
            <p className="text-zinc-400 mb-8 font-light leading-relaxed">
              A collection of digital echoes, left behind by those who passed through the silence.
            </p>
            <button
              onClick={handleStart}
              className="group flex items-center gap-2 mx-auto px-8 py-3 rounded-full border border-white/20 hover:bg-white hover:text-black transition-all duration-500"
            >
              Enter the Silence
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="z-10 w-full max-w-lg"
          >
            <div className="mb-12 flex items-center justify-between text-xs uppercase tracking-widest text-zinc-500 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {getTimeOfDay()} — {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Seeding Context
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <label className="block">
                <span className="block text-2xl font-light mb-6 leading-tight">
                  What is a memory you haven&apos;t thought about in years?
                </span>
                <input
                  autoFocus
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer..."
                  className="w-full bg-transparent border-b border-white/20 py-4 text-xl focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700"
                />
              </label>
              <button
                type="submit"
                disabled={!answer.trim()}
                className="w-full py-4 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center z-10"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full border border-white/20 mx-auto mb-8 flex items-center justify-center"
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </motion.div>
            <p className="text-sm uppercase tracking-[0.3em] font-light text-zinc-400">
              Finding your room...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
