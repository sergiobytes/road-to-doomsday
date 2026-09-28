import { isIsoDate } from '../domain/dates';
import type { IsoDate } from '../domain/types';
import { migrate } from './migrations';
import { EMPTY_PROGRESS, type UserProgress } from './types';

export const STORAGE_KEY = 'road-to-doomsday:progress';
/** Copia de datos que no se pudieron leer, para poder recuperarlos a mano. */
export const BACKUP_STORAGE_KEY = `${STORAGE_KEY}:backup`;
export const STORAGE_VERSION = 2;

interface PersistedProgress {
  version: typeof STORAGE_VERSION;
  watched: Record<string, IsoDate>;
  skipped: Record<string, IsoDate>;
}

export type LoadStatus = 'empty' | 'loaded' | 'migrated' | 'invalid' | 'unavailable';

export interface LoadResult {
  readonly status: LoadStatus;
  readonly progress: UserProgress;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseDatedIds(record: Record<string, unknown>): Map<string, IsoDate> {
  const result = new Map<string, IsoDate>();
  for (const [sessionId, date] of Object.entries(record)) {
    if (isIsoDate(date)) result.set(sessionId, date);
  }
  return result;
}

export function parseProgress(value: unknown): UserProgress | null {
  if (
    !isRecord(value) ||
    value.version !== STORAGE_VERSION ||
    !isRecord(value.watched) ||
    !isRecord(value.skipped)
  ) {
    return null;
  }

  const watched = parseDatedIds(value.watched);
  const skipped = parseDatedIds(value.skipped);
  for (const sessionId of watched.keys()) skipped.delete(sessionId);

  return { watched, skipped };
}

export function serializeProgress(progress: UserProgress): string {
  const persisted: PersistedProgress = {
    version: STORAGE_VERSION,
    watched: Object.fromEntries(progress.watched),
    skipped: Object.fromEntries(progress.skipped),
  };
  return JSON.stringify(persisted);
}

function readProgress(raw: string): { progress: UserProgress; migrated: boolean } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isRecord(parsed)) return null;

  const migration = migrate(parsed, STORAGE_VERSION);
  if (!migration) return null;

  const progress = parseProgress(migration.data);
  return progress ? { progress, migrated: migration.migrated } : null;
}

function backupRawData(storage: Pick<Storage, 'setItem'>, raw: string): void {
  try {
    storage.setItem(BACKUP_STORAGE_KEY, raw);
  } catch {
    // Si tampoco se puede respaldar, no hay nada más que hacer.
  }
}

export function loadProgress(storage: Pick<Storage, 'getItem' | 'setItem'>): LoadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'unavailable', progress: EMPTY_PROGRESS };
  }

  if (raw === null) return { status: 'empty', progress: EMPTY_PROGRESS };

  const result = readProgress(raw);
  if (!result) {
    backupRawData(storage, raw);
    return { status: 'invalid', progress: EMPTY_PROGRESS };
  }

  return { status: result.migrated ? 'migrated' : 'loaded', progress: result.progress };
}

export function saveProgress(storage: Pick<Storage, 'setItem'>, progress: UserProgress): boolean {
  try {
    storage.setItem(STORAGE_KEY, serializeProgress(progress));
    return true;
  } catch {
    return false;
  }
}

export function clearProgress(storage: Pick<Storage, 'removeItem'>): boolean {
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
