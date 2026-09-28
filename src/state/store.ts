import { toIsoDate } from '../domain/dates';
import type { IsoDate, SkippedSessionIds, WatchedSessionIds } from '../domain/types';
import { clearProgress, loadProgress, saveProgress, type LoadStatus } from './storage';
import { EMPTY_PROGRESS, type UserProgress } from './types';

export interface StoreState {
  readonly progress: UserProgress;
  /** Cómo fue la carga inicial; la interfaz puede usarlo para avisar de datos inválidos. */
  readonly loadStatus: LoadStatus;
  /** `true` si el último cambio no se pudo guardar en Local Storage. */
  readonly saveFailed: boolean;
}

export type StoreListener = (state: StoreState) => void;

export interface ProgressStore {
  getState(): StoreState;
  /** Registra una función que se llama después de cada cambio. Devuelve cómo cancelarla. */
  subscribe(listener: StoreListener): () => void;
  markWatched(sessionId: string): void;
  unmarkWatched(sessionId: string): void;
  /** Marca la sesión si no estaba vista, o la desmarca si ya lo estaba. */
  toggleWatched(sessionId: string): void;
  /** Omite una sesión pendiente; no tiene efecto sobre sesiones ya vistas. */
  skipSession(sessionId: string): void;
  unskipSession(sessionId: string): void;
  toggleSkipped(sessionId: string): void;
  reset(): void;
}

export interface StoreOptions {
  readonly storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  /** Día actual; se inyecta para poder probar con fechas fijas. */
  readonly getToday?: () => IsoDate;
}

/** Ids vistos en el formato que espera la lógica del dominio. */
export function toWatchedIds(progress: UserProgress): WatchedSessionIds {
  return new Set(progress.watched.keys());
}

export function toSkippedIds(progress: UserProgress): SkippedSessionIds {
  return new Set(progress.skipped.keys());
}

export function createProgressStore({
  storage,
  getToday = () => toIsoDate(new Date()),
}: StoreOptions): ProgressStore {
  const loaded = loadProgress(storage);
  const listeners = new Set<StoreListener>();

  let state: StoreState = {
    progress: loaded.progress,
    loadStatus: loaded.status,
    // Los datos migrados se guardan de inmediato en el formato actual.
    saveFailed: loaded.status === 'migrated' && !saveProgress(storage, loaded.progress),
  };

  function setState(next: StoreState): void {
    state = next;
    listeners.forEach((listener) => listener(state));
  }

  function commitProgress(progress: UserProgress): void {
    setState({ ...state, progress, saveFailed: !saveProgress(storage, progress) });
  }

  function markWatched(sessionId: string): void {
    if (state.progress.watched.has(sessionId)) return;

    const watched = new Map(state.progress.watched);
    const skipped = new Map(state.progress.skipped);
    watched.set(sessionId, getToday());
    skipped.delete(sessionId);
    commitProgress({ watched, skipped });
  }

  function unmarkWatched(sessionId: string): void {
    if (!state.progress.watched.has(sessionId)) return;

    const watched = new Map(state.progress.watched);
    watched.delete(sessionId);
    commitProgress({ ...state.progress, watched });
  }

  function skipSession(sessionId: string): void {
    const { watched, skipped } = state.progress;
    if (watched.has(sessionId) || skipped.has(sessionId)) return;

    commitProgress({ watched, skipped: new Map(skipped).set(sessionId, getToday()) });
  }

  function unskipSession(sessionId: string): void {
    if (!state.progress.skipped.has(sessionId)) return;

    const skipped = new Map(state.progress.skipped);
    skipped.delete(sessionId);
    commitProgress({ ...state.progress, skipped });
  }

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    markWatched,
    unmarkWatched,
    skipSession,
    unskipSession,

    toggleSkipped(sessionId) {
      if (state.progress.skipped.has(sessionId)) unskipSession(sessionId);
      else skipSession(sessionId);
    },

    toggleWatched(sessionId) {
      if (state.progress.watched.has(sessionId)) unmarkWatched(sessionId);
      else markWatched(sessionId);
    },

    reset() {
      setState({
        progress: EMPTY_PROGRESS,
        loadStatus: 'empty',
        saveFailed: !clearProgress(storage),
      });
    },
  };
}
