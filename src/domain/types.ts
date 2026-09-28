export type IsoDate = string;

export type ContentKind = 'movie' | 'series';

export type ContentTier = 'essential' | 'recommended' | 'extra';

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
}

export interface MovieItem extends BaseRoadItem {
  readonly kind: 'movie';
  readonly session: Session;
}

export interface SeriesItem extends BaseRoadItem {
  readonly kind: 'series';
  readonly season: number;
  readonly sessions: readonly SeriesSession[];
}

export type RoadItem = MovieItem | SeriesItem;

export type SessionEntry =
  | { readonly kind: 'movie'; readonly item: MovieItem; readonly session: Session }
  | { readonly kind: 'series'; readonly item: SeriesItem; readonly session: SeriesSession };

export type WatchedSessionIds = ReadonlySet<string>;
