import { describe, expect, it } from 'vitest';
import { MOVIE_A, SERIES_B, TEST_ROAD } from './test-fixtures';
import { getItemStartDate, groupItemsByWeek } from './timeline';

describe('getItemStartDate', () => {
  it('es la fecha de la primera sesión', () => {
    expect(getItemStartDate(MOVIE_A)).toBe('2026-10-01');
    expect(getItemStartDate(SERIES_B)).toBe('2026-10-02');
  });
});

describe('groupItemsByWeek', () => {
  const weeks = groupItemsByWeek(TEST_ROAD, '2026-09-28');

  it('agrupa por semana de lunes a domingo', () => {
    expect(weeks.map((week) => [week.start, week.end])).toEqual([
      ['2026-09-28', '2026-10-04'],
      ['2026-10-05', '2026-10-11'],
    ]);
  });

  it('conserva el orden de los títulos dentro de cada semana', () => {
    expect(weeks.map((week) => week.items.map((item) => item.id))).toEqual([
      ['movie-a', 'series-b'],
      ['movie-c'],
    ]);
  });

  it('numera las semanas desde el inicio del Road', () => {
    expect(weeks.map((week) => week.number)).toEqual([1, 2]);
  });

  it('respeta los huecos: una semana sin contenido no se numera', () => {
    const later = groupItemsByWeek(TEST_ROAD, '2026-09-21');

    expect(later.map((week) => week.number)).toEqual([2, 3]);
  });
});
