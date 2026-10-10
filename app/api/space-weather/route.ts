import { NextResponse } from 'next/server';

export const revalidate = 600; // 10 minutes cache

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    // Fetch Planetary K-index from NOAA Space Weather Prediction Center
    const res = await fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json', {
      signal: controller.signal,
      next: { revalidate: 600 },
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({
        level: 'quiet',
        kIndex: 2,
        fetchedAt: new Date().toISOString(),
        offline: true,
      });
    }

    const data = await res.json();
    // NOAA returns an array of recent 1-minute measurements
    // Each entry: [time_tag, kp_index, ...]
    let kp = 2;
    if (Array.isArray(data) && data.length > 0) {
      const latest = data[data.length - 1];
      if (Array.isArray(latest) && typeof latest[1] === 'number') {
        kp = latest[1];
      } else if (typeof latest?.kp_index === 'number') {
        kp = latest.kp_index;
      }
    }

    let level: 'quiet' | 'active' | 'storm' = 'quiet';
    if (kp >= 5) {
      level = 'storm';
    } else if (kp >= 4) {
      level = 'active';
    } else {
      level = 'quiet';
    }

    return NextResponse.json({
      level,
      kIndex: kp,
      fetchedAt: new Date().toISOString(),
      offline: false,
    });
  } catch {
    // If NOAA SWPC is unreachable, fail silently and return fallback
    return NextResponse.json({
      level: 'quiet',
      kIndex: 2,
      fetchedAt: new Date().toISOString(),
      offline: true,
    });
  }
}
