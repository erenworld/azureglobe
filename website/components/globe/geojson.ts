import type { GeoJSONSourceSpecification } from 'maplibre-gl';
import { azureRegions } from '@/lib/azure-data';
import { greatCircle, toLngLat } from '@/lib/geo';
import { AZURE_BLUE, bandOf } from '@/lib/latency';
import type { LatencyView } from '@/lib/view';

export type FeatureCollection = Exclude<GeoJSONSourceSpecification['data'], string>;

const UNKNOWN_COLOR = '#9ca3af';

/** One great-circle line per measured destination, colored by latency. */
export function routesGeoJSON(view: LatencyView): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: azureRegions.flatMap((region, i) => {
      const ms = view.ms[i];
      if (i === view.fromIndex || ms === null) return [];
      return [
        {
          type: 'Feature' as const,
          id: i,
          properties: { color: bandOf(ms).color, ms },
          geometry: {
            type: 'LineString' as const,
            coordinates: greatCircle(view.from, toLngLat(region.location)),
          },
        },
      ];
    }),
  };
}

/** Every Azure region as a point, with its color and label. */
export function regionsGeoJSON(view: LatencyView): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: azureRegions.map((region, i) => {
      const selected = i === view.fromIndex;
      const ms = view.ms[i];
      return {
        type: 'Feature' as const,
        id: i,
        properties: {
          index: i,
          selected,
          color: selected ? AZURE_BLUE : ms === null ? UNKNOWN_COLOR : bandOf(ms).color,
          label: selected || ms === null ? region.id : `${region.id}  ${ms}ms`,
          // Lower ranks win label collisions: closer regions stay visible.
          rank: selected ? -1 : (ms ?? 9999),
        },
        geometry: { type: 'Point' as const, coordinates: toLngLat(region.location) },
      };
    }),
  };
}

/** The visitor's marker, only when routes start from them. */
export function visitorGeoJSON(view: LatencyView): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features:
      view.fromIndex === null
        ? [
            {
              type: 'Feature' as const,
              properties: { label: 'you' },
              geometry: { type: 'Point' as const, coordinates: view.from },
            },
          ]
        : [],
  };
}
