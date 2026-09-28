import { parseIsoDate } from '../../domain/dates';
import type { TimelineWeek } from '../../domain/timeline';
import type {
  ContentTier,
  IsoDate,
  MovieItem,
  RoadItem,
  SeriesItem,
  SeriesSession,
  WatchedSessionIds,
} from '../../domain/types';
import { FOCUS_RING, toggleSessionAttributes } from '../actions';
import {
  escapeHtml,
  formatEpisodeRange,
  formatSessionDate,
  getItemDisplayTitle,
  getSessionTiming,
} from '../format';
import { icons } from '../icons';
import { renderPoster } from './poster';

const WEEK_RANGE_FORMAT = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' });

interface TimelineContext {
  readonly watched: WatchedSessionIds;
  readonly today: IsoDate;
}

function formatDateRange(start: IsoDate, end: IsoDate): string {
  return WEEK_RANGE_FORMAT.formatRange(parseIsoDate(start), parseIsoDate(end));
}

const TIER_BADGES: Record<
  Exclude<ContentTier, 'essential'>,
  { label: string; className: string }
> = {
  recommended: { label: 'Recomendado', className: 'border-recommended/30 text-recommended' },
  extra: { label: 'Extra', className: 'border-line-strong text-ink-subtle' },
};

function renderTierBadge(item: RoadItem): string {
  if (item.tier === 'essential') return '';
  const { label, className } = TIER_BADGES[item.tier];
  return `<span class="rounded-full border px-2 py-0.5 text-[11px] ${className}">${label}</span>`;
}

function renderTimingLabel(date: IsoDate, isWatched: boolean, today: IsoDate): string {
  if (isWatched) return '';

  const timing = getSessionTiming(date, today);
  if (timing === 'today') return '<span class="text-xs font-medium text-progress">Hoy</span>';
  if (timing === 'overdue') return '<span class="text-xs text-status-behind">Pendiente</span>';
  return '';
}

function renderMeta(item: RoadItem, detail: string, extra = ''): string {
  const kind = item.kind === 'movie' ? 'Película' : 'Serie';
  return `
    <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-subtle">
      <span>${kind} · ${item.releaseDate.slice(0, 4)} · ${detail}</span>
      ${renderTierBadge(item)}
      ${extra}
    </p>
  `;
}

function renderMovieToggle(item: MovieItem, isWatched: boolean): string {
  const styles = isWatched
    ? 'border-progress/40 bg-progress/10 text-progress'
    : 'border-line-strong text-ink-muted hover:border-progress/60 hover:text-ink';
  const content = isWatched ? `${icons.check('size-4')} Vista` : `${icons.circle('size-4')} Marcar`;

  return `
    <button
      type="button"
      ${toggleSessionAttributes(item.session.id, `timeline:${item.session.id}`)}
      aria-pressed="${isWatched}"
      aria-label="${escapeHtml(`Marcar ${item.title} como vista`)}"
      class="flex shrink-0 cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${styles} ${FOCUS_RING}"
    >
      ${content}
    </button>
  `;
}

function renderMovieCard(item: MovieItem, { watched, today }: TimelineContext): string {
  const isWatched = watched.has(item.session.id);
  const isToday = getSessionTiming(item.session.date, today) === 'today';

  return `
    <article class="flex gap-4 rounded-xl border bg-surface p-3 sm:p-4 ${isToday ? 'border-progress/60' : 'border-line'}">
      <div class="${isWatched ? 'opacity-50' : ''}">${renderPoster(item)}</div>
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <div class="flex items-start justify-between gap-3">
          <h4 class="font-semibold leading-snug ${isWatched ? 'text-ink-muted' : ''}">${escapeHtml(item.title)}</h4>
          ${renderMovieToggle(item, isWatched)}
        </div>
        ${renderMeta(
          item,
          formatSessionDate(item.session.date),
          renderTimingLabel(item.session.date, isWatched, today),
        )}
        <p class="line-clamp-2 text-sm text-ink-muted">${escapeHtml(item.relevance)}</p>
      </div>
    </article>
  `;
}

