import type { RoadItem } from '../../domain/types';
import { escapeHtml } from '../format';
import { icons } from '../icons';
import { getPosterUrl } from '../posters';

const POSTER_FRAME = 'aspect-2/3 w-16 shrink-0 rounded-lg border sm:w-20';

function renderGeneratedCover(item: RoadItem): string {
  const isMovie = item.kind === 'movie';
  const accent = isMovie ? 'text-movie border-movie/30' : 'text-series border-series/30';
  const icon = isMovie ? icons.movie('size-5') : icons.series('size-5');

  return `
    <div class="${POSTER_FRAME} flex flex-col items-center justify-center gap-1 bg-canvas ${accent}">
      ${icon}
      <span class="text-xs font-medium tabular-nums">${item.releaseDate.slice(0, 4)}</span>
    </div>
  `;
}

export function renderPoster(item: RoadItem): string {
  const url = getPosterUrl(item.id);
  if (!url) return renderGeneratedCover(item);

  return `<img src="${escapeHtml(url)}" alt="" loading="lazy" decoding="async" class="${POSTER_FRAME} border-line bg-canvas object-cover" />`;
}
