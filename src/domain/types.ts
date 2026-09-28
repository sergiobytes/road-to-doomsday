export type IsoDate = string;

export type ContentKind = 'movie' | 'series';

export type ContentTier = 'essential' | 'recommended' | 'extra';

/** Dónde ver un título en México: servicios de suscripción o, si aún no llega a streaming, el cine. */
export type Platform = 'disney-plus' | 'netflix' | 'prime-video' | 'hbo-max' | 'vix' | 'cinema';

export interface Episode {
  readonly number: number;
  readonly title?: string;
}

export interface Session {
  readonly id: string;
  readonly date: IsoDate;
  readonly minutes: number;
}

export interface SeriesSession extends Session {
  readonly episodes: readonly Episode[];
}

interface BaseRoadItem {
  readonly id: string;
  readonly title: string;
  readonly releaseDate: IsoDate;
  readonly tier: ContentTier;
  readonly relevance: string;
  /** Vacío si en este momento solo se puede rentar, comprar o no está disponible. */
  readonly platforms: readonly Platform[];
}

export interface MovieItem extends BaseRoadItem {
  readonly kind: 'movie';
  readonly isSpecial?: boolean;
  readonly session: Session;
}

export interface SeriesItem extends BaseRoadItem {
  readonly kind: 'series';
  readonly season: number;
  /**
   * Se ve conforme salen los episodios: sus sesiones siguen las fechas de estreno
   * y no el orden del Road ni el límite diario.
   */
  readonly watchOnRelease?: boolean;
  readonly sessions: readonly SeriesSession[];
}

export type RoadItem = MovieItem | SeriesItem;

export type SessionEntry =
  | { readonly kind: 'movie'; readonly item: MovieItem; readonly session: Session }
  | { readonly kind: 'series'; readonly item: SeriesItem; readonly session: SeriesSession };

export type WatchedSessionIds = ReadonlySet<string>;

export type SkippedSessionIds = ReadonlySet<string>;

export const NO_SESSIONS: ReadonlySet<string> = new Set();
