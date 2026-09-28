import { ROAD_START_DATE } from '../data/constants';
import { ROAD } from '../data/road';
import { getNextSession, getProgressSummary } from '../domain/progress';
import { getScheduleReport } from '../domain/schedule';
import { groupItemsByWeek } from '../domain/timeline';
import type { IsoDate } from '../domain/types';
import { toWatchedIds, type ProgressStore, type StoreState } from '../state/store';
import { MOUNT_IDS, renderAppShell } from './app-shell';
import { renderNextSessionCard } from './components/next-session-card';
import { renderProgressPanel } from './components/progress-panel';
import { renderTimeline } from './components/timeline';

function getMountPoint(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`No se encontró el contenedor #${id}`);
  return element;
}

/** Dibuja la app y la vuelve a dibujar cada vez que cambia el estado. */
export function mountApp(root: HTMLElement, store: ProgressStore, getToday: () => IsoDate): void {
  root.innerHTML = renderAppShell();
  const progressSummary = getMountPoint(MOUNT_IDS.progressSummary);
  const nextSession = getMountPoint(MOUNT_IDS.nextSession);
  const timeline = getMountPoint(MOUNT_IDS.timeline);

  // Las semanas dependen solo de los datos estáticos: se calculan una vez.
  const weeks = groupItemsByWeek(ROAD, ROAD_START_DATE);

  function render(state: StoreState): void {
    const watched = toWatchedIds(state.progress);
    const today = getToday();

    progressSummary.innerHTML = renderProgressPanel({
      summary: getProgressSummary(ROAD, watched),
      schedule: getScheduleReport(ROAD, watched, today),
    });

    nextSession.innerHTML = renderNextSessionCard({
      entry: getNextSession(ROAD, watched),
      today,
    });

    timeline.innerHTML = renderTimeline({ weeks, watched, today });
  }

  render(store.getState());
  store.subscribe(render);
}
