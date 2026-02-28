import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RoomConfig, CardType, EnrichedCardEvent } from '../types';
import QuoteCard from './cards/QuoteCard';
import ImageCard from './cards/ImageCard';
import VideoCard from './cards/VideoCard';
import SoundCard from './cards/SoundCard';
import RecommendationCard from './cards/RecommendationCard';
import CardActions from './CardActions';
import { logCardEvent, markRoomVisited, markRoomCompleted, getTimeBucket, getDayOfWeek, getSessionElapsed, getEventCount } from '../lib/session';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  room: RoomConfig;
  onComplete: () => void;
  onAutoReturn: () => void;
}

export default function Carousel({ room, onComplete, onAutoReturn }: CarouselProps) {
  const [availableTypes, setAvailableTypes] = useState<CardType[]>(['text', 'image', 'video', 'sound', 'recommendation']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flash, setFlash] = useState<null | 'like' | 'dislike'>(null);
  const [sessionEvents, setSessionEvents] = useState<EnrichedCardEvent[]>([]);

  // Dwell tracking: reset whenever the displayed card changes
  const cardStart = useRef(Date.now());
  useEffect(() => { cardStart.current = Date.now(); }, [currentIndex]);

  const dim = useMemo(() => {
    return {
      base: `${room.theme.text}55`,
      faint: `${room.theme.text}33`,
      border: `${room.theme.text}30`,
      disabled: `${room.theme.text}22`,
    };
  }, [room.theme.text]);

  // Mark room as visited on mount
  useEffect(() => { markRoomVisited(room.slug); }, [room.slug]);

  useEffect(() => {
    if (availableTypes.length === 0) {
      onAutoReturn();
    }
  }, [availableTypes, onAutoReturn]);

  const handleAction = (action: 'like' | 'dislike' | 'skip') => {
    const now = Date.now();
    const currentType = availableTypes[currentIndex];
    const dwell = now - cardStart.current;

    if (action === 'like' || action === 'dislike') {
      setFlash(action);
      window.setTimeout(() => setFlash(null), 180);
    }

    const event = {
      card_type:       currentType,
      room_slug:       room.slug,
      card_index:      currentIndex,
      action,
      timestamp:       now,
      time_of_day:     getTimeBucket(),
      day_of_week:     getDayOfWeek(),
      dwell_time_ms:   dwell,
      session_time_ms: getSessionElapsed(),
      session_index:   getEventCount(),
    };
    logCardEvent(event);
    setSessionEvents(prev => [...prev, event as EnrichedCardEvent]);

    if (action === 'skip') {
      const newTypes = availableTypes.filter((_, i) => i !== currentIndex);
      setAvailableTypes(newTypes);
      if (currentIndex >= newTypes.length && newTypes.length > 0) {
        setCurrentIndex(newTypes.length - 1);
      }
    } else {
      if (currentIndex < availableTypes.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        markRoomCompleted(room.slug);
        onComplete();
      }
    }
  };

  const nextCard = () => {
    if (currentIndex < availableTypes.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (availableTypes.length === 0) return null;

  const currentType = availableTypes[currentIndex];

  return (
    <div className="h-full flex flex-col vibe-mono">
      {/* Header */}
      <div className="px-8 pt-7 flex items-start justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-[0.35em] opacity-60" style={{ color: room.theme.accent }}>
            now in
          </div>
          <div className="text-[28px] tracking-[0.25em] vibe-display leading-none" style={{ color: room.theme.text }}>
            {room.name}
          </div>
          <div className="text-[11px] tracking-wide mt-1" style={{ color: dim.base }}>
            {room.emotion}
          </div>
        </div>

        <div className="text-[10px] tracking-[0.25em] mt-1" style={{ color: dim.base }}>
          {currentIndex + 1}/{availableTypes.length}
        </div>
      </div>

      {/* Progress bars */}
      <div className="px-8 pt-5 flex items-center gap-2">
        {availableTypes.map((_, i) => (
          <div
            key={i}
            className="h-[2px] flex-1 transition-colors"
            style={{
              backgroundColor: i === currentIndex ? room.theme.accent : dim.base,
              opacity: i < currentIndex ? 0.3 : 1,
            }}
          />
        ))}
      </div>

      {/* Card Stage */}
      <div className="flex-1 relative overflow-hidden">
        <div
          className="h-full w-full relative overflow-hidden"
          style={{ borderTop: `1px solid ${dim.border}` }}
        >
          {/* Reaction flash */}
          {flash && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{
                background: flash === 'like' ? `${room.theme.accent}22` : '#ff444422',
                pointerEvents: 'none',
              }}
            >
              <div className="text-[48px] opacity-60" style={{ color: flash === 'like' ? room.theme.accent : '#FF6B6B' }}>
                {flash === 'like' ? '♡' : '✕'}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={currentType}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="h-full w-full"
            >
              {currentType === 'text' && <QuoteCard room={room} />}
              {currentType === 'image' && <ImageCard room={room} />}
              {currentType === 'video' && <VideoCard room={room} />}
              {currentType === 'sound' && <SoundCard room={room} />}
              {currentType === 'recommendation' && <RecommendationCard room={room} events={sessionEvents} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button 
            onClick={prevCard}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-2 transition-opacity"
            style={{ color: currentIndex === 0 ? dim.disabled : dim.base, opacity: currentIndex === 0 ? 0.2 : 0.8 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {currentIndex < availableTypes.length - 1 && (
          <button 
            onClick={nextCard}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-2 transition-opacity"
            style={{ color: currentIndex >= availableTypes.length - 1 ? dim.disabled : dim.base, opacity: currentIndex >= availableTypes.length - 1 ? 0.2 : 0.8 }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Actions */}
      <CardActions 
        accentColor={room.theme.accent}
        onLike={() => handleAction('like')}
        onDislike={() => handleAction('dislike')}
        onSkip={() => handleAction('skip')}
      />
    </div>
  );
}
