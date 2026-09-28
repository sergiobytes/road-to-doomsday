import { ROAD } from '../data/road';
import { getProgressSummary } from '../domain/progress';
import { getScheduleReport } from '../domain/schedule';
import type { IsoDate } from '../domain/types';
import { toWatchedIds, type ProgressStore, type StoreState } from '../state/store';
import { MOUNT_IDS, renderAppShell } from './app-shell';
import { renderProgressPanel } from './components/progress-panel';

function getMountPoint(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`No se encontró el contenedor #${id}`);
  return element;
}

/** Dibuja la app y la vuelve a dibujar cada vez que cambia el estado. */
export function mountApp(root: HTMLElement, store: ProgressStore, getToday: () => IsoDate): void {
  root.innerHTML = renderAppShell();
  const progressSummary = getMountPoint(MOUNT_IDS.progressSummary);

  function render(state: StoreState): void {
    const watched = toWatchedIds(state.progress);

    progressSummary.innerHTML = renderProgressPanel({
      summary: getProgressSummary(ROAD, watched),
      schedule: getScheduleReport(ROAD, watched, getToday()),
    });
  }

  render(store.getState());
  store.subscribe(render);
}
