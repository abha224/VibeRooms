import React, { useEffect, useState } from 'react';
import { RoomConfig } from '../../types';
import { generateRoomImage } from '../../services/gemini';
import { Loader2 } from 'lucide-react';

interface ImageCardProps {
  room: RoomConfig;
}

export default function ImageCard({ room }: ImageCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dim = `${room.theme.text}66`;

  useEffect(() => {
    const fetchImage = async () => {
      const url = await generateRoomImage(room.prompts.image, room.name, room.emotion);
      setImageUrl(url);
      setLoading(false);
    };
    fetchImage();
  }, [room]);

  return (
    <div className="h-full w-full relative overflow-hidden vibe-mono">
      {/* Label */}
      <div
        className="absolute top-6 left-8 z-10 text-[11px] tracking-[0.35em] uppercase opacity-70"
        style={{ color: room.theme.accent }}
      >
        {room.name} / image
      </div>

      {/* Full-bleed image / states */}
      {loading ? (
        <div className="h-full w-full flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin opacity-30" />
          <span className="text-[12px] tracking-[0.2em]" style={{ color: dim }}>visualizing…</span>
        </div>
      ) : imageUrl === 'FALLBACK' ? (
        <div
          className="h-full w-full flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${room.theme.bg} 0%, ${room.theme.accent}18 100%)` }}
        >
          <span className="text-[13px]" style={{ color: dim }}>[ image ]</span>
        </div>
      ) : (
        <img
          src={imageUrl!}
          alt="Generated Room"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      )}

      {/* Bottom label */}
      <div className="absolute bottom-5 left-8 z-10 text-[11px] tracking-[0.25em]" style={{ color: dim }}>
        gemini image
      </div>
    </div>
  );
}
