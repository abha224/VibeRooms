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

  useEffect(() => {
    const fetchImage = async () => {
      const url = await generateRoomImage(room.prompts.image, room.name, room.emotion);
      setImageUrl(url);
      setLoading(false);
    };
    fetchImage();
  }, [room]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin opacity-20" />
          <p className="text-[10px] uppercase tracking-widest opacity-20">Visualizing...</p>
        </div>
      ) : imageUrl === 'FALLBACK' ? (
        <div 
          className="w-full h-full max-w-sm aspect-square rounded-2xl shadow-2xl" 
          style={{ background: `linear-gradient(45deg, ${room.theme.bg}, ${room.theme.accent}44)` }}
        />
      ) : (
        <img 
          src={imageUrl!} 
          alt="Generated Room" 
          className="w-full h-full max-w-sm aspect-square object-cover rounded-2xl shadow-2xl"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="mt-6 text-center">
        <span className="text-[10px] uppercase tracking-[0.3em] opacity-30">Visual Echo</span>
      </div>
    </div>
  );
}
