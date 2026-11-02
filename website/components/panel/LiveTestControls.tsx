import type { LiveTestStatus } from '@/hooks/useLiveTest';
import styles from './RegionPanel.module.css';

type Props = {
  status: LiveTestStatus;
  done: number;
  total: number;
  onRun: () => void;
};

export function LiveTestControls({ status, done, total, onRun }: Props) {
  if (status === 'running') {
    const progress = (done / Math.max(total, 1)) * 100;
    return (
      <div className={styles.live} role="status">
        <span className={styles.progress}>
          <i style={{ width: `${progress}%` }} />
        </span>
        <span>
          Testing {done}/{total}
        </span>
      </div>
    );
  }

  return (
    <div className={styles.live}>
      <button type="button" onClick={onRun}>
        {status === 'done' ? 'Run the test again' : 'Test from my browser'}
      </button>
    </div>
  );
}
