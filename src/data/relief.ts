/** [west, south, east, north] WGS84 – muss zum Bild aus scripts/fetch-relief.mjs passen. */
export const RELIEF_BBOX = [8.1, 46.28, 9.26, 47.24] as const;

export const RELIEF = {
  src: '/geo/relief.jpg',
  bbox: RELIEF_BBOX,
  quelle: 'Relief: swisstopo',
} as const;
