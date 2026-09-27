import { describe, expect, it } from 'vitest';
import { compareIsoDates, isIsoDate, parseIsoDate, toIsoDate } from './dates';

describe('entorno', () => {
  it('las pruebas corren en la zona horaria de Ciudad de México', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/Mexico_City');
  });
});

describe('isIsoDate', () => {
  it.each(['2026-09-28', '2026-12-16', '2024-02-29'])('acepta %s', (value) => {
    expect(isIsoDate(value)).toBe(true);
  });

  it.each([
    ['formato sin ceros', '2026-9-28'],
    ['mes inexistente', '2026-13-01'],
    ['día inexistente', '2026-02-30'],
    ['29 de febrero en año no bisiesto', '2026-02-29'],
    ['fecha con hora', '2026-09-28T00:00:00'],
    ['texto vacío', ''],
  ])('rechaza %s (%s)', (_, value) => {
    expect(isIsoDate(value)).toBe(false);
  });

  it.each([null, undefined, 20260928, {}])('rechaza valores que no son texto: %s', (value) => {
    expect(isIsoDate(value)).toBe(false);
  });
});

describe('parseIsoDate', () => {
  it('crea la fecha a medianoche local, no UTC', () => {
    const date = parseIsoDate('2026-09-28');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(8);
    expect(date.getDate()).toBe(28);
    expect(date.getHours()).toBe(0);
  });

  it('evita el error de new Date("YYYY-MM-DD")', () => {
    expect(new Date('2026-09-28').getDate()).toBe(27);
    expect(parseIsoDate('2026-09-28').getDate()).toBe(28);
  });

  it('lanza un error con fechas inválidas', () => {
    expect(() => parseIsoDate('2026-02-30')).toThrow('Fecha inválida');
  });
});

describe('toIsoDate', () => {
  it('usa el día local incluso a las 23:59', () => {
    expect(toIsoDate(new Date(2026, 8, 27, 23, 59))).toBe('2026-09-27');
  });

  it('usa el día local aunque en UTC ya sea el día siguiente', () => {
    expect(toIsoDate(new Date('2026-09-28T03:00:00Z'))).toBe('2026-09-27');
  });

  it('es la operación inversa de parseIsoDate', () => {
    expect(toIsoDate(parseIsoDate('2026-12-16'))).toBe('2026-12-16');
  });
});

describe('compareIsoDates', () => {
  it('ordena cronológicamente', () => {
    const dates = ['2026-12-09', '2026-09-29', '2026-10-18'];

    expect([...dates].sort(compareIsoDates)).toEqual(['2026-09-29', '2026-10-18', '2026-12-09']);
  });

  it('devuelve 0 para fechas iguales', () => {
    expect(compareIsoDates('2026-10-01', '2026-10-01')).toBe(0);
  });
});
