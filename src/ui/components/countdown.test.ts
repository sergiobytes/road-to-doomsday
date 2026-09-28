import { describe, expect, it } from 'vitest';
import { parseInstant, type Countdown } from '../../domain/countdown';
import { formatShowtime, getCountdownLabel, padTwoDigits } from './countdown';

function countdown(overrides: Partial<Countdown>): Countdown {
  return { isOver: false, days: 0, hours: 0, minutes: 0, seconds: 0, ...overrides };
}

describe('padTwoDigits', () => {
  it.each([
    [0, '00'],
    [7, '07'],
    [42, '42'],
  ])('%i → %s', (value, expected) => {
    expect(padTwoDigits(value)).toBe(expected);
  });
});

describe('getCountdownLabel', () => {
  it('describe el tiempo restante para lectores de pantalla', () => {
    expect(getCountdownLabel(countdown({ days: 80, hours: 3, minutes: 15 }))).toBe(
      'Faltan 80 días, 3 horas y 15 minutos para la función',
    );
  });

  it('usa el singular para un solo día', () => {
    expect(getCountdownLabel(countdown({ days: 1 }))).toContain('1 día,');
  });
});

describe('formatShowtime', () => {
  it('una función a las 00:00 se describe como la medianoche del día anterior', () => {
    const text = formatShowtime(parseInstant('2026-12-17T00:00:00-06:00'));

    expect(text).toContain('16');
    expect(text).toContain('medianoche');
  });

  it('a cualquier otra hora muestra el día y la hora', () => {
    const text = formatShowtime(parseInstant('2026-12-17T19:30:00-06:00'));

    expect(text).toContain('17');
    expect(text).toContain('19:30');
  });
});
