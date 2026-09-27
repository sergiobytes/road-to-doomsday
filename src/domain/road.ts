import type { RoadItem, Session, SessionEntry } from './types';

export function getItemSessions(item: RoadItem): readonly Session[] {
  return item.kind === 'movie' ? [item.session] : item.sessions;
}

export function getAllSessions(items: readonly RoadItem[]): readonly Session[] {
  return items.flatMap(getItemSessions);
}

export function getSessionEntries(items: readonly RoadItem[]): readonly SessionEntry[] {
  return items.flatMap((item): SessionEntry[] =>
    item.kind === 'movie'
      ? [{ kind: 'movie', item, session: item.session }]
      : item.sessions.map((session) => ({ kind: 'series', item, session })),
  );
}
