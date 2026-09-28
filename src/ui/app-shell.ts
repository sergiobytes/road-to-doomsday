import { ACTIONS, FOCUS_RING } from './actions';

/** Ids de los contenedores donde se montará cada sección de la interfaz. */
export const MOUNT_IDS = {
  notices: 'notices',
  announcer: 'announcer',
  progressSummary: 'progress-summary',
  nextSession: 'next-session',
  timeline: 'timeline',
  resetDialog: 'reset-dialog',
  resetDialogCount: 'reset-dialog-count',
} as const;

/** Valor con el que el diálogo se cierra al confirmar el reinicio. */
export const RESET_CONFIRM_VALUE = 'confirm';

function renderResetDialog(): string {
  return `
    <dialog
      id="${MOUNT_IDS.resetDialog}"
      aria-labelledby="reset-dialog-title"
      class="m-auto w-[min(28rem,calc(100%-2rem))] rounded-2xl border border-line bg-surface p-6 text-ink backdrop:bg-black/70"
    >
      <form method="dialog" class="flex flex-col gap-4">
        <h2 id="reset-dialog-title" class="text-lg font-semibold">¿Reiniciar tu progreso?</h2>
        <p class="text-sm text-ink-muted">
          Se desmarcarán <span id="${MOUNT_IDS.resetDialogCount}" class="font-medium text-ink"></span>.
          Esta acción no se puede deshacer.
        </p>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            value="cancel"
            autofocus
            class="cursor-pointer rounded-lg border border-line-strong px-4 py-2 text-sm hover:bg-surface-raised ${FOCUS_RING}"
          >
            Cancelar
          </button>
          <button
            value="${RESET_CONFIRM_VALUE}"
            class="cursor-pointer rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90 ${FOCUS_RING}"
          >
            Reiniciar progreso
          </button>
        </div>
      </form>
    </dialog>
  `;
}

function placeholder(label: string): string {
  return `
    <div class="rounded-xl border border-dashed border-line-strong p-6 text-sm text-ink-subtle">
      ${label}
    </div>
  `;
}

/** Estructura fija de la página: cabecera, panel de progreso, timeline y pie. */
export function renderAppShell(): string {
  return `
    <a
      href="#calendar"
      class="sr-only rounded-lg bg-progress text-sm font-semibold text-canvas focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-10 focus:px-4 focus:py-2"
    >
      Saltar al calendario
    </a>
    <div class="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
      <header class="flex items-center justify-between gap-4 border-b border-line py-4">
        <h1 class="text-lg font-semibold tracking-tight sm:text-xl">
          Road to <span class="text-progress">Avengers: Doomsday</span>
        </h1>
        <button
          type="button"
          data-action="${ACTIONS.openResetDialog}"
          class="shrink-0 cursor-pointer rounded-lg px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface hover:text-ink ${FOCUS_RING}"
        >
          Reiniciar
        </button>
      </header>
 
      <div id="${MOUNT_IDS.notices}" aria-live="polite" class="empty:hidden pt-4"></div>
      <p id="${MOUNT_IDS.announcer}" aria-live="polite" class="sr-only"></p>
 
      <main class="grid flex-1 content-start gap-6 py-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-8">
        <section
          aria-labelledby="progress-heading"
          class="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start"
        >
          <h2 id="progress-heading" class="sr-only">Tu progreso</h2>
          <div id="${MOUNT_IDS.progressSummary}"></div>
          <div id="${MOUNT_IDS.nextSession}"></div>
          ${placeholder('Cuenta regresiva')}
        </section>
 
        <section
          id="calendar"
          tabindex="-1"
          aria-labelledby="timeline-heading"
          class="flex scroll-mt-4 flex-col gap-4 focus:outline-none"
        >
          <h2 id="timeline-heading" class="text-sm font-medium text-ink-muted">Calendario</h2>
          <div id="${MOUNT_IDS.timeline}"></div>
        </section>
      </main>
 
      <footer class="border-t border-line py-4 text-xs text-ink-subtle">
        Proyecto personal sin afiliación con Marvel Studios ni Disney.
      </footer>
    </div>
    ${renderResetDialog()}
  `;
}
