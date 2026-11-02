export const AZURE_BLUE = '#0078d4';

export const LATENCY_BANDS = [
  { id: 'good', label: '< 100ms', max: 100, color: '#27b648' },
  { id: 'ok', label: '100 – 200ms', max: 200, color: '#f2b600' },
  { id: 'bad', label: '> 200ms', max: Infinity, color: '#ff455d' },
] as const;

export type LatencyBand = (typeof LATENCY_BANDS)[number];
export type LatencyBandId = LatencyBand['id'];

/** Color band (green / yellow / red) for a round-trip time in ms. */
export function bandOf(ms: number): LatencyBand {
  return LATENCY_BANDS.find((band) => ms < band.max) ?? LATENCY_BANDS[2];
}
