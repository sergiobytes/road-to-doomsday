import type { IsoDate } from './types';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

interface DateParts {
  year: number;
  month: number;
  day: number;
}

function parseDateParts(value: string): DateParts | null {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  if (year === undefined || month === undefined || day === undefined) return null;

  const date = new Date(year, month - 1, day);
  const isRealDate =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;

  return isRealDate ? { year, month, day } : null;
}

export function isIsoDate(value: unknown): value is IsoDate {
  return typeof value === 'string' && parseDateParts(value) !== null;
}

export function parseIsoDate(value: IsoDate): Date {
  const parts = parseDateParts(value);
  if (!parts) {
    throw new Error(`Fecha inválida: "${value}". Se esperaba YYYY-MM-DD.`);
  }
  return new Date(parts.year, parts.month - 1, parts.day);
}

export function toIsoDate(date: Date): IsoDate {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function compareIsoDates(a: IsoDate, b: IsoDate): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((parseIsoDate(to).getTime() - parseIsoDate(from).getTime()) / MS_PER_DAY);
}