function renderEpisodeBlock(
  item: SeriesItem,
  session: SeriesSession,
  { watched, today }: TimelineContext,
): string {
  const isWatched = watched.has(session.id);
  const isToday = getSessionTiming(session.date, today) === 'today';
  const range = formatEpisodeRange(session.episodes);
  const titles = session.episodes
    .flatMap((episode) => (episode.title ? [escapeHtml(episode.title)] : []))
    .join(' · ');
  const label = `Marcar ${range} de ${getItemDisplayTitle(item)} como vistos`;

  return `
    <li>
      <button
        type="button"
        ${toggleSessionAttributes(session.id, `timeline:${session.id}`)}
        aria-pressed="${isWatched}"
        aria-label="${escapeHtml(label)}"
        class="flex w-full cursor-pointer items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-raised/60 ${isToday ? 'bg-series/10' : ''} ${FOCUS_RING}"
      >
        <span class="mt-0.5 ${isWatched ? 'text-progress' : 'text-ink-subtle'}">
          ${isWatched ? icons.checkCircle('size-5') : icons.circle('size-5')}
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm ${isWatched ? 'text-ink-muted' : ''}">
            <span class="font-medium">${range}</span>
            <span class="text-ink-subtle">· ${formatSessionDate(session.date)}</span>
          </span>
          ${titles ? `<span class="block truncate text-xs text-ink-subtle">${titles}</span>` : ''}
        </span>
        <span class="shrink-0 pt-0.5">
          ${isWatched ? '<span class="text-xs text-progress">Visto</span>' : renderTimingLabel(session.date, false, today)}
        </span>
      </button>
    </li>
  `;
}

function renderSeriesCard(item: SeriesItem, context: TimelineContext): string {
  const watchedCount = item.sessions.filter((session) => context.watched.has(session.id)).length;
  const isComplete = watchedCount === item.sessions.length;
  const [first] = item.sessions;
  const last = item.sessions.at(-1);
  const dateRange = first && last ? formatDateRange(first.date, last.date) : '';

  const status = isComplete
    ? `<span class="flex items-center gap-1 text-xs text-progress">${icons.check('size-4')} Vista</span>`
    : `<span class="text-xs text-ink-muted tabular-nums">${watchedCount}/${item.sessions.length}</span>`;

  return `
    <article class="flex flex-col gap-3 rounded-xl border border-line bg-surface p-3 sm:p-4">
      <div class="flex gap-4">
        <div class="${isComplete ? 'opacity-50' : ''}">${renderPoster(item)}</div>
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <div class="flex items-start justify-between gap-3">
            <h4 class="font-semibold leading-snug ${isComplete ? 'text-ink-muted' : ''}">
              ${escapeHtml(getItemDisplayTitle(item))}
            </h4>
            <div class="shrink-0 pt-0.5">${status}</div>
          </div>
          ${renderMeta(item, dateRange)}
          <p class="line-clamp-2 text-sm text-ink-muted">${escapeHtml(item.relevance)}</p>
        </div>
      </div>
      <ol class="flex flex-col border-t border-line pt-2" aria-label="Sesiones de ${escapeHtml(getItemDisplayTitle(item))}">
        ${item.sessions.map((session) => renderEpisodeBlock(item, session, context)).join('')}
      </ol>
    </article>
  `;
}

function renderItem(item: RoadItem, context: TimelineContext): string {
  const card =
    item.kind === 'movie' ? renderMovieCard(item, context) : renderSeriesCard(item, context);
  return `<li>${card}</li>`;
}

function renderWeek(week: TimelineWeek, context: TimelineContext): string {
  const headingId = `week-${week.number}`;
  return `
    <li>
      <section aria-labelledby="${headingId}" class="flex flex-col gap-2">
        <h3 id="${headingId}" class="flex items-baseline gap-2 text-xs text-ink-subtle">
          <span class="font-medium uppercase tracking-wider text-ink-muted">Semana ${week.number}</span>
          <span>${formatDateRange(week.start, week.end)}</span>
        </h3>
        <ol class="flex flex-col gap-2">
          ${week.items.map((item) => renderItem(item, context)).join('')}
        </ol>
      </section>
    </li>
  `;
}

interface TimelineProps extends TimelineContext {
  readonly weeks: readonly TimelineWeek[];
}

export function renderTimeline({ weeks, ...context }: TimelineProps): string {
  return `
    <ol class="flex flex-col gap-6">
      ${weeks.map((week) => renderWeek(week, context)).join('')}
    </ol>
  `;
}
