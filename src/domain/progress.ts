import { getItemSessions, getSessionEntries } from './road';
import {
  NO_SESSIONS,
  type RoadItem,
  type SessionEntry,
  type SkippedSessionIds,
  type WatchedSessionIds,
} from './types';

export interface ProgressSummary {
  readonly totalSessions: number;
  readonly watchedSessions: number;
  readonly skippedSessions: number;
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
  skipped: SkippedSessionIds = NO_SESSIONS,
): ProgressSummary {
  const entries = getSessionEntries(items);
  const watchedSessions = entries.filter((entry) => watched.has(entry.session.id)).length;
  const skippedSessions = entries.filter(
    (entry) => skipped.has(entry.session.id) && !watched.has(entry.session.id),
  ).length;

  return {
    totalSessions: entries.length,
    watchedSessions,
    skippedSessions,
    pendingSessions: entries.length - watchedSessions - skippedSessions,
    percent: calculatePercent(watchedSessions, entries.length),
    totalItems: items.length,
    completedItems: items.filter((item) => isItemComplete(item, watched)).length,
  };
}

export function getNextSession(
  items: readonly RoadItem[],
  watched: WatchedSessionIds,
  skipped: SkippedSessionIds = NO_SESSIONS,
): SessionEntry | null {
  return (
    getSessionEntries(items).find(
      (entry) => !watched.has(entry.session.id) && !skipped.has(entry.session.id),
    ) ?? null
  );
}
