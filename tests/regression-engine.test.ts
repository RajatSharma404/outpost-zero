import { describe, it, expect } from 'vitest';
import {
  runFullSimulation,
  DEFAULT_REFERENCE_CREW,
  VEHICLE_PRESETS,
  createDefaultEclssSuite,
  processSabatier,
  calculateCrewMemberMetabolism,
  calculatePpCo2MmHg,
  calculateHoursToCo2Limit,
  co2MassFromPpMmHg,
  getConstant,
  validateScrubberCapacity,
  evaluateVehicleFeasibility,
} from '../src/engine';
import type { SimulationConfig } from '../src/engine/types';
import { Mulberry32 } from '../lib/sim/rng';

describe('Mission Telemetry Engine Regression Tests', () => {
  // Baseline 577-day Mars mission configuration
  const default577Config: SimulationConfig = {
    seed: 12345,
    crew: DEFAULT_REFERENCE_CREW,
    vehicle: VEHICLE_PRESETS.nasa_mth_2020,
    menuType: 'standard',
    eclssUnits: createDefaultEclssSuite(),
    openLoopBackupDays: 30,
    intakeFraction: 1.0,
    storageDegradationYears: 0,
    predeployedFoodLeadTimeMonths: 26,
    predeployedCargoSuccessProb: 0.9,
    phaseDurations: { outbound: 180, surface: 217, return: 180 }, // 577 days total
    contingencyExtensionDays: 0,
    shieldingMassKg: 2000,
    realityFactor: 2.0,
  };

  // 1. CO2 Runaway Fix & Scrubber Nominal Equilibrium
  it('1. maintains cabin ppCO2 <= 3.0 mmHg across all 577 days when scrubber is nominal', () => {
    // When scrubber is nominal throughout 577 days
    const nominal577Config: SimulationConfig = {
      ...default577Config,
      realityFactor: 0, // hardware nominal throughout
    };

    const output = runFullSimulation(nominal577Config);
    expect(output.dailyResults.length).toBe(577);

    // Verify every single day holds ppCO2 <= 3.0 mmHg
    for (const step of output.dailyResults) {
      expect(step.ppCo2MmHg).toBeLessThanOrEqual(3.0);
      expect(step.ppCo2MmHg).toBeGreaterThanOrEqual(1.0);
    }

    const day577 = output.dailyResults[576];
    expect(day577.ppCo2MmHg).toBeLessThanOrEqual(3.0);
    console.log(`[REPORT METRICS] Day 577 ppCO2: ${day577.ppCo2MmHg} mmHg`);
    console.log(`[REPORT METRICS] Day 577 Mass-Balance Delta: ${day577.massBalanceAudit.deltaKg.toFixed(3)} kg, Error: ${day577.massBalanceAudit.errorPct.toFixed(2)}%`);
  });

  // 1b. Scrubber Offline -> Hours-to-limit countdown & hand check
  it('1b. predicts hours-to-limit accurately and matches analytical ideal-gas calculation when scrubber is offline', () => {
    const cabinVolumeM3 = 306.0;
    const startPpMmHg = 1.5;
    const crewCo2PerHourKg = (4 * 1.02) / 24; // ~0.17 kg/h for 4 crew

    const hours = calculateHoursToCo2Limit(startPpMmHg, cabinVolumeM3, crewCo2PerHourKg);

    // Analytical calculation:
    // delta P = 3.0 - 1.5 = 1.5 mmHg = 1.5 / 7.50062 kPa = 0.19998 kPa = 199.98 Pa
    // moles = P * V / (R * T) = 199.98 * 306 / (8.31446 * 294.15) = 25.02 mol
    // deltaMassKg = 25.02 * 0.04401 = 1.101 kg
    // hours = 1.101 / 0.17 = 6.47 hours
    expect(hours).toBeCloseTo(6.48, 1);
  });

  // 1c. Incapacitation end condition at ppCO2 >= 15.0 mmHg
  it('1c. terminates mission with acute crew hypercapnic incapacitation when ppCO2 reaches 15.0 mmHg', () => {
    // Disable scrubber to force CO2 accumulation
    const noScrubberUnits = createDefaultEclssSuite().map((u) =>
      u.id === 'eclss_co2_scrubber' ? { ...u, status: 'offline' as const } : u
    );

    const run = runFullSimulation({
      ...default577Config,
      eclssUnits: noScrubberUnits,
    });

    expect(run.success).toBe(false);
    expect(run.summary.toLowerCase()).toContain('acute crew hypercapnic incapacitation');
    expect(run.summary).toContain('ppCO2');
    expect(run.totalDays).toBeLessThan(577);

    const finalStep = run.dailyResults[run.dailyResults.length - 1];
    expect(finalStep.ppCo2MmHg).toBeGreaterThanOrEqual(15.0);
    // Crew performance penalty must have dropped to degraded floor (0.4)
    expect(finalStep.crewStatus[0].performanceIndex).toBeLessThanOrEqual(0.5);
  });

  // 2. Mass Balance Conservation Audit <= 2%
  it('2. closes daily mass-balance conservation within <= 2% error on every sol of the 577-day run', () => {
    const output = runFullSimulation(default577Config);

    let maxErrorPct = 0;
    for (const step of output.dailyResults) {
      expect(step.massBalanceAudit.withinTolerance).toBe(true);
      expect(step.massBalanceAudit.errorPct).toBeLessThanOrEqual(2.0);
      if (step.massBalanceAudit.errorPct > maxErrorPct) {
        maxErrorPct = step.massBalanceAudit.errorPct;
      }
    }

    // Default scenario maximum closure error is well under 1%
    expect(maxErrorPct).toBeLessThanOrEqual(1.5);
  });

  // 3. Single Source of Truth: crew-derived flows from roster
  it('3. derives all metabolic and consumable flows dynamically from crew roster (EER -> MJ -> O2/CO2/fluid)', () => {
    const crewRoster = DEFAULT_REFERENCE_CREW;
    const computedMetas = crewRoster.map((c) => calculateCrewMemberMetabolism(c));

    const totalRosterO2 = computedMetas.reduce((acc, m) => acc + m.o2ConsumptionKg, 0);
    const totalRosterCo2 = computedMetas.reduce((acc, m) => acc + m.co2ProductionKg, 0);
    const totalRosterFluid = computedMetas.reduce((acc, m) => acc + m.fluidTargetL, 0);

    const output = runFullSimulation(default577Config);
    const step1 = output.dailyResults[0];

    // Engine step telemetry must match roster metabolism exactly
    expect(step1.dailyCrewO2DemandKg).toBeCloseTo(totalRosterO2, 2);
    expect(step1.dailyCrewCo2ExhaledKg).toBeCloseTo(totalRosterCo2, 2);
    expect(step1.dailyCrewDrinkingWaterKg).toBeCloseTo(totalRosterFluid, 2);

    // Verify non-flat variation: pilot female vs commander male
    expect(computedMetas[0].o2ConsumptionKg).not.toBe(computedMetas[1].o2ConsumptionKg);
    expect(computedMetas[0].fluidTargetL).not.toBe(computedMetas[1].fluidTargetL);
  });

  // 4. Sabatier Stoichiometry: 0.423 kg H2/d -> 1.89 kg H2O/d and 0.84 kg CH4/d; max O2 recovery 50%
  it('4. calculates exact Sabatier stoichiometry: 0.423 kg H2 -> 1.89 kg H2O and 0.84 kg CH4 with 50% O2 recovery ceiling', () => {
    const h2InputKg = 0.423;
    const co2InputKg = 5.0; // ample CO2 available
    const crewO2DemandBasis = (h2InputKg * 31.998) / 4.032; // ~3.357 kg O2 consumed to yield 0.423 kg H2

    const result = processSabatier(co2InputKg, h2InputKg, 1.0, crewO2DemandBasis);

    expect(result.waterProducedKg).toBeCloseTo(1.89, 2);
    expect(result.methaneVentedKg).toBeCloseTo(0.84, 2);
    expect(result.ventedCarbonKg).toBeCloseTo(0.84 * (12.011 / 16.043), 2);
    expect(result.emergentO2RecoveryFraction).toBeCloseTo(0.50, 2);
  });

  // 5. Reliability & Sparing: Monte Carlo probability of unrecoverable life-support failure ~10% over 577 days
  it('5. validates calibrated ECLSS sparing has ~10% probability of unrecoverable life-support failure over 577 days', () => {
    const defaultUnits = createDefaultEclssSuite();
    const days = 577;
    const realityFactor = 2.0;
    const sampleSize = 1000;
    let unrecoverableRuns = 0;

    for (let s = 0; s < sampleSize; s++) {
      let isUnrecoverable = false;
      const rng = new Mulberry32(10000 + s);

      for (const u of defaultUnits) {
        const mtbfDays = u.mtbfHours / 24;
        const dailyHazard = (realityFactor / mtbfDays);
        let failures = 0;
        for (let d = 0; d < days; d++) {
          if (rng.next() < dailyHazard) {
            failures++;
          }
        }
        if (failures > u.sparesCarried) {
          isUnrecoverable = true;
          break;
        }
      }
      if (isUnrecoverable) {
        unrecoverableRuns++;
      }
    }

    const unrecoverableRatePct = (unrecoverableRuns / sampleSize) * 100;
    // Calibrated target: roughly 10% (8% - 13% statistical band for 1000 seeds)
    expect(unrecoverableRatePct).toBeGreaterThanOrEqual(7.0);
    expect(unrecoverableRatePct).toBeLessThanOrEqual(14.0);
    console.log(`[REPORT METRICS] ECLSS Sparing P(LOC) Unrecoverable Failure Rate: ${unrecoverableRatePct.toFixed(1)}% across 1,000 runs`);
    console.log(`[REPORT METRICS] Expected Failures Per 577-Day Run: ${(5 * (577 * 24 * realityFactor) / 35000).toFixed(2)} failures/run`);
  });

  // 6. Scrubber Sizing Safety Margin: Planner red-flags if capacity < 1.25x crew production
  it('6. red-flags launch if installed scrubber capacity is less than 1.25x crew CO2 production', () => {
    const crewCo2PerDay = 4.08; // kg/d for 4 crew
    const requiredCapacity = crewCo2PerDay * 1.25; // 5.10 kg/d

    // Sufficient capacity (e.g. 15.0 kg/d): pass
    const passCheck = validateScrubberCapacity(15.0, crewCo2PerDay);
    expect(passCheck.isSufficient).toBe(true);
    expect(passCheck.marginRatio).toBeGreaterThanOrEqual(1.25);

    // Undersized capacity (e.g. 4.5 kg/d < 5.10 kg/d): fail with red-flag violation
    const failCheck = validateScrubberCapacity(4.5, crewCo2PerDay);
    expect(failCheck.isSufficient).toBe(false);
    expect(failCheck.marginRatio).toBeLessThan(1.25);
    expect(failCheck.message).toContain('1.25x safety margin');

    // Feasibility validator also registers launch violation
    const orionXL = VEHICLE_PRESETS.nasa_mth_2020;
    const feasibility = evaluateVehicleFeasibility(
      orionXL,
      4,
      577,
      25000,
      40,
      100,
      4.5, // scrubber capacity
      crewCo2PerDay
    );
    expect(feasibility.isFeasible).toBe(false);
    expect(feasibility.violations.some((v) => v.includes('scrubber capacity'))).toBe(true);
  });

  // 7. Sourced Citations Verification
  it('7. verifies correct citations: BVAD Table 4-20 for water and NTRS 20200002973 for 306 m3 habitat', () => {
    const drinkingEntry = getConstant<number>('water_drinking_food_prep');
    expect(drinkingEntry).toBe(2.5);

    const mthHab = VEHICLE_PRESETS.nasa_mth_2020;
    expect(mthHab.pressurizedVolumeM3).toBe(306.0);
    expect(mthHab.sourceCitation).toContain('NTRS 20200002973');
    expect(mthHab.sourceTier).toBe('STUDY');
  });

  // 8. Thiamin Depletion Threshold & Cognitive Impairment Constant Registration
  it('8. verifies thiamin depletion threshold (60%) and incapacitation threshold (15.0 mmHg) in registry', () => {
    const thiaminThreshold = getConstant<number>('thiamin_depletion_threshold_pct');
    expect(thiaminThreshold).toBe(60.0);

    const incapacitationLimit = getConstant<number>('ppco2_incapacitation_limit_mmhg');
    expect(incapacitationLimit).toBe(15.0);

    const calibrationTarget = getConstant<number>('eclss_failure_calibration_target_loc_pct');
    expect(calibrationTarget).toBe(10.0);
  });
});
