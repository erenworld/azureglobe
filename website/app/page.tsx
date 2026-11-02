import { LatencyExplorer } from '@/components/LatencyExplorer';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { GithubStarButton } from '@/components/ui/GithubStarButton';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>
      <GithubStarButton />
      <main className={styles.main}>
        <SiteHeader />
        <LatencyExplorer />
        <SiteFooter />
      </main>
    </div>
  );
}
