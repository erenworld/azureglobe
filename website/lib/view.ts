import { azureRegions, latency, type AzureRegion } from './azure-data';
import { toLngLat, type LngLat } from './geo';

/** Where routes start from: an Azure region (by index) or the visitor. */
export type Origin = number | 'you';

/**
 * What the globe and the panel show: routes from one origin to every region,
 * with one latency per region (`null` = not measured / unknown).
 */
export type LatencyView = {
  /** Changes only when the origin moves, used to trigger camera moves. */
  key: string;
  from: LngLat;
  /** Index of the origin region, or null when the origin is the visitor. */
  fromIndex: number | null;
  ms: (number | null)[];
};

export type RankedRegion = AzureRegion & { index: number; ms: number };

export const DEFAULT_REGION = azureRegions.findIndex((r) => r.id === 'francecentral');

export function regionView(index: number): LatencyView {
  return {
    key: `region:${index}`,
    from: toLngLat(azureRegions[index].location),
    fromIndex: index,
    ms: latency[index],
  };
}

/**
 * View for the visitor's live results. Without a browser location, the
 * visitor is placed at the fastest region (a good proxy for "nearby").
 */
export function visitorView(results: (number | null)[], location: LngLat | null): LatencyView {
  let fastest = -1;
  results.forEach((ms, i) => {
    if (ms !== null && (fastest < 0 || ms < (results[fastest] ?? Infinity))) fastest = i;
  });
  const from = location ?? toLngLat(azureRegions[fastest >= 0 ? fastest : DEFAULT_REGION].location);

  return { key: `you:${from.join(',')}`, from, fromIndex: null, ms: results };
}

/** Destinations sorted from fastest to slowest, skipping unknown ones. */
export function rankRegions(view: LatencyView): RankedRegion[] {
  return azureRegions
    .map((region, index) => ({ ...region, index, ms: view.ms[index] }))
    .filter((r): r is RankedRegion => r.index !== view.fromIndex && r.ms !== null)
    .sort((a, b) => a.ms - b.ms);
}
