import { ROOMS } from './rooms';
import { RoomSlug } from '../types';

export const getRoomFromPrompt = (prompt: string): RoomSlug => {
  const p = prompt.toLowerCase();
  if (p.includes('stair') || p.includes('focus') || p.includes('restless')) return 'the-stairwell';
  if (p.includes('green') || p.includes('plant') || p.includes('growth')) return 'the-greenhouse';
  if (p.includes('archive') || p.includes('memory') || p.includes('dust')) return 'the-archive';
  if (p.includes('star') || p.includes('space') || p.includes('wonder')) return 'the-observatory';
  if (p.includes('digital') || p.includes('code') || p.includes('terminal')) return 'the-terminal';
  
  // Default to random if no match
  return ROOMS[Math.floor(Math.random() * ROOMS.length)].slug;
};
