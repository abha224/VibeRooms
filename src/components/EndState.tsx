import React from 'react';
import { motion } from 'motion/react';

interface EndStateProps {
  roomName: string;
  onRestart: () => void;
}

export default function EndState({ roomName, onRestart }: EndStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex flex-col items-center justify-center z-50 p-6 text-center bg-black"
    >
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="mb-12"
      >
        <h2 className="text-4xl font-serif italic mb-2">{roomName}</h2>
        <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Echo Fading</p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        onClick={onRestart}
        className="text-sm uppercase tracking-[0.4em] hover:opacity-50 transition-opacity"
      >
        find another room
      </motion.button>
    </motion.div>
  );
}
