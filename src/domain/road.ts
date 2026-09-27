import type { RoadItem, Session } from './types';

export function getItemSessions(item: RoadItem): readonly Session[] {
  return item.kind === 'movie' ? [item.session] : item.sessions;
}

export function getAllSessions(items: readonly RoadItem[]): readonly Session[] {
  return items.flatMap(getItemSessions);
}
