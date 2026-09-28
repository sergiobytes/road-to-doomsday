import type { IsoDate } from '../domain/types';

/** Primer día del Road. */
export const ROAD_START_DATE: IsoDate = '2026-09-28';

/** Todas las sesiones deben quedar antes de este día (el de la función). */
export const ROAD_DEADLINE: IsoDate = '2026-12-16';

export const DAILY_MINUTES_LIMIT = 240;

export const MAX_MOVIES_PER_DAY = 2;

/** Instante de la función de estreno, con zona horaria explícita: miércoles 16 de diciembre, 5:55 p. m. */
export const PREMIERE_SHOWTIME = '2026-12-16T17:55:00-06:00';
