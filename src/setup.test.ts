import { describe, expect, it } from 'vitest';

describe('entorno de pruebas', () => {
  it('usa la zona horaria de Ciudad de México', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/Mexico_City');
  });

  it('demuestra por qué no usaremos new Date("YYYY-MM-DD")', () => {
    const parsed = new Date('2026-09-28');

    // El string se interpreta como medianoche UTC:
    // en México todavía es el día anterior.
    expect(parsed.getDate()).toBe(27);
  });
});
