import type { MovieItem, RoadItem, SeriesItem } from './types';

export const MOVIE_A: MovieItem = {
  id: 'movie-a',
  kind: 'movie',
  title: 'Movie A',
  releaseDate: '2020-01-01',
  tier: 'essential',
  relevance: 'Película de prueba.',
  session: { id: 'movie-a', date: '2026-10-01', minutes: 120 },
};

export const SERIES_B: SeriesItem = {
  id: 'series-b',
  kind: 'series',
  title: 'Series B',
  season: 1,
  releaseDate: '2021-01-01',
  tier: 'recommended',
  relevance: 'Serie de prueba.',
  sessions: [
    {
      id: 'series-b-e1-2',
      date: '2026-10-02',
      minutes: 90,
      episodes: [
        { number: 1, title: 'Uno' },
        { number: 2, title: 'Dos' },
      ],
    },
    {
      id: 'series-b-e3-4',
      date: '2026-10-03',
      minutes: 90,
      episodes: [
        { number: 3, title: 'Tres' },
        { number: 4, title: 'Cuatro' },
      ],
    },
  ],
};

export const MOVIE_C: MovieItem = {
  id: 'movie-c',
  kind: 'movie',
  title: 'Movie C',
  releaseDate: '2022-01-01',
  tier: 'essential',
  relevance: 'Otra película de prueba.',
  session: { id: 'movie-c', date: '2026-10-05', minutes: 130 },
};

export const TEST_ROAD: readonly RoadItem[] = [MOVIE_A, SERIES_B, MOVIE_C];
