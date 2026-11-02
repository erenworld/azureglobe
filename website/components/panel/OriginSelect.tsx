import { azureRegions } from '@/lib/azure-data';
import type { Origin } from '@/lib/view';
import styles from './RegionPanel.module.css';

type Props = {
  origin: Origin;
  /** Show the "You · live test" option. */
  allowVisitor: boolean;
  onChange: (origin: Origin) => void;
};

export function OriginSelect({ origin, allowVisitor, onChange }: Props) {
  return (
    <label className={styles.select}>
      <span>From</span>
      <select
        value={origin}
        onChange={(e) => onChange(e.target.value === 'you' ? 'you' : Number(e.target.value))}
      >
        {allowVisitor && <option value="you">You · live test</option>}
        {azureRegions.map((region, index) => (
          <option key={region.id} value={index}>
            {region.name} · {region.city}
          </option>
        ))}
      </select>
    </label>
  );
}
