/**
 * Outpost Zero: ECLSS Subsystems & Chemical Stoichiometry
 * Implements pure stoichiometric life-support processes:
 * - WRS (Water Recovery System): 93.5% historical vs 98.0% with Brine Processor Assembly (BPA).
 * - OGS (Oxygen Generation): 2 H2O -> 2 H2 + O2.
 * - Sabatier: CO2 + 4 H2 -> CH4 (vented) + 2 H2O. Natural ~47-50% O2 recovery ceiling.
 * - Bosch (Optional): CO2 + 2 H2 -> C(s) + 2 H2O (>75% target, solid carbon).
 * - Bioregenerative Plant Module: Photosynthesis & transpiration.
 */

import type { ECLSSUnit, UnitStatus } from './types';
import { getConstant } from './constants';

export interface SabatierResult {
  co2ReactedKg: number;
  h2ReactedKg: number;
  waterProducedKg: number;
  methaneVentedKg: number;
  unreactedCo2Kg: number;
  unreactedH2Kg: number;
  emergentO2RecoveryFraction: number;
}

export interface ElectrolysisResult {
  waterConsumedKg: number;
  o2ProducedKg: number;
  h2ProducedKg: number;
}

export interface WrsResult {
  wastewaterProcessedKg: number;
  potableWaterRecoveredKg: number;
  brineProducedKg: number;
  recoveryEfficiency: number;
}

export interface BoschResult {
  co2ReactedKg: number;
  h2ReactedKg: number;
  waterProducedKg: number;
  solidCarbonDepositedKg: number;
}

export interface PlantGrowthResult {
  freshFoodKg: number;
  dryMassKg: number;
  o2ProducedKg: number;
  co2AbsorbedKg: number;
  transpirationWaterKg: number;
}

/**
 * 1. Water Recovery System (WRS)
 * Recovers potable water from wastewater (urine + condensate + hygiene).
 */
export function processWrs(
  wastewaterAvailableKg: number,
  hasBrineProcessor: boolean,
  unitEfficiency = 1.0,
): WrsResult {
  const baseRate = hasBrineProcessor
    ? getConstant<number>('wrs_recovery_with_bpa_milestone') // 0.980
    : getConstant<number>('wrs_recovery_historical');         // 0.935

  const effectiveRecovery = baseRate * unitEfficiency;
  const potableWaterRecoveredKg = wastewaterAvailableKg * effectiveRecovery;
  const brineProducedKg = wastewaterAvailableKg - potableWaterRecoveredKg;

  return {
    wastewaterProcessedKg: wastewaterAvailableKg,
    potableWaterRecoveredKg,
    brineProducedKg,
    recoveryEfficiency: effectiveRecovery,
  };
}

/**
 * 2. Water Electrolysis (OGS)
 * 2 H2O -> 2 H2 + O2
 * Molecular Weights: 2*18.015 (36.03 g H2O) -> 31.998 g O2 + 4.032 g H2
 */
export function processElectrolysis(o2DemandKg: number): ElectrolysisResult {
  // To produce 1 kg O2:
  // Water needed = 1.0 * (36.03 / 31.998) = 1.126 kg H2O
  // Hydrogen produced = 1.0 * (4.032 / 31.998) = 0.126 kg H2
  const waterConsumedKg = o2DemandKg * (36.03 / 31.998);
  const h2ProducedKg = o2DemandKg * (4.032 / 31.998);

  return {
    waterConsumedKg,
    o2ProducedKg: o2DemandKg,
    h2ProducedKg,
  };
}

/**
 * 3. Sabatier Carbon Dioxide Reduction
 * CO2 + 4 H2 -> CH4 + 2 H2O (CH4 is vented into space)
 * Exact Molar Stoichiometry:
 * 1 mol CO2 (44.01 g) + 4 mol H2 (8.064 g) -> 1 mol CH4 (16.04 g) + 2 mol H2O (36.03 g)
 *
 * Notice: 8.064 g H2 reacts with 44.01 g CO2 to yield 36.03 g H2O.
 * When that 36.03 g H2O is electrolyzed, it yields 31.998 g O2.
 * Thus, the maximum theoretical recovery of O2 from CO2 when venting CH4 is limited by H2 availability.
 */
