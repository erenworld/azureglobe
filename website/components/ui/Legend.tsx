import { LATENCY_BANDS } from '@/lib/latency';
import styles from './Legend.module.css';

export function Legend() {
  return (
    <ul className={styles.legend} aria-label="Latency legend">
      {LATENCY_BANDS.map((band) => (
        <li key={band.id}>
          <i style={{ background: band.color }} aria-hidden="true" />
          {band.label}
        </li>
      ))}
    </ul>
  );
}
