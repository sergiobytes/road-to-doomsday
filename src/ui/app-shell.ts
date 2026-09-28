export const MOUNT_IDS = {
  progressSummary: 'progress-summary',
  nextSession: 'next-session',
  timeline: 'timeline',
} as const;

function placeholder(label: string): string {
  return `
    <div class="rounded-xl border border-dashed border-line-strong p-6 text-sm text-ink-subtle">
      ${label}
    </div>
  `;
}

export function renderAppShell(): string {
  return `
    <div class="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 sm:px-6 lg:px-8">
      <header class="flex items-center justify-between gap-4 border-b border-line py-4">
        <h1 class="text-lg font-semibold tracking-tight sm:text-xl">
          Road to <span class="text-progress">Avengers: Doomsday</span>
        </h1>
      </header>

      <main class="grid flex-1 content-start gap-6 py-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-8">
        <section
          aria-labelledby="progress-heading"
          class="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start"
        >
          <h2 id="progress-heading" class="sr-only">Tu progreso</h2>
          <div id="${MOUNT_IDS.progressSummary}"></div>
          <div id="${MOUNT_IDS.nextSession}"></div>
          ${placeholder('Siguiente sesión')}
        </section>

        <section aria-labelledby="timeline-heading" class="flex flex-col gap-4">
          <h2 id="timeline-heading" class="text-sm font-medium text-ink-muted">Calendario</h2>
          <div id="${MOUNT_IDS.timeline}" class="flex flex-col gap-3">
            ${placeholder('Semana 1')}
            ${placeholder('Semana 2')}
            ${placeholder('Semana 3')}
          </div>
        </section>
      </main>

      <footer class="border-t border-line py-4 text-xs text-ink-subtle">
        Proyecto personal sin afiliación con Marvel Studios ni Disney.
      </footer>
    </div>
  `;
}
