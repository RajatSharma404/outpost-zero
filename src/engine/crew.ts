/**
 * Outpost Zero: Human Metabolism & Crew Physiology
 * Implements EER, metabolic energy conversion, stoichiometric respiration, and fluid requirements.
 */

import type { CrewMember } from './types';
import { getConstant } from './constants';

export interface MetabolicOutput {
  eerKcal: number;
  metabolicMj: number;
  o2ConsumptionKg: number;
  co2ProductionKg: number;
  fluidTargetL: number;
  dryFoodNeedKg: number;
  respirationVaporKg: number;
  perspirationSweatKg: number;
  urineWaterKg: number;
  urineSolidsKg: number;
  fecesWaterKg: number;
  fecesSolidsKg: number;
}

/**
 * Calculates Estimated Energy Requirement (EER) in kcal/day for an adult crewmember.
 * Uses NASA-STD-3001 Vol 2 / DRI Erratum equations.
 */
export function calculateCrewMemberEER(member: CrewMember, dailyEvaHours = 0): number {
  let baseKcal = 0;
  if (member.sex === 'male') {
    const c = getConstant<number>('eer_male_baseline_erratum'); // 662
    const ageCoeff = getConstant<number>('eer_male_age_coeff');   // 9.53
    const massCoeff = getConstant<number>('eer_male_mass_coeff'); // 15.9
    const htCoeff = getConstant<number>('eer_male_height_coeff'); // 539.6
    baseKcal = c - ageCoeff * member.age + member.activityFactor * (massCoeff * member.massKg + htCoeff * member.heightM);
  } else {
    const c = getConstant<number>('eer_female_baseline');          // 354
    const ageCoeff = getConstant<number>('eer_female_age_coeff');   // 6.91
    const massCoeff = getConstant<number>('eer_female_mass_coeff'); // 9.36
    const htCoeff = getConstant<number>('eer_female_height_coeff'); // 726.0
    baseKcal = c - ageCoeff * member.age + member.activityFactor * (massCoeff * member.massKg + htCoeff * member.heightM);
  }

  // EVA energy increment: +200 kcal/h
  const evaHoursToday = dailyEvaHours > 0 ? dailyEvaHours : member.evaHoursPerWeek / 7;
  const evaEnergy = evaHoursToday * getConstant<number>('eva_energy_increment_per_hour');

  return baseKcal + evaEnergy;
}

/**
 * Converts kcal to metabolic megajoules (MJ).
 */
export function kcalToMetabolicMj(kcal: number): number {
  return kcal * getConstant<number>('kcal_to_mj_factor'); // 0.004184
}

/**
 * Calculates oxygen consumption (kg/day) from metabolic MJ.
 */
export function o2FromMetabolicMj(mj: number): number {
  return mj * getConstant<number>('o2_per_metabolic_mj'); // 0.0701
}

/**
 * Calculates carbon dioxide production (kg/day) from metabolic MJ.
 */
export function co2FromMetabolicMj(mj: number): number {
  return mj * getConstant<number>('co2_per_metabolic_mj'); // 0.0850
}

/**
 * Computes individual daily fluid intake target (L/day).
 */
export function calculateFluidTarget(member: CrewMember, dailyEvaHours = 0): number {
  const massBasis = (member.massKg * getConstant<number>('fluid_intake_mass_basis')) / 1000; // 32 mL/kg -> L
  const floor = member.sex === 'male'
    ? getConstant<number>('fluid_intake_minimum_men') // 2.5 L
    : getConstant<number>('fluid_intake_minimum_women'); // 2.1 L
  const evaHoursToday = dailyEvaHours > 0 ? dailyEvaHours : member.evaHoursPerWeek / 7;
  const evaWater = evaHoursToday * getConstant<number>('eva_water_increment_per_hour'); // 0.24 L/h

  return Math.max(massBasis, floor) + evaWater;
}

