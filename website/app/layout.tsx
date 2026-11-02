import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import { SITE_DESCRIPTION, SITE_NAME, X_HANDLE } from '@/lib/site';
import './globals.css';

const pixel = localFont({ src: './fonts/GeistPixel-Square.woff2', variable: '--font-pixel' });
const pixelLine = localFont({
  src: './fonts/GeistPixel-Line.woff2',
  variable: '--font-pixel-line',
});
const mono = localFont({
  src: './fonts/DepartureMono-Regular.woff',
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s - ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  openGraph: { title: SITE_NAME, description: SITE_DESCRIPTION },
  twitter: { card: 'summary_large_image', site: X_HANDLE },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="%230078d4"/></svg>',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${pixel.variable} ${pixelLine.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
