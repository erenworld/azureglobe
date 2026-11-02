import { SAMPLES } from '@/lib/measure';
import { MICROSOFT_LATENCY_URL, REPO_URL, X_HANDLE, X_URL } from '@/lib/site';
import styles from './SiteFooter.module.css';

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.source}>
        Live test: median of {SAMPLES} HTTPS requests from your browser to each region. Region to
        region: P50 round-trip times from{' '}
        <a href={MICROSOFT_LATENCY_URL} target="_blank" rel="noopener noreferrer">
          Microsoft Azure network latency statistics
        </a>
        .
      </p>
      <nav className={styles.links} aria-label="Links">
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <span aria-hidden="true">/</span>
        <a href={X_URL} target="_blank" rel="noopener noreferrer">
          {X_HANDLE}
        </a>
      </nav>
    </footer>
  );
}