export function processSabatier(
  co2AvailableKg: number,
  h2AvailableKg: number,
  unitEfficiency = 0.95,
  referenceCrewO2DemandKg?: number,
): SabatierResult {
  if (co2AvailableKg <= 0 || h2AvailableKg <= 0) {
    return {
      co2ReactedKg: 0,
      h2ReactedKg: 0,
      waterProducedKg: 0,
      methaneVentedKg: 0,
      unreactedCo2Kg: co2AvailableKg,
      unreactedH2Kg: h2AvailableKg,
      emergentO2RecoveryFraction: 0,
    };
  }

  // Stoichiometric ratio: 8.064 kg H2 per 44.01 kg CO2 = 0.18323 kg H2 / kg CO2
  const h2PerCo2 = 8.064 / 44.01;

  // Find limiting reagent
  const maxCo2FromH2 = h2AvailableKg / h2PerCo2;
  const theoreticalCo2Reacted = Math.min(co2AvailableKg, maxCo2FromH2);
  const co2ReactedKg = theoreticalCo2Reacted * unitEfficiency;
  const h2ReactedKg = co2ReactedKg * h2PerCo2;

  // Products:
  // Water: 36.03 kg H2O per 44.01 kg CO2
  const waterProducedKg = co2ReactedKg * (36.03 / 44.01);
  // Methane: 16.04 kg CH4 per 44.01 kg CO2
  const methaneVentedKg = co2ReactedKg * (16.04 / 44.01);

  // Oxygen contained in the produced water:
  const o2InProducedWater = waterProducedKg * (31.998 / 36.03);
  // O2 demand basis: The crew O2 consumption that generated this H2 via water electrolysis
  // 1 kg O2 produces 4.032 / 31.998 kg H2 = 0.126 kg H2
  const o2DemandBasis = referenceCrewO2DemandKg || (h2AvailableKg * (31.998 / 4.032));
  const emergentO2RecoveryFraction = o2DemandBasis > 0 ? o2InProducedWater / o2DemandBasis : 0;

  return {
    co2ReactedKg,
    h2ReactedKg,
    waterProducedKg,
    methaneVentedKg,
    unreactedCo2Kg: co2AvailableKg - co2ReactedKg,
    unreactedH2Kg: h2AvailableKg - h2ReactedKg,
    emergentO2RecoveryFraction,
  };
}

/**
 * 4. Advanced Bosch Reactor (Optional Concept)
 * CO2 + 2 H2 -> C(s) + 2 H2O
 * Solid elemental carbon is deposited; hydrogen is fully utilized.
 * 44.01 g CO2 + 4.032 g H2 -> 12.011 g C(s) + 36.03 g H2O
 */
export function processBosch(
  co2AvailableKg: number,
  h2AvailableKg: number,
  unitEfficiency = 0.85,
): BoschResult {
  const h2PerCo2 = 4.032 / 44.01;
  const maxCo2FromH2 = h2AvailableKg / h2PerCo2;
  const theoreticalCo2 = Math.min(co2AvailableKg, maxCo2FromH2);
  const co2ReactedKg = theoreticalCo2 * unitEfficiency;
  const h2ReactedKg = co2ReactedKg * h2PerCo2;

  const waterProducedKg = co2ReactedKg * (36.03 / 44.01);
  const solidCarbonDepositedKg = co2ReactedKg * (12.011 / 44.01);

  return {
    co2ReactedKg,
    h2ReactedKg,
    waterProducedKg,
    solidCarbonDepositedKg,
  };
}

/**
 * 5. Bioregenerative Plant Module (Salad & Salad Crops)
 * Yields fresh edible biomass, releases transpired water, and photosynthetic gas exchange.
 * Based on NASA Veggie / APH and Drysdale (1997) BVAD parameters.
 */
export function processPlantGrowth(
  areaM2: number,
  daysOfGrowth = 1,
): PlantGrowthResult {
  if (areaM2 <= 0) {
    return {
      freshFoodKg: 0,
      dryMassKg: 0,
      o2ProducedKg: 0,
      co2AbsorbedKg: 0,
      transpirationWaterKg: 0,
    };
  }

  // Baseline pick-and-eat salad crop yield: ~0.04 kg fresh biomass / (m² · day)
  const freshFoodKg = areaM2 * 0.04 * daysOfGrowth;
  // Fresh salad crops are ~90% water, 10% dry matter
  const dryMassKg = freshFoodKg * 0.10;

  // Photosynthetic exchange: 1 kg dry biomass ≈ 1.3 kg CO2 absorbed and 1.05 kg O2 released
  const co2AbsorbedKg = dryMassKg * 1.30;
  const o2ProducedKg = dryMassKg * 1.05;

  // Transpiration water vapor released into cabin atmosphere (~2.0 kg/m²/day)
  const transpirationWaterKg = areaM2 * 2.0 * daysOfGrowth;

  return {
    freshFoodKg,
    dryMassKg,
    o2ProducedKg,
    co2AbsorbedKg,
    transpirationWaterKg,
  };
}

