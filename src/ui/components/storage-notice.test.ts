import { describe, expect, it } from 'vitest';
import type { LoadStatus } from '../../state/storage';
import type { StoreState } from '../../state/store';
import { EMPTY_PROGRESS } from '../../state/types';
import { getStorageNotice } from './storage-notice';

function state(loadStatus: LoadStatus, saveFailed = false): StoreState {
  return { progress: EMPTY_PROGRESS, loadStatus, saveFailed };
}

describe('getStorageNotice', () => {
  it.each(['empty', 'loaded', 'migrated'] as const)('no avisa si la carga fue %s', (status) => {
    expect(getStorageNotice(state(status))).toBeNull();
  });

  it('avisa si los datos guardados estaban dañados', () => {
    expect(getStorageNotice(state('invalid'))?.message).toContain('copia de respaldo');
  });

  it('marca como error que no se haya podido guardar', () => {
    expect(getStorageNotice(state('loaded', true))?.tone).toBe('error');
  });

  it('si el almacenamiento no está disponible, muestra solo ese aviso', () => {
    expect(getStorageNotice(state('unavailable', true))?.message).toContain('modo privado');
  });

  it('un error al guardar tiene prioridad sobre los datos dañados', () => {
    expect(getStorageNotice(state('invalid', true))?.tone).toBe('error');
  });
});
