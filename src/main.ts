import './style.css';
import { isIsoDate, toIsoDate } from './domain/dates';
import type { IsoDate } from './domain/types';
import { createProgressStore } from './state/store';
import { mountApp } from './ui/mount';

/**
 * Día actual. En desarrollo se puede simular otro con `?today=YYYY-MM-DD`
 * para revisar la interfaz en cualquier punto del Road.
 */
function getToday(): IsoDate {
  if (import.meta.env.DEV) {
    const simulated = new URLSearchParams(window.location.search).get('today');
    if (isIsoDate(simulated)) return simulated;
  }
  return toIsoDate(new Date());
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
mountApp(app, store, getToday);
