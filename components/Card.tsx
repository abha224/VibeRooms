'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { Heart, X, ChevronRight, Play, Pause } from 'lucide-react';
import { CardData, RoomConfig } from '@/lib/types';
import { cn } from '@/lib/cn';

interface CardProps {
  card: CardData;
  room: RoomConfig;
  isActive: boolean;
  onLike: () => void;
  onDislike: () => void;
  onSkip: () => void;
}

export default function Card({ card, room, isActive, onLike, onDislike, onSkip }: CardProps) {
  const [mediaUrl, setMediaUrl] = useState<string | null>(card.mediaUrl || null);
  const [loading, setLoading] = useState(!card.mediaUrl && card.type !== 'text');

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const heartScale = useTransform(x, [50, 150], [0.5, 1.5]);
  const xIconScale = useTransform(x, [-50, -150], [0.5, 1.5]);
  const heartOpacity = useTransform(x, [0, 100], [0, 1]);
  const xIconOpacity = useTransform(x, [0, -100], [0, 1]);

  useEffect(() => {
    if (isActive && !mediaUrl && card.type !== 'text') {
      loadMedia();
    }
  }, [isActive]);

  const loadMedia = async () => {
    setLoading(true);
    let url: string | null = null;

    try {
      if (card.type === 'art' || card.type === 'combo') {
        const res = await fetch('/api/gemini/art', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: room.prompts.art }),
        });
        const data = await res.json();
        url = data.imageUrl || null;
      } else if (card.type === 'music') {
        const res = await fetch('/api/gemini/audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: room.prompts.music }),
        });
        const data = await res.json();
        url = data.audioUrl || null;
      } else if (card.type === 'video') {
        const res = await fetch('/api/gemini/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: room.prompts.video }),
        });
        const data = await res.json();
        url = data.videoUrl || null;
      }
    } catch (error) {
      console.error(`Failed to load ${card.type} media:`, error);
    }

    setMediaUrl(url);
    setLoading(false);
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x > 100) {
      onLike();
    } else if (info.offset.x < -100) {
      onDislike();
    }
  };

  return (
    <section className="h-screen w-full snap-start flex items-center justify-center relative overflow-hidden bg-black">
      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Card Content */}
        <div className="w-full h-full relative">
          {card.type === 'text' ? (
            <TextContent card={card} room={room} />
          ) : loading ? (
            <Skeleton room={room} />
          ) : card.type === 'music' ? (
            <MusicContent
              card={card}
              room={room}
              url={mediaUrl}
              isActive={isActive}
            />
          ) : (
            <MediaContent
              card={card}
              room={room}
              url={mediaUrl}
            />
          )}

          {/* Ghost Overlay for Text/Combo */}
          {(card.isGhost || card.type === 'combo') && (
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          )}
        </div>

        {/* Interaction Icons (Visible on Drag) */}
        <motion.div style={{ scale: heartScale, opacity: heartOpacity }} className="absolute right-12 top-1/2 -translate-y-1/2 z-30 text-emerald-400">
          <Heart className="w-16 h-16 fill-current" />
        </motion.div>
        <motion.div style={{ scale: xIconScale, opacity: xIconOpacity }} className="absolute left-12 top-1/2 -translate-y-1/2 z-30 text-rose-400">
          <X className="w-16 h-16" />
        </motion.div>
      </motion.div>

      {/* Bottom Controls */}
      <div className="absolute bottom-12 left-0 right-0 z-30 flex justify-center items-center gap-8 px-6">
        <button
          onClick={onDislike}
          className="w-14 h-14 rounded-full border border-white/10 bg-black/20 backdrop-blur-xl flex items-center justify-center text-white/60 hover:text-rose-400 hover:border-rose-400/50 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        <button
          onClick={onSkip}
          className="w-18 h-18 p-4 rounded-full border border-white/20 bg-white/10 backdrop-blur-2xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group"
        >
          <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={onLike}
          className="w-14 h-14 rounded-full border border-white/10 bg-black/20 backdrop-blur-xl flex items-center justify-center text-white/60 hover:text-emerald-400 hover:border-emerald-400/50 transition-all"
        >
          <Heart className={cn("w-6 h-6", card.liked && "fill-emerald-400 text-emerald-400")} />
        </button>
      </div>
    </section>
  );
}

