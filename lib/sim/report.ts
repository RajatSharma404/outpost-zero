import type { SimulationState, LedgerEntry, MeterType } from './types';
import { calculateScore, type ScoreBreakdown } from './scoring';

export interface CauseChainNode {
  sol: number;
  headline: string;
  detail: string;
  category: 'power' | 'lifesupport' | 'radiation' | 'morale' | 'environmental' | 'decision';
  relatedItemId?: string;
}

export interface MissionReport {
  outcome: 'success' | 'failure';
  headline: string;
  summary: string;
  endSol: number;
  maxSols: number;
  score: ScoreBreakdown;
  causeChain: CauseChainNode[];
  topCauses: Array<{ source: string; totalImpact: number; meter: MeterType }>;
  templatedMentorNote: string;
  recommendation: string;
  sparklines: Record<MeterType, Array<{ sol: number; value: number }>>;
}

export function buildCauseChain(state: SimulationState): CauseChainNode[] {
  const nodes: CauseChainNode[] = [];
  const ledger = state.ledger;

  // 1. Walk through significant milestone events in history
  for (const hist of state.eventHistory) {
    nodes.push({
      sol: hist.sol,
      headline: `Emergency Incident Encountered: ${hist.eventId.replace(/_/g, ' ').toUpperCase()}`,
      detail: `Crew selected protocol "${hist.choiceId.replace(/_/g, ' ')}".`,
      category: 'decision',
    });
  }

  // 2. Identify first brownout sol
  const brownoutEntries = ledger.filter(
    (e) => e.meter === 'powerStoredKwh' && e.causes.some((c) => c.source === 'environmental_heating_demand' || c.amount < -100),
  );
  if (brownoutEntries.length > 0) {
    const firstBrownout = brownoutEntries[0];
    nodes.push({
      sol: firstBrownout.sol,
      headline: 'Energy Storage Depletion (Brownout)',
      detail: 'Habitat electrical reserves reached zero. Non-vital systems shed to keep life support alive.',
      category: 'power',
      relatedItemId: 'battery_bank',
    });
  }

  // 3. Trace consumable zero crossings
  const o2Depletions = ledger.filter((e) => e.meter === 'o2Kg' && e.delta < 0);
  if (state.meters.o2Kg <= 0.1 && o2Depletions.length > 0) {
    const zeroSol = state.sol - state.consecutiveO2Zero;
    nodes.push({
      sol: Math.max(1, zeroSol),
      headline: 'Oxygen Tanks Exhausted',
      detail: 'Stored oxygen reserves fully depleted. Atmospheric partial pressure dropped below breathable limits.',
      category: 'lifesupport',
      relatedItemId: 'eclss_recycler',
    });
  }

  const waterDepletions = ledger.filter((e) => e.meter === 'waterKg' && e.delta < 0);
  if (state.meters.waterKg <= 0.1 && waterDepletions.length > 0) {
    const zeroSol = state.sol - state.consecutiveWaterZero;
    nodes.push({
      sol: Math.max(1, zeroSol),
      headline: 'Potable Water Depleted',
      detail: 'Water storage hit zero. Closed-loop recycling was either absent, degraded, or shed due to power shortage.',
      category: 'lifesupport',
      relatedItemId: 'eclss_recycler',
    });
  }

  // 4. Trace final terminal failure
  if (state.status === 'failed' && state.endCondition) {
    nodes.push({
      sol: state.sol,
      headline: state.endCondition.headline,
      detail: state.endCondition.primaryCause,
      category: state.endCondition.reason === 'radiation_poisoning' ? 'radiation' : 'lifesupport',
    });
  } else if (state.status === 'completed') {
    nodes.push({
      sol: state.maxSols,
      headline: 'Mission Completed Successfully',
      detail: `Outpost reached nominal end of stay on Sol ${state.maxSols} with all systems operational.`,
      category: 'decision',
    });
  }

  // Sort chronologically by sol
  nodes.sort((a, b) => a.sol - b.sol);
  return nodes;
}

