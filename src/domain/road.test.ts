import { describe, expect, it } from 'vitest';
import { getAllSessions, getItemSessions, getSessionEntries } from './road';
import { MOVIE_A, SERIES_B, TEST_ROAD } from './test-fixtures';

describe('getItemSessions', () => {
  it('devuelve la única sesión de una película', () => {
    expect(getItemSessions(MOVIE_A).map((session) => session.id)).toEqual(['movie-a']);
  });

  it('devuelve todas las sesiones de una serie', () => {
    expect(getItemSessions(SERIES_B).map((session) => session.id)).toEqual([
      'series-b-e1-2',
      'series-b-e3-4',
    ]);
  });
});

describe('getAllSessions', () => {
  it('aplana las sesiones respetando el orden de los títulos', () => {
    expect(getAllSessions(TEST_ROAD).map((session) => session.id)).toEqual([
      'movie-a',
      'series-b-e1-2',
      'series-b-e3-4',
      'movie-c',
    ]);
  });

  it('ordena por fecha aunque un título aparezca después en la lista', () => {
    const late = {
      ...MOVIE_A,
      id: 'late',
      session: { ...MOVIE_A.session, id: 'late', date: '2026-10-02' },
    };

    expect(getAllSessions([...TEST_ROAD, late]).map((session) => session.id)).toEqual([
      'movie-a',
      'series-b-e1-2',
      'late',
      'series-b-e3-4',
      'movie-c',
    ]);
  });

  it('devuelve una lista vacía si no hay títulos', () => {
    expect(getAllSessions([])).toEqual([]);
  });
});

describe('getSessionEntries', () => {
  it('acompaña cada sesión con su título y su tipo', () => {
    const entries = getSessionEntries(TEST_ROAD).map((entry) => [
      entry.kind,
      entry.item.id,
      entry.session.id,
    ]);

    expect(entries).toEqual([
      ['movie', 'movie-a', 'movie-a'],
      ['series', 'series-b', 'series-b-e1-2'],
      ['series', 'series-b', 'series-b-e3-4'],
      ['movie', 'movie-c', 'movie-c'],
    ]);
  });
});
