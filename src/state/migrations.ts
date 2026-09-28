export type PersistedData = Readonly<Record<string, unknown>>;

export type Migration = (data: PersistedData) => PersistedData;

export const MIGRATIONS: Readonly<Partial<Record<number, Migration>>> = {
  1: (data) => ({ ...data, version: 2, skipped: {} }),
};

export interface MigrationResult {
  readonly data: PersistedData;
  /** `true` si se aplicó al menos una migración. */
  readonly migrated: boolean;
}

function isKnownVersion(version: unknown, targetVersion: number): version is number {
  return (
    typeof version === 'number' &&
    Number.isInteger(version) &&
    version >= 1 &&
    version <= targetVersion
  );
}

export function migrate(
  data: PersistedData,
  targetVersion: number,
  migrations: Readonly<Partial<Record<number, Migration>>> = MIGRATIONS,
): MigrationResult | null {
  const startVersion = data.version;
  if (!isKnownVersion(startVersion, targetVersion)) return null;

  let current = data;
  for (let version = startVersion; version < targetVersion; version++) {
    const step = migrations[version];
    if (!step) return null;

    current = step(current);
    if (current.version !== version + 1) return null;
  }

  return { data: current, migrated: startVersion !== targetVersion };
}
