import { parseIsoDate } from '../../domain/dates';
import type { TimelineWeek } from '../../domain/timeline';
import type {
  IsoDate,
  MovieItem,
  RoadItem,
  SeriesItem,
  SeriesSession,
  WatchedSessionIds,
} from '../../domain/types';
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

function formatWeekRange(week: TimelineWeek): string {
  return WEEK_RANGE_FORMAT.formatRange(parseIsoDate(week.start), parseIsoDate(week.end));
}

function renderTierBadge(item: RoadItem): string {
  if (item.tier === 'essential') return '';
  return `
    <span class="rounded-full border border-recommended/30 px-2 py-0.5 text-[11px] text-recommended">
      Recomendado
    </span>
  `;
}

function renderMeta(item: RoadItem, detail: string): string {
  const kind = item.kind === 'movie' ? 'Película' : 'Serie';
  return `
    <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-subtle">
      <span>${kind} · ${item.releaseDate.slice(0, 4)} · ${detail}</span>
      ${renderTierBadge(item)}
    </p>
  `;
}

function renderMovieStatus(item: MovieItem, { watched, today }: TimelineContext): string {
  if (watched.has(item.session.id)) {
    return `<span class="flex items-center gap-1 text-xs text-progress">${icons.check('size-4')} Vista</span>`;
  }

  const timing = getSessionTiming(item.session.date, today);
  if (timing === 'today') return '<span class="text-xs font-medium text-progress">Hoy</span>';
  if (timing === 'overdue') return '<span class="text-xs text-status-behind">Pendiente</span>';
  return '';
}

function renderMovieCard(item: MovieItem, context: TimelineContext): string {
  const isWatched = context.watched.has(item.session.id);
  const isToday = getSessionTiming(item.session.date, context.today) === 'today';

  return `
    <article class="flex gap-4 rounded-xl border bg-surface p-3 sm:p-4 ${isToday ? 'border-progress/60' : 'border-line'}">
      <div class="${isWatched ? 'opacity-50' : ''}">${renderPoster(item)}</div>
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <div class="flex items-start justify-between gap-3">
          <h4 class="font-semibold leading-snug ${isWatched ? 'text-ink-muted' : ''}">${escapeHtml(item.title)}</h4>
          <div class="shrink-0 pt-0.5">${renderMovieStatus(item, context)}</div>
        </div>
        ${renderMeta(item, formatSessionDate(item.session.date))}
        <p class="line-clamp-2 text-sm text-ink-muted">${escapeHtml(item.relevance)}</p>
      </div>
    </article>
  `;
}

function renderBlockStatus(session: SeriesSession, { watched, today }: TimelineContext): string {
  if (watched.has(session.id)) return '<span class="text-xs text-progress">Visto</span>';

  const timing = getSessionTiming(session.date, today);
  if (timing === 'today') return '<span class="text-xs font-medium text-progress">Hoy</span>';
  if (timing === 'overdue') return '<span class="text-xs text-status-behind">Pendiente</span>';
  return '';
}

function renderEpisodeBlock(session: SeriesSession, context: TimelineContext): string {
  const isWatched = context.watched.has(session.id);
  const isToday = getSessionTiming(session.date, context.today) === 'today';
  const titles = session.episodes.map((episode) => escapeHtml(episode.title)).join(' · ');

  return `
    <li class="flex items-start gap-3 rounded-lg px-2 py-2 ${isToday ? 'bg-series/10' : ''}">
      <span class="mt-0.5 ${isWatched ? 'text-progress' : 'text-ink-subtle'}">
        ${isWatched ? icons.checkCircle('size-5') : icons.circle('size-5')}
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-sm ${isWatched ? 'text-ink-muted' : ''}">
          <span class="font-medium">${formatEpisodeRange(session.episodes)}</span>
          <span class="text-ink-subtle">· ${formatSessionDate(session.date)}</span>
        </p>
        <p class="truncate text-xs text-ink-subtle">${titles}</p>
      </div>
      <div class="shrink-0 pt-0.5">${renderBlockStatus(session, context)}</div>
    </li>
  `;
}

function renderSeriesCard(item: SeriesItem, context: TimelineContext): string {
  const watchedCount = item.sessions.filter((session) => context.watched.has(session.id)).length;
  const isComplete = watchedCount === item.sessions.length;
  const [first] = item.sessions;
  const last = item.sessions.at(-1);
  const dateRange =
    first && last
      ? WEEK_RANGE_FORMAT.formatRange(parseIsoDate(first.date), parseIsoDate(last.date))
      : '';

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
        ${item.sessions.map((session) => renderEpisodeBlock(session, context)).join('')}
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
          <span>${formatWeekRange(week)}</span>
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
