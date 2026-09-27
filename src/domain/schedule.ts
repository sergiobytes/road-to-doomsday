import { compareIsoDates } from './dates';
import { getAllSessions } from './road';
import type { IsoDate, RoadItem, WatchedSessionIds } from './types';

export type ScheduleStatus = 'behind' | 'on-track' | 'ahead';

export interface ScheduleReport {
  readonly status: ScheduleStatus;
  readonly overdueSessions: number;
  readonly sessionsAhead: number;
}

function toStatus(overdueSessions: number, sessionsAhead: number): ScheduleStatus {
  if (overdueSessions > 0) return 'behind';
  if (sessionsAhead > 0) return 'ahead';
  return 'on-track';
}

export function getScheduleReport(
  items: readonly RoadItem[],
  watched: WatchedSessionIds,
  today: IsoDate,
): ScheduleReport {
  const sessions = getAllSessions(items);

  const overdueSessions = sessions.filter(
    (session) => compareIsoDates(session.date, today) < 0 && !watched.has(session.id),
  ).length;

  const sessionsAhead = sessions.filter(
    (session) => compareIsoDates(session.date, today) > 0 && watched.has(session.id),
  ).length;

  return { status: toStatus(overdueSessions, sessionsAhead), overdueSessions, sessionsAhead };
}
