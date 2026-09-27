import { describe, expect, it } from 'vitest';
import { getScheduleReport } from './schedule';
import { TEST_ROAD } from './test-fixtures';

const ALL_SESSION_IDS = ['movie-a', 'series-b-e1-2', 'series-b-e3-4', 'movie-c'];

function report(watchedIds: readonly string[], today: string) {
  return getScheduleReport(TEST_ROAD, new Set(watchedIds), today);
}

describe('getScheduleReport', () => {
  describe('al día', () => {
    it('antes de que empiece el Road', () => {
      expect(report([], '2026-09-27')).toEqual({
        status: 'on-track',
        overdueSessions: 0,
        sessionsAhead: 0,
      });
    });

    it('con la sesión de hoy todavía pendiente', () => {
      expect(report([], '2026-10-01').status).toBe('on-track');
    });

    it('con la sesión de hoy ya vista', () => {
      expect(report(['movie-a'], '2026-10-01').status).toBe('on-track');
    });

    it('en un día sin sesión, con todo lo anterior visto', () => {
      expect(report(['movie-a', 'series-b-e1-2', 'series-b-e3-4'], '2026-10-04').status).toBe(
        'on-track',
      );
    });

    it('después de terminar el Road con todo visto', () => {
      expect(report(ALL_SESSION_IDS, '2026-12-16').status).toBe('on-track');
    });
  });

  describe('atrasado', () => {
    it('cuando una sesión de ayer sigue pendiente', () => {
      expect(report([], '2026-10-02')).toEqual({
        status: 'behind',
        overdueSessions: 1,
        sessionsAhead: 0,
      });
    });

    it('cuenta todas las sesiones atrasadas', () => {
      expect(report(['movie-a'], '2026-10-06')).toMatchObject({
        status: 'behind',
        overdueSessions: 3,
      });
    });

    it('tiene prioridad aunque se haya visto algo por adelantado', () => {
      expect(report(['series-b-e3-4'], '2026-10-02')).toEqual({
        status: 'behind',
        overdueSessions: 1,
        sessionsAhead: 1,
      });
    });
  });

  describe('adelantado', () => {
    it('cuando se vio una sesión con fecha futura', () => {
      expect(report(['movie-a', 'series-b-e1-2', 'series-b-e3-4'], '2026-10-02')).toEqual({
        status: 'ahead',
        overdueSessions: 0,
        sessionsAhead: 1,
      });
    });

    it('antes de empezar, si ya se vio la primera sesión', () => {
      expect(report(['movie-a'], '2026-09-28')).toMatchObject({
        status: 'ahead',
        sessionsAhead: 1,
      });
    });
  });

  it('ignora sesiones guardadas que ya no existen en el Road', () => {
    expect(report(['sesion-eliminada'], '2026-09-30').status).toBe('on-track');
  });
});
