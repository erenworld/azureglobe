import type { LiveTest } from '@/hooks/useLiveTest';
import { azureRegions } from '@/lib/azure-data';
import type { Origin, RankedRegion } from '@/lib/view';
import { LiveTestControls } from './LiveTestControls';
import { OriginSelect } from './OriginSelect';
import { RegionList } from './RegionList';
import styles from './RegionPanel.module.css';

type Props = {
  origin: Origin;
  ranking: RankedRegion[];
  liveTest: LiveTest;
  hovered: number | null;
  onOriginChange: (origin: Origin) => void;
  onRunLiveTest: () => void;
  onHover: (index: number | null) => void;
};

export function RegionPanel({
  origin,
  ranking,
  liveTest,
  hovered,
  onOriginChange,
  onRunLiveTest,
  onHover,
}: Props) {
  const fromLabel = origin === 'you' ? 'your browser' : azureRegions[origin].id;

  return (
    <aside className={styles.panel}>
      <OriginSelect origin={origin} allowVisitor={liveTest.available} onChange={onOriginChange} />
      {liveTest.available && (
        <LiveTestControls
          status={liveTest.status}
          done={liveTest.done}
          total={liveTest.total}
          onRun={onRunLiveTest}
        />
      )}
      <p className={styles.meta}>
        <code>{fromLabel}</code> → {ranking.length} regions
      </p>
      <RegionList regions={ranking} hovered={hovered} onSelect={onOriginChange} onHover={onHover} />
    </aside>
  );
}
