import { describe, expect, it } from 'vitest';
import { compareIsoDates, getWeekStart, isIsoDate } from '../domain/dates';
import { getAllSessions } from '../domain/road';
import { ROAD_DEADLINE, ROAD_START_DATE } from './constants';
import { ROAD } from './road';
import { groupItemsByWeek } from '../domain/timeline';

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const sessions = getAllSessions(ROAD);

function findDuplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates];
}

interface DatedEntry {
  readonly id: string;
  readonly date: string;
}

/** Ids de las entradas cuya fecha es anterior a la de la entrada previa. */
function findOutOfOrder(entries: readonly DatedEntry[]): string[] {
  return entries
    .filter((entry, index) => {
      const previous = entries[index - 1];
      return previous !== undefined && compareIsoDates(previous.date, entry.date) > 0;
    })
    .map((entry) => entry.id);
}

describe('contenido acordado', () => {
  it('contiene 21 títulos y 27 sesiones', () => {
    expect(ROAD).toHaveLength(21);
    expect(sessions).toHaveLength(27);
  });
});

describe('identificadores', () => {
  it('los títulos tienen ids únicos', () => {
    expect(findDuplicates(ROAD.map((item) => item.id))).toEqual([]);
  });

  it('las sesiones tienen ids únicos', () => {
    expect(findDuplicates(sessions.map((session) => session.id))).toEqual([]);
  });

  it('todos los ids usan minúsculas, números y guiones', () => {
    const ids = [...ROAD.map((item) => item.id), ...sessions.map((session) => session.id)];

    expect(ids.filter((id) => !ID_PATTERN.test(id))).toEqual([]);
  });
});

describe('fechas de estreno', () => {
  it('son fechas válidas', () => {
    expect(ROAD.filter((item) => !isIsoDate(item.releaseDate)).map((item) => item.id)).toEqual([]);
  });

  it('los títulos están en orden de estreno original', () => {
    const releases = ROAD.map((item) => ({ id: item.id, date: item.releaseDate }));

    expect(findOutOfOrder(releases)).toEqual([]);
  });
});

describe('calendario de sesiones', () => {
  it('todas las fechas son válidas', () => {
    expect(sessions.filter((session) => !isIsoDate(session.date))).toEqual([]);
  });

  it('todas las sesiones caen entre el inicio del Road y el día de la función', () => {
    const outOfRange = sessions.filter(
      (session) =>
        compareIsoDates(session.date, ROAD_START_DATE) < 0 ||
        compareIsoDates(session.date, ROAD_DEADLINE) >= 0,
    );

    expect(outOfRange).toEqual([]);
  });

  it('no hay dos sesiones el mismo día', () => {
    expect(findDuplicates(sessions.map((session) => session.date))).toEqual([]);
  });

  it('el orden de visionado coincide con el orden de estreno', () => {
    expect(findOutOfOrder(sessions)).toEqual([]);
  });
});

describe('series', () => {
  const seriesItems = ROAD.filter((item) => item.kind === 'series');

  it.each(seriesItems.map((item) => [item.id, item] as const))(
    '%s tiene episodios consecutivos desde el 1',
    (_, item) => {
      const numbers = item.sessions.flatMap((session) =>
        session.episodes.map((episode) => episode.number),
      );

      expect(numbers).toEqual(numbers.map((_, index) => index + 1));
    },
  );

  it('cada serie se ve dentro de una misma semana', () => {
    const splitSeries = seriesItems.filter(
      (item) => new Set(item.sessions.map((session) => getWeekStart(session.date))).size > 1,
    );

    expect(splitSeries).toEqual([]);
  });

  it('ninguna sesión de serie está vacía', () => {
    const emptySessions = seriesItems.flatMap((item) =>
      item.sessions.filter((session) => session.episodes.length === 0),
    );

    expect(emptySessions).toEqual([]);
  });
});

describe('semanas del timeline', () => {
  it('el Road ocupa 11 semanas seguidas, todas con contenido', () => {
    const weeks = groupItemsByWeek(ROAD, ROAD_START_DATE);

    expect(weeks.map((week) => week.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });
});

describe('textos', () => {
  it('todos los títulos tienen nombre y relevancia', () => {
    const incomplete = ROAD.filter(
      (item) => item.title.trim() === '' || item.relevance.trim() === '',
    );

    expect(incomplete).toEqual([]);
  });
});
