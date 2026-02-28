import React, { useEffect, useRef, useState } from 'react';
import { RoomConfig } from '../../types';
import { motion } from 'motion/react';
import { generateRoomVideo } from '../../services/gemini';

interface VideoCardProps {
  room: RoomConfig;
}

export default function VideoCard({ room }: VideoCardProps) {
  const dim = `${room.theme.text}66`;
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [elapsedSec, setElapsedSec] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blobRef = useRef<string | null>(null);

  // Elapsed-time counter so users know generation is working
  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [loading]);

  // Generate video on mount
  useEffect(() => {
    let cancelled = false;
    generateRoomVideo(room.prompts.video, room.name, room.emotion).then((url) => {
      if (cancelled) {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        return;
      }
      blobRef.current = url.startsWith('blob:') ? url : null;
      setVideoUrl(url);
      setLoading(false);
    });
    return () => {
      cancelled = true;
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, [room]);

  return (
    <div className="h-full w-full relative overflow-hidden vibe-mono">
      {/* Top label */}
      <div
        className="absolute top-6 left-8 z-10 text-[11px] tracking-[0.35em] uppercase opacity-70"
        style={{ color: room.theme.accent }}
      >
        {room.name} / video
      </div>

      {loading ? (
        <>
          {/* Ambient background while waiting */}
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.06, 0.16, 0.06] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${room.theme.accent}55 0%, transparent 70%)`,
            }}
          />

          {/* Loading text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
            <div className="flex items-end gap-[4px] h-8">
              {[0.5, 1, 0.7, 1.3, 0.6, 1.1, 0.8].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-[3px] rounded-sm"
                  style={{ background: room.theme.accent, opacity: 0.6 }}
                  animate={{ scaleY: [h * 0.4, h, h * 0.4] }}
                  transition={{
                    duration: 0.6 + i * 0.1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.07,
                  }}
                />
              ))}
            </div>
            <span className="text-[11px] tracking-[0.25em]" style={{ color: dim }}>
              generating video · {elapsedSec}s
            </span>
            <span className="text-[10px] tracking-[0.15em] opacity-50" style={{ color: dim }}>
              takes ~1–2 minutes
            </span>
          </div>
        </>
      ) : videoUrl === 'FALLBACK' ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 40% 60%, ${room.theme.accent}22 0%, ${room.theme.bg} 70%)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[13px] tracking-[0.2em]" style={{ color: dim }}>
              [ video unavailable ]
            </span>
          </div>
        </>
      ) : (
        <video
          ref={videoRef}
          src={videoUrl!}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Bottom label */}
      <div
        className="absolute bottom-5 left-8 z-10 text-[11px] tracking-[0.25em]"
        style={{ color: dim }}
      >
        gemini · veo 2
      </div>
    </div>
  );
}
