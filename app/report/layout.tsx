import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mission Flight Certification Report | Outpost Zero',
  description:
    'Post-mission systems engineering postmortem, root-cause investigation ledger, and 100-point flight certification evaluation.',
  alternates: {
    canonical: 'https://outpost-zero-livid.vercel.app/report',
  },
  openGraph: {
    title: 'Mission Flight Certification Report | Outpost Zero',
    description:
      'Post-mission systems engineering postmortem, root-cause investigation ledger, and 100-point flight certification evaluation.',
    url: 'https://outpost-zero-livid.vercel.app/report',
  },
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

