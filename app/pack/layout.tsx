import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pack the Lander | Outpost Zero',
  description:
    'Select surface power, ECLSS life support recyclers, regolith shielding, and consumable rations within the 40-tonne lander cargo budget.',
  alternates: {
    canonical: 'https://outpost-zero-livid.vercel.app/pack',
  },
  openGraph: {
    title: 'Pack the Lander | Outpost Zero',
    description:
      'Select surface power, ECLSS life support recyclers, regolith shielding, and consumable rations within the 40-tonne lander cargo budget.',
    url: 'https://outpost-zero-livid.vercel.app/pack',
  },
};

export default function PackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