export function buildMissionReport(state: SimulationState): MissionReport {
  const score = calculateScore(state);
  const causeChain = buildCauseChain(state);

  // Compute top negative contributors across ledger
  const impactMap = new Map<string, { totalImpact: number; meter: MeterType }>();
  for (const entry of state.ledger) {
    for (const c of entry.causes) {
      if (c.amount < 0) {
        const key = `${c.source}_${entry.meter}`;
        const existing = impactMap.get(key) || { totalImpact: 0, meter: entry.meter };
        existing.totalImpact += Math.abs(c.amount);
        impactMap.set(key, existing);
      }
    }
  }

  const topCauses = Array.from(impactMap.entries())
    .map(([key, val]) => ({
      source: key.split('_')[0],
      totalImpact: Math.round(val.totalImpact * 10) / 10,
      meter: val.meter,
    }))
    .sort((a, b) => b.totalImpact - a.totalImpact)
    .slice(0, 5);

  // Construct templated plain-language narrative
  let templatedMentorNote = '';
  let recommendation = '';

  if (state.status === 'failed' && state.endCondition) {
    const reason = state.endCondition.reason;
    if (reason === 'asphyxiation') {
      templatedMentorNote = `Your outpost failed on Sol ${state.sol} because the habitat ran completely out of oxygen. Carrying bottled oxygen is fine for short trips, but for a ${state.maxSols}-sol expedition, a 4-person crew consumes 3.36 kg of O2 every single sol. Without a powered ECLSS Recycler or a MOXIE unit extracting oxygen from Martian CO2, finite tanks empty fast.`;
      recommendation = 'Pack the MOXIE O2 Extractor or the Closed-Loop ECLSS Recycler, and ensure you have at least 15 kW of power to keep them running.';
    } else if (reason === 'dehydration') {
      templatedMentorNote = `On Sol ${state.sol}, the base ran out of water. At 14 kg consumed per sol for drinking and food rehydration, 4 crew members exhaust water supplies rapidly unless water is captured and reclaimed. When power failed or recyclers were missing, the remaining water vanished within days.`;
      recommendation = 'Bring the Closed-Loop ECLSS Recycler. It recovers 90% of water, turning a 630 kg water demand into just 63 kg.';
    } else if (reason === 'starvation') {
      templatedMentorNote = `Caloric depletion forced mission abort on Sol ${state.sol}. Dehydrated food rations ran out before the mission concluded, and hydroponic food production was unable to bridge the caloric gap.`;
      recommendation = 'Pack additional dry food rations or add a Hydroponic Salad Dome with enough water and power reserves to sustain crop cycles.';
    } else if (reason === 'radiation_poisoning') {
      templatedMentorNote = `Cumulative cosmic rays and solar particle bursts breached the 250 mSv career health threshold on Sol ${state.sol}. Without regolith berm shielding or a water-jacket storm shelter, the thin Martian atmosphere offers minimal defense against deep-space radiation.`;
      recommendation = 'Invest in the Regolith Berm (cuts daily dose by 40%) or the Water-Jacket Storm Shelter to safely ride out solar coronal ejections.';
    } else if (reason === 'crew_unrest') {
      templatedMentorNote = `Crew psychological collapse ended the mission on Sol ${state.sol}. Sustained dark brownouts, unvaried emergency rations, and isolation without recreation broke crew morale.`;
      recommendation = 'Pack the Crew Habitat & Rec Module, provide fresh crops, and avoid frequent life-support power brownouts.';
    }
  } else {
    templatedMentorNote = `Outstanding engineering! Outpost Zero survived all ${state.maxSols} Martian sols, achieving Grade ${score.grade}. Your cargo balance properly accommodated life support closed loops, reliable electrical generation, and radiation protection.`;
    recommendation = 'For an even higher score, try reducing total cargo weight below 36 tonnes while maintaining nominal reserves.';
  }

  // Synthesize sparklines from state ledger (sample every sol or 2 sols)
  const sparklines: Record<MeterType, Array<{ sol: number; value: number }>> = {
    powerStoredKwh: [],
    o2Kg: [],
    waterKg: [],
    foodKg: [],
    doseMsvPerCrew: [],
    morale: [],
    crewHealth: [],
  };

  // Build sparklines by summing cumulative changes from ledger
  const meterAccumulator: Record<MeterType, number> = {
    powerStoredKwh: state.batteryCapacityKwh * 0.8,
    o2Kg: state.loadout.consumables.o2Kg,
    waterKg: state.loadout.consumables.waterKg,
    foodKg: state.loadout.consumables.foodKg,
    doseMsvPerCrew: 0,
    morale: 85,
    crewHealth: 100,
  };

  for (let s = 1; s <= state.sol; s++) {
    const solEntries = state.ledger.filter((e) => e.sol === s);
    for (const ent of solEntries) {
      meterAccumulator[ent.meter] = Math.max(0, meterAccumulator[ent.meter] + ent.delta);
    }
    for (const m of Object.keys(sparklines) as MeterType[]) {
      sparklines[m].push({ sol: s, value: Math.round(meterAccumulator[m] * 10) / 10 });
    }
  }

  return {
    outcome: state.status === 'completed' ? 'success' : 'failure',
    headline: state.endCondition?.headline || 'Mission Status Concluded',
    summary: state.endCondition?.primaryCause || 'All objectives verified.',
    endSol: state.sol,
    maxSols: state.maxSols,
    score,
    causeChain,
    topCauses,
    templatedMentorNote,
    recommendation,
    sparklines,
  };
}
