import { RoomConfig } from '../types';

export const ROOMS: RoomConfig[] = [
  {
    slug: "the-stairwell",
    name: "The Stairwell",
    emotion: "Restless focus",
    theme: { bg: "#0D0D0D", accent: "#C8FF00", text: "#CCCCCC" },
    cards: {
      quote: "couldn't finish the thought. kept starting over.",
      ghost: "left before the song ended — 3:14am",
    },
    prompts: {
      image: "liminal stairwell, harsh fluorescent, late night, grainy",
      video: "empty stairwell, slow breathing camera, brutalist concrete",
      audio: "low hum, distant footsteps, reverb, tension without resolution",
    }
  },
  {
    slug: "the-greenhouse",
    name: "The Greenhouse",
    emotion: "Quiet growth",
    theme: { bg: "#0A0F0A", accent: "#4ADE80", text: "#D1D5DB" },
    cards: {
      quote: "the roots are moving faster than the leaves.",
      ghost: "watered the ferns and forgot to leave — 10:22am",
    },
    prompts: {
      image: "overgrown glass house, morning mist, soft green light",
      video: "time-lapse of a vine curling around a rusted pipe",
      audio: "dripping water, rustling leaves, distant birdsong",
    }
  },
  {
    slug: "the-archive",
    name: "The Archive",
    emotion: "Dusty nostalgia",
    theme: { bg: "#1A1A1A", accent: "#FDE047", text: "#E5E7EB" },
    cards: {
      quote: "every record is a ghost of a moment.",
      ghost: "filed a memory under the wrong year — 4:45pm",
    },
    prompts: {
      image: "infinite rows of filing cabinets, warm tungsten glow",
      video: "dust motes dancing in a single beam of light",
      audio: "paper rustling, typewriter clicks, muffled voices",
    }
  },
  {
    slug: "the-observatory",
    name: "The Observatory",
    emotion: "Cold wonder",
    theme: { bg: "#020617", accent: "#38BDF8", text: "#F8FAFC" },
    cards: {
      quote: "the stars don't care if we're looking.",
      ghost: "waited for the comet that never came — 11:59pm",
    },
    prompts: {
      image: "massive telescope pointing at a nebula, deep blue void",
      video: "slow rotation of a distant planet, rings glowing",
      audio: "cosmic wind, electronic pings, deep space drone",
    }
  },
  {
    slug: "the-terminal",
    name: "The Terminal",
    emotion: "Digital fatigue",
    theme: { bg: "#000000", accent: "#22C55E", text: "#86EFAC" },
    cards: {
      quote: "system failure is the only honest output.",
      ghost: "rebooted the soul but the errors remained — 2:00am",
    },
    prompts: {
      image: "cracked CRT monitor displaying green code, dark room",
      video: "glitchy terminal text scrolling infinitely",
      audio: "modem screech, hard drive whir, digital static",
    }
  }
];