/**
 * Standard factory for creating baseline flight ECLSS hardware suite.
 */
export function createDefaultEclssSuite(): ECLSSUnit[] {
  return [
    {
      id: 'eclss_wrs',
      name: 'Water Recovery System (WRS)',
      throughputKgPerDay: 40.0,
      efficiency: 0.935,
      powerKw: 1.2,
      massKg: 380,
      volumeM3: 0.9,
      mtbfHours: 4380, // ~6 months MTBF
      repairCrewHours: 4.0,
      sparesCarried: 2,
      status: 'nominal',
      offlineHours: 0,
    },
    {
      id: 'eclss_bpa',
      name: 'Brine Processor Assembly (BPA)',
      throughputKgPerDay: 8.0,
      efficiency: 0.980,
      powerKw: 0.8,
      massKg: 160,
      volumeM3: 0.4,
      mtbfHours: 5000,
      repairCrewHours: 3.5,
      sparesCarried: 1,
      status: 'nominal',
      offlineHours: 0,
    },
    {
      id: 'eclss_ogs',
      name: 'Oxygen Generation Assembly (OGA Electrolyzer)',
      throughputKgPerDay: 12.0,
      efficiency: 0.99,
      powerKw: 2.5,
      massKg: 450,
      volumeM3: 1.1,
      mtbfHours: 8760, // ~1 year MTBF
      repairCrewHours: 5.0,
      sparesCarried: 2,
      status: 'nominal',
      offlineHours: 0,
    },
    {
      id: 'eclss_sabatier',
      name: 'Sabatier CO2 Reduction Reactor',
      throughputKgPerDay: 10.0,
      efficiency: 0.95,
      powerKw: 0.7,
      massKg: 220,
      volumeM3: 0.5,
      mtbfHours: 6000,
      repairCrewHours: 3.0,
      sparesCarried: 2,
      status: 'nominal',
      offlineHours: 0,
    },
    {
      id: 'eclss_co2_scrubber',
      name: 'Amine / Zeolite Thermal Swing CO2 Scrubber',
      throughputKgPerDay: 15.0,
      efficiency: 0.98,
      powerKw: 1.5,
      massKg: 310,
      volumeM3: 0.8,
      mtbfHours: 7200,
      repairCrewHours: 4.0,
      sparesCarried: 2,
      status: 'nominal',
      offlineHours: 0,
    },
  ];
}

/**
 * All selectable ECLSS technologies across life-support functions:
 * Water (WRS, BPA), Air/O2 (OGA, Sabatier, Bosch, Pyrolysis), Food/Bioregeneration (Plants).
 */
export const ALL_AVAILABLE_ECLSS_UNITS: ECLSSUnit[] = [
  ...createDefaultEclssSuite(),
  {
    id: 'eclss_bosch',
    name: 'Bosch Carbon Deposition Reactor (Solid Carbon)',
    throughputKgPerDay: 8.0,
    efficiency: 0.98,
    powerKw: 2.1,
    massKg: 420,
    volumeM3: 1.2,
    mtbfHours: 4000,
    repairCrewHours: 6.0,
    sparesCarried: 2,
    status: 'nominal',
    offlineHours: 0,
  },
  {
    id: 'eclss_pyrolysis',
    name: 'Methane Pyrolysis Unit (CH4 -> C(s) + 2 H2)',
    throughputKgPerDay: 4.0,
    efficiency: 0.90,
    powerKw: 1.8,
    massKg: 280,
    volumeM3: 0.7,
    mtbfHours: 4500,
    repairCrewHours: 4.5,
    sparesCarried: 1,
    status: 'nominal',
    offlineHours: 0,
  },
  {
    id: 'eclss_plants',
    name: 'Bioregenerative Crop Chamber (Hydroponics 50 m²)',
    throughputKgPerDay: 12.0,
    efficiency: 0.95,
    powerKw: 5.5,
    massKg: 1200,
    volumeM3: 18.0,
    mtbfHours: 10000,
    repairCrewHours: 8.0,
    sparesCarried: 3,
    status: 'nominal',
    offlineHours: 0,
  },
];
