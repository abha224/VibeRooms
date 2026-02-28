'use client';

import { useState, useEffect, useRef, UIEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2, Info } from 'lucide-react';
import { ROOMS, CARD_CYCLE_TYPES } from '@/lib/constants';
import { RoomSlug, CardData, SessionPrefs } from '@/lib/types';
import { INITIAL_SESSION_PREFS } from '@/lib/constants';
import Card from './Card';

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
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePrefs = useCallback((type: string, delta: number) => {
    setSessionPrefs(prev => ({
      ...prev,
      [type]: (prev[type as keyof SessionPrefs] || 0) + delta
    }));
  }, []);

  // Initial card generation
  useEffect(() => {
    if (!room) return;

    const initialBatch: CardData[] = [
      { id: '1', type: 'art', liked: false },
      { id: '2', type: 'text', content: room.ghostTraces[0], liked: false, isGhost: true },
      { id: '3', type: 'music', liked: false },
    ];
    setCards(initialBatch);

    // Preload the rest of the cycle
    const timeout = setTimeout(() => preloadBatch(3, 10), 100);

    const introTimer = setTimeout(() => setShowIntro(false), 3000);
    return () => {
      clearTimeout(introTimer);
      clearTimeout(timeout);
    };
  }, [slug]);

  const preloadBatch = useCallback((start: number, end: number) => {
    if (!room) return;
    const newCards: CardData[] = [];

    for (let i = start; i < end; i++) {
      const type = CARD_CYCLE_TYPES[i % CARD_CYCLE_TYPES.length];
      const card: CardData = {
        id: `${Date.now()}-${i}`,
        type,
        liked: false,
        content: type === 'text' ? room.ghostTraces[Math.floor(Math.random() * room.ghostTraces.length)] : undefined,
        isGhost: type === 'text',
      };
      newCards.push(card);
    }
    setCards(prev => [...prev, ...newCards]);
  }, [room]);

  const handleLike = useCallback((id: string) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;

    updatePrefs(card.type, 1);
    setCards(prev => prev.map(c => c.id === id ? { ...c, liked: true } : c));

    // Demo moment: Re-surface liked card 4 cards later as ghost trace
    if (card.type === 'art') {
      setTimeout(() => {
        const ghostCard: CardData = {
          id: `ghost-${id}-${Date.now()}`,
          type: 'text',
          content: 'someone left this here',
          isGhost: true,
          liked: false,
          mediaUrl: card.mediaUrl,
        };
        setCards(prev => {
          const nextIndex = Math.min(currentIndex + 4, prev.length);
          const newCards = [...prev];
          newCards.splice(nextIndex, 0, ghostCard);
          return newCards;
        });
      }, 1000);
    }
  }, [cards, currentIndex, updatePrefs]);

  const handleDislike = useCallback((id: string) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;
    updatePrefs(card.type, -1);
  }, [cards, updatePrefs]);

  const handleSkip = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      containerRef.current?.scrollTo({
        top: nextIndex * window.innerHeight,
        behavior: 'smooth',
      });
    }
  }, [currentIndex, cards.length]);

  const handleScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    const index = Math.round(e.currentTarget.scrollTop / window.innerHeight);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      // Preload more if near end
      if (index > cards.length - 4) {
        preloadBatch(cards.length, cards.length + 5);
      }
    }
  }, [currentIndex, cards.length, preloadBatch]);

  if (!room) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Room not found</p>
      </div>
    );
  }

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
        <div className="flex gap-3 pointer-events-auto">
          <button className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
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
