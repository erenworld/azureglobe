import type { StyleSpecification } from 'maplibre-gl';

export type MapMode = 'plan' | 'satellite';

export const MAP_MODES: { id: MapMode; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'satellite', label: 'Satellite' },
];

/** Free OpenStreetMap vector basemap, no API key needed. */
const PLAN_STYLE = 'https://tiles.openfreemap.org/styles/positron';

/**
 * NASA Blue Marble imagery (public domain), with light borders and country
 * names from OpenFreeMap on top and an atmosphere around the globe.
 */
const SATELLITE_STYLE: StyleSpecification = {
  version: 8,
  projection: { type: 'globe' },
  glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
  sky: {
    'sky-color': '#0b1a33',
    'horizon-color': '#5fa8ff',
    'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0],
  },
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg',
      ],
      tileSize: 256,
      maxzoom: 8,
      attribution:
        '<a href="https://earthobservatory.nasa.gov/features/BlueMarble" target="_blank">NASA Blue Marble</a>',
    },
    openmaptiles: {
      type: 'vector',
      url: 'https://tiles.openfreemap.org/planet',
    },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#04070f' } },
    { id: 'satellite', type: 'raster', source: 'satellite' },
    {
      id: 'country-borders',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['all', ['==', ['get', 'admin_level'], 2], ['!=', ['get', 'maritime'], 1]],
      paint: { 'line-color': '#ffffff', 'line-opacity': 0.35, 'line-width': 0.6 },
    },
    {
      id: 'country-names',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      filter: ['==', ['get', 'class'], 'country'],
      layout: {
        'text-field': ['coalesce', ['get', 'name:en'], ['get', 'name']],
        'text-font': ['Noto Sans Regular'],
        'text-size': 10,
        'text-transform': 'uppercase',
        'text-letter-spacing': 0.15,
      },
      paint: {
        'text-color': '#ffffff',
        'text-opacity': 0.55,
        'text-halo-color': '#000000',
        'text-halo-width': 1,
      },
    },
  ],
};

export const MAP_STYLES: Record<MapMode, string | StyleSpecification> = {
  plan: PLAN_STYLE,
  satellite: SATELLITE_STYLE,
};

/** Zoom that fits the whole globe in a container of this width (≈1.4 at 600px). */
export function fitZoom(width: number): number {
  return 1.4 + 0.85 * Math.log2(Math.max(width, 200) / 600);
}
