import type { ExpressionSpecification, GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import { AZURE_BLUE } from '@/lib/latency';
import type { LatencyView } from '@/lib/view';
import { regionsGeoJSON, routesGeoJSON, visitorGeoJSON } from './geojson';

/** Layer whose features can be clicked / hovered to pick a region. */
export const REGION_HIT_LAYER = 'regions-hit';

const isHovered: ExpressionSpecification = ['boolean', ['feature-state', 'hover'], false];

/**
 * Adds our sources and layers on top of the base style. Must run again after
 * every `setStyle`, since switching styles drops custom layers.
 */
export function addLatencyLayers(map: MapLibreMap, view: LatencyView, dark: boolean): void {
  const accent = dark ? '#7cc4ff' : AZURE_BLUE;
  const halo = dark ? 'rgba(0, 0, 0, 0.85)' : '#ffffff';

  map.setProjection({ type: 'globe' });
  map.addSource('routes', { type: 'geojson', data: routesGeoJSON(view) });
  map.addSource('regions', { type: 'geojson', data: regionsGeoJSON(view) });
  map.addSource('visitor', { type: 'geojson', data: visitorGeoJSON(view) });

  map.addLayer({
    id: 'routes',
    type: 'line',
    source: 'routes',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': ['get', 'color'],
      'line-width': ['case', isHovered, 4, 1.6],
      'line-opacity': ['case', isHovered, 1, dark ? 0.9 : 0.75],
    },
  });

  map.addLayer({
    id: 'regions',
    type: 'circle',
    source: 'regions',
    paint: {
      'circle-color': ['get', 'color'],
      'circle-radius': ['case', ['get', 'selected'], 8, isHovered, 7, 4.5],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1.5,
    },
  });

  // Invisible, larger hit area so small dots are easy to click.
  map.addLayer({
    id: REGION_HIT_LAYER,
    type: 'circle',
    source: 'regions',
    paint: { 'circle-radius': 14, 'circle-opacity': 0 },
  });

  map.addLayer({
    id: 'region-labels',
    type: 'symbol',
    source: 'regions',
    layout: {
      'text-field': ['get', 'label'],
      'text-font': [
        'case',
        ['get', 'selected'],
        ['literal', ['Noto Sans Bold']],
        ['literal', ['Noto Sans Regular']],
      ],
      'text-size': ['case', ['get', 'selected'], 13, 11],
      'text-offset': [0, -1.1],
      'text-anchor': 'bottom',
      'symbol-sort-key': ['get', 'rank'],
    },
    paint: {
      'text-color': ['case', ['get', 'selected'], accent, dark ? '#ffffff' : '#1f2937'],
      'text-halo-color': halo,
      'text-halo-width': 1.5,
    },
  });

  map.addLayer({
    id: 'visitor',
    type: 'circle',
    source: 'visitor',
    paint: {
      'circle-color': AZURE_BLUE,
      'circle-radius': 8,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 3,
    },
  });

  map.addLayer({
    id: 'visitor-label',
    type: 'symbol',
    source: 'visitor',
    layout: {
      'text-field': ['get', 'label'],
      'text-font': ['Noto Sans Bold'],
      'text-size': 13,
      'text-offset': [0, -1.3],
      'text-anchor': 'bottom',
      'text-allow-overlap': true,
    },
    paint: { 'text-color': accent, 'text-halo-color': halo, 'text-halo-width': 1.5 },
  });
}

/** Pushes new data into the sources created by `addLatencyLayers`. */
export function updateLatencyLayers(map: MapLibreMap, view: LatencyView): void {
  (map.getSource('routes') as GeoJSONSource | undefined)?.setData(routesGeoJSON(view));
  (map.getSource('regions') as GeoJSONSource | undefined)?.setData(regionsGeoJSON(view));
  (map.getSource('visitor') as GeoJSONSource | undefined)?.setData(visitorGeoJSON(view));
}

/** Highlights (or un-highlights) a region and its route. */
export function setRegionHover(map: MapLibreMap, index: number, hover: boolean): void {
  if (!map.getSource('regions')) return;
  map.setFeatureState({ source: 'regions', id: index }, { hover });
  map.setFeatureState({ source: 'routes', id: index }, { hover });
}
