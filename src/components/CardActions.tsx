import React from 'react';
import { Heart, X, SkipForward } from 'lucide-react';

interface CardActionsProps {
  onLike: () => void;
  onDislike: () => void;
  onSkip: () => void;
  accentColor: string;
}

export default function CardActions({ onLike, onDislike, onSkip, accentColor }: CardActionsProps) {
  return (
    <div className="flex items-center justify-center gap-12 py-8">
      <button 
        onClick={onDislike}
        className="group flex flex-col items-center gap-2"
      >
        <div className="p-4 rounded-full border border-white/10 hover:bg-white/5 transition-all">
          <X className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="text-[8px] uppercase tracking-widest opacity-20">Dislike</span>
      </button>

      <button 
        onClick={onLike}
        className="group flex flex-col items-center gap-2"
      >
        <div className="p-5 rounded-full border border-white/10 hover:bg-white/5 transition-all" style={{ borderColor: `${accentColor}22` }}>
          <Heart className="w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:text-red-500 transition-all" />
        </div>
        <span className="text-[8px] uppercase tracking-widest opacity-20">Like</span>
      </button>

      <button 
        onClick={onSkip}
        className="group flex flex-col items-center gap-2"
      >
        <div className="p-4 rounded-full border border-white/10 hover:bg-white/5 transition-all">
          <SkipForward className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="text-[8px] uppercase tracking-widest opacity-20">Skip</span>
      </button>
    </div>
  );
}
