import { addDays, daysBetween, getWeekStart } from './dates';
import { getItemSessions } from './road';
import {
  NO_SESSIONS,
  type IsoDate,
  type RoadItem,
  type SkippedSessionIds,
  type WatchedSessionIds,
} from './types';

export interface TimelineWeek {
  /** Número de semana desde el inicio del Road, empezando en 1. */
  readonly number: number;
  readonly start: IsoDate;
  readonly end: IsoDate;
  readonly items: readonly RoadItem[];
}

const DAYS_PER_WEEK = 7;

/** Fecha de la primera sesión de un título. */
export function getItemStartDate(item: RoadItem): IsoDate {
  const [firstSession] = getItemSessions(item);
  if (!firstSession) throw new Error(`El título "${item.id}" no tiene sesiones`);
  return firstSession.date;
}

/**
 * Agrupa los títulos por la semana (de lunes a domingo) de su primera sesión,
 * conservando el orden de los títulos. Solo incluye semanas con contenido.
 */
export function groupItemsByWeek(
  items: readonly RoadItem[],
  roadStart: IsoDate,
): readonly TimelineWeek[] {
  const firstWeekStart = getWeekStart(roadStart);
  const weeks = new Map<IsoDate, RoadItem[]>();

  for (const item of items) {
    const weekStart = getWeekStart(getItemStartDate(item));
    weeks.set(weekStart, [...(weeks.get(weekStart) ?? []), item]);
  }

  return [...weeks].map(([start, weekItems]) => ({
    number: daysBetween(firstWeekStart, start) / DAYS_PER_WEEK + 1,
    start,
    end: addDays(start, DAYS_PER_WEEK - 1),
    items: weekItems,
  }));
}

export interface WeekProgress {
  readonly total: number;
  readonly resolved: number;
  readonly isResolved: boolean;
}

export function getWeekProgress(
  week: TimelineWeek,
  watched: WatchedSessionIds,
  skipped: SkippedSessionIds = NO_SESSIONS,
): WeekProgress {
  const sessions = week.items.flatMap(getItemSessions);
  const resolved = sessions.filter(
    (session) => watched.has(session.id) || skipped.has(session.id),
  ).length;

  return { total: sessions.length, resolved, isResolved: resolved === sessions.length };
}
