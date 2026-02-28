import React from 'react';
import { RoomConfig } from '../../types';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';

interface SoundCardProps {
  room: RoomConfig;
}

export default function SoundCard({ room }: SoundCardProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-sm aspect-square bg-white/5 rounded-full flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
        <div className="flex items-end gap-1 h-12">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ height: [10, Math.random() * 40 + 10, 10] }}
              transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
              className="w-1 rounded-full bg-current"
              style={{ color: room.theme.accent }}
            />
          ))}
        </div>
        
        <div className="mt-6 flex flex-col items-center gap-2">
          <Volume2 className="w-5 h-5 opacity-40" />
          <p className="text-[10px] uppercase tracking-widest opacity-40">Sonic Texture</p>
        </div>
      </div>
      
      <div className="mt-12 text-center max-w-xs">
        <p className="text-xs font-mono opacity-40 italic">
          "{room.prompts.audio}"
        </p>
      </div>
    </div>
  );
}
