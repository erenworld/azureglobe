'use client';

import { useMemo, useState } from 'react';
import { useLiveTest } from '@/hooks/useLiveTest';
import { rankRegions, regionView, visitorView, DEFAULT_REGION, type Origin } from '@/lib/view';
import { LatencyGlobe } from './globe/LatencyGlobe';
import { RegionPanel } from './panel/RegionPanel';
import { Legend } from './ui/Legend';
import styles from './LatencyExplorer.module.css';

/** Globe + region panel, sharing the selected origin and hovered region. */
export function LatencyExplorer() {
  const [origin, setOrigin] = useState<Origin>(DEFAULT_REGION);
  const [hovered, setHovered] = useState<number | null>(null);
  const liveTest = useLiveTest();

  const view = useMemo(
    () =>
      origin === 'you' ? visitorView(liveTest.results, liveTest.location) : regionView(origin),
    [origin, liveTest.results, liveTest.location],
  );
  const ranking = useMemo(() => rankRegions(view), [view]);

  const runLiveTest = () => {
    setOrigin('you');
    void liveTest.run();
  };

  const changeOrigin = (next: Origin) => {
    // Picking "You" for the first time starts the test.
    if (next === 'you' && liveTest.status === 'idle') runLiveTest();
    else setOrigin(next);
  };

  return (
    <div className={styles.layout}>
      <div className={styles.stage}>
        <LatencyGlobe view={view} hovered={hovered} onSelect={setOrigin} onHover={setHovered} />
        <Legend />
      </div>
      <RegionPanel
        origin={origin}
        ranking={ranking}
        liveTest={liveTest}
        hovered={hovered}
        onOriginChange={changeOrigin}
        onRunLiveTest={runLiveTest}
        onHover={setHovered}
      />
    </div>
  );
}
