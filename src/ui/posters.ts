import { TMDB_POSTERS, type TmdbPoster } from '../data/posters';

const POSTER_FILE_PATTERN = /([^/]+)\.(jpe?g|png|webp)$/i;

/** Ancho de 185 px: cubre el póster de 80 px en pantallas de alta densidad. */
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w185';

export function buildPosterIndex(modules: Record<string, string>): ReadonlyMap<string, string> {
  const index = new Map<string, string>();

  for (const [path, url] of Object.entries(modules)) {
    const id = POSTER_FILE_PATTERN.exec(path)?.[1];
    if (id) index.set(id, url);
  }

  return index;
}

/** Un póster local tiene prioridad sobre el de TMDB. */
export function resolvePosterUrl(
  itemId: string,
  local: ReadonlyMap<string, string>,
  remote: Readonly<Record<string, TmdbPoster>>,
): string | undefined {
  const path = remote[itemId]?.path;
  return local.get(itemId) ?? (path ? `${TMDB_IMAGE_BASE}${path}` : undefined);
}

const posterModules = import.meta.glob<string>('../assets/posters/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const LOCAL_POSTERS = buildPosterIndex(posterModules);

export function getPosterUrl(itemId: string): string | undefined {
  return resolvePosterUrl(itemId, LOCAL_POSTERS, TMDB_POSTERS);
}
