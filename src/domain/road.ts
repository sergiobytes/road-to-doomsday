import { compareIsoDates } from './dates';
import type { RoadItem, Session, SessionEntry } from './types';

export function getItemSessions(item: RoadItem): readonly Session[] {
  return item.kind === 'movie' ? [item.session] : item.sessions;
}

/** Sesiones en orden de visionado: por fecha y, el mismo día, en el orden de los títulos. */
export function getAllSessions(items: readonly RoadItem[]): readonly Session[] {
  return items.flatMap(getItemSessions).toSorted((a, b) => compareIsoDates(a.date, b.date));
}

export function getSessionEntries(items: readonly RoadItem[]): readonly SessionEntry[] {
  return items
    .flatMap((item): SessionEntry[] =>
      item.kind === 'movie'
        ? [{ kind: 'movie', item, session: item.session }]
        : item.sessions.map((session) => ({ kind: 'series', item, session })),
    )
    .toSorted((a, b) => compareIsoDates(a.session.date, b.session.date));
}
