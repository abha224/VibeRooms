import React, { useEffect, useRef, useState } from 'react';
import { RoomConfig } from '../../types';
import { motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundCardProps {
  room: RoomConfig;
}

const BAR_HEIGHTS = [0.6, 1, 0.8, 1.4, 0.7, 1.8, 0.9, 1.5, 0.65, 1.2, 1.0, 0.75, 1.6, 0.85, 1.3];

function accentToFreq(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) || 128;
  const g = parseInt(h.slice(2, 4), 16) || 128;
  const b = parseInt(h.slice(4, 6), 16) || 128;
  // Map colour luminance → musical root in 40–90 Hz (deep bass drone range)
  return 40 + ((r * 0.299 + g * 0.587 + b * 0.114) / 255) * 50;
}

function buildDrone(ctx: AudioContext, baseFreq: number, master: GainNode) {
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 700;
  filter.Q.value = 0.8;
  filter.connect(master);

  const add = (freq: number, type: OscillatorType, gain: number) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(filter);
    osc.start();
    return osc;
  };

  // Sub + root + detuned copy (beats) + perfect 5th + octave
  add(baseFreq * 0.5,   'sine',     0.30);
  add(baseFreq,         'sine',     0.55);
  add(baseFreq * 1.003, 'sine',     0.18); // slight detune → slow beating
  add(baseFreq * 1.5,   'sine',     0.20); // P5
  add(baseFreq * 2,     'sine',     0.08); // octave

  // Slow tremolo LFO
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.value = 0.07;
  lfoGain.gain.value = 0.025;
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);
  lfo.start();
}

export default function SoundCard({ room }: SoundCardProps) {
  const dim = `${room.theme.text}66`;
  const [muted, setMuted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const ctxRef    = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  function initAudio() {
    if (ctxRef.current) return; // already running

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 2.5);
    master.connect(ctx.destination);
    masterRef.current = master;

    buildDrone(ctx, accentToFreq(room.theme.accent), master);
    setAudioReady(true);
  }

  // Try silent auto-start on mount (works if user has already interacted with page)
  useEffect(() => {
    const timer = setTimeout(() => {
      try { initAudio(); } catch { /* requires user gesture — handled by tap */ }
    }, 300);
    return () => {
      clearTimeout(timer);
      ctxRef.current?.close();
      ctxRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.slug]);

  function toggleMute() {
    if (!ctxRef.current) {
      initAudio();
      setMuted(false);
      return;
    }
    const now = ctxRef.current.currentTime;
    if (muted) {
      masterRef.current?.gain.linearRampToValueAtTime(0.14, now + 0.6);
    } else {
      masterRef.current?.gain.linearRampToValueAtTime(0,    now + 0.6);
    }
    setMuted((m) => !m);
  }

  return (
    <div className="h-full w-full relative overflow-hidden vibe-mono">
      {/* Top label */}
      <div
        className="absolute top-6 left-8 z-10 text-[11px] tracking-[0.35em] uppercase opacity-70"
        style={{ color: room.theme.accent }}
      >
        {room.name} / sound
      </div>

      {/* Full-height waveform — dims when muted */}
      <div className="absolute inset-0 flex items-center justify-center gap-[6px] px-12">
        {BAR_HEIGHTS.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-sm"
            style={{ background: room.theme.accent, opacity: muted ? 0.15 : 0.65 }}
            animate={{ scaleY: muted ? [0.08, 0.12, 0.08] : [h * 0.4, h, h * 0.4] }}
            transition={{
              duration: 0.5 + i * 0.06,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.04,
            }}
          />
        ))}
      </div>

      {/* Centre: mute / tap-to-play button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
        <button
          className="p-4 rounded-full transition-all hover:scale-110 active:scale-95"
          style={{ border: `1px solid ${muted || !audioReady ? dim : room.theme.accent}` }}
          onClick={toggleMute}
          aria-label={muted ? 'Unmute' : audioReady ? 'Mute' : 'Play'}
        >
          {muted || !audioReady
            ? <VolumeX className="w-5 h-5" style={{ color: dim }} />
            : <Volume2 className="w-5 h-5" style={{ color: room.theme.accent }} />
          }
        </button>
        <span className="text-[10px] tracking-[0.25em]" style={{ color: dim }}>
          {!audioReady ? 'tap to hear' : muted ? 'muted' : 'ambient drone · looping'}
        </span>
      </div>

      {/* Bottom label */}
      <div
        className="absolute bottom-5 left-8 z-10 text-[11px] tracking-[0.25em]"
        style={{ color: dim }}
      >
        web audio · generative
      </div>
    </div>
  );
}
