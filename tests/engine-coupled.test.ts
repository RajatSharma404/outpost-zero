import { describe, it, expect } from 'vitest';
import {
  calculateCrewMemberEER,
  o2FromMetabolicMj,
  co2FromMetabolicMj,
  calculateCrewMemberMetabolism,
  DEFAULT_REFERENCE_CREW,
} from '../src/engine/crew';
import { processSabatier, processWrs, createDefaultEclssSuite } from '../src/engine/eclss';
import { calculatePpCo2MmHg, calculateHoursToCo2Limit } from '../src/engine/atmosphere';
import { VEHICLE_PRESETS, evaluateVehicleFeasibility } from '../src/engine/vehicles';
import { auditDailyMassBalance } from '../src/engine/mass-balance';
import { calculateBreakEvenCurves } from '../src/engine/breakeven';
import { runFullSimulation } from '../src/engine/sim';
import type { SimulationConfig, CrewMember } from '../src/engine/types';

describe('Coupled Life-Support & Logistics Engine Tests', () => {
  // Test 1: Reference astronaut EER calculation
  it('calculates reference astronaut EER ~3,075 kcal with 662 constant', () => {
    const refAstronaut: CrewMember = {
      id: 'test_ref_cm',
      name: 'NASA Reference Male',
      sex: 'male',
      age: 45,
      massKg: 82.4,
      heightM: 1.786,
      activityFactor: 1.25,
      evaHoursPerWeek: 0,
    };

    const eer = calculateCrewMemberEER(refAstronaut);
    // Erratum arithmetic: 662 - 9.53*45 + 1.25*(15.9*82.4 + 539.6*1.786) = 3075.5 kcal
    expect(eer).toBeGreaterThanOrEqual(3070);
    expect(eer).toBeLessThanOrEqual(3080);
    expect(Math.round(eer)).toBe(3076);
  });

  // Test 2: O2 and CO2 for 12.0-12.8 MJ/d matches BVAD within +/-3%
  it('couples O2 and CO2 consumption/production for 12.0 - 12.8 MJ/d within +/-3%', () => {
    // 12.027 MJ nominal BVAD reference: O2 ~0.84 kg, CO2 ~1.01 kg
    const o2Nominal = o2FromMetabolicMj(12.027);
    const co2Nominal = co2FromMetabolicMj(12.027);

    expect(o2Nominal).toBeGreaterThanOrEqual(0.84 * 0.97);
    expect(o2Nominal).toBeLessThanOrEqual(0.84 * 1.03);

    expect(co2Nominal).toBeGreaterThanOrEqual(1.01 * 0.97);
    expect(co2Nominal).toBeLessThanOrEqual(1.01 * 1.03);

    // 12.778 MJ exercise-heavy BVAD case: O2 ~0.90 kg, CO2 ~1.08 kg
    const o2Exercise = o2FromMetabolicMj(12.778);
    const co2Exercise = co2FromMetabolicMj(12.778);

    expect(o2Exercise).toBeGreaterThanOrEqual(0.90 * 0.97);
    expect(o2Exercise).toBeLessThanOrEqual(0.90 * 1.03);

    expect(co2Exercise).toBeGreaterThanOrEqual(1.08 * 0.97);
    expect(co2Exercise).toBeLessThanOrEqual(1.08 * 1.03);
  });

  // Test 3: 5th and 95th percentile cases
  it('matches 5th and 95th percentile metabolic rates within +/-3%', () => {
    // 5th percentile (8.676 MJ): O2 ~0.61 kg, CO2 ~0.74 kg
    const o2Small = o2FromMetabolicMj(8.676);
    const co2Small = co2FromMetabolicMj(8.676);

    expect(o2Small).toBeGreaterThanOrEqual(0.61 * 0.97);
    expect(o2Small).toBeLessThanOrEqual(0.61 * 1.03);

    expect(co2Small).toBeGreaterThanOrEqual(0.74 * 0.97);
    expect(co2Small).toBeLessThanOrEqual(0.74 * 1.03);

    // 95th percentile (15.402 MJ): O2 ~1.08 kg, CO2 ~1.31 kg
    const o2Large = o2FromMetabolicMj(15.402);
    const co2Large = co2FromMetabolicMj(15.402);

    expect(o2Large).toBeGreaterThanOrEqual(1.08 * 0.97);
    expect(o2Large).toBeLessThanOrEqual(1.08 * 1.03);

    expect(co2Large).toBeGreaterThanOrEqual(1.31 * 0.97);
    expect(co2Large).toBeLessThanOrEqual(1.31 * 1.03);
  });

  // Test 4: Sabatier O2 recovery ceiling emerges <= 50%
  it('enforces natural Sabatier O2 recovery ceiling <= 50%', () => {
    // When 1 mole of O2 (32g) is generated via electrolysis, it produces 4g H2.
    // 4g H2 can reduce at most 0.5 moles of CO2 (22g), generating 18g H2O.
    // When electrolyzed, that 18g H2O yields 16g O2 (50% recovery of the 32g O2).
    const co2Exhaled = 1.02; // kg CO2
    // H2 available from electrolyzing water to satisfy 0.84 kg crew O2:
    const h2Available = 0.84 * (4.032 / 31.998); // ~0.1058 kg H2

    const sabatier = processSabatier(co2Exhaled, h2Available, 1.0); // 100% mechanical efficiency
    expect(sabatier.emergentO2RecoveryFraction).toBeLessThanOrEqual(0.5001);
    expect(sabatier.emergentO2RecoveryFraction).toBeGreaterThanOrEqual(0.45);
  });

  // Test 5: WRS recovery 0.935 vs 0.980
  it('correctly models WRS recovery: 0.935 baseline vs 0.980 with Brine Processor Assembly', () => {
    const wastewater = 100.0; // kg

    const wrsHistorical = processWrs(wastewater, false, 1.0);
    expect(wrsHistorical.recoveryEfficiency).toBe(0.935);
    expect(wrsHistorical.potableWaterRecoveredKg).toBeCloseTo(93.5, 1);
    expect(wrsHistorical.brineProducedKg).toBeCloseTo(6.5, 1);

    const wrsBpa = processWrs(wastewater, true, 1.0);
    expect(wrsBpa.recoveryEfficiency).toBe(0.980);
    expect(wrsBpa.potableWaterRecoveredKg).toBeCloseTo(98.0, 1);
    expect(wrsBpa.brineProducedKg).toBeCloseTo(2.0, 1);
  });

  // Test 6: Daily mass-balance audit closure <= 2%
  it('satisfies daily mass-balance conservation within <= 2%', () => {
    const crewMember = DEFAULT_REFERENCE_CREW[0];
    const meta = calculateCrewMemberMetabolism(crewMember);

    const inputs = {
      o2ConsumedKg: meta.o2ConsumptionKg,
      foodConsumedKg: meta.dryFoodNeedKg * 1.42, // dry + inherent moisture (42%)
      waterIngestedKg: meta.fluidTargetL, // drinking + hydration water
    };

    const outputs = {
      co2ExhaledKg: meta.co2ProductionKg,
      respirationVaporKg: meta.respirationVaporKg,
      perspirationSweatKg: meta.perspirationSweatKg,
      urineTotalKg: meta.urineWaterKg + meta.urineSolidsKg,
      fecesTotalKg: meta.fecesWaterKg + meta.fecesSolidsKg,
      shedSolidsKg: 0.04,
    };

    const audit = auditDailyMassBalance(inputs, outputs);
    expect(audit.withinTolerance).toBe(true);
    expect(audit.errorPct).toBeLessThanOrEqual(2.0);
  });

  // Test 7: Monotonicity (more crew or more days never lowers required mass)
  it('satisfies monotonicity: increasing crew or duration never lowers required mass', () => {
    const curve4Crew = calculateBreakEvenCurves(DEFAULT_REFERENCE_CREW.slice(0, 4));
    const curve6Crew = calculateBreakEvenCurves([
      ...DEFAULT_REFERENCE_CREW,
      { ...DEFAULT_REFERENCE_CREW[0], id: 'cm_5', name: 'Extra 1' },
      { ...DEFAULT_REFERENCE_CREW[1], id: 'cm_6', name: 'Extra 2' },
    ]);

    // Check mass monotonicity across durations for same crew
    for (let i = 1; i < curve4Crew.dataPoints.length; i++) {
      const prev = curve4Crew.dataPoints[i - 1];
      const curr = curve4Crew.dataPoints[i];
      expect(curr.allStoredMassKg).toBeGreaterThan(prev.allStoredMassKg);
      expect(curr.recyclingOnlyMassKg).toBeGreaterThan(prev.recyclingOnlyMassKg);
      expect(curr.mixedArchitectureMassKg).toBeGreaterThan(prev.mixedArchitectureMassKg);
    }

    // Check crew size monotonicity at 180 days
    const pt4 = curve4Crew.dataPoints.find((p) => p.days === 180)!;
    const pt6 = curve6Crew.dataPoints.find((p) => p.days === 180)!;
    expect(pt6.allStoredMassKg).toBeGreaterThan(pt4.allStoredMassKg);
    expect(pt6.recyclingOnlyMassKg).toBeGreaterThan(pt4.recyclingOnlyMassKg);
    expect(pt6.mixedArchitectureMassKg).toBeGreaterThan(pt4.mixedArchitectureMassKg);
  });

  // Test 8: Determinism by seed
  it('produces 100% deterministic results for a given PRNG seed', () => {
    const config: SimulationConfig = {
      seed: 424242,
      crew: DEFAULT_REFERENCE_CREW,
      vehicle: VEHICLE_PRESETS.nasa_mth_2020,
      menuType: 'standard',
      eclssUnits: createDefaultEclssSuite(),
      openLoopBackupDays: 30,
      intakeFraction: 1.0,
      storageDegradationYears: 0,
      predeployedFoodLeadTimeMonths: 26,
      predeployedCargoSuccessProb: 0.9,
      phaseDurations: { outbound: 30, surface: 30, return: 30 },
      contingencyExtensionDays: 0,
      shieldingMassKg: 2000,
    };

    const run1 = runFullSimulation(config);
    const run2 = runFullSimulation(config);

    expect(run1.dailyResults.length).toBe(run2.dailyResults.length);
    expect(run1.totalSparesUsed).toBe(run2.totalSparesUsed);

    for (let d = 0; d < run1.dailyResults.length; d++) {
      expect(run1.dailyResults[d].potableWaterRemainingKg).toBe(run2.dailyResults[d].potableWaterRemainingKg);
      expect(run1.dailyResults[d].o2RemainingKg).toBe(run2.dailyResults[d].o2RemainingKg);
      expect(run1.dailyResults[d].ppCo2MmHg).toBe(run2.dailyResults[d].ppCo2MmHg);
    }
  });

  // Test 9: Orion preset flagged infeasible beyond 21 days
  it('flags Orion preset as infeasible beyond 21 days due to standalone duration limit', () => {
    const orion = VEHICLE_PRESETS.orion_capsule;

    // 21 days: feasible
    const result21d = evaluateVehicleFeasibility(orion, 4, 21, 2000, 1.5);
    expect(result21d.isFeasible).toBe(true);

    // 22 days: infeasible due to standalone duration limit
    const result22d = evaluateVehicleFeasibility(orion, 4, 22, 2000, 1.5);
    expect(result22d.isFeasible).toBe(false);
    expect(result22d.bindingConstraint).toBe('standalone_duration');
  });

  // Test 10: Cabin ppCO2 hours-to-limit hand check
  it('calculates hours-to-limit in roughly 5-6 hours for 6 crew in 300 m3 with scrubber off', () => {
    const cabinVolumeM3 = 300.0;
    const startPpMmHg = 1.0;

    // 6 crew exhaling nominal BVAD CO2 (~1.022 kg/day each = 6.132 kg/day total = 0.2555 kg/h)
    const hourlyCo2GenerationKg = (6 * 1.022) / 24;

    const hoursToLimit = calculateHoursToCo2Limit(startPpMmHg, cabinVolumeM3, hourlyCo2GenerationKg);

    // Must fall roughly in the 5-6 hours envelope
    expect(hoursToLimit).toBeGreaterThanOrEqual(5.0);
    expect(hoursToLimit).toBeLessThanOrEqual(6.0);
  });
});
