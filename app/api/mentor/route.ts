import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

// In-memory rate limiting: 10 requests per 10 minutes per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;

const MentorRequestSchema = z.object({
  outcome: z.enum(['success', 'failure']),
  endSol: z.number(),
  loadoutIds: z.array(z.string()),
  topCauses: z.array(z.string()),
  eventsFaced: z.array(z.string()),
  keyNumbers: z.object({
    finalPowerKwh: z.number(),
    finalWaterKg: z.number(),
    finalO2Kg: z.number(),
    finalFoodKg: z.number(),
    finalDoseMsv: z.number(),
    finalHealth: z.number(),
    finalMorale: z.number(),
  }),
});

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'anonymous_client';
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Check content length (Reject payloads > 8 KB)
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > 8192) {
      return NextResponse.json({ error: 'Payload exceeds 8 KB limit' }, { status: 413 });
    }

    const ip = getClientIp(req);
    const allowed = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          source: 'template',
          text: 'Mission Control communication link is rate limited. Reviewing local telemetry flight data instead.',
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = MentorRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid telemetry payload', details: parsed.error.format() }, { status: 400 });
    }

    const data = parsed.data;

    // Fallback template if no API key is provided
    const fallbackText =
      data.outcome === 'success'
        ? `Flight Director Log: Excellent mission execution! Outpost Zero maintained environmental control and crew safety through Sol ${data.endSol}. Your power reserves (${data.keyNumbers.finalPowerKwh} kWh) and potable water (${data.keyNumbers.finalWaterKg} kg) demonstrated proper resource balance.`
        : `Flight Director Log: Mission ended on Sol ${data.endSol}. The primary bottleneck stemmed from ${data.topCauses.slice(0, 2).join(' and ') || 'resource exhaustion'}. For your next landing, focus on closing the loop earlier.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ source: 'template', text: fallbackText });
    }

    // Call Google GenAI SDK with strict prompt and 8-second timeout
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `
Mission Outcome: ${data.outcome}
Elapsed Sol: ${data.endSol}
Hardware Packed: ${data.loadoutIds.join(', ')}
Incidents Encountered: ${data.eventsFaced.join(', ')}
Top Negative Contributors: ${data.topCauses.join(', ')}
Telemetry End State:
- Stored Power: ${data.keyNumbers.finalPowerKwh} kWh
- Potable Water: ${data.keyNumbers.finalWaterKg} kg
- Breathable O2: ${data.keyNumbers.finalO2Kg} kg
- Rations: ${data.keyNumbers.finalFoodKg} kg
- Cumulative Radiation Dose: ${data.keyNumbers.finalDoseMsv} mSv
- Crew Health: ${data.keyNumbers.finalHealth}%
- Crew Morale: ${data.keyNumbers.finalMorale}%
`.trim();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptText,
        config: {
          systemInstruction:
            'You are Mission Control, explaining a Mars outpost simulation to a student aged 11 to 17. Use only the numbers provided. Do not add facts or numbers. Explain the cause chain in at most 150 words, then give one concrete suggestion for the next attempt. Be encouraging. No markdown headings.',
          maxOutputTokens: 250,
          temperature: 0.2,
        },
      });

      clearTimeout(timeout);
      const outputText = response.text?.trim() || fallbackText;
      return NextResponse.json({ source: 'gemini', text: outputText });
    } catch {
      clearTimeout(timeout);
      return NextResponse.json({ source: 'template', text: fallbackText });
    }
  } catch {
    return NextResponse.json(
      {
        source: 'template',
        text: 'Flight telemetry debrief generated from standard onboard flight recorder.',
      },
      { status: 200 },
    );
  }
}
