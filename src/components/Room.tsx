import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ROOMS } from '../lib/rooms';
import { RoomSlug } from '../types';
import Carousel from './Carousel';
import EndState from './EndState';

export default function Room() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [completedRooms, setCompletedRooms] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slug && containerRef.current) {
      const element = document.getElementById(`room-${slug}`);
      if (element) {
        element.scrollIntoView({ behavior: 'auto' });
      }
    }
  }, [slug]);

  const handleComplete = (roomSlug: string) => {
    setCompletedRooms(prev => new Set(prev).add(roomSlug));
  };

  const handleAutoReturn = (roomSlug: string) => {
    // If a room is skipped entirely, we could hide it or just let them scroll past
    console.log(`Room ${roomSlug} skipped entirely`);
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black overflow-y-auto snap-y snap-mandatory scroll-smooth"
    >
      {ROOMS.map((room) => (
        <section 
          key={room.slug}
          id={`room-${room.slug}`}
          className="h-screen w-full snap-start relative overflow-hidden flex flex-col"
          style={{ 
            backgroundColor: room.theme.bg, 
            color: room.theme.text,
          }}
        >
          <AnimatePresence mode="wait">
            {completedRooms.has(room.slug) ? (
              <motion.div key="end" className="h-full w-full">
                <EndState 
                  roomName={room.name} 
                  onRestart={() => navigate('/')} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="carousel"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ amount: 0.5 }}
                className="flex-1"
              >
                <Carousel 
                  room={room} 
                  onComplete={() => handleComplete(room.slug)}
                  onAutoReturn={() => handleAutoReturn(room.slug)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vertical Scroll Indicators */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
            {ROOMS.map((r) => (
              <button
                key={r.slug}
                onClick={() => {
                  document.getElementById(`room-${r.slug}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  r.slug === room.slug ? 'scale-150 opacity-100' : 'opacity-20 hover:opacity-50'
                }`}
                style={{ backgroundColor: room.theme.text }}
              />
            ))}
          </div>

          {/* Scroll Hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-20 text-[8px] uppercase tracking-[0.4em] animate-bounce pointer-events-none">
            Scroll to explore
          </div>
        </section>
      ))}
    </div>
  );
}
