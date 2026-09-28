import { escapeHtml } from './format';

/** Acciones que la interfaz declara en el HTML con `data-action`. */
export const ACTIONS = {
  toggleSession: 'toggle-session',
  openResetDialog: 'open-reset-dialog',
} as const;

/** Estilo de foco visible compartido por todos los controles. */
export const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-progress';

/**
 * Atributos de un botón que marca o desmarca una sesión.
 * `focusKey` identifica el botón para devolverle el foco después de redibujar.
 */
export function toggleSessionAttributes(sessionId: string, focusKey: string): string {
  return [
    `data-action="${ACTIONS.toggleSession}"`,
    `data-session-id="${escapeHtml(sessionId)}"`,
    `data-focus-key="${escapeHtml(focusKey)}"`,
  ].join(' ');
}
