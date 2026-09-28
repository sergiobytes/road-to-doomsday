import { describe, expect, it, vi } from 'vitest';
import { BACKUP_STORAGE_KEY, loadProgress, STORAGE_KEY } from './storage';
import { createProgressStore, toSkippedIds, toWatchedIds } from './store';
import { createMemoryStorage, failingStorage } from './test-utils';

const TODAY = '2026-10-01';
const SAVED_PROGRESS = JSON.stringify({
  version: 2,
  watched: { 'x-men': '2026-09-29' },
  skipped: {},
});

function setup(initial: Record<string, string> = {}) {
  const storage = createMemoryStorage(initial);
  const store = createProgressStore({ storage, getToday: () => TODAY });
  const listener = vi.fn();
  store.subscribe(listener);
  return { storage, store, listener };
}

describe('carga inicial', () => {
  it('sin datos guardados empieza vacío', () => {
    const { store } = setup();

    expect(store.getState()).toEqual({
      progress: { watched: new Map(), skipped: new Map() },
      loadStatus: 'empty',
      saveFailed: false,
    });
  });

  it('recupera el progreso guardado', () => {
    const { store } = setup({ [STORAGE_KEY]: SAVED_PROGRESS });

    expect(store.getState().loadStatus).toBe('loaded');
    expect(store.getState().progress.watched.get('x-men')).toBe('2026-09-29');
  });

  it('migra el progreso de la versión 1 y lo guarda en el formato actual', () => {
    const { storage, store } = setup({
      [STORAGE_KEY]: JSON.stringify({ version: 1, watched: { 'x-men': '2026-09-29' } }),
    });

    expect(store.getState().loadStatus).toBe('migrated');
    expect(store.getState().progress.watched.get('x-men')).toBe('2026-09-29');
    expect(JSON.parse(storage.data.get(STORAGE_KEY) ?? '')).toMatchObject({
      version: 2,
      skipped: {},
    });
  });

  it('informa cuando los datos guardados eran inválidos', () => {
    const { store } = setup({ [STORAGE_KEY]: 'basura' });

    expect(store.getState().loadStatus).toBe('invalid');
  });
});

describe('markWatched', () => {
  it('marca la sesión con la fecha de hoy, guarda y avisa', () => {
    const { storage, store, listener } = setup();

    store.markWatched('x2');

    expect(store.getState().progress.watched.get('x2')).toBe(TODAY);
    expect(loadProgress(storage).progress.watched.get('x2')).toBe(TODAY);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(store.getState());
  });

  it('no hace nada si la sesión ya estaba vista', () => {
    const { store, listener } = setup({ [STORAGE_KEY]: SAVED_PROGRESS });

    store.markWatched('x-men');

    expect(store.getState().progress.watched.get('x-men')).toBe('2026-09-29');
    expect(listener).not.toHaveBeenCalled();
  });

  it('no modifica el estado anterior', () => {
    const { store } = setup();
    const before = store.getState();

    store.markWatched('x2');

    expect(before.progress.watched.has('x2')).toBe(false);
    expect(store.getState()).not.toBe(before);
  });
});

describe('unmarkWatched', () => {
  it('desmarca la sesión, guarda y avisa', () => {
    const { storage, store, listener } = setup({ [STORAGE_KEY]: SAVED_PROGRESS });

    store.unmarkWatched('x-men');

    expect(store.getState().progress.watched.has('x-men')).toBe(false);
    expect(loadProgress(storage).progress.watched.has('x-men')).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('no hace nada si la sesión no estaba vista', () => {
    const { store, listener } = setup();

    store.unmarkWatched('x-men');

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('toggleWatched', () => {
  it('marca una sesión que no estaba vista', () => {
    const { store } = setup();

    store.toggleWatched('x2');

    expect(store.getState().progress.watched.get('x2')).toBe(TODAY);
  });

  it('desmarca una sesión que ya estaba vista', () => {
    const { store, listener } = setup({ [STORAGE_KEY]: SAVED_PROGRESS });

    store.toggleWatched('x-men');

    expect(store.getState().progress.watched.has('x-men')).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('omitir sesiones', () => {
  it('omite una sesión pendiente, guarda y avisa', () => {
    const { storage, store, listener } = setup();

    store.skipSession('ghost-rider');

    expect(store.getState().progress.skipped.get('ghost-rider')).toBe(TODAY);
    expect(loadProgress(storage).progress.skipped.has('ghost-rider')).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('no omite una sesión ya vista', () => {
    const { store, listener } = setup({ [STORAGE_KEY]: SAVED_PROGRESS });

    store.skipSession('x-men');

    expect(store.getState().progress.skipped.has('x-men')).toBe(false);
    expect(listener).not.toHaveBeenCalled();
  });

  it('deshacer la omisión la devuelve a pendiente', () => {
    const { store } = setup();
    store.skipSession('ghost-rider');

    store.unskipSession('ghost-rider');

    expect(store.getState().progress.skipped.has('ghost-rider')).toBe(false);
  });

  it('marcar como vista una sesión omitida quita la omisión', () => {
    const { store } = setup();
    store.skipSession('ghost-rider');

    store.markWatched('ghost-rider');

    expect(store.getState().progress.watched.has('ghost-rider')).toBe(true);
    expect(store.getState().progress.skipped.has('ghost-rider')).toBe(false);
  });

  it('toSkippedIds devuelve los ids omitidos', () => {
    const { store } = setup();
    store.skipSession('ghost-rider');

    expect(toSkippedIds(store.getState().progress)).toEqual(new Set(['ghost-rider']));
  });
});

describe('reset', () => {
  it('borra el progreso guardado y el de memoria, y avisa', () => {
    const { storage, store, listener } = setup({ [STORAGE_KEY]: SAVED_PROGRESS });

    store.reset();

    expect(store.getState().progress.watched.size).toBe(0);
    expect(storage.data.has(STORAGE_KEY)).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('olvida el aviso de datos inválidos pero conserva el respaldo', () => {
    const { storage, store } = setup({ [STORAGE_KEY]: 'basura' });

    store.reset();

    expect(store.getState().loadStatus).toBe('empty');
    expect(storage.data.get(BACKUP_STORAGE_KEY)).toBe('basura');
  });
});

describe('errores de almacenamiento', () => {
  it('si no se puede guardar, el cambio se mantiene en memoria y se informa', () => {
    const store = createProgressStore({ storage: failingStorage, getToday: () => TODAY });

    store.markWatched('x2');

    expect(store.getState().loadStatus).toBe('unavailable');
    expect(store.getState().progress.watched.has('x2')).toBe(true);
    expect(store.getState().saveFailed).toBe(true);
  });
});

describe('subscribe', () => {
  it('deja de avisar después de cancelar la suscripción', () => {
    const { store } = setup();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    unsubscribe();
    store.markWatched('x2');

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('toWatchedIds', () => {
  it('convierte el progreso en el conjunto de ids que usa el dominio', () => {
    const { store } = setup({ [STORAGE_KEY]: SAVED_PROGRESS });

    expect(toWatchedIds(store.getState().progress)).toEqual(new Set(['x-men']));
  });
});
