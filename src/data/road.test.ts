import { describe, expect, it } from 'vitest';
import { ROAD } from './road';

describe('ROAD', () => {
  it('contiene los 21 títulos acordados', () => {
    expect(ROAD).toHaveLength(21);
  });

  it('contiene 27 sesiones en total', () => {
    const sessionCount = ROAD.reduce(
      (total, item) => total + (item.kind === 'movie' ? 1 : item.sessions.length),
      0,
    );

    expect(sessionCount).toBe(27);
  });

  it('genera los ids de las sesiones de series a partir de sus episodios', () => {
    const loki = ROAD.find((item) => item.id === 'loki-s1');

    expect(loki?.kind === 'series' && loki.sessions.map((session) => session.id)).toEqual([
      'loki-s1-e1-2',
      'loki-s1-e3-4',
      'loki-s1-e5-6',
    ]);
  });
});
