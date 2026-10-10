import { describe, it, expect } from 'vitest';
import { POST as mentorHandler } from '../app/api/mentor/route';
import { GET as weatherHandler } from '../app/api/space-weather/route';
import { NextRequest } from 'next/server';

describe('Server API Routes', () => {
  it('POST /api/mentor rejects malformed payloads with 400', async () => {
    const badReq = new NextRequest('http://localhost:3000/api/mentor', {
      method: 'POST',
      body: JSON.stringify({ invalidField: true }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await mentorHandler(badReq);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('POST /api/mentor handles valid simulation summary with fallback template when no API key is provided', async () => {
    const validReq = new NextRequest('http://localhost:3000/api/mentor', {
      method: 'POST',
      body: JSON.stringify({
        outcome: 'success',
        endSol: 60,
        loadoutIds: ['fission_unit', 'battery_bank'],
        topCauses: ['solar_flare (-15 mSv)'],
        eventsFaced: ['solar_particle_event'],
        keyNumbers: {
          finalPowerKwh: 120,
          finalWaterKg: 2000,
          finalO2Kg: 500,
          finalFoodKg: 1500,
          finalDoseMsv: 140,
          finalHealth: 95,
          finalMorale: 85,
        },
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await mentorHandler(validReq);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(['template', 'gemini']).toContain(json.source);
    expect(json.text.length).toBeGreaterThan(20);
  });

  it('GET /api/space-weather returns normalized level and timestamp', async () => {
    const res = await weatherHandler();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(['quiet', 'active', 'storm']).toContain(json.level);
    expect(json.fetchedAt).toBeDefined();
  });
});
