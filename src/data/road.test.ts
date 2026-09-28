import { describe, expect, it } from 'vitest';
import { parseInstant } from '../domain/countdown';
import { compareIsoDates, isIsoDate } from '../domain/dates';
import { getAllSessions, getItemSessions } from '../domain/road';
import {
  DAILY_MINUTES_LIMIT,
  MAX_MOVIES_PER_DAY,
  PREMIERE_SHOWTIME,
  ROAD_DEADLINE,
  ROAD_START_DATE,
} from './constants';
import { TMDB_POSTERS } from './posters';
import { ROAD } from './road';
import { groupItemsByWeek } from '../domain/timeline';

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const sessions = getAllSessions(ROAD);

/** Títulos que se ven conforme se estrenan, fuera del orden y del límite diario del Road. */
const onRelease = ROAD.filter((item) => item.kind === 'series' && item.watchOnRelease);
const roadSessions = getAllSessions(ROAD.filter((item) => !onRelease.includes(item)));

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
  it('contiene 87 títulos y 128 sesiones', () => {
    expect(ROAD).toHaveLength(87);
    expect(sessions).toHaveLength(128);
  });

  it('la lista oficial de Marvel son los 16 títulos esenciales', () => {
    expect(ROAD.filter((item) => item.tier === 'essential')).toHaveLength(16);
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

  it('la primera sesión es el día de inicio del Road', () => {
    expect(sessions[0]?.date).toBe(ROAD_START_DATE);
  });

  it('todas las sesiones caen entre el inicio del Road y el día de la función', () => {
    const outOfRange = sessions.filter(
      (session) =>
        compareIsoDates(session.date, ROAD_START_DATE) < 0 ||
        compareIsoDates(session.date, ROAD_DEADLINE) >= 0,
    );

    expect(outOfRange).toEqual([]);
  });

  it('toda sesión dura un número entero y positivo de minutos', () => {
    const invalid = sessions.filter(
      (session) => !Number.isInteger(session.minutes) || session.minutes <= 0,
    );

    expect(invalid).toEqual([]);
  });

  it(`ningún día supera ${DAILY_MINUTES_LIMIT} minutos`, () => {
    const minutesByDay = new Map<string, number>();
    for (const session of roadSessions) {
      minutesByDay.set(session.date, (minutesByDay.get(session.date) ?? 0) + session.minutes);
    }

    const overLimit = [...minutesByDay].filter(([, minutes]) => minutes > DAILY_MINUTES_LIMIT);

    expect(overLimit).toEqual([]);
  });

  it(`ningún día tiene más de ${MAX_MOVIES_PER_DAY} películas`, () => {
    const moviesByDay = new Map<string, number>();
    for (const item of ROAD) {
      if (item.kind !== 'movie') continue;
      const { date } = item.session;
      moviesByDay.set(date, (moviesByDay.get(date) ?? 0) + 1);
    }

    const tooMany = [...moviesByDay].filter(([, count]) => count > MAX_MOVIES_PER_DAY);

    expect(tooMany).toEqual([]);
  });

  it('el orden de visionado coincide con el orden de estreno', () => {
    expect(findOutOfOrder(roadSessions)).toEqual([]);
  });

  it('lo que se ve al estrenarse nunca se programa antes de su estreno', () => {
    const early = onRelease.flatMap((item) =>
      getItemSessions(item).filter(
        (session) => compareIsoDates(session.date, item.releaseDate) < 0,
      ),
    );

    expect(early).toEqual([]);
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

  it('ninguna sesión de serie está vacía', () => {
    const emptySessions = seriesItems.flatMap((item) =>
      item.sessions.filter((session) => session.episodes.length === 0),
    );

    expect(emptySessions).toEqual([]);
  });
});

describe('semanas del timeline', () => {
  it('el Road ocupa 12 semanas seguidas, todas con contenido', () => {
    const weeks = groupItemsByWeek(ROAD, ROAD_START_DATE);

    expect(weeks.map((week) => week.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
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

describe('plataformas', () => {
  it('ningún título repite plataforma', () => {
    const repeated = ROAD.filter((item) => findDuplicates(item.platforms).length > 0);

    expect(repeated.map((item) => item.id)).toEqual([]);
  });

  it('solo los estrenos que aún no llegan a streaming están en cines', () => {
    const inCinemas = ROAD.filter((item) => item.platforms.includes('cinema'));

    expect(inCinemas.filter((item) => item.platforms.length > 1)).toEqual([]);
  });
});

describe('pósters de TMDB', () => {
  const ids = ROAD.map((item) => item.id);

  it('todos los títulos tienen póster', () => {
    expect(ids.filter((id) => !TMDB_POSTERS[id])).toEqual([]);
  });

  it('no hay pósters de títulos que no existen', () => {
    expect(Object.keys(TMDB_POSTERS).filter((id) => !ids.includes(id))).toEqual([]);
  });

  it('las rutas son archivos de imagen en la raíz del CDN', () => {
    const invalid = Object.entries(TMDB_POSTERS).filter(
      ([, poster]) => !/^\/[A-Za-z0-9]+\.(jpg|png)$/.test(poster.path),
    );

    expect(invalid).toEqual([]);
  });
});

describe('función de estreno', () => {
  it('es un instante válido con zona horaria explícita', () => {
    expect(PREMIERE_SHOWTIME).toMatch(/(Z|[+-]\d{2}:\d{2})$/);
    expect(() => parseInstant(PREMIERE_SHOWTIME)).not.toThrow();
  });

  it('ocurre después de la última sesión posible', () => {
    const lastSessionEnd = parseInstant(`${ROAD_DEADLINE}T00:00:00-06:00`);

    expect(parseInstant(PREMIERE_SHOWTIME)).toBeGreaterThanOrEqual(lastSessionEnd);
  });
});
