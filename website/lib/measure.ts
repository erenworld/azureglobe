// Live latency test, run from the visitor's browser.
//
// Each Azure region has a tiny public blob (created by infra/deploy.sh).
// We time HTTPS GETs to it: one warm-up request (DNS + TLS handshake), then a
// few timed requests on the warm connection, and keep the median.

import type { LngLat } from './geo';

/** Region id → URL of the tiny file hosted in that region. */
export type Endpoints = Record<string, string>;

const WARMUP = 1;
export const SAMPLES = 4;
// Files in public/ live under the base path too (see next.config.js).
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const TIMEOUT_MS = 5000;
const CONCURRENCY = 6;

/** Endpoints written by infra/deploy.sh, or null when none are deployed. */
export async function loadEndpoints(): Promise<Endpoints | null> {
  try {
    const res = await fetch(`${BASE_PATH}/endpoints.json`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as Endpoints;
    return Object.keys(data).length ? data : null;
  } catch {
    return null;
  }
}

async function ping(url: string): Promise<number> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const start = performance.now();
    const res = await fetch(`${url}?t=${Date.now()}${Math.random()}`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    await res.arrayBuffer();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return performance.now() - start;
  } finally {
    clearTimeout(timer);
  }
}

/** Median round-trip time to one endpoint, in ms (null if unreachable). */
export async function measureEndpoint(url: string): Promise<number | null> {
  try {
    for (let i = 0; i < WARMUP; i++) await ping(url);
    const times: number[] = [];
    for (let i = 0; i < SAMPLES; i++) times.push(await ping(url));
    times.sort((a, b) => a - b);
    const mid = times.length / 2;
    const median = times.length % 2 ? times[Math.floor(mid)] : (times[mid - 1] + times[mid]) / 2;
    return Math.round(median);
  } catch {
    return null;
  }
}

/** Measures every target, a few at a time, reporting each result as it lands. */
export async function measureAll(
  targets: { index: number; url: string }[],
  onResult: (index: number, ms: number | null) => void,
  isCancelled: () => boolean,
): Promise<void> {
  const queue = [...targets];
  const worker = async () => {
    while (queue.length && !isCancelled()) {
      const { index, url } = queue.shift()!;
      const ms = await measureEndpoint(url);
      if (!isCancelled()) onResult(index, ms);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

/**
 * Visitor's approximate position from the browser (asks for permission).
 * Rounded to ~10 km and never sent anywhere. Null if refused or unavailable.
 */
export function locateVisitor(): Promise<LngLat | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve([Math.round(coords.longitude * 10) / 10, Math.round(coords.latitude * 10) / 10]),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 3_600_000 },
    );
  });
}
