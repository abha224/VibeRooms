import React from 'react';

interface CardActionsProps {
  onLike: () => void;
  onDislike: () => void;
  onSkip: () => void;
  accentColor: string;
}

export default function CardActions({ onLike, onDislike, onSkip, accentColor }: CardActionsProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-7 vibe-mono">
      <button
        onClick={onDislike}
        className="w-12 h-12 rounded-full border transition-transform active:scale-95"
        style={{ borderColor: 'rgba(255,255,255,0.18)', color: '#FF6B6B' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#FF6B6B';
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Dislike"
        title="Dislike"
      >
        <span className="text-[18px] leading-none">✕</span>
      </button>

      <button
        onClick={onSkip}
        className="w-10 h-10 border transition-transform active:scale-95"
        style={{ borderColor: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.35)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Skip"
        title="Skip"
      >
        <span className="text-[13px] leading-none">→</span>
      </button>

      <button
        onClick={onLike}
        className="w-12 h-12 rounded-full border transition-transform active:scale-95"
        style={{ borderColor: 'rgba(255,255,255,0.18)', color: accentColor }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = accentColor;
          e.currentTarget.style.transform = 'scale(1.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        aria-label="Like"
        title="Like"
      >
        <span className="text-[20px] leading-none">♡</span>
      </button>
    </div>
  );
}
