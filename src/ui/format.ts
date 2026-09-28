import { daysBetween, parseIsoDate } from '../domain/dates';
import type { Episode, IsoDate, RoadItem } from '../domain/types';

/** Elige singular o plural según la cantidad: `1 sesión`, `3 sesiones`. */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Convierte texto en HTML seguro: `Deadpool & Wolverine` → `Deadpool &amp; Wolverine`. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

const SESSION_DATE_FORMAT = new Intl.DateTimeFormat('es-MX', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

/** Fecha corta para mostrar, por ejemplo `mar 29 de sep`. */
export function formatSessionDate(date: IsoDate): string {
  return SESSION_DATE_FORMAT.format(parseIsoDate(date));
}

/** Nombre visible de un título: las series incluyen la temporada. */
export function getItemDisplayTitle(item: RoadItem): string {
  return item.kind === 'series' ? `${item.title} · Temporada ${item.season}` : item.title;
}

export type SessionTiming = 'overdue' | 'today' | 'tomorrow' | 'upcoming';

/** Cómo se relaciona la fecha de una sesión con hoy. */
export function getSessionTiming(date: IsoDate, today: IsoDate): SessionTiming {
  const days = daysBetween(today, date);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return 'upcoming';
}

/** Rango de episodios de un bloque: `Ep. 3` o `Ep. 1–2`. */
export function formatEpisodeRange(episodes: readonly Episode[]): string {
  const first = episodes[0]?.number;
  const last = episodes.at(-1)?.number;
  if (first === undefined || last === undefined) return '';
  return first === last ? `Ep. ${first}` : `Ep. ${first}–${last}`;
}
