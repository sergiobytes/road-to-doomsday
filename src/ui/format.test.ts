import { describe, expect, it } from 'vitest';
import { MOVIE_A, SERIES_B } from '../domain/test-fixtures';
import { escapeHtml, getItemDisplayTitle, getSessionTiming, pluralize } from './format';

describe('pluralize', () => {
  it.each([
    [0, '0 sesiones'],
    [1, '1 sesión'],
    [2, '2 sesiones'],
  ])('%i → %s', (count, expected) => {
    expect(pluralize(count, 'sesión', 'sesiones')).toBe(expected);
  });
});

describe('escapeHtml', () => {
  it('escapa los caracteres especiales de HTML', () => {
    expect(escapeHtml('Deadpool & Wolverine')).toBe('Deadpool &amp; Wolverine');
    expect(escapeHtml('<b>"x"</b>')).toBe('&lt;b&gt;&quot;x&quot;&lt;/b&gt;');
  });

  it('no cambia texto normal', () => {
    expect(escapeHtml('Thunderbolts*')).toBe('Thunderbolts*');
  });
});

describe('getItemDisplayTitle', () => {
  it('las películas usan su título', () => {
    expect(getItemDisplayTitle(MOVIE_A)).toBe('Movie A');
  });

  it('las series incluyen la temporada', () => {
    expect(getItemDisplayTitle(SERIES_B)).toBe('Series B · Temporada 1');
  });
});

describe('getSessionTiming', () => {
  it.each([
    ['2026-10-01', 'overdue'],
    ['2026-10-02', 'today'],
    ['2026-10-03', 'tomorrow'],
    ['2026-10-10', 'upcoming'],
  ] as const)('una sesión del %s, visto el 2 de octubre, es %s', (date, expected) => {
    expect(getSessionTiming(date, '2026-10-02')).toBe(expected);
  });
});
