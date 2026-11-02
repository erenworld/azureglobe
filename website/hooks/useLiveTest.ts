'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { azureRegions } from '@/lib/azure-data';
import type { LngLat } from '@/lib/geo';
import { loadEndpoints, locateVisitor, measureAll, type Endpoints } from '@/lib/measure';

export type LiveTestStatus = 'idle' | 'running' | 'done';

export type LiveTest = {
  /** False until endpoints are loaded and at least one is deployed. */
  available: boolean;
  status: LiveTestStatus;
  /** One entry per Azure region, in ms (null = not measured). */
  results: (number | null)[];
  done: number;
  total: number;
  location: LngLat | null;
  run: () => Promise<void>;
};

const emptyResults = () => azureRegions.map((): number | null => null);

/** Measures latency from the browser to every deployed Azure endpoint. */
export function useLiveTest(): LiveTest {
  const [endpoints, setEndpoints] = useState<Endpoints | null>(null);
  const [status, setStatus] = useState<LiveTestStatus>('idle');
  const [results, setResults] = useState(emptyResults);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [location, setLocation] = useState<LngLat | null>(null);
  // Each run gets an id so a restarted test ignores the previous one's results.
  const runId = useRef(0);

  useEffect(() => {
    let active = true;
    loadEndpoints().then((loaded) => active && setEndpoints(loaded));
    return () => {
      active = false;
    };
  }, []);

  const run = useCallback(async () => {
    if (!endpoints) return;
    const id = ++runId.current;
    const isCancelled = () => id !== runId.current;
    const targets = azureRegions.flatMap((region, index) => {
      const url = endpoints[region.id];
      return url ? [{ index, url }] : [];
    });

    setStatus('running');
    setResults(emptyResults());
    setDone(0);
    setTotal(targets.length);

    locateVisitor().then((found) => {
      if (found && !isCancelled()) setLocation(found);
    });

    await measureAll(
      targets,
      (index, ms) => {
        setResults((previous) => previous.map((value, i) => (i === index ? ms : value)));
        setDone((count) => count + 1);
      },
      isCancelled,
    );

    if (!isCancelled()) setStatus('done');
  }, [endpoints]);

  return {
    available: endpoints !== null,
    status,
    results,
    done,
    total,
    location,
    run,
  };
}
