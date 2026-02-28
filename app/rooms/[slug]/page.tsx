import { Metadata } from 'next';
import { ROOMS } from '@/lib/constants';
import { notFound } from 'next/navigation';
import RoomView from '@/components/RoomView';

const validSlugs = Object.keys(ROOMS);

export async function generateStaticParams() {
  return validSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const room = ROOMS[slug];

  if (!room) {
    return { title: 'Room Not Found — Vibe Rooms' };
  }

  return {
    title: `${room.name} — Vibe Rooms`,
    description: `Experience ${room.emotion.toLowerCase()} in ${room.name}. Tune in to your vibe.`,
    openGraph: {
      title: `${room.name} — Vibe Rooms`,
      description: `Experience ${room.emotion.toLowerCase()} in ${room.name}.`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${room.name} — Vibe Rooms`,
      description: `Experience ${room.emotion.toLowerCase()} in ${room.name}.`,
    },
  };
}

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!ROOMS[slug]) {
    notFound();
  }

  return <RoomView slug={slug} />;
}
