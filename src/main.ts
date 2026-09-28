import './style.css';
import { isIsoDate, toIsoDate } from './domain/dates';
import type { IsoDate } from './domain/types';
import { createProgressStore } from './state/store';
import { mountApp } from './ui/mount';

/**
 * En desarrollo se puede simular la fecha con `?today=YYYY-MM-DD`
 * o el instante exacto con `?now=2026-12-16T23:59:50-06:00`.
 */
const devParams = import.meta.env.DEV ? new URLSearchParams(window.location.search) : null;

function getSimulatedOffsetMs(): number {
  const simulatedNow = Date.parse(devParams?.get('now') ?? '');
  return Number.isNaN(simulatedNow) ? 0 : simulatedNow - Date.now();
}

const simulatedOffsetMs = getSimulatedOffsetMs();

function getNow(): number {
  return Date.now() + simulatedOffsetMs;
}

function getToday(): IsoDate {
  const simulatedToday = devParams?.get('today');
  if (isIsoDate(simulatedToday)) return simulatedToday;
  return toIsoDate(new Date(getNow()));
}

/** Algunos navegadores lanzan un error con solo acceder a `localStorage` si está bloqueado. */
function getBrowserStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function unavailable(): never {
  throw new Error('Local Storage no está disponible');
}

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) {
  throw new Error('No se encontró el elemento #app en index.html');
}

const store = createProgressStore({
  storage: getBrowserStorage() ?? {
    getItem: unavailable,
    setItem: unavailable,
    removeItem: unavailable,
  },
  getToday,
});
mountApp(app, store, { getToday, getNow });
