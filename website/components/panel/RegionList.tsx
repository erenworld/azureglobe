import { bandOf } from '@/lib/latency';
import type { RankedRegion } from '@/lib/view';
import styles from './RegionPanel.module.css';

type Props = {
  regions: RankedRegion[];
  hovered: number | null;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
};

/** Destinations from fastest to slowest, with a latency bar. */
export function RegionList({ regions, hovered, onSelect, onHover }: Props) {
  const slowest = regions.at(-1)?.ms ?? 1;

  return (
    <ol className={styles.list}>
      {regions.map((region) => {
        const band = bandOf(region.ms);
        return (
          <li key={region.id}>
            <button
              type="button"
              className={hovered === region.index ? styles.active : undefined}
              onClick={() => onSelect(region.index)}
              onPointerEnter={() => onHover(region.index)}
              onPointerLeave={() => onHover(null)}
            >
              <span className={styles.name}>
                {region.name}
                <small>{region.city}</small>
              </span>
              <span className={styles.bar}>
                <i
                  className={styles[band.id]}
                  style={{ width: `${(region.ms / slowest) * 100}%` }}
                />
              </span>
              <span className={`${styles.ms} ${styles[band.id]}`}>{region.ms}ms</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
