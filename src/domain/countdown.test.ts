import { describe, expect, it } from 'vitest';
import { getCountdown, parseInstant } from './countdown';

const TARGET = parseInstant('2026-12-17T00:00:00-06:00');

function countdownAt(now: string) {
  return getCountdown(TARGET, parseInstant(now));
}

describe('getCountdown', () => {
  it('descompone el tiempo restante en días, horas, minutos y segundos', () => {
    expect(countdownAt('2026-12-15T21:29:15-06:00')).toEqual({
      isOver: false,
      days: 1,
      hours: 2,
      minutes: 30,
      seconds: 45,
    });
  });

  it('desde el inicio del Road faltan 80 días completos', () => {
    expect(countdownAt('2026-09-28T00:00:00-06:00')).toMatchObject({ days: 80, hours: 0 });
  });

  it('un segundo antes aún no termina', () => {
    expect(countdownAt('2026-12-16T23:59:59-06:00')).toEqual({
      isOver: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
    });
  });

  it('termina exactamente a la hora de la función', () => {
    expect(countdownAt('2026-12-17T00:00:00-06:00').isOver).toBe(true);
  });

  it('después de la función se queda en cero', () => {
    expect(countdownAt('2026-12-18T10:00:00-06:00')).toEqual({
      isOver: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  });

  it('descarta las fracciones de segundo', () => {
    const almostTwoSeconds = getCountdown(TARGET, TARGET - 1999);

    expect(almostTwoSeconds.seconds).toBe(1);
  });
});

describe('parseInstant', () => {
  it('respeta la zona horaria explícita', () => {
    expect(parseInstant('2026-12-17T00:00:00-06:00')).toBe(Date.UTC(2026, 11, 17, 6));
  });

  it('lanza un error con un texto inválido', () => {
    expect(() => parseInstant('mañana')).toThrow('Instante inválido');
  });
});
