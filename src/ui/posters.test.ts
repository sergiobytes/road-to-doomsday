import { describe, expect, it } from 'vitest';
import { buildPosterIndex } from './posters';

describe('buildPosterIndex', () => {
  it('usa el nombre del archivo como id del título', () => {
    const index = buildPosterIndex({
      '../assets/posters/x-men.jpg': '/assets/x-men-a1b2.jpg',
      '../assets/posters/loki-s1.webp': '/assets/loki-s1-c3d4.webp',
    });

    expect(index.get('x-men')).toBe('/assets/x-men-a1b2.jpg');
    expect(index.get('loki-s1')).toBe('/assets/loki-s1-c3d4.webp');
  });

  it('acepta jpg, jpeg, png y webp sin importar mayúsculas', () => {
    const index = buildPosterIndex({
      '../assets/posters/a.jpeg': 'a',
      '../assets/posters/b.PNG': 'b',
    });

    expect([...index.keys()]).toEqual(['a', 'b']);
  });

  it('ignora archivos con otras extensiones', () => {
    expect(buildPosterIndex({ '../assets/posters/notas.txt': 'x' }).size).toBe(0);
  });

  it('sin archivos, el índice está vacío', () => {
    expect(buildPosterIndex({}).size).toBe(0);
  });
});
