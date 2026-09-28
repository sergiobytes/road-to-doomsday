import { describe, expectTypeOf, it } from 'vitest';
import type { MovieItem, RoadItem, SeriesItem, SeriesSession } from './types';

const movie: MovieItem = {
  id: 'x-men',
  kind: 'movie',
  title: 'X-Men',
  releaseDate: '2000-07-14',
  tier: 'essential',
  platforms: ['disney-plus'],
  relevance: 'Regresa el reparto original.',
  session: { id: 'x-men', date: '2026-09-29', minutes: 104 },
};

const series: SeriesItem = {
  id: 'loki-s1',
  kind: 'series',
  title: 'Loki',
  season: 1,
  releaseDate: '2021-06-09',
  tier: 'essential',
  platforms: ['disney-plus'],
  relevance: 'Multiverso y variantes.',
  sessions: [
    {
      id: 'loki-s1-e1-2',
      date: '2026-10-27',
      minutes: 96,
      episodes: [
        { number: 1, title: 'Glorious Purpose' },
        { number: 2, title: 'The Variant' },
      ],
    },
  ],
};

describe('tipos del dominio', () => {
  it('distingue películas y series por `kind`', () => {
    const items: RoadItem[] = [movie, series];

    for (const item of items) {
      if (item.kind === 'movie') {
        expectTypeOf(item).toEqualTypeOf<MovieItem>();
      } else {
        expectTypeOf(item.sessions).toEqualTypeOf<readonly SeriesSession[]>();
      }
    }
  });

  it('rechaza formas inválidas', () => {
    // @ts-expect-error: una película no tiene sesiones con episodios
    const invalidMovie: MovieItem = { ...movie, sessions: series.sessions };

    // @ts-expect-error: el tier solo puede ser 'essential' o 'recommended'
    const invalidTier: RoadItem = { ...movie, tier: 'optional' };

    // @ts-expect-error: los datos son de solo lectura
    movie.title = 'Otro título';

    expectTypeOf(invalidMovie).not.toBeAny();
    expectTypeOf(invalidTier).not.toBeAny();
  });
});
