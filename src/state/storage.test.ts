import { describe, expect, it } from 'vitest';
import {
  BACKUP_STORAGE_KEY,
  clearProgress,
  loadProgress,
  parseProgress,
  saveProgress,
  serializeProgress,
  STORAGE_KEY,
} from './storage';
import { createMemoryStorage, failingStorage } from './test-utils';
import type { UserProgress } from './types';

const SAMPLE_PROGRESS: UserProgress = {
  watched: new Map([
    ['x-men', '2026-09-28'],
    ['loki-s1-e1-2', '2026-11-07'],
  ]),
  skipped: new Map([['ghost-rider', '2026-10-03']]),
};

describe('parseProgress', () => {
  it('acepta datos válidos', () => {
    const progress = parseProgress({
      version: 2,
      watched: { 'x-men': '2026-09-28' },
      skipped: { 'ghost-rider': '2026-10-03' },
    });

    expect(progress).toEqual({
      watched: new Map([['x-men', '2026-09-28']]),
      skipped: new Map([['ghost-rider', '2026-10-03']]),
    });
  });

  it('descarta solo las entradas con fecha inválida', () => {
    const progress = parseProgress({
      version: 2,
      watched: { 'x-men': '2026-09-28', x2: 'ayer', 'the-avengers': 42 },
      skipped: { elektra: 'nunca' },
    });

    expect(progress?.watched).toEqual(new Map([['x-men', '2026-09-28']]));
    expect(progress?.skipped.size).toBe(0);
  });

  it('una sesión vista no puede estar también omitida', () => {
    const progress = parseProgress({
      version: 2,
      watched: { 'x-men': '2026-09-28' },
      skipped: { 'x-men': '2026-09-28' },
    });

    expect(progress?.skipped.has('x-men')).toBe(false);
  });

  it.each([
    ['null', null],
    ['un número', 42],
    ['un arreglo', []],
    ['sin versión', { watched: {}, skipped: {} }],
    ['versión desconocida', { version: 99, watched: {}, skipped: {} }],
    ['versión como texto', { version: '2', watched: {}, skipped: {} }],
    ['la versión 1 sin migrar', { version: 1, watched: {} }],
    ['sin watched', { version: 2, skipped: {} }],
    ['sin skipped', { version: 2, watched: {} }],
    ['watched como arreglo', { version: 2, watched: ['x-men'], skipped: {} }],
  ])('rechaza %s', (_, value) => {
    expect(parseProgress(value)).toBeNull();
  });
});

describe('serializeProgress', () => {
  it('guarda la versión, las sesiones vistas y las omitidas', () => {
    expect(JSON.parse(serializeProgress(SAMPLE_PROGRESS))).toEqual({
      version: 2,
      watched: { 'x-men': '2026-09-28', 'loki-s1-e1-2': '2026-11-07' },
      skipped: { 'ghost-rider': '2026-10-03' },
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

  it('migra el progreso guardado en la versión 1', () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({ version: 1, watched: { 'x-men': '2026-09-28' } }),
    });

    expect(loadProgress(storage)).toEqual({
      status: 'migrated',
      progress: { watched: new Map([['x-men', '2026-09-28']]), skipped: new Map() },
    });
  });

  it.each([
    ['JSON corrupto', '{no es json'],
    ['estructura inválida', '{"version":2}'],
    ['una versión futura', '{"version":3,"watched":{},"skipped":{}}'],
  ])('con %s devuelve progreso vacío y guarda un respaldo', (_, raw) => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: raw });
    const result = loadProgress(storage);

    expect(result.status).toBe('invalid');
    expect(result.progress.watched.size).toBe(0);
    expect(storage.data.get(BACKUP_STORAGE_KEY)).toBe(raw);
  });

  it('no crea respaldo cuando los datos son válidos', () => {
    const storage = createMemoryStorage({ [STORAGE_KEY]: serializeProgress(SAMPLE_PROGRESS) });
    loadProgress(storage);

    expect(storage.data.has(BACKUP_STORAGE_KEY)).toBe(false);
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

describe('clearProgress', () => {
  it('borra el progreso y deja el respaldo intacto', () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: serializeProgress(SAMPLE_PROGRESS),
      [BACKUP_STORAGE_KEY]: 'respaldo',
    });

    expect(clearProgress(storage)).toBe(true);
    expect(loadProgress(storage).status).toBe('empty');
    expect(storage.data.get(BACKUP_STORAGE_KEY)).toBe('respaldo');
  });

  it('devuelve false si no se pudo borrar, sin lanzar error', () => {
    expect(clearProgress(failingStorage)).toBe(false);
  });
});
