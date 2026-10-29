import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Model Manual & Physics Specs | Outpost Zero',
  description:
    'Mathematical resource loop equations, physical constants, BVAD consumption baselines, and scaling principles.',
  alternates: {
    canonical: 'https://outpost-zero-livid.vercel.app/how-it-works',
  },
  openGraph: {
    title: 'System Model Manual & Physics Specs | Outpost Zero',
    description:
      'Mathematical resource loop equations, physical constants, BVAD consumption baselines, and scaling principles.',
    url: 'https://outpost-zero-livid.vercel.app/how-it-works',
  },
};

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

