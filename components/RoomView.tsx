'use client';

import { useState, useEffect, useRef, UIEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2, Sparkles } from 'lucide-react';
import { ROOMS, CARD_CYCLE_TYPES } from '@/lib/constants';
import { RoomSlug, CardData, SessionPrefs, InteractionEvent } from '@/lib/types';
import { INITIAL_SESSION_PREFS } from '@/lib/constants';
import { buildVibeProfile, saveVibeProfile } from '@/lib/vibe-metrics';
import { cn } from '@/lib/cn';
import Card from './Card';

const ONBOARDING_CARD_COUNT = 6; // Cards before we compute vibe and transition

interface RoomViewProps {
  slug: string;
}

export default function RoomView({ slug }: RoomViewProps) {
  const router = useRouter();
  const room = ROOMS[slug as RoomSlug];
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [sessionPrefs, setSessionPrefs] = useState<SessionPrefs>(INITIAL_SESSION_PREFS);
  const [interactions, setInteractions] = useState<InteractionEvent[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardEnteredAt = useRef<number>(Date.now());
  const prefetchStarted = useRef(false);

  // Read the entry answer from sessionStorage (set by entry page)
  const entryAnswer = typeof window !== 'undefined'
    ? sessionStorage.getItem('viberooms_entry_answer') || ''
    : '';

  // ─── Prompt Enhancement ──────────────────────────────────
  // Injects the user's original prompt + quality suffixes for
  // better Gemini output, personalized to what they typed.
  const enhancePrompt = useCallback((basePrompt: string, type: 'art' | 'music' | 'video') => {
    const ctx = entryAnswer
      ? `, deeply inspired by the feeling of: "${entryAnswer}"`
      : '';
    const suffix: Record<string, string> = {
      art: ', masterpiece quality, highly detailed, dramatic cinematic lighting, 4K ultra HD, professional concept art',
      music: ', professional studio production, emotionally resonant, rich and immersive',
      video: ', smooth cinematic camera movement, film grain texture, atmospheric, 8-second seamless loop',
    };
    return `${basePrompt}${ctx}${suffix[type]}`;
  }, [entryAnswer]);

  const updatePrefs = useCallback((type: string, delta: number) => {
    setSessionPrefs(prev => ({
      ...prev,
      [type]: (prev[type as keyof SessionPrefs] || 0) + delta
    }));
  }, []);

  // ─── Initial Card Generation ─────────────────────────────
  useEffect(() => {
    if (!room) return;

    const initialBatch: CardData[] = [
      { id: '1', type: 'art', liked: false },
      { id: '2', type: 'text', content: room.ghostTraces[0], liked: false, isGhost: true },
      { id: '3', type: 'music', liked: false },
      { id: '4', type: 'art', liked: false },
      { id: '5', type: 'text', content: room.ghostTraces[1], liked: false, isGhost: true },
      { id: '6', type: 'video', liked: false },
    ];
    setCards(initialBatch);

    const introTimer = setTimeout(() => setShowIntro(false), 3000);
    return () => clearTimeout(introTimer);
  }, [slug, room]);

  // ─── Pre-fetch ALL Media in Parallel ─────────────────────
  // For rooms with pre-generated static assets, use those instantly.
  // For other rooms, call Gemini APIs in parallel.
  useEffect(() => {
    if (!room || cards.length === 0 || prefetchStarted.current) return;
    prefetchStarted.current = true;

    const hasStatic = room.staticAssets;

    // Track which static assets we've used (round-robin)
    const staticCounters: Record<string, number> = { art: 0, music: 0, video: 0 };

    const endpoints: Record<string, { url: string; promptKey: 'art' | 'music' | 'video'; responseKey: string }> = {
      art:   { url: '/api/gemini/art',   promptKey: 'art',   responseKey: 'imageUrl' },
      combo: { url: '/api/gemini/art',   promptKey: 'art',   responseKey: 'imageUrl' },
      music: { url: '/api/gemini/audio', promptKey: 'music', responseKey: 'audioUrl' },
      video: { url: '/api/gemini/video', promptKey: 'video', responseKey: 'videoUrl' },
    };

    const fetchCardMedia = async (card: CardData) => {
      if (card.type === 'text' || card.mediaUrl) return;

      // ── Check for static assets first ──
      if (hasStatic) {
        const assetType = (card.type === 'combo' ? 'art' : card.type) as 'art' | 'music' | 'video';
        const assets = hasStatic[assetType];
        if (assets && assets.length > 0) {
          const idx = staticCounters[assetType] % assets.length;
          staticCounters[assetType]++;
          setCards(prev => prev.map(c =>
            c.id === card.id ? { ...c, mediaUrl: assets[idx] } : c
          ));
          return; // Static asset found, skip API call
        }
      }

      // ── No static asset — call Gemini API ──
      const config = endpoints[card.type];
      if (!config) return;

      try {
        const prompt = enhancePrompt(room.prompts[config.promptKey], config.promptKey);
        const res = await fetch(config.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        const url = data[config.responseKey];
        if (url) {
          setCards(prev => prev.map(c =>
            c.id === card.id ? { ...c, mediaUrl: url } : c
          ));
        }
      } catch (err) {
        console.error(`Pre-fetch failed for ${card.type} card ${card.id}:`, err);
      }
    };

    // Fire all fetches in parallel — video (slowest) starts at same time as art (fastest)
    cards.forEach(card => fetchCardMedia(card));
  }, [cards.length, room, enhancePrompt]);

  // ─── Dwell Time Tracking ─────────────────────────────────
  useEffect(() => {
    cardEnteredAt.current = Date.now();
  }, [currentIndex]);

  // ─── Onboarding Complete Check ───────────────────────────
  const checkOnboardingComplete = useCallback((updatedInteractions: InteractionEvent[]) => {
    if (updatedInteractions.length >= ONBOARDING_CARD_COUNT && !isTransitioning) {
      setIsTransitioning(true);

      // Build and save vibe profile
      const profile = buildVibeProfile(
        updatedInteractions,
        slug as RoomSlug,
        entryAnswer,
      );
      saveVibeProfile(profile);

      // Transition to discover page after a moment
      setTimeout(() => {
        router.push('/discover');
      }, 2500);
    }
  }, [isTransitioning, slug, entryAnswer, router]);

  const recordInteraction = useCallback((cardId: string, action: 'like' | 'dislike' | 'skip') => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const dwellMs = Date.now() - cardEnteredAt.current;
    const event: InteractionEvent = {
      cardId,
      cardType: card.type,
      action,
      roomSlug: slug as RoomSlug,
      dwellMs,
      timestamp: Date.now(),
    };

    setInteractions(prev => {
      const updated = [...prev, event];
      // Check completion after state update
      setTimeout(() => checkOnboardingComplete(updated), 0);
      return updated;
    });
  }, [cards, slug, checkOnboardingComplete]);

  // Advance to next card without recording interaction (used after like/dislike)
  const advanceCard = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      containerRef.current?.scrollTo({
        top: nextIndex * window.innerHeight,
        behavior: 'smooth',
      });
    }
  }, [currentIndex, cards.length]);

  const handleLike = useCallback((id: string) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;

    updatePrefs(card.type, 1);
    setCards(prev => prev.map(c => c.id === id ? { ...c, liked: true } : c));
    recordInteraction(id, 'like');
    advanceCard();
  }, [cards, updatePrefs, recordInteraction, advanceCard]);

  const handleDislike = useCallback((id: string) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;
    updatePrefs(card.type, -1);
    recordInteraction(id, 'dislike');
    advanceCard();
  }, [cards, updatePrefs, recordInteraction, advanceCard]);

  // Skip = record skip + advance
  const handleSkip = useCallback(() => {
    const currentCard = cards[currentIndex];
    if (currentCard) {
      recordInteraction(currentCard.id, 'skip');
    }
    advanceCard();
  }, [currentIndex, cards, recordInteraction, advanceCard]);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const index = Math.round(e.currentTarget.scrollTop / window.innerHeight);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  }, [currentIndex]);

  if (!room) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Room not found</p>
      </div>
    );
  }

  // Progress indicator (how far through onboarding)
  const progress = Math.min(interactions.length / ONBOARDING_CARD_COUNT, 1);

  return (
    <div
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide"
      ref={containerRef}
      onScroll={handleScroll}
      style={{ backgroundColor: room.colorTheme.bg }}
    >
      {/* UI Overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center pointer-events-none">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white pointer-events-auto hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Progress Dots */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
            {Array.from({ length: ONBOARDING_CARD_COUNT }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  i < interactions.length ? "bg-white" : "bg-white/20"
                )}
              />
            ))}
          </div>
          <button className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-1 bg-white/5 pointer-events-none">
        <motion.div
          className="h-full bg-white/30"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Room Intro */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black text-white p-12 text-center"
            style={{ backgroundColor: room.colorTheme.bg }}
          >
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs uppercase tracking-[0.5em] font-light text-zinc-500 mb-4"
            >
              Entering
            </motion.h2>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-light serif italic mb-8"
            >
              {room.name}
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 1.5 }}
              className="w-24 h-[1px] bg-white/20"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-sm text-zinc-400 font-light tracking-widest uppercase"
            >
              {room.emotion}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 1.5 }}
              className="mt-4 text-xs text-zinc-600 font-light"
            >
              Swipe through {ONBOARDING_CARD_COUNT} vibes to discover your match
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition to Discover */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black text-white"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-8"
            >
              <Sparkles className="w-6 h-6 text-white/60" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm uppercase tracking-[0.3em] font-light text-zinc-400"
            >
              Computing your vibe...
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 1 }}
              className="mt-4 text-xs text-zinc-600 font-light"
            >
              {interactions.length} signals collected
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feed */}
      {cards.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          room={room}
          isActive={index === currentIndex}
          onLike={() => handleLike(card.id)}
          onDislike={() => handleDislike(card.id)}
          onSkip={handleSkip}
        />
      ))}
    </div>
  );
}
