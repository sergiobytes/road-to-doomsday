import type { Platform } from '../../domain/types';

export const PLATFORM_LABELS: Record<Platform, string> = {
  'disney-plus': 'Disney+',
  netflix: 'Netflix',
  'prime-video': 'Prime Video',
  'hbo-max': 'HBO Max',
  vix: 'ViX',
  cinema: 'En cines',
};

const PLATFORM_STYLES: Record<Platform, string> = {
  'disney-plus': 'border-platform-disney/40 text-platform-disney',
  netflix: 'border-platform-netflix/40 text-platform-netflix',
  'prime-video': 'border-platform-prime/40 text-platform-prime',
  'hbo-max': 'border-platform-hbo/40 text-platform-hbo',
  vix: 'border-platform-vix/40 text-platform-vix',
  cinema: 'border-movie/40 text-movie',
};

const BADGE = 'rounded-full border px-2 py-0.5 text-[11px]';

/** Etiquetas con las plataformas donde se puede ver un título. */
export function renderPlatformBadges(platforms: readonly Platform[]): string {
  if (platforms.length === 0) {
    return `<span class="${BADGE} border-dashed border-line-strong text-ink-subtle">Sin streaming</span>`;
  }

  const badges = platforms
    .map(
      (platform) =>
        `<li class="${BADGE} ${PLATFORM_STYLES[platform]}">${PLATFORM_LABELS[platform]}</li>`,
    )
    .join('');

  return `<ul class="contents" aria-label="Disponible en">${badges}</ul>`;
}
