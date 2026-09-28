import { describe, expect, it } from 'vitest';
import type { ScheduleReport } from '../../domain/schedule';
import { getRingOffset, getStatusText, RING_CIRCUMFERENCE } from './progress-panel';

function schedule(overrides: Partial<ScheduleReport>): ScheduleReport {
  return { status: 'on-track', overdueSessions: 0, sessionsAhead: 0, ...overrides };
}

describe('getRingOffset', () => {
  it.each([
    [0, RING_CIRCUMFERENCE],
    [50, RING_CIRCUMFERENCE / 2],
    [100, 0],
  ])('con %i %% deja sin pintar %d', (percent, expected) => {
    expect(getRingOffset(percent)).toBeCloseTo(expected);
  });

  it('limita valores fuera de rango', () => {
    expect(getRingOffset(-10)).toBeCloseTo(RING_CIRCUMFERENCE);
    expect(getRingOffset(150)).toBeCloseTo(0);
  });
});

describe('getStatusText', () => {
  it('al día no muestra detalle', () => {
    expect(getStatusText(schedule({}))).toBe('Al día');
  });

  it('atrasado indica cuántas sesiones, en singular o plural', () => {
    expect(getStatusText(schedule({ status: 'behind', overdueSessions: 1 }))).toBe(
      'Atrasado · 1 sesión',
    );
    expect(getStatusText(schedule({ status: 'behind', overdueSessions: 3 }))).toBe(
      'Atrasado · 3 sesiones',
    );
  });

  it('adelantado indica cuántas sesiones', () => {
    expect(getStatusText(schedule({ status: 'ahead', sessionsAhead: 2 }))).toBe(
      'Adelantado · 2 sesiones',
    );
  });
});
