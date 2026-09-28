import type { StoreState } from '../../state/store';

export interface StorageNotice {
  readonly tone: 'warning' | 'error';
  readonly message: string;
}

/**
 * Aviso sobre el almacenamiento, o `null` si todo está bien.
 * Si hay varios problemas, se muestra el más específico.
 */
export function getStorageNotice({ loadStatus, saveFailed }: StoreState): StorageNotice | null {
  if (loadStatus === 'unavailable') {
    return {
      tone: 'warning',
      message:
        'Tu navegador no permite guardar datos (quizá estás en modo privado). Puedes usar la app, pero tu progreso se perderá al cerrarla.',
    };
  }

  if (saveFailed) {
    return {
      tone: 'error',
      message: 'No se pudo guardar tu último cambio. Si cierras la página, se perderá.',
    };
  }

  if (loadStatus === 'invalid') {
    return {
      tone: 'warning',
      message:
        'Tu progreso guardado estaba dañado y empezaste de cero. Se guardó una copia de respaldo por si necesitas recuperarlo.',
    };
  }

  return null;
}

const TONE_STYLES: Record<StorageNotice['tone'], string> = {
  warning: 'border-status-behind/40 bg-status-behind/10 text-status-behind',
  error: 'border-danger/40 bg-danger/10 text-danger',
};

export function renderStorageNotice(notice: StorageNotice | null): string {
  if (!notice) return '';
  return `
    <p class="rounded-xl border px-4 py-3 text-sm ${TONE_STYLES[notice.tone]}">
      ${notice.message}
    </p>
  `;
}
