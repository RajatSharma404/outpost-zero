/**
 * Outpost Zero: Pure Coupled Simulation Engine
 * Stepping day-by-day across Outbound, Surface, and Return phases.
 * 100% deterministic given a PRNG seed. Pure TypeScript (zero React/DOM imports).
 */

import type {
  SimulationConfig,
  SimulationOutput,
  DailyStepResult,
  Inventories,
  MissionPhase,
  ECLSSUnit,
  CrewDailyStatus,
} from './types';
import { getConstant } from './constants';
import { calculateCrewMemberMetabolism } from './crew';
import { calculatePpCo2MmHg, calculateHoursToCo2Limit } from './atmosphere';
import { processWrs, processElectrolysis, processSabatier, processPlantGrowth } from './eclss';
import { calculateMenuDailySpecs, calculateStorageDegradationFactor, calculateHealthIndices } from './nutrition';
import { auditDailyMassBalance, updateCarbonLedger } from './mass-balance';
import { evaluateUnitFailures } from './reliability';
import { evaluateVehicleFeasibility } from './vehicles';
import { Mulberry32 } from '../../lib/sim/rng';

export function runFullSimulation(config: SimulationConfig): SimulationOutput {
  const rng = new Mulberry32(config.seed || 404);

  // 1. Evaluate vehicle feasibility upfront
  const totalPhaseDays =
    config.phaseDurations.outbound +
    config.phaseDurations.surface +
    config.phaseDurations.return +
    config.contingencyExtensionDays;

  // Initial estimate of consumable inventory masses
  const crewCount = config.crew.length;
  const initialWaterKg = crewCount * totalPhaseDays * 2.5 * 0.15; // 15% buffer
  const initialO2Kg = crewCount * totalPhaseDays * 0.84 * 0.55;   // ~50% buffer
  const initialFoodKg = crewCount * totalPhaseDays * 1.83;

  const initialCargoMassKg =
    initialWaterKg +
    initialO2Kg +
    initialFoodKg +
    config.eclssUnits.reduce((acc, u) => acc + u.massKg + u.sparesCarried * 40, 0) +
    config.shieldingMassKg;

  const initialStowageVolumeM3 = (initialFoodKg / 300) + (initialWaterKg / 1000) + (initialO2Kg / 200);

  const vehicleFeasibility = evaluateVehicleFeasibility(
    config.vehicle,
    crewCount,
    totalPhaseDays,
    initialCargoMassKg,
    initialStowageVolumeM3,
    config.eclssUnits.reduce((acc, u) => acc + u.volumeM3, 0)
  );

  // Initialize inventories
  let potableWaterKg = initialWaterKg;
  let wasteWaterBufferKg = 0;
  let o2Kg = initialO2Kg;
  let foodDryKg = initialFoodKg * 0.45;
  let cabinCo2Kg = 0.5; // nominal starting trace cabin CO2
  let h2Kg = 2.0;       // initial buffer
  let ch4VentedKg = 0;
  let totalTrashKg = 0;
  let totalBiomassGrownKg = 0;
  let cumulativeRadiationMsv = 0;
  let totalSparesUsed = 0;

  // Open-loop 30-day emergency backup stores
  let backupWaterKg = config.openLoopBackupDays * crewCount * 2.5;
  let backupO2Kg = config.openLoopBackupDays * crewCount * 0.84;

  let currentUnits: ECLSSUnit[] = config.eclssUnits.map((u) => ({ ...u }));
  let crewStatusList: CrewDailyStatus[] = config.crew.map((cm) => ({
    id: cm.id,
    eerKcal: 3000,
    metabolicMj: 12.0,
    bodyMassKg: cm.massKg,
    boneDensityIndex: 1.0,
    vitaminCCoveragePct: 100,
    thiaminCoveragePct: 100,
    calciumCoveragePct: 100,
    vitaminDCoveragePct: 100,
  }));

  const dailyResults: DailyStepResult[] = [];
  let isCrewLost = false;
  let failureReason: string | undefined = undefined;

  // If vehicle standalone limit breached on day 1 (e.g. Orion for >21 days)
  if (config.vehicle.maxStandaloneDurationDays && totalPhaseDays > config.vehicle.maxStandaloneDurationDays) {
    isCrewLost = true;
    failureReason = `Vehicle ${config.vehicle.name} duration capability exceeded. Certified for max ${config.vehicle.maxStandaloneDurationDays} days.`;
  }

  // Daily stepping loop
  let currentSol = 1;
  const outboundDays = config.phaseDurations.outbound;
  const surfaceDays = config.phaseDurations.surface;
  const returnDays = config.phaseDurations.return + config.contingencyExtensionDays;

  for (let day = 1; day <= totalPhaseDays; day++) {
    let phase: MissionPhase = 'outbound';
    if (day > outboundDays && day <= outboundDays + surfaceDays) {
      phase = 'surface';
      currentSol = Math.floor((day - outboundDays) / getConstant<number>('sol_to_earth_days_factor')) + 1;
    } else if (day > outboundDays + surfaceDays) {
      phase = 'return';
    }

    const dailyAlarms: string[] = [];
    const dailyEvents: string[] = [];

    // 1. Radiation Exposure Step
    // Cruise: 1.84 mSv/d unshielded. Surface: 0.67 mSv/sol.
    // Shielding attenuation: mass attenuation factor e^(-0.0005 * shieldingKg)
    const shieldingFactor = Math.max(0.35, Math.exp(-0.00008 * config.shieldingMassKg));
    const dailyRawDose = phase === 'surface'
      ? getConstant<number>('surface_radiation_dose_msv_per_sol')
      : getConstant<number>('gcr_cruise_dose_rate_msv_per_day');
    const dailyDoseEffective = dailyRawDose * shieldingFactor;
    cumulativeRadiationMsv += dailyDoseEffective;

    if (cumulativeRadiationMsv >= getConstant<number>('career_radiation_limit_msv')) {
      dailyAlarms.push(`RADIATION WARNING: Cumulative crew dose reached ${cumulativeRadiationMsv.toFixed(1)} mSv (exceeds NASA 600 mSv career limit).`);
    }

    // 2. Hardware Reliability & Failures
    const realityFactor = config.realityFactor || 2.0;
    const failureCheck = evaluateUnitFailures(currentUnits, day, rng, realityFactor);
    currentUnits = failureCheck.updatedUnits;
    for (const ev of failureCheck.events) {
      dailyEvents.push(ev.message);
      if (ev.message.includes('FAILURE:')) {
        totalSparesUsed++;
      }
    }

    const wrsUnit = currentUnits.find((u) => u.id === 'eclss_wrs');
    const bpaUnit = currentUnits.find((u) => u.id === 'eclss_bpa');
    const ogsUnit = currentUnits.find((u) => u.id === 'eclss_ogs');
    const sabatierUnit = currentUnits.find((u) => u.id === 'eclss_sabatier');
    const scrubberUnit = currentUnits.find((u) => u.id === 'eclss_co2_scrubber');

    const isWrsActive = wrsUnit && wrsUnit.status === 'nominal';
    const isBpaActive = bpaUnit && bpaUnit.status === 'nominal';
    const isOgsActive = ogsUnit && ogsUnit.status === 'nominal';
    const isSabatierActive = sabatierUnit && sabatierUnit.status === 'nominal';
    const isScrubberActive = scrubberUnit && scrubberUnit.status === 'nominal';

    // 3. Crew Metabolism & Nutrient Degradation
    let totalDayO2ConsumedKg = 0;
    let totalDayCo2ExhaledKg = 0;
    let totalDayWaterNeededKg = 0;
    let totalDayDryFoodEatenKg = 0;
    let totalDayVaporProducedKg = 0;
    let totalDaySweatProducedKg = 0;
    let totalDayUrineProducedKg = 0;

    const storageDegradation = calculateStorageDegradationFactor(day, config.predeployedFoodLeadTimeMonths);

    crewStatusList = config.crew.map((cm, idx) => {
      const prevStatus = crewStatusList[idx];
      const meta = calculateCrewMemberMetabolism(cm, 0, config.intakeFraction);
      const menuSpecs = calculateMenuDailySpecs(cm, config.menuType);

      totalDayO2ConsumedKg += meta.o2ConsumptionKg;
      totalDayCo2ExhaledKg += meta.co2ProductionKg;
      totalDayWaterNeededKg += meta.fluidTargetL + 0.7; // fluid + flush/hygiene
      totalDayDryFoodEatenKg += menuSpecs.dryFoodKg;
      totalDayVaporProducedKg += meta.respirationVaporKg;
      totalDaySweatProducedKg += meta.perspirationSweatKg;
      totalDayUrineProducedKg += meta.urineWaterKg + meta.urineSolidsKg;

      const health = calculateHealthIndices(
        prevStatus.bodyMassKg,
        meta.eerKcal,
        meta.eerKcal * config.intakeFraction,
        prevStatus.boneDensityIndex,
        cm.activityFactor,
        storageDegradation.standardRetention,
        storageDegradation.standardRetention,
        1
      );

      return {
        id: cm.id,
        eerKcal: Math.round(meta.eerKcal),
        metabolicMj: Number(meta.metabolicMj.toFixed(2)),
        bodyMassKg: Number(health.newBodyMassKg.toFixed(2)),
        boneDensityIndex: Number(health.boneDensityIndex.toFixed(3)),
        vitaminCCoveragePct: Math.round(storageDegradation.vitaminCRetention * 100),
        thiaminCoveragePct: Math.round(storageDegradation.thiaminRetention * 100),
        calciumCoveragePct: Math.round(storageDegradation.standardRetention * 100),
        vitaminDCoveragePct: Math.round(storageDegradation.standardRetention * 100),
      };
    });

    // 4. Bioregenerative Crop Output
    let plantFreshFoodKg = 0;
    let plantO2Kg = 0;
    let plantCo2AbsorbedKg = 0;
    let plantTranspirationH2OKg = 0;

    if (config.plantsAreaM2 && config.plantsAreaM2 > 0) {
      const plantResult = processPlantGrowth(config.plantsAreaM2, 1);
      plantFreshFoodKg = plantResult.freshFoodKg;
      plantO2Kg = plantResult.o2ProducedKg;
      plantCo2AbsorbedKg = plantResult.co2AbsorbedKg;
      plantTranspirationH2OKg = plantResult.transpirationWaterKg;
      totalBiomassGrownKg += plantResult.dryMassKg;
    }

    // 5. Life Support Processing Loops
    // A. Wastewater & WRS
    const totalWastewaterDayKg = totalDayUrineProducedKg + totalDayVaporProducedKg + totalDaySweatProducedKg + plantTranspirationH2OKg;
    wasteWaterBufferKg += totalWastewaterDayKg;

    let waterRecoveredDayKg = 0;
    if (isWrsActive) {
      const wrsResult = processWrs(wasteWaterBufferKg, Boolean(isBpaActive), 1.0);
      waterRecoveredDayKg = wrsResult.potableWaterRecoveredKg;
      wasteWaterBufferKg = 0; // all processed
    } else {
      // Drawdown emergency open-loop backup water if WRS is failed
      if (backupWaterKg > 0) {
        const draw = Math.min(backupWaterKg, totalDayWaterNeededKg);
        backupWaterKg -= draw;
        dailyAlarms.push(`WRS OFFLINE: Drawing emergency backup water (${draw.toFixed(1)} kg used). Backup remaining: ${backupWaterKg.toFixed(1)} kg.`);
      }
    }

    // B. Oxygen Generation (Electrolysis) & OGS
    let o2ProducedDayKg = plantO2Kg;
    let h2ProducedDayKg = 0;

    if (isOgsActive) {
      // Net O2 demand to make up
      const netO2Needed = Math.max(0, totalDayO2ConsumedKg - plantO2Kg);
      const ogaResult = processElectrolysis(netO2Needed);
      o2ProducedDayKg += ogaResult.o2ProducedKg;
      h2ProducedDayKg += ogaResult.h2ProducedKg;
      // Deduct water split by electrolysis
      potableWaterKg -= ogaResult.waterConsumedKg;
    } else {
      if (backupO2Kg > 0) {
        const draw = Math.min(backupO2Kg, totalDayO2ConsumedKg);
        backupO2Kg -= draw;
        dailyAlarms.push(`OGA OFFLINE: Drawing emergency backup oxygen (${draw.toFixed(1)} kg used). Backup remaining: ${backupO2Kg.toFixed(1)} kg.`);
      }
    }

    h2Kg += h2ProducedDayKg;

    // C. Carbon Dioxide Scrubbing & Sabatier
    cabinCo2Kg += (totalDayCo2ExhaledKg - plantCo2AbsorbedKg);

    let co2ReducedKg = 0;
    let sabatierWaterProducedKg = 0;
    let dayMethaneVentedKg = 0;

    if (isScrubberActive && isSabatierActive && cabinCo2Kg > 0.5) {
      const co2ToProcess = Math.min(cabinCo2Kg, 10.0);
      const sabResult = processSabatier(co2ToProcess, h2Kg, 0.95);
      co2ReducedKg = sabResult.co2ReactedKg;
      sabatierWaterProducedKg = sabResult.waterProducedKg;
      dayMethaneVentedKg = sabResult.methaneVentedKg;
      cabinCo2Kg -= co2ReducedKg;
      h2Kg -= sabResult.h2ReactedKg;
      ch4VentedKg += dayMethaneVentedKg;
    } else if (!isScrubberActive) {
      dailyAlarms.push(`CO2 SCRUBBER OFFLINE: Cabin CO2 accumulating!`);
    }

    // Update Potable Water Inventory
    potableWaterKg += (waterRecoveredDayKg + sabatierWaterProducedKg);
    potableWaterKg -= totalDayWaterNeededKg;

    // Update Oxygen Inventory
    o2Kg += o2ProducedDayKg;
    o2Kg -= totalDayO2ConsumedKg;

    // Update Food Inventory
    const foodConsumedToday = totalDayDryFoodEatenKg * 1.83; // as-packaged
    foodDryKg -= foodConsumedToday;
    totalTrashKg += foodConsumedToday * 0.25;

    // Calculate Cabin ppCO2
    const currentPpCo2MmHg = calculatePpCo2MmHg(cabinCo2Kg, config.vehicle.pressurizedVolumeM3);
    const hourlyNetCo2Kg = Math.max(0.01, (totalDayCo2ExhaledKg - co2ReducedKg) / 24);
    const hoursToCo2Limit = calculateHoursToCo2Limit(currentPpCo2MmHg, config.vehicle.pressurizedVolumeM3, hourlyNetCo2Kg);

    if (currentPpCo2MmHg >= getConstant<number>('ppco2_max_1hr_average_mmhg')) {
      dailyAlarms.push(`CRITICAL ATMOSPHERE ALARM: Cabin ppCO2 reached ${currentPpCo2MmHg.toFixed(2)} mmHg (exceeds 3.0 mmHg limit).`);
    }

    // Check for consumable exhaustion
    if (potableWaterKg <= 0 && backupWaterKg <= 0) {
      isCrewLost = true;
      failureReason = `Mission terminated on Day ${day} due to catastrophic dehydration. Potable water and emergency backup exhausted.`;
    }
    if (o2Kg <= 0 && backupO2Kg <= 0) {
      isCrewLost = true;
      failureReason = `Mission terminated on Day ${day} due to asphyxiation. Oxygen stores exhausted.`;
    }
    if (foodDryKg <= 0) {
      isCrewLost = true;
      failureReason = `Mission terminated on Day ${day} due to acute starvation. Food supplies depleted.`;
    }

    // 6. Mass Balance Audit & Carbon Ledger
    const massAudit = auditDailyMassBalance(
      {
        o2ConsumedKg: totalDayO2ConsumedKg,
        foodConsumedKg: totalDayDryFoodEatenKg * 1.4,
        waterIngestedKg: totalDayWaterNeededKg,
      },
      {
        co2ExhaledKg: totalDayCo2ExhaledKg,
        respirationVaporKg: totalDayVaporProducedKg,
        perspirationSweatKg: totalDaySweatProducedKg,
        urineTotalKg: totalDayUrineProducedKg,
        fecesTotalKg: 0.12 * crewCount,
        shedSolidsKg: 0.04 * crewCount,
      }
    );

    const carbonLedger = updateCarbonLedger(
      totalDayDryFoodEatenKg,
      totalDayCo2ExhaledKg,
      dayMethaneVentedKg,
      0.05 * crewCount,
      plantFreshFoodKg * 0.10
    );

    dailyResults.push({
      day,
      sol: currentSol,
      phase,
      ppCo2MmHg: Number(currentPpCo2MmHg.toFixed(2)),
      hoursToCo2Limit: Number(hoursToCo2Limit.toFixed(1)),
      massBalanceAudit: massAudit,
      carbonLedger,
      cumulativeRadiationMsv: Number(cumulativeRadiationMsv.toFixed(2)),
      crewStatus: crewStatusList,
      activeAlarms: dailyAlarms,
      unitEvents: dailyEvents,
      isCrewLost,
      failureReason,
      waterSurplusOrDeficitKg: Number((waterRecoveredDayKg + sabatierWaterProducedKg - totalDayWaterNeededKg).toFixed(2)),
      o2SurplusOrDeficitKg: Number((o2ProducedDayKg - totalDayO2ConsumedKg).toFixed(2)),
      foodSurplusOrDeficitKg: Number((-foodConsumedToday).toFixed(2)),
      potableWaterRemainingKg: Math.max(0, Number(potableWaterKg.toFixed(1))),
      o2RemainingKg: Math.max(0, Number(o2Kg.toFixed(1))),
      foodRemainingKg: Math.max(0, Number(foodDryKg.toFixed(1))),
    });

    if (isCrewLost) {
      break;
    }
  }

  const finalDay = dailyResults[dailyResults.length - 1];
  const success = !isCrewLost && vehicleFeasibility.isFeasible;

  const finalInventories: Inventories = {
    potableWater: { kg: Math.max(0, potableWaterKg), volumeM3: potableWaterKg / 1000 },
    wasteWater: { kg: wasteWaterBufferKg, volumeM3: wasteWaterBufferKg / 1000 },
    brine: { kg: 20, volumeM3: 0.02 },
    o2: { kg: Math.max(0, o2Kg), volumeM3: o2Kg / 200 },
    n2: { kg: 30, volumeM3: 0.03 },
    cabinCo2: { kg: cabinCo2Kg, volumeM3: cabinCo2Kg / 1.98 },
    h2: { kg: h2Kg, volumeM3: h2Kg / 0.089 },
    ch4Vented: { kg: ch4VentedKg, volumeM3: ch4VentedKg / 0.65 },
    foodDry: { kg: Math.max(0, foodDryKg), volumeM3: foodDryKg / 300 },
    foodPackaged: { kg: Math.max(0, foodDryKg * 1.8), volumeM3: (foodDryKg * 1.8) / 300 },
    foodFrozen: { kg: 0, volumeM3: 0 },
    foodFresh: { kg: totalBiomassGrownKg, volumeM3: totalBiomassGrownKg / 200 },
    hygieneItems: { kg: 20, volumeM3: 0.04 },
    clothing: { kg: 30, volumeM3: 0.06 },
    trash: { kg: totalTrashKg, volumeM3: totalTrashKg / 150 },
    spares: currentUnits.reduce((acc, u) => ({ ...acc, [u.id]: u.sparesCarried }), {}),
  };

  return {
    success,
    totalDays: dailyResults.length,
    dailyResults,
    finalInventories,
    bindingConstraint: vehicleFeasibility.bindingConstraint,
    nhvPerPersonM3: vehicleFeasibility.nhvPerPersonM3,
    maxCrewForPlan: vehicleFeasibility.maxCrewForPlan,
    maxDaysForCrew: vehicleFeasibility.maxDaysForCrew,
    totalSparesUsed,
    summary: success
      ? `Mission sustained ${crewCount} crew across ${totalPhaseDays} days. All mass-balance and habitability invariants met.`
      : failureReason || vehicleFeasibility.violations.join('; '),
  };
}
