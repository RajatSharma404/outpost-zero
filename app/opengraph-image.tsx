import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Outpost Zero — Mars Surface Systems Engineering Simulator';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#15110F',
          color: '#EDE3D6',
          padding: '60px',
          fontFamily: 'monospace',
          border: '12px solid #756155',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '24px', color: '#D9622B', letterSpacing: '0.15em', fontWeight: 700 }}>
            NASA SPACE APPS CHALLENGE // MARS SURFACE SYSTEMS
          </div>
          <div style={{ fontSize: '20px', color: '#F0A24B' }}>
            40-TONNE LANDER CARGO LIMIT
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '72px', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', color: '#EDE3D6' }}>
            OUTPOST ZERO
          </div>
          <div style={{ fontSize: '32px', color: '#A89B8C', maxWidth: '900px' }}>
            How many people can you keep alive on 40 tonnes? Balance life support, power, radiation shielding, and food.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #756155', paddingTop: '24px' }}>
          <div style={{ fontSize: '20px', color: '#8FB38A' }}>
            [● REAL-TIME TELEMETRY] Sabatier Loops // MOXIE O2 // Kilopower Nuclear
          </div>
          <div style={{ fontSize: '20px', color: '#F0A24B' }}>
            outpost-zero-livid.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

