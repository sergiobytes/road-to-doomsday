import { getItemSessions, getSessionEntries } from './road';
import type { RoadItem, SessionEntry, WatchedSessionIds } from './types';

export interface ProgressSummary {
  readonly totalSessions: number;
  readonly watchedSessions: number;
  readonly pendingSessions: number;
  readonly percent: number;
  readonly totalItems: number;
  readonly completedItems: number;
}

export function calculatePercent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.floor((done / total) * 100);
}

export function isItemComplete(item: RoadItem, watched: WatchedSessionIds): boolean {
  return getItemSessions(item).every((session) => watched.has(session.id));
}

export function getProgressSummary(
  items: readonly RoadItem[],
  watched: WatchedSessionIds,
): ProgressSummary {
  const entries = getSessionEntries(items);
  const watchedSessions = entries.filter((entry) => watched.has(entry.session.id)).length;

  return {
    totalSessions: entries.length,
    watchedSessions,
    pendingSessions: entries.length - watchedSessions,
    percent: calculatePercent(watchedSessions, entries.length),
    totalItems: items.length,
    completedItems: items.filter((item) => isItemComplete(item, watched)).length,
  };
}

export function getNextSession(
  items: readonly RoadItem[],
  watched: WatchedSessionIds,
): SessionEntry | null {
  return getSessionEntries(items).find((entry) => !watched.has(entry.session.id)) ?? null;
}
