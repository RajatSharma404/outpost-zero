import type { Metadata } from 'next';
import { Barlow_Condensed, IBM_Plex_Mono, Source_Serif_4 } from 'next/font/google';
import '../styles/tokens.css';
import { SoundToggle } from '../components/ui/SoundToggle';

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
  metadataBase: new URL('https://outpost-zero-livid.vercel.app'),
  title: {
    default: 'Outpost Zero | Mars Surface Systems Engineering Simulator',
    template: '%s | Outpost Zero',
  },
  description:
    'Balance a 40-tonne lander cargo budget across life support, power, radiation shielding, and food on the Martian surface.',
  keywords: [
    'NASA Space Apps Challenge',
    'Mars Simulator',
    'Systems Engineering',
    'ECLSS Life Support',
    'MOXIE ISRU',
    'Kilopower Nuclear',
    'STEM Education',
  ],
  authors: [{ name: 'Team Outpost Zero' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Outpost Zero | Mars Surface Systems Engineering Simulator',
    description:
      'How many people can you keep alive on 40 tonnes on Mars? Balance life support, power, radiation shielding, and food.',
    url: 'https://outpost-zero-livid.vercel.app',
    siteName: 'Outpost Zero',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Outpost Zero | Mars Surface Systems Engineering Simulator',
    description:
      'How many people can you keep alive on 40 tonnes on Mars? Balance life support, power, radiation shielding, and food.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://outpost-zero-livid.vercel.app/#webapp',
      name: 'Outpost Zero',
      url: 'https://outpost-zero-livid.vercel.app',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'All modern web browsers',
      description:
        'Deterministic Mars surface systems engineering simulator developed for the NASA Space Apps Challenge.',
      browserRequirements: 'Requires JavaScript. Compliant with WCAG 2.2 AAA standards.',
    },
    {
      '@type': 'EducationalApplication',
      '@id': 'https://outpost-zero-livid.vercel.app/#educational',
      name: 'Outpost Zero STEM Mars Mission Simulator',
      educationalLevel: 'Middle School, High School, Undergraduate',
      learningResourceType: 'Interactive Engineering Simulation',
      about: [
        'Mars Surface Habitability',
        'ECLSS Closed Loops',
        'Radiation Shielding',
        'In-Situ Resource Utilization',
      ],
    },
  ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: 'var(--basalt)',
          color: 'var(--ink)',
          fontFamily: 'var(--font-mono)',
          minHeight: '100vh',
          position: 'relative',
        }}
      >
        {/* Global Sound Control Header Widget */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-2)',
            right: 'var(--space-4)',
            zIndex: 110,
          }}
        >
          <SoundToggle />
        </div>

        {children}
      </body>
    </html>
  );
}
