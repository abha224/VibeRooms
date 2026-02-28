import React, { useEffect, useState } from 'react';
import { RoomConfig } from '../../types';
import { generateRoomText, RoomText } from '../../services/gemini';
import { getEntryPrompt, getCategory } from '../../lib/session';

interface QuoteCardProps {
  room: RoomConfig;
}

export default function QuoteCard({ room }: QuoteCardProps) {
  const dim = `${room.theme.text}66`;

  const [text, setText] = useState<RoomText>({
    quote: room.cards.quote,
    ghost: room.cards.ghost,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userPrompt = getEntryPrompt() || '';
    const category   = getCategory() || room.category;
    generateRoomText(room.name, room.emotion, userPrompt, category).then((result) => {
      setText(result);
      setLoading(false);
    });
  }, [room]);

  return (
    <div className="h-full flex flex-col justify-center px-10 md:px-16 vibe-mono">
      <div
        className="text-[11px] tracking-[0.35em] uppercase mb-10 opacity-70"
        style={{ color: room.theme.accent }}
      >
        {room.name} / text
      </div>

      {loading ? (
        <div className="flex flex-col gap-4 mb-12 pl-6" style={{ borderLeft: `2px solid ${room.theme.accent}44` }}>
          <div className="h-5 w-3/4 rounded animate-pulse" style={{ background: `${room.theme.text}18` }} />
          <div className="h-5 w-1/2 rounded animate-pulse" style={{ background: `${room.theme.text}18` }} />
        </div>
      ) : (
        <div
          className="text-[clamp(20px,3vw,32px)] leading-[1.65] pl-6 mb-12"
          style={{
            color: room.theme.text,
            borderLeft: `2px solid ${room.theme.accent}`,
          }}
        >
          "{text.quote}"
        </div>
      )}

      <div className="text-[13px] tracking-wide" style={{ color: dim }}>
        {loading ? (
          <div className="h-3 w-2/5 rounded animate-pulse inline-block" style={{ background: `${room.theme.text}18` }} />
        ) : (
          <>░ {text.ghost}</>
        )}
      </div>
    </div>
  );
}
