import type { Episode, IsoDate, MovieItem, RoadItem, SeriesItem } from '../domain/types';

type MovieInput = Omit<MovieItem, 'kind' | 'session'> & { date: IsoDate };

interface EpisodeBlock {
  readonly date: IsoDate;
  readonly episodes: readonly Episode[];
}

type SeriesInput = Omit<SeriesItem, 'kind' | 'sessions'> & {
  blocks: readonly EpisodeBlock[];
};

function movie({ date, ...item }: MovieInput): MovieItem {
  return { ...item, kind: 'movie', session: { id: item.id, date } };
}

function series({ blocks, ...item }: SeriesInput): SeriesItem {
  return {
    ...item,
    kind: 'series',
    sessions: blocks.map(({ date, episodes }) => {
      const first = episodes[0]?.number;
      const last = episodes.at(-1)?.number;
      return { id: `${item.id}-e${first}-${last}`, date, episodes };
    }),
  };
}

export const ROAD: readonly RoadItem[] = [
  movie({
    id: 'x-men',
    title: 'X-Men',
    releaseDate: '2000-07-14',
    tier: 'essential',
    relevance:
      'Presenta a Xavier, Magneto, Cíclope y Mística: el reparto original de Fox que regresa en Doomsday.',
    date: '2026-09-29',
  }),
  movie({
    id: 'x2',
    title: 'X2',
    releaseDate: '2003-05-02',
    tier: 'essential',
    relevance: 'Debut de Nightcrawler; Alan Cumming forma parte del reparto de Doomsday.',
    date: '2026-10-01',
  }),
  movie({
    id: 'x-men-the-last-stand',
    title: 'X-Men: The Last Stand',
    releaseDate: '2006-05-26',
    tier: 'recommended',
    relevance: 'Cierra la trilogía original y presenta a Kelsey Grammer como Beast.',
    date: '2026-10-03',
  }),
  movie({
    id: 'captain-america-the-first-avenger',
    title: 'Captain America: The First Avenger',
    releaseDate: '2011-07-22',
    tier: 'essential',
    relevance:
      'Origen de Steve Rogers y Peggy Carter; Chris Evans y Hayley Atwell forman parte del reparto.',
    date: '2026-10-06',
  }),
  movie({
    id: 'the-avengers',
    title: 'The Avengers',
    releaseDate: '2012-05-04',
    tier: 'essential',
    relevance:
      'Formación del equipo y primera gran historia de Thor y Loki como personajes centrales.',
    date: '2026-10-08',
  }),
  movie({
    id: 'x-men-days-of-future-past',
    title: 'X-Men: Days of Future Past',
    releaseDate: '2014-05-23',
    tier: 'recommended',
    relevance: 'Une ambos repartos de X-Men y reescribe el final de la trilogía original.',
    date: '2026-10-10',
  }),
  movie({
    id: 'captain-america-civil-war',
    title: 'Captain America: Civil War',
    releaseDate: '2016-05-06',
    tier: 'recommended',
    relevance: 'La fractura de los Avengers: contexto emocional de Steve, Bucky y Sam.',
    date: '2026-10-13',
  }),
  movie({
    id: 'avengers-infinity-war',
    title: 'Avengers: Infinity War',
    releaseDate: '2018-04-27',
    tier: 'essential',
    relevance: 'Mismos directores que Doomsday y la plantilla de un crossover masivo.',
    date: '2026-10-17',
  }),
  movie({
    id: 'avengers-endgame',
    title: 'Avengers: Endgame',
    releaseDate: '2019-04-26',
    tier: 'essential',
    relevance:
      'Cierre de Tony Stark y Steve Rogers; clave para entender a Downey regresando como Doom.',
    date: '2026-10-18',
  }),
  series({
    id: 'the-falcon-and-the-winter-soldier',
    title: 'The Falcon and the Winter Soldier',
    season: 1,
    releaseDate: '2021-03-19',
    tier: 'recommended',
    relevance:
      'Sam Wilson decide cargar con el escudo; también presenta a John Walker (U.S. Agent).',
    blocks: [
      {
        date: '2026-10-20',
        episodes: [
          { number: 1, title: 'New World Order' },
          { number: 2, title: 'The Star-Spangled Man' },
        ],
      },
      {
        date: '2026-10-22',
        episodes: [
          { number: 3, title: 'Power Broker' },
          { number: 4, title: 'The Whole World Is Watching' },
        ],
      },
      {
        date: '2026-10-24',
        episodes: [
          { number: 5, title: 'Truth' },
          { number: 6, title: 'One World, One People' },
        ],
      },
    ],
  }),
  series({
    id: 'loki-s1',
    title: 'Loki',
    season: 1,
    releaseDate: '2021-06-09',
    tier: 'essential',
    relevance: 'Introduce la TVA, las variantes y la amenaza del multiverso.',
    blocks: [
      {
        date: '2026-10-27',
        episodes: [
          { number: 1, title: 'Glorious Purpose' },
          { number: 2, title: 'The Variant' },
        ],
      },
      {
        date: '2026-10-29',
        episodes: [
          { number: 3, title: 'Lamentis' },
          { number: 4, title: 'The Nexus Event' },
        ],
      },
      {
        date: '2026-10-31',
        episodes: [
          { number: 5, title: 'Journey into Mystery' },
          { number: 6, title: 'For All Time. Always.' },
        ],
      },
    ],
  }),
  movie({
    id: 'shang-chi',
    title: 'Shang-Chi and the Legend of the Ten Rings',
    releaseDate: '2021-09-03',
    tier: 'essential',
    relevance: 'Origen de Shang-Chi; Simu Liu forma parte del reparto de Doomsday.',
    date: '2026-11-04',
  }),
  movie({
    id: 'spider-man-no-way-home',
    title: 'Spider-Man: No Way Home',
    releaseDate: '2021-12-17',
    tier: 'essential',
    relevance: 'Personajes de otras franquicias llegan al MCU a través del multiverso.',
    date: '2026-11-07',
  }),
  movie({
    id: 'doctor-strange-multiverse-of-madness',
    title: 'Doctor Strange in the Multiverse of Madness',
    releaseDate: '2022-05-06',
    tier: 'essential',
    relevance: 'Explica las incursiones y el peligro de cruzar entre universos.',
    date: '2026-11-11',
  }),
  movie({
    id: 'black-panther-wakanda-forever',
    title: 'Black Panther: Wakanda Forever',
    releaseDate: '2022-11-11',
    tier: 'essential',
    relevance: 'Shuri, M’Baku y Namor forman parte del reparto de Doomsday.',
    date: '2026-11-14',
  }),
  series({
    id: 'loki-s2',
    title: 'Loki',
    season: 2,
    releaseDate: '2023-10-05',
    tier: 'essential',
    relevance: 'Define el destino de Loki y el estado del multiverso.',
    blocks: [
      {
        date: '2026-11-17',
        episodes: [
          { number: 1, title: 'Ouroboros' },
          { number: 2, title: 'Breaking Brad' },
        ],
      },
      {
        date: '2026-11-19',
        episodes: [
          { number: 3, title: '1893' },
          { number: 4, title: 'Heart of the TVA' },
        ],
      },
      {
        date: '2026-11-21',
        episodes: [
          { number: 5, title: 'Science/Fiction' },
          { number: 6, title: 'Glorious Purpose' },
        ],
      },
    ],
  }),
  movie({
    id: 'deadpool-and-wolverine',
    title: 'Deadpool & Wolverine',
    releaseDate: '2024-07-26',
    tier: 'essential',
    relevance: 'Puente entre el universo de Fox y el MCU; presenta al Gambit de Channing Tatum.',
    date: '2026-11-25',
  }),
  movie({
    id: 'captain-america-brave-new-world',
    title: 'Captain America: Brave New World',
    releaseDate: '2025-02-14',
    tier: 'essential',
    relevance: 'Sam Wilson ya como Capitán América, con Joaquín Torres como el nuevo Falcon.',
    date: '2026-11-28',
  }),
  movie({
    id: 'thunderbolts',
    title: 'Thunderbolts*',
    releaseDate: '2025-05-02',
    tier: 'essential',
    relevance: 'Nacen los New Avengers, uno de los equipos centrales de Doomsday.',
    date: '2026-12-02',
  }),
  movie({
    id: 'the-fantastic-four-first-steps',
    title: 'The Fantastic Four: First Steps',
    releaseDate: '2025-07-25',
    tier: 'essential',
    relevance: 'Presenta la Tierra-828 y la primera aparición de Doom.',
    date: '2026-12-05',
  }),
  movie({
    id: 'spider-man-brand-new-day',
    title: 'Spider-Man: Brand New Day',
    releaseDate: '2026-07-31',
    tier: 'recommended',
    relevance:
      'Ocurre antes de Doomsday y Hulk aparece en ambas (confirmado). Verificar si ya está disponible.',
    date: '2026-12-09',
  }),
];
