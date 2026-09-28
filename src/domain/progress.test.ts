import { describe, expect, expectTypeOf, it } from 'vitest';
import { calculatePercent, getNextSession, getProgressSummary, isItemComplete } from './progress';
import { SERIES_B, TEST_ROAD } from './test-fixtures';
import type { SeriesSession } from './types';

const ALL_SESSION_IDS = ['movie-a', 'series-b-e1-2', 'series-b-e3-4', 'movie-c'];

describe('calculatePercent', () => {
  it.each([
    [0, 4, 0],
    [1, 3, 33],
    [2, 4, 50],
    [2, 3, 66],
    [26, 27, 96],
    [199, 200, 99],
    [27, 27, 100],
  ])('%i de %i da %i', (done, total, expected) => {
    expect(calculatePercent(done, total)).toBe(expected);
  });

  it('devuelve 0 si no hay sesiones', () => {
    expect(calculatePercent(0, 0)).toBe(0);
  });
});

describe('isItemComplete', () => {
  it('una serie está completa solo con todas sus sesiones vistas', () => {
    expect(isItemComplete(SERIES_B, new Set(['series-b-e1-2']))).toBe(false);
    expect(isItemComplete(SERIES_B, new Set(['series-b-e1-2', 'series-b-e3-4']))).toBe(true);
  });
});

describe('getProgressSummary', () => {
  it('sin nada visto', () => {
    expect(getProgressSummary(TEST_ROAD, new Set())).toEqual({
      totalSessions: 4,
      watchedSessions: 0,
      skippedSessions: 0,
      pendingSessions: 4,
      percent: 0,
      totalItems: 3,
      completedItems: 0,
    });
  });

  it('con progreso parcial', () => {
    const watched = new Set(['movie-a', 'series-b-e1-2']);

    expect(getProgressSummary(TEST_ROAD, watched)).toMatchObject({
      watchedSessions: 2,
      pendingSessions: 2,
      percent: 50,
      completedItems: 1,
    });
  });

  it('con todo visto', () => {
    expect(getProgressSummary(TEST_ROAD, new Set(ALL_SESSION_IDS))).toMatchObject({
      pendingSessions: 0,
      percent: 100,
      completedItems: 3,
    });
  });

  it('ignora sesiones guardadas que ya no existen en el Road', () => {
    const watched = new Set(['movie-a', 'sesion-eliminada']);

    expect(getProgressSummary(TEST_ROAD, watched)).toMatchObject({
      watchedSessions: 1,
      pendingSessions: 3,
    });
  });
});

describe('getNextSession', () => {
  it('sin nada visto, es la primera sesión', () => {
    expect(getNextSession(TEST_ROAD, new Set())?.session.id).toBe('movie-a');
  });

  it('avanza a la primera sesión pendiente', () => {
    expect(getNextSession(TEST_ROAD, new Set(['movie-a']))?.session.id).toBe('series-b-e1-2');
  });

  it('si se vio algo fuera de orden, sigue siendo la primera pendiente', () => {
    expect(getNextSession(TEST_ROAD, new Set(['movie-c']))?.session.id).toBe('movie-a');
  });

  it('devuelve null cuando todo está visto', () => {
    expect(getNextSession(TEST_ROAD, new Set(ALL_SESSION_IDS))).toBeNull();
  });

  it('permite acceder a los episodios cuando la siguiente es de una serie', () => {
    const next = getNextSession(TEST_ROAD, new Set(['movie-a']));

    if (next?.kind === 'series') {
      expectTypeOf(next.session).toEqualTypeOf<SeriesSession>();
      expect(next.session.episodes.map((episode) => episode.number)).toEqual([1, 2]);
    } else {
      expect.fail('La siguiente sesión debía ser de una serie');
    }
  });
});

describe('sesiones omitidas', () => {
  const skipped = new Set(['series-b-e1-2']);

  it('no cuentan para el porcentaje ni se restan del total', () => {
    expect(getProgressSummary(TEST_ROAD, new Set(['movie-a']), skipped)).toMatchObject({
      totalSessions: 4,
      watchedSessions: 1,
      skippedSessions: 1,
      pendingSessions: 2,
      percent: 25,
    });
  });

  it('una sesión vista no cuenta además como omitida', () => {
    const summary = getProgressSummary(TEST_ROAD, new Set(['movie-a']), new Set(['movie-a']));

    expect(summary).toMatchObject({ watchedSessions: 1, skippedSessions: 0, pendingSessions: 3 });
  });

  it('una serie con un bloque omitido no queda completa', () => {
    const watched = new Set(['series-b-e3-4']);

    expect(getProgressSummary(TEST_ROAD, watched, skipped).completedItems).toBe(0);
  });

  it('la siguiente sesión se salta las omitidas', () => {
    expect(getNextSession(TEST_ROAD, new Set(['movie-a']), skipped)?.session.id).toBe(
      'series-b-e3-4',
    );
  });

  it('si todo lo pendiente está omitido, no hay siguiente sesión', () => {
    const all = new Set(['movie-a', 'series-b-e1-2', 'series-b-e3-4', 'movie-c']);

    expect(getNextSession(TEST_ROAD, new Set(), all)).toBeNull();
  });
});
