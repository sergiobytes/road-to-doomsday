import { toIsoDate } from '../domain/dates';
import type { IsoDate, WatchedSessionIds } from '../domain/types';
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

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    markWatched(sessionId) {
      if (state.progress.watched.has(sessionId)) return;

      const watched = new Map(state.progress.watched);
      watched.set(sessionId, getToday());
      commitProgress({ watched });
    },

    unmarkWatched(sessionId) {
      if (!state.progress.watched.has(sessionId)) return;

      const watched = new Map(state.progress.watched);
      watched.delete(sessionId);
      commitProgress({ watched });
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
