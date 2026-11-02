import styles from './SiteHeader.module.css';

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <h1>
        Azure<span>globe</span>
      </h1>
      <p>
        Test your latency to every Azure datacenter, live from your browser, or pick a region to see
        how fast it reaches the others.
      </p>
    </header>
  );
}
