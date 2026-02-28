import React from 'react';
import { RoomConfig } from '../../types';

interface QuoteCardProps {
  room: RoomConfig;
}

export default function QuoteCard({ room }: QuoteCardProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8">
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] opacity-30">The Thought</span>
        <p className="text-2xl md:text-3xl font-serif italic leading-tight">
          "{room.cards.quote}"
        </p>
      </div>
      
      <div className="w-12 h-[1px] bg-current opacity-20" />

      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.3em] opacity-30">Ghost Trace</span>
        <p className="text-sm font-mono opacity-60">
          {room.cards.ghost}
        </p>
      </div>
    </div>
  );
}