/**
 * Full coupled metabolic output for a single crew member on a given day.
 */
export function calculateCrewMemberMetabolism(
  member: CrewMember,
  dailyEvaHours = 0,
  intakeFraction = 1.0,
): MetabolicOutput {
  const eerKcal = calculateCrewMemberEER(member, dailyEvaHours);
  const metabolicMj = kcalToMetabolicMj(eerKcal * intakeFraction);

  const o2ConsumptionKg = o2FromMetabolicMj(metabolicMj);
  const co2ProductionKg = co2FromMetabolicMj(metabolicMj);
  const fluidTargetL = calculateFluidTarget(member, dailyEvaHours);

  // Dry food needed proportional to energy (BVAD Table 4-60 baseline: 0.71 kg for 11.82 MJ -> 0.06007 kg/MJ)
  const dryFoodNeedKg = metabolicMj * (0.71 / 11.82);

  // Moisture excretions scaled to preserve physiological mass balance:
  // Total water exiting = Water ingested + Metabolic water produced by food oxidation - Feces moisture
  // Metabolic water production from carbohydrate/fat oxidation: ~0.032 kg/MJ (BVAD Table 4-51)
  const metabolicWaterKg = metabolicMj * 0.032;
  const foodMoistureInKg = dryFoodNeedKg * 0.42; // standard 42% inherent moisture
  const totalWaterInKg = fluidTargetL + foodMoistureInKg;
  const fecesWaterKg = getConstant<number>('feces_water_output');   // 0.09 kg
  const fecesSolidsKg = getConstant<number>('feces_solids_output'); // 0.03 kg

  const totalWaterExcretedKg = Math.max(1.5, totalWaterInKg + metabolicWaterKg - fecesWaterKg);

  // Excretion partitioning (BVAD Table 3-24 standard distribution):
  // Respiration & perspiration vapor: ~54% of excreted moisture
  // Liquid sweat runoff: ~6% of excreted moisture
  // Urine water: ~40% of excreted moisture
  const respirationVaporKg = totalWaterExcretedKg * 0.54;
  const perspirationSweatKg = totalWaterExcretedKg * 0.06;
  const urineWaterKg = totalWaterExcretedKg * 0.40;
  const urineSolidsKg = getConstant<number>('urine_solids_output'); // 0.06 kg

  return {
    eerKcal,
    metabolicMj,
    o2ConsumptionKg,
    co2ProductionKg,
    fluidTargetL,
    dryFoodNeedKg,
    respirationVaporKg,
    perspirationSweatKg,
    urineWaterKg,
    urineSolidsKg,
    fecesWaterKg,
    fecesSolidsKg,
  };
}

/**
 * Default standard 4-person crew profile for reference testing and simulations.
 */
export const DEFAULT_REFERENCE_CREW: CrewMember[] = [
  {
    id: 'cm_commander',
    name: 'Cmdr. Alex Vance',
    sex: 'male',
    age: 45,
    massKg: 82.4,
    heightM: 1.786,
    activityFactor: 1.25,
    evaHoursPerWeek: 4,
  },
  {
    id: 'cm_pilot',
    name: 'Lt. Maya Lin',
    sex: 'female',
    age: 38,
    massKg: 64.0,
    heightM: 1.680,
    activityFactor: 1.25,
    evaHoursPerWeek: 4,
  },
  {
    id: 'cm_flight_surgeon',
    name: 'Dr. Tariq Al-Mansoor',
    sex: 'male',
    age: 42,
    massKg: 78.0,
    heightM: 1.750,
    activityFactor: 1.25,
    evaHoursPerWeek: 2,
  },
  {
    id: 'cm_science_officer',
    name: 'Dr. Elena Rostova',
    sex: 'female',
    age: 36,
    massKg: 58.0,
    heightM: 1.640,
    activityFactor: 1.25,
    evaHoursPerWeek: 2,
  },
];
