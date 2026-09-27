import { describe, expect, it } from 'vitest';
import { getAllSessions, getItemSessions } from './road';
import type { MovieItem, SeriesItem } from './types';

const movie: MovieItem = {
  id: 'movie',
  kind: 'movie',
  title: 'Movie',
  releaseDate: '2020-01-01',
  tier: 'essential',
  relevance: 'Prueba.',
  session: { id: 'movie', date: '2026-10-01' },
};

const series: SeriesItem = {
  id: 'series',
  kind: 'series',
  title: 'Series',
  season: 1,
  releaseDate: '2021-01-01',
  tier: 'recommended',
  relevance: 'Prueba.',
  sessions: [
    { id: 'series-e1-2', date: '2026-10-02', episodes: [] },
    { id: 'series-e3-4', date: '2026-10-03', episodes: [] },
  ],
};

describe('getItemSessions', () => {
  it('devuelve la única sesión de una película', () => {
    expect(getItemSessions(movie).map((session) => session.id)).toEqual(['movie']);
  });

  it('devuelve todas las sesiones de una serie', () => {
    expect(getItemSessions(series).map((session) => session.id)).toEqual([
      'series-e1-2',
      'series-e3-4',
    ]);
  });
});

describe('getAllSessions', () => {
  it('aplana las sesiones respetando el orden de los títulos', () => {
    expect(getAllSessions([movie, series]).map((session) => session.id)).toEqual([
      'movie',
      'series-e1-2',
      'series-e3-4',
    ]);
  });

  it('devuelve una lista vacía si no hay títulos', () => {
    expect(getAllSessions([])).toEqual([]);
  });
});
