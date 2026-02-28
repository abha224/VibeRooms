import {
  CardEvent,
  CardType,
  Category,
  EnrichedCardEvent,
  Interaction,
  SessionSummary,
  TimeBucket,
} from '../types';
import {
  buildBehavioralProfile,
  decisionConfidence,
  detectAnomalies,
  dwellScore,
  engagementDepth,
  engagementLevel,
} from './behavior';

// ── Internal state ───────────────────────────────────────────────────────────

const state = {
  sessionStart:    Date.now(),
  entryStart:      0,
  entryTimMs:      0,
  entryPrompt:     '',
  category:        null as Category | null,
  routedRoom:      '',
  roomsVisited:    new Set<string>(),
  completedRooms:  new Set<string>(),
  returnedToEntry: false,
  events:          [] as EnrichedCardEvent[],
  interactions:    [] as Interaction[],  // legacy
};

// ── Helpers ──────────────────────────────────────────────────────────────────

export const getTimeBucket = (): TimeBucket => {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 22) return 'evening';
  return 'late-night';
};

export const getDayOfWeek = (): string =>
  new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

export const getSessionElapsed = (): number => Date.now() - state.sessionStart;
export const getEventCount = (): number => state.events.length;

// ── Entry tracking ───────────────────────────────────────────────────────────

export const startEntryTimer = () => { state.entryStart = Date.now(); };

export const setEntryPrompt = (prompt: string) => {
  state.entryPrompt = prompt;
  state.entryTimMs  = state.entryStart > 0 ? Date.now() - state.entryStart : 0;
};

export const getEntryPrompt  = () => state.entryPrompt;

export const setCategory     = (cat: Category) => { state.category = cat; };
export const getCategory     = (): Category | null => state.category;

export const setRoutedRoom = (slug: string) => { state.routedRoom = slug; };

// ── Room tracking ────────────────────────────────────────────────────────────

export const markRoomVisited   = (slug: string) => { state.roomsVisited.add(slug); };
export const markRoomCompleted = (slug: string) => { state.completedRooms.add(slug); };
export const markReturnedToEntry = () => { state.returnedToEntry = true; };

// ── Card event logging ───────────────────────────────────────────────────────

export const logCardEvent = (raw: CardEvent & { session_index: number }) => {
  const ds    = dwellScore(raw.dwell_time_ms, raw.card_type);
  const conf  = decisionConfidence(ds);
  const depth = engagementDepth(ds, raw.action);

  const enriched: EnrichedCardEvent = {
    ...raw,
    dwell_score:      ds,
    confidence:       conf,
    engagement_depth: depth,
    engagement_level: engagementLevel(depth),
  };

  state.events.push(enriched);

  // Legacy compat
  state.interactions.push({
    cardId:    `${raw.room_slug}-${raw.card_type}`,
    type:      raw.action,
    timestamp: raw.timestamp,
  });

  // Run anomaly check against full event stream so far
  const anomalies = detectAnomalies(enriched, state.events);

  // Pretty console output
  console.groupCollapsed(
    `%c[behavior] ${raw.action.toUpperCase()} ${raw.card_type} · dwell ${raw.dwell_time_ms}ms` +
    ` · score ${ds.toFixed(2)} · ${conf} confidence · ${enriched.engagement_level}`,
    anomalies.length ? 'color: orange; font-weight: bold' : 'color: #888',
  );
  console.table({
    card_type:        raw.card_type,
    action:           raw.action,
    dwell_ms:         raw.dwell_time_ms,
    dwell_score:      +ds.toFixed(3),
    confidence:       conf,
    engagement_depth: +depth.toFixed(3),
    engagement_level: enriched.engagement_level,
    session_index:    raw.session_index,
    time_of_day:      raw.time_of_day,
  });
  if (anomalies.length) {
    console.warn('⚠ anomalies detected:', anomalies.map(a => `[${a.type}] ${a.description}`));
  }
  console.groupEnd();
};

// ── Session summary ──────────────────────────────────────────────────────────

export const getSessionSummary = (): SessionSummary => {
  const events   = state.events;
  const liked    = events.filter(e => e.action === 'like');
  const disliked = events.filter(e => e.action === 'dislike');
  const skipped  = events.filter(e => e.action === 'skip');

  const avgDwell = events.length > 0
    ? Math.round(events.reduce((s, e) => s + e.dwell_time_ms, 0) / events.length)
    : 0;

  const CARD_TYPES: CardType[] = ['text', 'image', 'video', 'sound'];
  const typeStats = CARD_TYPES.map(type => {
    const te       = events.filter(e => e.card_type === type);
    if (te.length === 0) return { type, likeRate: 0, skipRate: 0, avgDwell: 0 };
    const likeRate = te.filter(e => e.action === 'like').length / te.length;
    const skipRate = te.filter(e => e.action === 'skip').length / te.length;
    const avgDwellType = te.reduce((s, e) => s + e.dwell_time_ms, 0) / te.length;
    return { type, likeRate, skipRate, avgDwell: avgDwellType };
  });

  const preferred = typeStats
    .filter(s => s.likeRate > 0.5 || (s.avgDwell > avgDwell && s.likeRate > 0))
    .map(s => s.type);

  const avoided = typeStats
    .filter(s => s.skipRate > 0.5)
    .map(s => s.type);

  const completionRate = state.roomsVisited.size > 0
    ? state.completedRooms.size / state.roomsVisited.size
    : 0;

  return {
    category:            state.category,
    prompt_answer:       state.entryPrompt,
    routed_room:         state.routedRoom,
    entry_time_ms:       state.entryTimMs,
    rooms_visited:       Array.from(state.roomsVisited),
    cards_seen:          events.length,
    cards_liked:         liked.length,
    cards_disliked:      disliked.length,
    cards_skipped:       skipped.length,
    preferred_card_types: preferred,
    avoided_card_types:  avoided,
    avg_dwell_ms:        avgDwell,
    completion_rate:     completionRate,
    returned_to_entry:   state.returnedToEntry,
    events,
    behavior:            buildBehavioralProfile(events),
  };
};

// ── Legacy ────────────────────────────────────────────────────────────────────

/** @deprecated use logCardEvent instead */
export const recordInteraction = (interaction: Interaction) => {
  state.interactions.push(interaction);
};

export const getSessionInteractions = () => [...state.interactions];

export const clearSession = () => {
  state.sessionStart    = Date.now();
  state.entryStart      = 0;
  state.entryTimMs      = 0;
  state.entryPrompt     = '';
  state.category        = null;
  state.routedRoom      = '';
  state.roomsVisited.clear();
  state.completedRooms.clear();
  state.returnedToEntry = false;
  state.events          = [];
  state.interactions    = [];
};
