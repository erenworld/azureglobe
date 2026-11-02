import { REPO_URL } from '@/lib/site';
import { PixelStar } from './PixelStar';
import styles from './GithubStarButton.module.css';

export function GithubStarButton() {
  return (
    <a className={styles.button} href={REPO_URL} target="_blank" rel="noopener noreferrer">
      <PixelStar className={styles.star} />
      <span>Star on GitHub</span>
    </a>
  );
}
