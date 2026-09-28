const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;

export interface Countdown {
  readonly isOver: boolean;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
}

export function getCountdown(targetMs: number, nowMs: number): Countdown {
  const remainingSeconds = Math.max(0, Math.floor((targetMs - nowMs) / MS_PER_SECOND));

  return {
    isOver: remainingSeconds === 0,
    days: Math.floor(remainingSeconds / SECONDS_PER_DAY),
    hours: Math.floor((remainingSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR),
    minutes: Math.floor((remainingSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE),
    seconds: remainingSeconds % SECONDS_PER_MINUTE,
  };
}

export function parseInstant(value: string): number {
  const ms = Date.parse(value);
  if (Number.isNaN(ms)) throw new Error(`Instante inválido: "${value}"`);
  return ms;
}
