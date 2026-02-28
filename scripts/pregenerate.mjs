#!/usr/bin/env node
/**
 * Pre-generates static media assets for demo showcase rooms.
 * Run with: node scripts/pregenerate.mjs
 *
 * Requires the Next.js dev server to be running at localhost:3000.
 * Assets are saved to /public/rooms/{slug}/ as static files.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'rooms');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ─── Rooms to pre-generate ──────────────────────────────────

const ROOMS = [
  {
    slug: 'last-summer',
    prompts: {
      art: [
        "A suburban street at golden hour, long warm shadows stretching across a quiet road, a teenager sitting on a curb looking at the sunset, lawn sprinklers catching the amber light like tiny diamonds, fireflies beginning to appear, nostalgic coming-of-age film still, shot on 35mm film, Greta Gerwig meets Terrence Malick, 4K masterpiece, emotionally devastating beauty",
        "A bedroom window at sunset, curtains billowing in warm breeze, polaroid photos and concert tickets pinned to a corkboard, golden light painting everything amber, the last summer before college, nostalgic and bittersweet, 35mm film aesthetic, 4K masterpiece",
      ],
      music: [
        "The bittersweet ache of the last perfect day before everything changes forever, a whispered goodbye to innocence",
      ],
      video: [
        "Cinematic golden hour shot of a quiet suburban street, warm amber sunlight streaming through trees, sprinklers creating rainbow mist on a green lawn, a bicycle leaning against a fence, fireflies appearing as dusk approaches, nostalgic 35mm film grain, slow dolly movement, coming-of-age film atmosphere",
      ],
    },
  },
  {
    slug: 'neo-noir',
    prompts: {
      art: [
        "A rain-slicked narrow alley in Hong Kong at night, dense neon signs in Chinese and English reflecting in puddles, a lone figure in a dark coat walking away, steam rising from a grate, dramatic chiaroscuro lighting with deep reds and electric blues, neo-noir meets Wong Kar-wai, Blade Runner 2049 color palette, Roger Deakins cinematography, anamorphic lens, 4K masterpiece",
        "A dark detective office at night, venetian blind shadows striping across the desk, a glass of whiskey catching neon light from outside, rain streaking down the window, city lights blurred beyond, film noir aesthetic, dramatic high contrast, moody, 4K masterpiece",
      ],
      music: [
        "Footsteps echoing in a dark alley, tension building, you are being watched and you know it, do not trust anyone",
      ],
      video: [
        "Cinematic tracking shot through a rain-soaked Hong Kong alley at night, neon signs reflecting in puddles, steam rising from vents, a silhouette disappearing around a corner, shallow depth of field, anamorphic lens flares in red and blue, neo-noir thriller atmosphere, smooth steadicam movement",
      ],
    },
  },
  {
    slug: 'the-signal',
    prompts: {
      art: [
        "Interior of a space station observation deck, a lone astronaut floating by a massive curved window overlooking Earth's blue curve against infinite black space, stars reflected in the visor, bioluminescent control panels casting cyan and blue light, inspired by Interstellar and 2001 A Space Odyssey, Emmanuel Lubezki lighting, existential solitude in cosmic beauty, 4K masterpiece, hyperrealistic",
        "A vast radio telescope array in a desert at night under the Milky Way, hundreds of dish antennas pointing at the sky, a single red light blinking on the control tower, cosmic scale and human smallness, cinematic wide shot, deep blues and star whites, 4K masterpiece",
      ],
      music: [
        "The vast silence of deep space, a fading radio signal from Earth growing quieter, existential solitude among the stars",
      ],
      video: [
        "Slow cinematic shot from inside a space station, camera slowly rotating to reveal Earth through a massive observation window, stars drifting past, subtle lens flare from the sun peeking around the planet edge, interior bioluminescent panels casting soft blue light on floating objects, zero gravity dust particles, Interstellar atmosphere, smooth orbital camera movement",
      ],
    },
  },
];

// ─── Helpers ────────────────────────────────────────────────

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function generateArt(prompt, outputPath) {
  console.log(`  🎨 Generating art → ${path.basename(outputPath)}`);
  try {
    const res = await fetch(`${BASE_URL}/api/gemini/art`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.imageUrl) {
      // data:image/png;base64,... → save as PNG file
      const base64 = data.imageUrl.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'));
      console.log(`  ✅ Art saved (${(Buffer.from(base64, 'base64').length / 1024).toFixed(0)} KB)`);
      return true;
    } else {
      console.log(`  ❌ Art failed: ${data.error || 'no image'}`);
      return false;
    }
  } catch (err) {
    console.log(`  ❌ Art error: ${err.message}`);
    return false;
  }
}

async function generateAudio(prompt, outputPath) {
  console.log(`  🎧 Generating audio → ${path.basename(outputPath)}`);
  try {
    const res = await fetch(`${BASE_URL}/api/gemini/audio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.audioUrl) {
      const base64 = data.audioUrl.replace(/^data:audio\/\w+;base64,/, '');
      fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'));
      console.log(`  ✅ Audio saved (${(Buffer.from(base64, 'base64').length / 1024).toFixed(0)} KB)`);
      return true;
    } else {
      console.log(`  ❌ Audio failed: ${data.error || 'no audio'}`);
      return false;
    }
  } catch (err) {
    console.log(`  ❌ Audio error: ${err.message}`);
    return false;
  }
}

async function generateVideo(prompt, outputPath) {
  console.log(`  🎬 Generating video → ${path.basename(outputPath)} (this takes 60-90s...)`);
  try {
    const res = await fetch(`${BASE_URL}/api/gemini/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (data.videoUrl) {
      const base64 = data.videoUrl.replace(/^data:video\/\w+;base64,/, '');
      fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'));
      console.log(`  ✅ Video saved (${(Buffer.from(base64, 'base64').length / 1024 / 1024).toFixed(1)} MB)`);
      return true;
    } else {
      console.log(`  ❌ Video failed: ${data.error || 'no video'}`);
      return false;
    }
  } catch (err) {
    console.log(`  ❌ Video error: ${err.message}`);
    return false;
  }
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   VibeRooms — Pre-generating Demo Assets     ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log(`Server: ${BASE_URL}`);
  console.log(`Output: ${PUBLIC_DIR}`);
  console.log('');

  // Check server is running
  try {
    const health = await fetch(`${BASE_URL}`);
    if (!health.ok) throw new Error(`Status ${health.status}`);
    console.log('✅ Server is running\n');
  } catch (err) {
    console.error('❌ Cannot reach server at', BASE_URL);
    console.error('   Make sure `npm run dev` is running first.\n');
    process.exit(1);
  }

  const startTime = Date.now();

  for (const room of ROOMS) {
    const roomDir = path.join(PUBLIC_DIR, room.slug);
    ensureDir(roomDir);
    console.log(`\n── ${room.slug} ${'─'.repeat(40 - room.slug.length)}`);

    // Generate art images (in parallel)
    const artPromises = room.prompts.art.map((prompt, i) =>
      generateArt(prompt, path.join(roomDir, `art-${i + 1}.png`))
    );

    // Generate audio
    const audioPromises = room.prompts.music.map((prompt, i) =>
      generateAudio(prompt, path.join(roomDir, `audio-${i + 1}.wav`))
    );

    // Generate video
    const videoPromises = room.prompts.video.map((prompt, i) =>
      generateVideo(prompt, path.join(roomDir, `video-${i + 1}.mp4`))
    );

    // Run art + audio in parallel, then video (to avoid overwhelming the API)
    await Promise.all([...artPromises, ...audioPromises]);
    await Promise.all(videoPromises);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
  console.log(`\n╔══════════════════════════════════════════════╗`);
  console.log(`║   ✅ Done! Generated in ${elapsed}s                  ║`);
  console.log(`╚══════════════════════════════════════════════╝\n`);

  // List generated files
  for (const room of ROOMS) {
    const roomDir = path.join(PUBLIC_DIR, room.slug);
    if (fs.existsSync(roomDir)) {
      const files = fs.readdirSync(roomDir);
      console.log(`  /public/rooms/${room.slug}/`);
      files.forEach(f => {
        const stat = fs.statSync(path.join(roomDir, f));
        const size = stat.size > 1024 * 1024
          ? `${(stat.size / 1024 / 1024).toFixed(1)} MB`
          : `${(stat.size / 1024).toFixed(0)} KB`;
        console.log(`    ${f} (${size})`);
      });
    }
  }
  console.log('');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
