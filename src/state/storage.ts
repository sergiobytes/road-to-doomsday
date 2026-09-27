import { isIsoDate } from '../domain/dates';
import type { IsoDate } from '../domain/types';
import { EMPTY_PROGRESS, type UserProgress } from './types';

export const STORAGE_KEY = 'road-to-doomsday:progress';
export const STORAGE_VERSION = 1;

interface PersistedProgress {
  version: typeof STORAGE_VERSION;
  watched: Record<string, IsoDate>;
}

export type LoadStatus = 'empty' | 'loaded' | 'invalid' | 'unavailable';

export interface LoadResult {
  readonly status: LoadStatus;
  readonly progress: UserProgress;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseProgress(value: unknown): UserProgress | null {
  if (!isRecord(value) || value.version !== STORAGE_VERSION || !isRecord(value.watched)) {
    return null;
  }

  const watched = new Map<string, IsoDate>();
  for (const [sessionId, date] of Object.entries(value.watched)) {
    if (isIsoDate(date)) watched.set(sessionId, date);
  }

  return { watched };
}

export function serializeProgress(progress: UserProgress): string {
  const persisted: PersistedProgress = {
    version: STORAGE_VERSION,
    watched: Object.fromEntries(progress.watched),
  };
  return JSON.stringify(persisted);
}

export function loadProgress(storage: Pick<Storage, 'getItem'>): LoadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'unavailable', progress: EMPTY_PROGRESS };
  }

  if (raw === null) return { status: 'empty', progress: EMPTY_PROGRESS };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: 'invalid', progress: EMPTY_PROGRESS };
  }

  const progress = parseProgress(parsed);
  return progress
    ? { status: 'loaded', progress }
    : { status: 'invalid', progress: EMPTY_PROGRESS };
}

export function saveProgress(storage: Pick<Storage, 'setItem'>, progress: UserProgress): boolean {
  try {
    storage.setItem(STORAGE_KEY, serializeProgress(progress));
    return true;
  } catch {
    return false;
  }
}
