import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Surface Mission Operations | Outpost Zero',
  description:
    'Monitor real-time Martian surface systems telemetry, ECLSS atmospheric loops, and emergency incident event directives.',
  alternates: {
    canonical: 'https://outpost-zero-livid.vercel.app/mission',
  },
  openGraph: {
    title: 'Surface Mission Operations | Outpost Zero',
    description:
      'Monitor real-time Martian surface systems telemetry, ECLSS atmospheric loops, and emergency incident event directives.',
    url: 'https://outpost-zero-livid.vercel.app/mission',
  },
};

export default function MissionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

