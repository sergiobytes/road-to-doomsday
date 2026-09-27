import { describe, expect, it } from 'vitest';
import { migrate, MIGRATIONS, type Migration } from './migrations';

const toVersion2: Migration = (data) => ({ ...data, version: 2, preferences: {} });
const toVersion3: Migration = (data) => ({ ...data, version: 3, theme: 'dark' });
const FAKE_MIGRATIONS = { 1: toVersion2, 2: toVersion3 };

describe('migrate', () => {
  it('no cambia nada si los datos ya están en la versión actual', () => {
    const data = { version: 3, watched: {} };

    expect(migrate(data, 3, FAKE_MIGRATIONS)).toEqual({ data, migrated: false });
  });

  it('aplica una migración', () => {
    expect(migrate({ version: 2, watched: {} }, 3, FAKE_MIGRATIONS)).toEqual({
      data: { version: 3, watched: {}, theme: 'dark' },
      migrated: true,
    });
  });

  it('encadena varias migraciones en orden', () => {
    expect(migrate({ version: 1, watched: { 'x-men': '2026-09-29' } }, 3, FAKE_MIGRATIONS)).toEqual(
      {
        data: {
          version: 3,
          watched: { 'x-men': '2026-09-29' },
          preferences: {},
          theme: 'dark',
        },
        migrated: true,
      },
    );
  });

  it('falla si falta un paso de migración', () => {
    expect(migrate({ version: 1 }, 3, { 2: toVersion3 })).toBeNull();
  });

  it('falla si una migración no produce la versión siguiente', () => {
    const brokenMigration: Migration = (data) => ({ ...data, version: 1 });

    expect(migrate({ version: 1 }, 2, { 1: brokenMigration })).toBeNull();
  });

  it.each([
    ['una versión futura', 4],
    ['versión 0', 0],
    ['versión decimal', 1.5],
    ['versión como texto', '1'],
    ['sin versión', undefined],
  ])('rechaza %s', (_, version) => {
    expect(migrate({ version }, 3, FAKE_MIGRATIONS)).toBeNull();
  });

  it('con las migraciones reales, la versión 1 no necesita migrar', () => {
    expect(migrate({ version: 1, watched: {} }, 1, MIGRATIONS)?.migrated).toBe(false);
  });
});
