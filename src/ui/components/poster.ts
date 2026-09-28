import type { RoadItem } from '../../domain/types';
import { icons } from '../icons';

/**
 * Portada generada: se usa mientras no exista el póster del título.
 * Muestra el tipo y el año con el color del tipo de contenido.
 */
export function renderPoster(item: RoadItem): string {
  const isMovie = item.kind === 'movie';
  const accent = isMovie ? 'text-movie border-movie/30' : 'text-series border-series/30';
  const icon = isMovie ? icons.movie('size-5') : icons.series('size-5');

  return `
    <div class="flex aspect-2/3 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border bg-canvas sm:w-20 ${accent}">
      ${icon}
      <span class="text-xs font-medium tabular-nums">${item.releaseDate.slice(0, 4)}</span>
    </div>
  `;
}
