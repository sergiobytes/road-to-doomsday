import { describe, expect, it } from 'vitest';
import {
  loadProgress,
  parseProgress,
  saveProgress,
  serializeProgress,
  STORAGE_KEY,
} from './storage';
import type { UserProgress } from './types';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

const failingStorage = {
  getItem: (): string | null => {
    throw new Error('SecurityError');
  },
  setItem: (): void => {
    throw new Error('QuotaExceededError');
  },
};

const SAMPLE_PROGRESS: UserProgress = {
  watched: new Map([
    ['x-men', '2026-09-29'],
    ['loki-s1-e1-2', '2026-10-27'],
  ]),
};

describe('parseProgress', () => {
  it('acepta datos válidos', () => {
    const progress = parseProgress({ version: 1, watched: { 'x-men': '2026-09-29' } });

    expect(progress?.watched).toEqual(new Map([['x-men', '2026-09-29']]));
  });

  it('descarta solo las entradas con fecha inválida', () => {
    const progress = parseProgress({
      version: 1,
      watched: { 'x-men': '2026-09-29', x2: 'ayer', 'the-avengers': 42 },
    });

    expect(progress?.watched).toEqual(new Map([['x-men', '2026-09-29']]));
  });

  it.each([
    ['null', null],
    ['un número', 42],
    ['un arreglo', []],
    ['sin versión', { watched: {} }],
    ['versión desconocida', { version: 99, watched: {} }],
    ['versión como texto', { version: '1', watched: {} }],
    ['sin watched', { version: 1 }],
    ['watched como arreglo', { version: 1, watched: ['x-men'] }],
  ])('rechaza %s', (_, value) => {
    expect(parseProgress(value)).toBeNull();
  });
});

describe('serializeProgress', () => {
  it('guarda la versión y las sesiones vistas', () => {
    expect(JSON.parse(serializeProgress(SAMPLE_PROGRESS))).toEqual({
      version: 1,
      watched: { 'x-men': '2026-09-29', 'loki-s1-e1-2': '2026-10-27' },
    });
  });

  it('parseProgress recupera exactamente lo que se serializó', () => {
    const roundTrip = parseProgress(JSON.parse(serializeProgress(SAMPLE_PROGRESS)));

    expect(roundTrip).toEqual(SAMPLE_PROGRESS);
  });
});

describe('loadProgress', () => {
  it('sin datos guardados devuelve progreso vacío', () => {
    const result = loadProgress(createMemoryStorage());

    expect(result.status).toBe('empty');
    expect(result.progress.watched.size).toBe(0);
  });

  it('carga el progreso guardado', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: serializeProgress(SAMPLE_PROGRESS) });

    expect(loadProgress(storage)).toEqual({ status: 'loaded', progress: SAMPLE_PROGRESS });
  });

  it('con JSON corrupto devuelve progreso vacío', () => {
    const result = loadProgress(createMemoryStorage({ [STORAGE_KEY]: '{no es json' }));

    expect(result.status).toBe('invalid');
    expect(result.progress.watched.size).toBe(0);
  });

  it('con estructura inválida devuelve progreso vacío', () => {
    const result = loadProgress(createMemoryStorage({ [STORAGE_KEY]: '{"version":1}' }));

    expect(result.status).toBe('invalid');
  });

  it('si el navegador bloquea el almacenamiento, no lanza error', () => {
    expect(loadProgress(failingStorage).status).toBe('unavailable');
  });
});

describe('saveProgress', () => {
  it('guarda y se puede volver a cargar', () => {
    const storage = createMemoryStorage();

    expect(saveProgress(storage, SAMPLE_PROGRESS)).toBe(true);
    expect(loadProgress(storage).progress).toEqual(SAMPLE_PROGRESS);
  });

  it('devuelve false si no se pudo guardar, sin lanzar error', () => {
    expect(saveProgress(failingStorage, SAMPLE_PROGRESS)).toBe(false);
  });
});
