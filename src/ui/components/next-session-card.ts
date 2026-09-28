import type { IsoDate, SessionEntry } from '../../domain/types';
import {
  escapeHtml,
  formatSessionDate,
  getItemDisplayTitle,
  getSessionTiming,
  type SessionTiming,
} from '../format';
import { FOCUS_RING, toggleSessionAttributes } from '../actions';

/**
 * El botón de esta tarjeta siempre conserva el foco al marcar,
 * aunque después muestre otra sesión.
 */
const NEXT_SESSION_FOCUS_KEY = 'next-session';

const TIMING_LABELS: Record<SessionTiming, (date: string) => string> = {
  overdue: (date) => `Pendiente desde el ${date}`,
  today: () => 'Toca hoy',
  tomorrow: () => 'Toca mañana',
  upcoming: (date) => `Programada para el ${date}`,
};

const TIMING_STYLES: Record<SessionTiming, string> = {
  overdue: 'text-status-behind',
  today: 'text-progress',
  tomorrow: 'text-ink-muted',
  upcoming: 'text-ink-muted',
};

function renderEpisodes(entry: SessionEntry): string {
  if (entry.kind === 'movie') return '';

  const episodes = entry.session.episodes
    .map(
      (episode) => `
        <li class="flex gap-2">
          <span class="shrink-0 text-ink-subtle tabular-nums">Ep. ${episode.number}</span>
          <span>${escapeHtml(episode.title)}</span>
        </li>
      `,
    )
    .join('');

  return `<ul class="flex flex-col gap-1 text-sm text-ink-muted">${episodes}</ul>`;
}

function renderCompleted(): string {
  return `
    <div class="rounded-2xl border border-progress/40 bg-surface p-5">
      <p class="text-sm font-medium text-progress">Road completado</p>
      <p class="mt-1 text-sm text-ink-muted">Viste todo. Nos vemos en la función.</p>
    </div>
  `;
}

interface NextSessionCardProps {
  readonly entry: SessionEntry | null;
  readonly today: IsoDate;
}

export function renderNextSessionCard({ entry, today }: NextSessionCardProps): string {
  if (!entry) return renderCompleted();

  const timing = getSessionTiming(entry.session.date, today);
  const accent = entry.kind === 'movie' ? 'border-movie/40' : 'border-series/40';
  const kindLabel = entry.kind === 'movie' ? 'Película' : 'Serie';

  return `
    <article class="flex flex-col gap-3 rounded-2xl border ${accent} bg-surface p-5">
      <header class="flex items-center justify-between gap-2 text-xs">
        <span class="font-medium uppercase tracking-wider text-ink-subtle">Siguiente</span>
        <span class="${TIMING_STYLES[timing]}">
          ${TIMING_LABELS[timing](formatSessionDate(entry.session.date))}
        </span>
      </header>
      <div>
        <h3 class="text-lg leading-snug font-semibold">${escapeHtml(getItemDisplayTitle(entry.item))}</h3>
        <p class="text-xs text-ink-subtle">${kindLabel} · ${entry.item.releaseDate.slice(0, 4)}</p>
      </div>
      ${renderEpisodes(entry)}

      <button
        type="button"
        ${toggleSessionAttributes(entry.session.id, NEXT_SESSION_FOCUS_KEY)}
        class="mt-1 cursor-pointer rounded-lg bg-progress px-4 py-2 text-sm font-semibold text-canvas transition-colors hover:bg-status-on-track ${FOCUS_RING}"
      >
        ${entry.kind === 'movie' ? 'Marcar como vista' : 'Marcar episodios como vistos'}
      </button>
    </article>
  `;
}
