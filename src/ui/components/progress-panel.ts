import type { ProgressSummary } from '../../domain/progress';
import type { ScheduleReport, ScheduleStatus } from '../../domain/schedule';
import { pluralize } from '../format';

const RING_RADIUS = 52;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Longitud del trazo que queda sin pintar para representar el porcentaje. */
export function getRingOffset(percent: number): number {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return RING_CIRCUMFERENCE * (1 - clamped / 100);
}

const STATUS_STYLES: Record<ScheduleStatus, { label: string; className: string }> = {
  'on-track': {
    label: 'Al día',
    className: 'border-status-on-track/30 bg-status-on-track/10 text-status-on-track',
  },
  ahead: {
    label: 'Adelantado',
    className: 'border-status-ahead/30 bg-status-ahead/10 text-status-ahead',
  },
  behind: {
    label: 'Atrasado',
    className: 'border-status-behind/30 bg-status-behind/10 text-status-behind',
  },
};

/** Texto del estado del calendario, con el detalle de cuántas sesiones. */
export function getStatusText({ status, overdueSessions, sessionsAhead }: ScheduleReport): string {
  const { label } = STATUS_STYLES[status];
  if (status === 'behind') return `${label} · ${pluralize(overdueSessions, 'sesión', 'sesiones')}`;
  if (status === 'ahead') return `${label} · ${pluralize(sessionsAhead, 'sesión', 'sesiones')}`;
  return label;
}

function renderRing(percent: number): string {
  return `
    <svg viewBox="0 0 120 120" class="size-40 -rotate-90" aria-hidden="true">
      <circle cx="60" cy="60" r="${RING_RADIUS}" fill="none" stroke-width="10"
        class="stroke-line" />
      <circle cx="60" cy="60" r="${RING_RADIUS}" fill="none" stroke-width="10"
        stroke-linecap="round" class="stroke-progress transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
        stroke-dasharray="${RING_CIRCUMFERENCE}" stroke-dashoffset="${getRingOffset(percent)}" />
    </svg>
  `;
}

function renderStat(label: string, value: string): string {
  return `
    <div class="rounded-lg bg-canvas px-3 py-2">
      <dt class="text-xs text-ink-muted">${label}</dt>
      <dd class="text-lg font-semibold tabular-nums">${value}</dd>
    </div>
  `;
}

interface ProgressPanelProps {
  readonly summary: ProgressSummary;
  readonly schedule: ScheduleReport;
}

export function renderProgressPanel({ summary, schedule }: ProgressPanelProps): string {
  const { percent, watchedSessions, totalSessions, pendingSessions } = summary;

  return `
    <div class="flex flex-col items-center gap-4 rounded-2xl border border-line bg-surface p-6">
      <div
        role="progressbar"
        aria-label="Progreso del Road"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${percent}"
        aria-valuetext="${percent} %, ${watchedSessions} de ${totalSessions} sesiones"
        class="relative grid place-items-center"
      >
        ${renderRing(percent)}
        <div class="absolute flex flex-col items-center">
          <span class="text-4xl font-semibold tabular-nums">${percent}%</span>
          <span class="text-xs text-ink-muted tabular-nums">${watchedSessions} de ${totalSessions}</span>
        </div>
      </div>

      <p class="rounded-full border px-3 py-1 text-sm font-medium ${STATUS_STYLES[schedule.status].className}">
        ${getStatusText(schedule)}
      </p>

      <dl class="grid w-full grid-cols-2 gap-2">
        ${renderStat('Pendientes', pluralize(pendingSessions, 'sesión', 'sesiones'))}
        ${renderStat('Títulos vistos', `${summary.completedItems}/${summary.totalItems}`)}
      </dl>
    </div>
  `;
}
