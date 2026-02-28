import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RoomConfig, CardType } from '../types';
import QuoteCard from './cards/QuoteCard';
import ImageCard from './cards/ImageCard';
import VideoCard from './cards/VideoCard';
import SoundCard from './cards/SoundCard';
import CardActions from './CardActions';
import { recordInteraction } from '../lib/session';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  room: RoomConfig;
  onComplete: () => void;
  onAutoReturn: () => void;
}

export default function Carousel({ room, onComplete, onAutoReturn }: CarouselProps) {
  const [availableTypes, setAvailableTypes] = useState<CardType[]>(['text', 'image', 'video', 'sound']);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (availableTypes.length === 0) {
      onAutoReturn();
    }
  }, [availableTypes, onAutoReturn]);

  const handleAction = (action: 'like' | 'dislike' | 'skip') => {
    const currentType = availableTypes[currentIndex];
    
    recordInteraction({
      cardId: `${room.slug}-${currentType}`,
      type: action,
      timestamp: Date.now()
    });

    if (action === 'skip') {
      const newTypes = availableTypes.filter((_, i) => i !== currentIndex);
      setAvailableTypes(newTypes);
      // Adjust index if we removed the last item
      if (currentIndex >= newTypes.length && newTypes.length > 0) {
        setCurrentIndex(newTypes.length - 1);
      }
    } else {
      if (currentIndex < availableTypes.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 flex justify-between items-center opacity-40">
        <div className="text-[10px] uppercase tracking-widest">
          {room.name}
        </div>
        <div className="text-[10px] uppercase tracking-widest">
          {currentIndex + 1} / {availableTypes.length}
        </div>
      </div>

      {/* Card Stage */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentType}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="w-full max-w-xl h-full"
          >
            {currentType === 'text' && <QuoteCard room={room} />}
            {currentType === 'image' && <ImageCard room={room} />}
            {currentType === 'video' && <VideoCard room={room} />}
            {currentType === 'sound' && <SoundCard room={room} />}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button 
            onClick={prevCard}
            className="absolute left-4 p-2 opacity-20 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {currentIndex < availableTypes.length - 1 && (
          <button 
            onClick={nextCard}
            className="absolute right-4 p-2 opacity-20 hover:opacity-100 transition-opacity"
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
