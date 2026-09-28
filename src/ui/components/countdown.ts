import type { Countdown } from '../../domain/countdown';

const SHOWTIME_DAY_FORMAT = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const SHOWTIME_HOUR_FORMAT = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function formatShowtime(showtimeMs: number): string {
  const showtime = new Date(showtimeMs);
  const isMidnight = showtime.getHours() === 0 && showtime.getMinutes() === 0;

  if (isMidnight) {
    const previousDay = new Date(showtimeMs - 1);
    return `${SHOWTIME_DAY_FORMAT.format(previousDay)} a la medianoche`;
  }

  return `${SHOWTIME_DAY_FORMAT.format(showtime)}, ${SHOWTIME_HOUR_FORMAT.format(showtime)}`;
}

export function padTwoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

export function getCountdownLabel({ days, hours, minutes }: Countdown): string {
  const dayLabel = days === 1 ? 'día' : 'días';
  return `Faltan ${days} ${dayLabel}, ${hours} horas y ${minutes} minutos para la función`;
}

function renderUnit(value: string, label: string): string {
  return `
    <div class="rounded-lg bg-canvas px-1 py-2">
      <span class="block text-2xl font-semibold tabular-nums">${value}</span>
      <span class="block text-[11px] text-ink-subtle">${label}</span>
    </div>
  `;
}

function renderShowtimeStarted(): string {
  return `
    <div class="rounded-2xl border border-progress/40 bg-surface p-5">
      <p class="text-sm font-medium text-progress">Es hora de la función</p>
      <p class="mt-1 text-sm text-ink-muted">Disfruta Avengers: Doomsday.</p>
    </div>
  `;
}

export function renderCountdown(countdown: Countdown, showtimeMs: number): string {
  if (countdown.isOver) return renderShowtimeStarted();

  return `
    <div class="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <h3 class="text-xs font-medium uppercase tracking-wider text-ink-subtle">Faltan para la función</h3>
      <div role="timer" aria-label="${getCountdownLabel(countdown)}" class="grid grid-cols-4 gap-2 text-center">
        ${renderUnit(String(countdown.days), countdown.days === 1 ? 'día' : 'días')}
        ${renderUnit(padTwoDigits(countdown.hours), 'horas')}
        ${renderUnit(padTwoDigits(countdown.minutes), 'min')}
        ${renderUnit(padTwoDigits(countdown.seconds), 'seg')}
      </div>
      <p class="text-xs text-ink-subtle">Función: ${formatShowtime(showtimeMs)}</p>
    </div>
  `;
}
