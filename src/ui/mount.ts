import { PREMIERE_SHOWTIME, ROAD_START_DATE } from '../data/constants';
import { ROAD } from '../data/road';
import { getCountdown, parseInstant } from '../domain/countdown';
import { getNextSession, getProgressSummary } from '../domain/progress';
import { getScheduleReport } from '../domain/schedule';
import { getWeekProgress, groupItemsByWeek } from '../domain/timeline';
import type { IsoDate } from '../domain/types';
import { toSkippedIds, toWatchedIds, type ProgressStore, type StoreState } from '../state/store';
import { ACTIONS } from './actions';
import { MOUNT_IDS, renderAppShell, RESET_CONFIRM_VALUE } from './app-shell';
import { renderCountdown } from './components/countdown';
import { renderNextSessionCard } from './components/next-session-card';
import { renderProgressPanel } from './components/progress-panel';
import { renderTimeline } from './components/timeline';
import { pluralize } from './format';
import { getStorageNotice, renderStorageNotice } from './components/storage-notice';

function getMountPoint(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) throw new Error(`No se encontró el contenedor #${id}`);
  return element;
}

function getDialog(id: string): HTMLDialogElement {
  const element = getMountPoint(id);
  if (!(element instanceof HTMLDialogElement)) throw new Error(`#${id} no es un <dialog>`);
  return element;
}

/** Clave del control que tiene el foco, para recuperarlo después de redibujar. */
function getFocusedKey(): string | undefined {
  const active = document.activeElement;
  return active instanceof HTMLElement ? active.dataset.focusKey : undefined;
}

function restoreFocus(root: HTMLElement, focusKey: string | undefined): void {
  if (!focusKey) return;
  root.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(focusKey)}"]`)?.focus();
}

export interface AppClock {
  getToday(): IsoDate;
  getNow(): number;
}

const COUNTDOWN_TICK_MS = 1000;

/** Dibuja la app y la vuelve a dibujar cada vez que cambia el estado. */
export function mountApp(root: HTMLElement, store: ProgressStore, clock: AppClock): void {
  root.innerHTML = renderAppShell();
  const notices = getMountPoint(MOUNT_IDS.notices);
  const announcer = getMountPoint(MOUNT_IDS.announcer);
  const progressSummary = getMountPoint(MOUNT_IDS.progressSummary);
  const nextSession = getMountPoint(MOUNT_IDS.nextSession);
  const timeline = getMountPoint(MOUNT_IDS.timeline);
  const countdown = getMountPoint(MOUNT_IDS.countdown);
  const resetDialog = getDialog(MOUNT_IDS.resetDialog);
  const resetDialogCount = getMountPoint(MOUNT_IDS.resetDialogCount);

  // Las semanas dependen solo de los datos estáticos: se calculan una vez.
  const weeks = groupItemsByWeek(ROAD, ROAD_START_DATE);

  let openWeeks: Set<number> | null = null;

  function getInitialOpenWeeks(state: StoreState): Set<number> {
    const watched = toWatchedIds(state.progress);
    const skipped = toSkippedIds(state.progress);
    return new Set(
      weeks
        .filter((week) => !getWeekProgress(week, watched, skipped).isResolved)
        .map((week) => week.number),
    );
  }

  function render(state: StoreState): void {
    const focusKey = getFocusedKey();
    const watched = toWatchedIds(state.progress);
    const skipped = toSkippedIds(state.progress);
    const today = clock.getToday();

    notices.innerHTML = renderStorageNotice(getStorageNotice(state));

    progressSummary.innerHTML = renderProgressPanel({
      summary: getProgressSummary(ROAD, watched, skipped),
      schedule: getScheduleReport(ROAD, watched, today, skipped),
    });

    nextSession.innerHTML = renderNextSessionCard({
      entry: getNextSession(ROAD, watched, skipped),
      today,
    });

    openWeeks ??= getInitialOpenWeeks(state);
    timeline.innerHTML = renderTimeline({ weeks, watched, skipped, today, openWeeks });

    restoreFocus(root, focusKey);
  }

  /** Marca o desmarca y lo anuncia a los lectores de pantalla, con el progreso nuevo. */
  function toggleSession(sessionId: string): void {
    store.toggleWatched(sessionId);

    const { progress } = store.getState();
    const { percent } = getProgressSummary(ROAD, toWatchedIds(progress));
    const action = progress.watched.has(sessionId) ? 'Marcada como vista' : 'Desmarcada';
    announcer.textContent = `${action}. Progreso: ${percent} %.`;
  }

  function toggleSkip(sessionId: string): void {
    store.toggleSkipped(sessionId);

    const isSkipped = store.getState().progress.skipped.has(sessionId);
    announcer.textContent = isSkipped ? 'Sesión omitida.' : 'Omisión deshecha.';
  }

  function openResetDialog(): void {
    const { watched, skipped } = store.getState().progress;
    const watchedText = pluralize(watched.size, 'sesión vista', 'sesiones vistas');
    resetDialogCount.textContent =
      skipped.size > 0
        ? `${watchedText} y ${pluralize(skipped.size, 'omitida', 'omitidas')}`
        : watchedText;
    resetDialog.showModal();
  }

  // Un solo listener para todos los botones, incluidos los que se crean al redibujar.
  root.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;

    const trigger = event.target.closest<HTMLElement>('[data-action]');
    switch (trigger?.dataset.action) {
      case ACTIONS.toggleSession: {
        const sessionId = trigger.dataset.sessionId;
        if (sessionId) toggleSession(sessionId);
        break;
      }
      case ACTIONS.toggleSkip: {
        const sessionId = trigger.dataset.sessionId;
        if (sessionId) toggleSkip(sessionId);
        break;
      }
      case ACTIONS.openResetDialog:
        openResetDialog();
        break;
    }
  });

  // El diálogo se cierra con Cancelar, Esc o Reiniciar; solo el último borra el progreso.
  resetDialog.addEventListener('close', () => {
    if (resetDialog.returnValue === RESET_CONFIRM_VALUE) {
      openWeeks = null;
      store.reset();
      announcer.textContent = 'Progreso reiniciado.';
    }
    resetDialog.returnValue = '';
  });

  const showtimeMs = parseInstant(PREMIERE_SHOWTIME);

  function renderCountdownNow(): boolean {
    const remaining = getCountdown(showtimeMs, clock.getNow());
    countdown.innerHTML = renderCountdown(remaining, showtimeMs);
    return remaining.isOver;
  }

  if (!renderCountdownNow()) {
    const timerId = window.setInterval(() => {
      if (renderCountdownNow()) window.clearInterval(timerId);
    }, COUNTDOWN_TICK_MS);
  }

  root.addEventListener(
    'toggle',
    (event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || !details.dataset.week) return;

      const weekNumber = Number(details.dataset.week);
      if (details.open) openWeeks?.add(weekNumber);
      else openWeeks?.delete(weekNumber);
    },
    true,
  );

  render(store.getState());
  store.subscribe(render);
}
