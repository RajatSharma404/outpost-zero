import type { SimulationState } from './types';
import { getConstantValue } from '../data';
import { calculateMass } from './loadout';

export type MissionGrade = 'S' | 'A' | 'B' | 'C' | 'F';

export interface ScoreBreakdown {
  grade: MissionGrade;
  totalScore: number;
  healthScore: number;
  doseMarginScore: number;
  reservesScore: number;
  massEfficiencyScore: number;
  survivalBonus: number;
  summary: string;
}

export function calculateScore(state: SimulationState): ScoreBreakdown {
  if (state.status === 'failed') {
    return {
      grade: 'F',
      totalScore: Math.floor((state.sol / state.maxSols) * 40),
      healthScore: Math.floor(state.crew.health * 0.2),
      doseMarginScore: 0,
      reservesScore: 0,
      massEfficiencyScore: 0,
      survivalBonus: 0,
      summary: `Mission terminated on Sol ${state.sol}. ${state.endCondition?.headline || 'Failure condition triggered.'}`,
    };
  }

  // 1. Health Score (max 25 pts)
  const healthScore = Math.round((state.crew.health / 100) * 25);

  // 2. Radiation Dose Margin (max 25 pts)
  const doseLimit = getConstantValue('dose_limit_mission_msv', 250);
  const doseRatio = Math.max(0, 1 - state.meters.doseMsvPerCrew / doseLimit);
  const doseMarginScore = Math.round(doseRatio * 25);

  // 3. Reserves Buffer (max 25 pts)
  // Rewarded for landing with safe surplus but not wasteful overload
  const reservesScore = Math.round(
    Math.min(25, (state.meters.waterKg / 100 + state.meters.o2Kg / 20 + state.meters.foodKg / 50 + state.meters.morale / 10) * 2.5),
  );

  // 4. Mass Efficiency (max 25 pts)
  const mass = calculateMass(state.loadout);
  // Sweet spot: using between 34,000 kg and 39,500 kg
  const massRatio = mass.totalMassKg / mass.maxMassKg;
  let massEfficiencyScore = 20;
  if (massRatio <= 0.85) massEfficiencyScore = 25; // extremely lean
  else if (massRatio <= 0.98) massEfficiencyScore = 22;
  else massEfficiencyScore = 18;

  const survivalBonus = state.resupplyAccepted ? -15 : 0;
  const rawScore = healthScore + doseMarginScore + reservesScore + massEfficiencyScore + survivalBonus;
  const totalScore = Math.max(0, Math.min(100, rawScore));

  let grade: MissionGrade = 'C';
  if (totalScore >= 90) grade = 'S';
  else if (totalScore >= 78) grade = 'A';
  else if (totalScore >= 62) grade = 'B';
  else if (totalScore >= 50) grade = 'C';
  else grade = 'F';

  return {
    grade,
    totalScore,
    healthScore,
    doseMarginScore,
    reservesScore,
    massEfficiencyScore,
    survivalBonus,
    summary: `Mission accomplished! Outpost Zero sustained all 4 crew through ${state.maxSols} sols.`,
  };
}
