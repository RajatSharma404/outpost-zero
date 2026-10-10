import type { Metadata } from 'next';
import { Barlow_Condensed, IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google';
import '../styles/tokens.css';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-source-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Outpost Zero | Mars Surface Systems Engineering Simulator',
  description: 'Balance a 40-tonne lander cargo budget across life support, power, radiation shielding, and food on the Martian surface.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${ibmPlexMono.variable} ${sourceSerif.variable}`}
      style={{
        backgroundColor: 'var(--basalt)',
        color: 'var(--ink)',
      }}
    >
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: 'var(--basalt)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-mono)',
          minHeight: '100vh',
        }}
      >
        {children}
      </body>
    </html>
  );
}
