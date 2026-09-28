import { parseIsoDate } from '../../domain/dates';
import { getWeekProgress, type TimelineWeek } from '../../domain/timeline';
import type {
  ContentTier,
  IsoDate,
  MovieItem,
  RoadItem,
  SeriesItem,
  SeriesSession,
  SkippedSessionIds,
  WatchedSessionIds,
} from '../../domain/types';
import { FOCUS_RING, toggleSessionAttributes, toggleSkipAttributes } from '../actions';
import {
  escapeHtml,
  formatEpisodeRange,
  formatSessionDate,
  getItemDisplayTitle,
  getKindLabel,
  getSessionTiming,
} from '../format';
import { icons } from '../icons';
import { renderPoster } from './poster';

const WEEK_RANGE_FORMAT = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short' });

interface TimelineContext {
  readonly watched: WatchedSessionIds;
  readonly skipped: SkippedSessionIds;
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

function renderSessionLabel(
  date: IsoDate,
  { isWatched, isSkipped }: { isWatched: boolean; isSkipped: boolean },
  today: IsoDate,
): string {
  if (isWatched) return '';
  if (isSkipped) return '<span class="text-xs text-ink-subtle">Omitida</span>';

  const timing = getSessionTiming(date, today);
  if (timing === 'today') return '<span class="text-xs font-medium text-progress">Hoy</span>';
  if (timing === 'overdue') return '<span class="text-xs text-status-behind">Pendiente</span>';
  return '';
}

function renderMeta(item: RoadItem, detail: string, extra = ''): string {
  return `
    <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-subtle">
      <span>${getKindLabel(item)} · ${item.releaseDate.slice(0, 4)} · ${detail}</span>
      ${renderTierBadge(item)}
      ${extra}
    </p>
  `;
}

function renderSkipToggle(sessionId: string, isSkipped: boolean, label: string): string {
  const styles = isSkipped
    ? 'border-line-strong bg-surface-raised text-ink'
    : 'border-transparent text-ink-subtle hover:text-ink';

  return `
    <button
      type="button"
      ${toggleSkipAttributes(sessionId, `skip:${sessionId}`)}
      aria-pressed="${isSkipped}"
      aria-label="${escapeHtml(label)}"
      class="shrink-0 cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors ${styles} ${FOCUS_RING}"
    >
      ${isSkipped ? 'Omitida' : 'Omitir'}
    </button>
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

function renderMovieCard(item: MovieItem, { watched, skipped, today }: TimelineContext): string {
  const { id, date } = item.session;
  const isWatched = watched.has(id);
  const isSkipped = !isWatched && skipped.has(id);
  const isToday = getSessionTiming(date, today) === 'today';
  const isDimmed = isWatched || isSkipped;

  return `
    <article class="flex gap-4 rounded-xl border bg-surface p-3 sm:p-4 ${isToday ? 'border-progress/60' : 'border-line'}">
      <div class="${isDimmed ? 'opacity-75' : ''}">${renderPoster(item)}</div>
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
          <h4 class="font-semibold leading-snug ${isDimmed ? 'text-ink-muted' : ''} ${isSkipped ? 'line-through' : ''}">${escapeHtml(item.title)}</h4>
          <div class="flex shrink-0 items-center gap-1">
            ${isWatched ? '' : renderSkipToggle(id, isSkipped, `Omitir ${item.title}`)}
            ${renderMovieToggle(item, isWatched)}
          </div>
        </div>
        ${renderMeta(item, formatSessionDate(date), renderSessionLabel(date, { isWatched, isSkipped }, today))}
        <p class="line-clamp-2 text-sm text-ink-muted">${escapeHtml(item.relevance)}</p>
      </div>
    </article>
  `;
}

function renderEpisodeBlock(
  item: SeriesItem,
  session: SeriesSession,
  { watched, skipped, today }: TimelineContext,
): string {
  const isWatched = watched.has(session.id);
  const isSkipped = !isWatched && skipped.has(session.id);
  const isToday = getSessionTiming(session.date, today) === 'today';
  const range = formatEpisodeRange(session.episodes);
  const titles = session.episodes
    .flatMap((episode) => (episode.title ? [escapeHtml(episode.title)] : []))
    .join(' · ');
  const seriesTitle = getItemDisplayTitle(item);

  return `
    <li class="flex items-start gap-1 rounded-lg ${isToday ? 'bg-series/10' : ''}">
      <button
        type="button"
        ${toggleSessionAttributes(session.id, `timeline:${session.id}`)}
        aria-pressed="${isWatched}"
        aria-label="${escapeHtml(`Marcar ${range} de ${seriesTitle} como vistos`)}"
        class="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-raised/60 ${FOCUS_RING}"
      >
        <span class="mt-0.5 ${isWatched ? 'text-progress' : 'text-ink-subtle'}">
          ${isWatched ? icons.checkCircle('size-5') : icons.circle('size-5')}
        </span>
        <span class="min-w-0 flex-1">
          <span class="block text-sm ${isWatched || isSkipped ? 'text-ink-muted' : ''} ${isSkipped ? 'line-through' : ''}">
            <span class="font-medium">${range}</span>
            <span class="text-ink-subtle">· ${formatSessionDate(session.date)}</span>
          </span>
          ${titles ? `<span class="block truncate text-xs text-ink-subtle">${titles}</span>` : ''}
        </span>
        <span class="shrink-0 pt-0.5">
          ${isWatched ? '<span class="text-xs text-progress">Visto</span>' : renderSessionLabel(session.date, { isWatched, isSkipped }, today)}
        </span>
      </button>
      ${isWatched ? '' : `<div class="py-1.5 pr-1">${renderSkipToggle(session.id, isSkipped, `Omitir ${range} de ${seriesTitle}`)}</div>`}
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
        <div class="${isComplete ? 'opacity-75' : ''}">${renderPoster(item)}</div>
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

function renderWeek(week: TimelineWeek, context: TimelineContext, isOpen: boolean): string {
  const { total, resolved, isResolved } = getWeekProgress(week, context.watched, context.skipped);
  const status = isResolved
    ? `<span class="flex items-center gap-1 text-progress">${icons.check('size-4')} Completada</span>`
    : `<span class="tabular-nums">${resolved}/${total}</span>`;

  return `
    <li>
      <details data-week="${week.number}" class="group flex flex-col gap-2" ${isOpen ? 'open' : ''}>
        <summary class="flex cursor-pointer list-none items-center gap-2 rounded-lg py-1 text-xs text-ink-subtle [&::-webkit-details-marker]:hidden ${FOCUS_RING}">
          <span class="transition-transform group-open:rotate-90 motion-reduce:transition-none">${icons.chevron('size-4')}</span>
          <h3 class="flex flex-1 items-baseline gap-2">
            <span class="font-medium uppercase tracking-wider text-ink-muted">Semana ${week.number}</span>
            <span>${formatDateRange(week.start, week.end)}</span>
          </h3>
          ${status}
        </summary>
        <ol class="mt-2 flex flex-col gap-2">
          ${week.items.map((item) => renderItem(item, context)).join('')}
        </ol>
      </details>
    </li>
  `;
}

interface TimelineProps extends TimelineContext {
  readonly weeks: readonly TimelineWeek[];
  readonly openWeeks: ReadonlySet<number>;
}

export function renderTimeline({ weeks, openWeeks, ...context }: TimelineProps): string {
  return `
    <ol class="flex flex-col gap-4">
      ${weeks.map((week) => renderWeek(week, context, openWeeks.has(week.number))).join('')}
    </ol>
  `;
}
