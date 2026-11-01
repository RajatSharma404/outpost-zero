/**
 * Outpost Zero: Vehicle Presets, Stowage Volumes & Habitability Feasibility
 * Enforces mass limits, pressurized volume balance, standalone duration caps, and NHV thresholds.
 */

import type { Vehicle } from './types';
import { getConstant } from './constants';

export const VEHICLE_PRESETS: Record<string, Vehicle> = {
  orion_capsule: {
    id: 'orion_capsule',
    name: 'Orion Crew Module (Capsule Baseline)',
    maxCrew: 4,
    massCapacityKg: 10400, // Capsule max payload/structure rating
    pressurizedVolumeM3: 20.0,
    habitableVolumeM3: 9.3,
    storageVolumeM3: 2.2,
    systemsVolumeM3: 8.5,
    maxStandaloneDurationDays: 21, // Hard limit for standalone capsule
    sourceTier: 'REQ',
    sourceCitation: 'NASA Orion Crew Module Specifications (NASA-STD-3001)',
  },
  nasa_mth_2020: {
    id: 'nasa_mth_2020',
    name: 'NASA Mars Transit Habitat (NTRS 20200002973)',
    maxCrew: 4,
    massCapacityKg: 45000,
    pressurizedVolumeM3: 306.0,
    habitableVolumeM3: 147.19, // 36.8 m³/person
    storageVolumeM3: 52.0,     // 987 CTBEs
    systemsVolumeM3: 104.0,
    maxStandaloneDurationDays: 1200,
    sourceTier: 'STUDY',
    sourceCitation: 'NTRS 20200002973 (Mars Transit Habitat concept, STUDY)',
  },
  nasa_hab_2011: {
    id: 'nasa_hab_2011',
    name: 'NASA 500-Day Surface Habitat (2011 Concept)',
    maxCrew: 4,
    massCapacityKg: 38000,
    pressurizedVolumeM3: 193.0,
    habitableVolumeM3: 90.0,
    storageVolumeM3: 49.0,
    systemsVolumeM3: 54.0,
    maxStandaloneDurationDays: 600,
    sourceTier: 'STUDY',
    sourceCitation: 'NASA NTRS 20120014530',
  },
  starship_dlr_conservative: {
    id: 'starship_dlr_conservative',
    name: 'Starship DLR Conservative (12 Crew)',
    maxCrew: 12,
    massCapacityKg: 100000,
    pressurizedVolumeM3: 200.0,
    habitableVolumeM3: 90.0, // 7.5 m³/person -> severe NHV penalty
    storageVolumeM3: 45.0,
    systemsVolumeM3: 65.0,
    maxStandaloneDurationDays: 1000,
    sourceTier: 'STUDY',
    sourceCitation: 'DLR Study (Sci Rep 14:11804 / 14:20718)',
  },
  starship_spacex_concept: {
    id: 'starship_spacex_concept',
    name: 'Starship SpaceX Concept (Commercial Estimate)',
    maxCrew: 20,
    massCapacityKg: 100000,
    pressurizedVolumeM3: 1100.0,
    habitableVolumeM3: 550.0,
    storageVolumeM3: 250.0,
    systemsVolumeM3: 300.0,
    maxStandaloneDurationDays: 1000,
    sourceTier: 'STUDY',
    sourceCitation: 'SpaceX Payload Users Guide 2020 / PMC9527650',
  },
  orion_xl_custom: {
    id: 'orion_xl_custom',
    name: 'Orion XL Conceptual Deep Space Variant',
    maxCrew: 6,
    massCapacityKg: 25000,
    pressurizedVolumeM3: 60.0,
    habitableVolumeM3: 25.0,
    storageVolumeM3: 15.0,
    systemsVolumeM3: 20.0,
    maxStandaloneDurationDays: 180,
    sourceTier: 'STUDENT',
    sourceCitation: 'Outpost Zero Educational Sandbox Concept (No official NASA spec)',
  },
};

