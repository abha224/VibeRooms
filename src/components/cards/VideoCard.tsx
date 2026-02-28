import React from 'react';
import { RoomConfig } from '../../types';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';

interface VideoCardProps {
  room: RoomConfig;
}

export default function VideoCard({ room }: VideoCardProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="relative w-full max-w-sm aspect-video bg-white/5 rounded-2xl overflow-hidden flex items-center justify-center border border-white/10">
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-current"
          style={{ color: room.theme.accent }}
        />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
            <Play className="w-6 h-6 fill-current" />
          </div>
          <p className="text-[10px] uppercase tracking-widest opacity-40">Motion Fragment</p>
        </div>
      </div>
      <div className="mt-8 text-center max-w-xs">
        <p className="text-xs font-mono opacity-40 italic">
          "{room.prompts.video}"
        </p>
      </div>
    </div>
  );
}
