import type { IsoDate } from '../domain/types';

export interface UserProgress {
  readonly watched: ReadonlyMap<string, IsoDate>;
  readonly skipped: ReadonlyMap<string, IsoDate>;
}

export const EMPTY_PROGRESS: UserProgress = { watched: new Map(), skipped: new Map() };