export interface VehicleFeasibilityResult {
  isFeasible: boolean;
  bindingConstraint: 'mass' | 'pressurized_volume' | 'nhv' | 'standalone_duration' | 'none';
  massMarginKg: number;
  volumeMarginM3: number;
  nhvPerPersonM3: number;
  nhvRating: 'optimal' | 'acceptable' | 'degraded' | 'critical_infeasible';
  maxCrewForPlan: number;
  maxDaysForCrew: number;
  violations: string[];
}

/**
 * Validates whether a mission manifest and crew plan fits within vehicle constraints.
 */
export function evaluateVehicleFeasibility(
  vehicle: Vehicle,
  crewCount: number,
  missionDurationDays: number,
  totalCargoMassKg: number,
  requiredStowageVolumeM3: number,
  subsystemsVolumeM3 = 0,
  scrubberCapacityKgPerDay?: number,
  totalCrewCo2ProductionKgPerDay?: number,
): VehicleFeasibilityResult {
  const violations: string[] = [];
  let isFeasible = true;
  let bindingConstraint: 'mass' | 'pressurized_volume' | 'nhv' | 'standalone_duration' | 'none' = 'none';

  // 1. Standalone duration check (e.g. Orion capsule capped at 21 days)
  if (vehicle.maxStandaloneDurationDays && missionDurationDays > vehicle.maxStandaloneDurationDays) {
    violations.push(
      `Mission duration (${missionDurationDays} d) exceeds ${vehicle.name} standalone certified limit (${vehicle.maxStandaloneDurationDays} d).`
    );
    isFeasible = false;
    bindingConstraint = 'standalone_duration';
  }

  // 2. Mass limit check
  const massMarginKg = vehicle.massCapacityKg - totalCargoMassKg;
  if (massMarginKg < 0) {
    violations.push(
      `Total cargo mass (${totalCargoMassKg.toFixed(0)} kg) exceeds ${vehicle.name} capacity (${vehicle.massCapacityKg.toFixed(0)} kg) by ${Math.abs(massMarginKg).toFixed(0)} kg.`
    );
    isFeasible = false;
    if (bindingConstraint === 'none') bindingConstraint = 'mass';
  }

  // 3. Pressurized volume check
  // Pressurized Volume = NHV + Required Stowage + Systems Volume
  // Short capsule flights (e.g. Orion 21-day envelope) require >= 2.0 m3/person,
  // whereas long-duration multi-month transits require >= 11.3 m3/person (Woolford & Bond emergency limit).
  const isShortCapsuleFlight = Boolean(
    vehicle.maxStandaloneDurationDays &&
    vehicle.maxStandaloneDurationDays <= 21 &&
    missionDurationDays <= 21
  );

  const minRequiredNhvPerPerson = isShortCapsuleFlight
    ? 2.0
    : getConstant<number>('nhv_woolford_bond_emergency_limit_m3');

  const effectiveSystemsVolume = subsystemsVolumeM3 > 0 ? subsystemsVolumeM3 : vehicle.systemsVolumeM3;
  const netAvailableHabitableVolume = vehicle.pressurizedVolumeM3 - (requiredStowageVolumeM3 + effectiveSystemsVolume);
  const volumeMarginM3 = vehicle.pressurizedVolumeM3 - (requiredStowageVolumeM3 + effectiveSystemsVolume + (crewCount * minRequiredNhvPerPerson));

  if (netAvailableHabitableVolume < 0 || volumeMarginM3 < 0) {
    violations.push(
      `Stowage and systems volume (${(requiredStowageVolumeM3 + effectiveSystemsVolume).toFixed(1)} m³) exceeds pressurized hull capacity (${vehicle.pressurizedVolumeM3} m³).`
    );
    isFeasible = false;
    if (bindingConstraint === 'none') bindingConstraint = 'pressurized_volume';
  }

  // 4. Net Habitable Volume (NHV) per person
  // Woolford & Bond long-duration threshold applies to multi-month deep-space transit (>21 days)
  const nhvPerPersonM3 = crewCount > 0 ? Math.max(0, netAvailableHabitableVolume / crewCount) : 0;
  let nhvRating: 'optimal' | 'acceptable' | 'degraded' | 'critical_infeasible' = 'optimal';

  if (isShortCapsuleFlight) {
    // Capsule rated for short flights (e.g. Orion 21-day envelope)
    nhvRating = nhvPerPersonM3 >= 2.0 ? 'acceptable' : 'critical_infeasible';
    if (nhvRating === 'critical_infeasible') {
      violations.push(`Capsule volume (${nhvPerPersonM3.toFixed(1)} m³/person) below minimum physical clearance.`);
      isFeasible = false;
      if (bindingConstraint === 'none') bindingConstraint = 'nhv';
    }
  } else {
    if (nhvPerPersonM3 >= getConstant<number>('nhv_minimum_sme_consensus_m3')) { // 25.0 m³
      nhvRating = 'optimal';
    } else if (nhvPerPersonM3 >= getConstant<number>('nhv_woolford_bond_optimal_limit_m3')) { // 20.0 m³
      nhvRating = 'acceptable';
    } else if (nhvPerPersonM3 >= getConstant<number>('nhv_woolford_bond_emergency_limit_m3')) { // 11.3 m³
      nhvRating = 'degraded';
    } else {
      nhvRating = 'critical_infeasible';
      violations.push(
        `Net Habitable Volume (${nhvPerPersonM3.toFixed(1)} m³/person) falls below emergency threshold (11.3 m³/person). Risk of psychological breakdown.`
      );
      isFeasible = false;
      if (bindingConstraint === 'none') bindingConstraint = 'nhv';
    }
  }

  // Compute max crew supported by volume and mass
  const maxCrewByNhv = Math.floor(Math.max(0, netAvailableHabitableVolume) / 11.3);
  const maxCrewForPlan = Math.min(vehicle.maxCrew, maxCrewByNhv);

  // Compute max days for current crew
  const dailyConsumableMassApprox = crewCount * 3.5; // kg/d rough envelope
  const maxDaysForCrew = dailyConsumableMassApprox > 0
    ? Math.floor(vehicle.massCapacityKg / dailyConsumableMassApprox)
    : 1000;

  // 5. Scrubber Safety Margin Check: Installed capacity must be >= 1.25x crew CO2 production
  if (scrubberCapacityKgPerDay !== undefined && totalCrewCo2ProductionKgPerDay !== undefined) {
    const requiredCapacity = totalCrewCo2ProductionKgPerDay * 1.25;
    if (scrubberCapacityKgPerDay < requiredCapacity) {
      violations.push(
        `CO2 scrubber capacity (${scrubberCapacityKgPerDay.toFixed(2)} kg/d) is below safety margin of 1.25x crew production (${requiredCapacity.toFixed(2)} kg/d required). Risk of cabin CO2 runaway.`
      );
      isFeasible = false;
    }
  }

  return {
    isFeasible,
    bindingConstraint,
    massMarginKg,
    volumeMarginM3,
    nhvPerPersonM3,
    nhvRating,
    maxCrewForPlan: Math.max(1, maxCrewForPlan),
    maxDaysForCrew: Math.min(maxDaysForCrew, vehicle.maxStandaloneDurationDays || 1200),
    violations,
  };
}

/**
 * Checks whether installed scrubber capacity satisfies the >= 1.25x crew production safety margin.
 */
export function validateScrubberCapacity(
  scrubberCapacityKgPerDay: number,
  crewCo2ProductionKgPerDay: number,
): { isSufficient: boolean; marginRatio: number; message?: string } {
  const marginRatio = crewCo2ProductionKgPerDay > 0 ? scrubberCapacityKgPerDay / crewCo2ProductionKgPerDay : Infinity;
  const isSufficient = marginRatio >= 1.25;
  const message = isSufficient
    ? undefined
    : `Scrubber capacity (${scrubberCapacityKgPerDay.toFixed(2)} kg/d) is below 1.25x safety margin of crew production (${crewCo2ProductionKgPerDay.toFixed(2)} kg/d). Required: ${(1.25 * crewCo2ProductionKgPerDay).toFixed(2)} kg/d.`;
  return { isSufficient, marginRatio, message };
}