function TextContent({ card, room }: { card: CardData; room: RoomConfig }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center relative overflow-hidden bg-zinc-950">
      {card.mediaUrl && (
        <div className="absolute inset-0 opacity-20 blur-sm scale-110">
          <img src={card.mediaUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="max-w-md space-y-6 z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs uppercase tracking-[0.4em] text-zinc-600 font-medium"
        >
          {card.isGhost ? 'Ghost Trace' : 'Fragment'}
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 1 }}
          className="text-2xl font-light serif italic leading-relaxed text-zinc-300"
        >
          &ldquo;{card.content}&rdquo;
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] uppercase tracking-widest text-zinc-500"
        >
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {room.slug.replace(/-/g, ' ')}
        </motion.div>
      </div>
    </div>
  );
}

function MusicContent({ card, room, url, isActive }: {
  card: CardData;
  room: RoomConfig;
  url: string | null;
  isActive: boolean;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-play when this card becomes active and audio is ready
  useEffect(() => {
    if (!audioRef.current || !url) return;

    if (isActive) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Browser blocked autoplay — user will need to tap play
          console.log('Autoplay blocked, user interaction required');
        });
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, url]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }
  }, [isPlaying]);

  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: `radial-gradient(circle at center, ${room.colorTheme.secondary}44, ${room.colorTheme.bg})` }}>
        <p className="text-zinc-500 text-sm italic">The signal was lost...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-12 bg-zinc-950">
      <audio ref={audioRef} src={url} loop preload="auto" />
      <div className="mb-12 text-center space-y-2">
        <div className="text-xs uppercase tracking-[0.4em] text-zinc-600">Ambient Echo</div>
        <div className="text-lg font-light text-zinc-300">{room.name}</div>
      </div>

      <button
        onClick={togglePlay}
        className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center group hover:border-white/30 transition-all relative"
      >
        {isPlaying && (
          <div className="absolute inset-0 rounded-full bg-white/5 animate-ping opacity-20" />
        )}
        {isPlaying ? <Pause className="w-12 h-12 text-white" /> : <Play className="w-12 h-12 text-white ml-2" />}
      </button>

      <p className="mt-6 text-xs text-zinc-600 uppercase tracking-widest">
        {isPlaying ? 'Now Playing' : 'Tap to Play'}
      </p>

      <div className="mt-10 flex items-end gap-1 h-12">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              height: isPlaying ? [12, Math.random() * 40 + 8, 12] : 4,
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.05,
            }}
            className="w-1 bg-white/20 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

function MediaContent({ card, room, url }: {
  card: CardData;
  room: RoomConfig;
  url: string | null;
}) {
  if (!url) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: `radial-gradient(circle at center, ${room.colorTheme.secondary}44, ${room.colorTheme.bg})` }}>
        <p className="text-zinc-500 text-sm italic">The signal was lost...</p>
      </div>
    );
  }

  if (card.type === 'art' || card.type === 'combo') {
    return (
      <div className="w-full h-full relative">
        <img src={url} alt="AI Generated Art" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        {card.type === 'combo' && (
          <div className="absolute inset-0 flex items-center justify-center p-12 bg-black/40">
            <p className="text-2xl font-light serif italic text-white text-center drop-shadow-lg">
              &ldquo;{room.ghostTraces[Math.floor(Math.random() * room.ghostTraces.length)]}&rdquo;
            </p>
          </div>
        )}
      </div>
    );
  }

  if (card.type === 'video') {
    return (
      <video
        src={url}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }

  return null;
}

function Skeleton({ room }: { room: RoomConfig }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-12 space-y-8 animate-pulse">
      <div className="w-full h-full absolute inset-0 opacity-20" style={{ background: `linear-gradient(45deg, ${room.colorTheme.primary}, ${room.colorTheme.bg})` }} />
      <div className="w-48 h-1 bg-white/10 rounded-full" />
      <div className="w-32 h-1 bg-white/5 rounded-full" />
    </div>
  );
}
