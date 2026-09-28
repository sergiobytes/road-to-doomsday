import { describe, expect, it } from 'vitest';
import { renderPlatformBadges } from './platform-badges';

describe('renderPlatformBadges', () => {
  it('muestra una etiqueta por plataforma, en orden', () => {
    const html = renderPlatformBadges(['netflix', 'prime-video']);

    expect(html).toContain('aria-label="Disponible en"');
    expect(html.indexOf('Netflix')).toBeLessThan(html.indexOf('Prime Video'));
  });

  it('indica cuando un título aún está en cines', () => {
    expect(renderPlatformBadges(['cinema'])).toContain('En cines');
  });

  it('avisa cuando no hay streaming', () => {
    expect(renderPlatformBadges([])).toContain('Sin streaming');
  });
});
