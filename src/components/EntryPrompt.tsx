import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { getRoomFromPrompt } from '../lib/routing';

export default function EntryPrompt() {
  const [prompt, setPrompt] = useState('');
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();
  
  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsExiting(true);
    const slug = getRoomFromPrompt(prompt);
    
    setTimeout(() => {
      navigate(`/rooms/${slug}`);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black text-white font-sans">
      <AnimatePresence>
        {!isExiting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            className="max-w-md w-full space-y-12 text-center"
          >
            <div className="space-y-4">
              <h1 className="text-4xl font-serif italic tracking-tight">Aether</h1>
              <p className="text-white/50 text-sm uppercase tracking-[0.2em]">Generative Space</p>
            </div>

            <form onSubmit={handleEnter} className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl space-y-6">
              <div className="space-y-2 text-left">
                <label className="text-[10px] uppercase tracking-widest opacity-40 ml-1">Current State</label>
                <input 
                  autoFocus
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your silence..."
                  className="w-full bg-transparent border-b border-white/10 py-3 px-1 text-lg font-light focus:outline-none focus:border-white/40 transition-colors placeholder:opacity-20"
                />
              </div>
              
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="group flex items-center justify-center gap-3 w-full py-4 bg-white text-black rounded-full font-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                Enter the Room
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <p className="text-[10px] text-white/20 uppercase tracking-widest">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Captured
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
