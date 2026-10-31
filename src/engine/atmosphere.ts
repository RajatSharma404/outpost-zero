/**
 * Outpost Zero: Cabin Atmosphere & ppCO2 Dynamics
 * Implements ideal-gas partial pressures, 1-hour average limit checks, and hours-to-limit countdown.
 */

import { getConstant } from './constants';

export const CO2_MOLAR_MASS_G = 44.01; // g/mol

/**
 * Calculates cabin ppCO2 in mmHg using the Ideal Gas Law.
 * P = (n * R * T) / V
 */
export function calculatePpCo2MmHg(
  co2MassKg: number,
  cabinVolumeM3: number,
  temperatureK = 294.15,
): number {
  if (cabinVolumeM3 <= 0 || co2MassKg <= 0) return 0;

  const r = getConstant<number>('molar_gas_constant_r'); // 8.31446 J/(mol·K)
  const kpaToMmHg = getConstant<number>('kpa_to_mmhg_factor'); // 7.50062

  const molesCo2 = (co2MassKg * 1000) / CO2_MOLAR_MASS_G;
  const pressurePa = (molesCo2 * r * temperatureK) / cabinVolumeM3;
  const pressureKpa = pressurePa / 1000;

  return pressureKpa * kpaToMmHg;
}

/**
 * Calculates CO2 mass in kg corresponding to a given ppCO2 in mmHg.
 */
export function co2MassFromPpMmHg(
  ppMmHg: number,
  cabinVolumeM3: number,
  temperatureK = 294.15,
): number {
  if (cabinVolumeM3 <= 0 || ppMmHg <= 0) return 0;

  const r = getConstant<number>('molar_gas_constant_r');
  const kpaToMmHg = getConstant<number>('kpa_to_mmhg_factor');

  const pressureKpa = ppMmHg / kpaToMmHg;
  const pressurePa = pressureKpa * 1000;
  const molesCo2 = (pressurePa * cabinVolumeM3) / (r * temperatureK);

  return (molesCo2 * CO2_MOLAR_MASS_G) / 1000;
}

/**
 * Computes hours until cabin reaches the 3.0 mmHg limit if CO2 removal is offline.
 * Returns Infinity if removal is online and generation is non-positive.
 */
export function calculateHoursToCo2Limit(
  currentPpMmHg: number,
  cabinVolumeM3: number,
  netHourlyCo2Kg: number,
): number {
  const limitMmHg = getConstant<number>('ppco2_max_1hr_average_mmhg'); // 3.0 mmHg

  if (currentPpMmHg >= limitMmHg) return 0;
  if (netHourlyCo2Kg <= 0) return Infinity;

  const currentMassKg = co2MassFromPpMmHg(currentPpMmHg, cabinVolumeM3);
  const limitMassKg = co2MassFromPpMmHg(limitMmHg, cabinVolumeM3);
  const massDeltaNeededKg = limitMassKg - currentMassKg;

  return massDeltaNeededKg / netHourlyCo2Kg;
}

/**
 * Student-tier cognitive & physical performance penalty curve.
 * Baseline nominal: 1.0 (no penalty) when ppCO2 <= 3.0 mmHg.
 * Elevates gradually between 3.0 and 8.0 mmHg.
 */
export function calculateCo2PerformancePenalty(ppMmHg: number): number {
  const limit = getConstant<number>('ppco2_max_1hr_average_mmhg'); // 3.0
  if (ppMmHg <= limit) return 1.0;

  // Student assumption: ~8% cognitive friction penalty per mmHg above 3.0
  const excess = ppMmHg - limit;
  return Math.max(0.4, 1.0 - excess * 0.08);
}

