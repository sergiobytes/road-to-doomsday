const POSTER_FILE_PATTERN = /([^/]+)\.(jpe?g|png|webp)$/i;

export function buildPosterIndex(modules: Record<string, string>): ReadonlyMap<string, string> {
  const index = new Map<string, string>();

  for (const [path, url] of Object.entries(modules)) {
    const id = POSTER_FILE_PATTERN.exec(path)?.[1];
    if (id) index.set(id, url);
  }

  return index;
}

const posterModules = import.meta.glob<string>('../assets/posters/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const POSTERS = buildPosterIndex(posterModules);

export function getPosterUrl(itemId: string): string | undefined {
  return POSTERS.get(itemId);
}
