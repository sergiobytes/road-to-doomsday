import type { IsoDate } from '../domain/types';

/** Primer día del Road. */
export const ROAD_START_DATE: IsoDate = '2026-09-28';

/** Todas las sesiones deben quedar antes de este día (el de la función). */
export const ROAD_DEADLINE: IsoDate = '2026-12-16';

/**
 * Instante de la función de estreno, con zona horaria explícita.
 * PROVISIONAL: medianoche del miércoles 16 al jueves 17 de diciembre.
 * Actualizar cuando se compren los boletos.
 */
export const PREMIERE_SHOWTIME = '2026-12-17T00:00:00-06:00';
