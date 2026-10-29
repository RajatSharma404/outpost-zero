import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research Bibliography & NASA Sources | Outpost Zero',
  description:
    'Official NASA citations, Curiosity RAD surface radiation measurements, and space flight human-system standards.',
  alternates: {
    canonical: 'https://outpost-zero-livid.vercel.app/sources',
  },
  openGraph: {
    title: 'Research Bibliography & NASA Sources | Outpost Zero',
    description:
      'Official NASA citations, Curiosity RAD surface radiation measurements, and space flight human-system standards.',
    url: 'https://outpost-zero-livid.vercel.app/sources',
  },
};

export default function SourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

