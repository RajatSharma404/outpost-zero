/**
 * Outpost Zero: Daily Mass-Balance Audit & Closed-Loop Carbon Ledger
 * Enforces physical conservation of mass (inputs = outputs within <= 2%)
 * and tracks elemental carbon from food intake through CO2, CH4, and biomass recycling.
 */

import type { MassBalanceAudit, CarbonLedger } from './types';
import type { MetabolicOutput } from './crew';

export interface DailyFlowInputs {
  o2ConsumedKg: number;
  foodConsumedKg: number; // dry food + inherent food moisture
  waterIngestedKg: number; // drinking water + food rehydration water
}

export interface DailyFlowOutputs {
  co2ExhaledKg: number;
  respirationVaporKg: number;
  perspirationSweatKg: number;
  urineTotalKg: number;
  fecesTotalKg: number;
  shedSolidsKg: number;
}

/**
 * Conducts the daily mass-balance conservation check.
 * Verifies sum of physical inputs equals sum of physical outputs within <= 2%.
 */
export function auditDailyMassBalance(
  inputs: DailyFlowInputs,
  outputs: DailyFlowOutputs,
): MassBalanceAudit {
  const inputsKg = inputs.o2ConsumedKg + inputs.foodConsumedKg + inputs.waterIngestedKg;
  const outputsKg =
    outputs.co2ExhaledKg +
    outputs.respirationVaporKg +
    outputs.perspirationSweatKg +
    outputs.urineTotalKg +
    outputs.fecesTotalKg +
    outputs.shedSolidsKg;

  const deltaKg = inputsKg - outputsKg;
  const errorPct = inputsKg > 0 ? (Math.abs(deltaKg) / inputsKg) * 100 : 0;
  const withinTolerance = errorPct <= 2.0;

  return {
    inputsKg,
    outputsKg,
    deltaKg,
    errorPct,
    withinTolerance,
  };
}

/**
 * Elemental Carbon Ledger
 * Tracks carbon atom conservation:
 * - Food dry mass is approximately 45% carbon by weight.
 * - CO2 is 27.29% carbon (12.011 / 44.01).
 * - CH4 is 74.87% carbon (12.011 / 16.04).
 * - Trash from uneaten food residue contains carbon.
 * - Plant edible biomass contains ~45% carbon by dry mass.
 */
export function updateCarbonLedger(
  dryFoodEatenKg: number,
  co2ExhaledKg: number,
  ch4VentedKg: number,
  trashFoodResidueKg: number,
  edibleBiomassGrownKg: number,
): CarbonLedger {
  const carbonInFoodKg = dryFoodEatenKg * 0.45;
  const carbonOutCo2Kg = co2ExhaledKg * (12.011 / 44.01);
  const carbonOutCh4Kg = ch4VentedKg * (12.011 / 16.04);
  const carbonOutTrashKg = trashFoodResidueKg * 0.45;
  const carbonOutBiomassKg = edibleBiomassGrownKg * 0.45;

  // Percentage of exhaled metabolic carbon recycled back into edible biomass
  const carbonClosurePct = carbonOutCo2Kg > 0
    ? (carbonOutBiomassKg / carbonOutCo2Kg) * 100
    : 0;

  return {
    carbonInFoodKg,
    carbonOutCo2Kg,
    carbonOutCh4Kg,
    carbonOutTrashKg,
    carbonOutBiomassKg,
    carbonClosurePct,
  };
}

