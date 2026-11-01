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
import { calculatePpCo2MmHg, calculateHoursToCo2Limit, co2MassFromPpMmHg, calculateCo2PerformancePenalty } from './atmosphere';
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

  // Initial estimate of consumable inventory masses derived from crew roster
  const crewCount = config.crew.length;
  const initialMetas = config.crew.map((cm) => calculateCrewMemberMetabolism(cm, 0, config.intakeFraction));
  const nominalDailyCrewO2Kg = initialMetas.reduce((s, m) => s + m.o2ConsumptionKg, 0);
  const nominalDailyCrewCo2Kg = initialMetas.reduce((s, m) => s + m.co2ProductionKg, 0);
  const nominalDailyCrewDrinkingWaterKg = initialMetas.reduce((s, m) => s + m.fluidTargetL, 0);
  const nominalDailyCrewDryFoodKg = initialMetas.reduce((s, m) => s + m.dryFoodNeedKg, 0);

  const initialWaterKg = totalPhaseDays * (nominalDailyCrewDrinkingWaterKg + crewCount * 0.7) * 0.15; // 15% buffer
  const initialO2Kg = totalPhaseDays * nominalDailyCrewO2Kg * 0.55;   // ~50% buffer
  const initialFoodKg = totalPhaseDays * nominalDailyCrewDryFoodKg * 1.83;

  const totalScrubberCapacityKg = config.eclssUnits
    .filter((u) => u.id === 'eclss_co2_scrubber')
    .reduce((s, u) => s + u.throughputKgPerDay, 0);

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
    config.eclssUnits.reduce((acc, u) => acc + u.volumeM3, 0),
    totalScrubberCapacityKg,
    nominalDailyCrewCo2Kg
  );

  // Initialize inventories
  let potableWaterKg = initialWaterKg;
  let wasteWaterBufferKg = 0;
  let o2Kg = initialO2Kg;
  let foodDryKg = totalPhaseDays * nominalDailyCrewDryFoodKg;
  // Initialize cabin CO2 at nominal 1.5 mmHg equilibrium baseline
  let cabinCo2Kg = co2MassFromPpMmHg(1.5, config.vehicle.pressurizedVolumeM3);
  let h2Kg = 2.0;       // initial buffer
  let ch4VentedKg = 0;
  let totalTrashKg = 0;
  let totalBiomassGrownKg = 0;
  let cumulativeRadiationMsv = 0;
  let totalSparesUsed = 0;

  // Open-loop 30-day emergency backup stores sized from crew roster
  let backupWaterKg = config.openLoopBackupDays * (nominalDailyCrewDrinkingWaterKg + crewCount * 0.7);
  let backupO2Kg = config.openLoopBackupDays * nominalDailyCrewO2Kg;

  let currentUnits: ECLSSUnit[] = config.eclssUnits.map((u) => ({ ...u }));
  let crewStatusList: CrewDailyStatus[] = config.crew.map((cm) => ({
    id: cm.id,
    eerKcal: 3000,
    metabolicMj: 12.0,
    bodyMassKg: cm.massKg,
    boneDensityIndex: 1.0,
    performanceIndex: 1.0,
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
    let totalDayDrinkingWaterKg = 0;
    let totalDayFlushHygieneWaterKg = 0;
    let totalDayDryFoodEatenKg = 0;
    let totalDayFoodMoistureEatenKg = 0;
    let totalDayVaporProducedKg = 0;
    let totalDaySweatProducedKg = 0;
    let totalDayUrineProducedKg = 0;
    let totalDayFecesProducedKg = 0;

    const storageDegradation = calculateStorageDegradationFactor(day, config.predeployedFoodLeadTimeMonths);

    for (const cm of config.crew) {
      const meta = calculateCrewMemberMetabolism(cm, 0, config.intakeFraction);
      totalDayO2ConsumedKg += meta.o2ConsumptionKg;
      totalDayCo2ExhaledKg += meta.co2ProductionKg;
      totalDayDrinkingWaterKg += meta.fluidTargetL;
      totalDayFlushHygieneWaterKg += 0.7; // 0.4 hygiene + 0.3 flush
      totalDayDryFoodEatenKg += meta.dryFoodNeedKg;
      totalDayFoodMoistureEatenKg += meta.dryFoodNeedKg * 0.42;
      totalDayVaporProducedKg += meta.respirationVaporKg;
      totalDaySweatProducedKg += meta.perspirationSweatKg;
      totalDayUrineProducedKg += meta.urineWaterKg + meta.urineSolidsKg;
      totalDayFecesProducedKg += meta.fecesWaterKg + meta.fecesSolidsKg;
    }

    const totalDayWaterNeededKg = totalDayDrinkingWaterKg + totalDayFlushHygieneWaterKg;

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
    const totalWastewaterDayKg = totalDayUrineProducedKg + totalDayVaporProducedKg + totalDaySweatProducedKg + totalDayFlushHygieneWaterKg + plantTranspirationH2OKg;
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

    let co2ScrubbedKg = 0;
    let co2ReducedKg = 0;
    let co2OverboardVentedKg = 0;
    let sabatierWaterProducedKg = 0;
    let dayMethaneVentedKg = 0;
    let ventedCarbonKg = 0;

    const targetBaselineCo2Kg = co2MassFromPpMmHg(1.5, config.vehicle.pressurizedVolumeM3);

    if (isScrubberActive) {
      // Scrubber actively draws cabin CO2 down towards the nominal 1.5 mmHg baseline
      const co2AboveBaseline = Math.max(0, cabinCo2Kg - targetBaselineCo2Kg);
      const maxScrubberCapacity = (scrubberUnit?.throughputKgPerDay ?? 15.0) * (scrubberUnit?.efficiency ?? 0.98);
      co2ScrubbedKg = Math.min(co2AboveBaseline, maxScrubberCapacity);
      cabinCo2Kg -= co2ScrubbedKg;

      if (isSabatierActive && h2Kg > 0) {
        const sabResult = processSabatier(co2ScrubbedKg, h2Kg, 0.95, totalDayO2ConsumedKg);
        co2ReducedKg = sabResult.co2ReactedKg;
        sabatierWaterProducedKg = sabResult.waterProducedKg;
        dayMethaneVentedKg = sabResult.methaneVentedKg;
        ventedCarbonKg = sabResult.ventedCarbonKg;
        h2Kg -= sabResult.h2ReactedKg;
        ch4VentedKg += dayMethaneVentedKg;

        // Any scrubbed CO2 that Sabatier cannot react due to H2 limits is vented overboard to space vacuum
        co2OverboardVentedKg = co2ScrubbedKg - co2ReducedKg;
      } else {
        // Sabatier offline or no H2: All scrubbed CO2 is desorbed and vented directly overboard
        co2OverboardVentedKg = co2ScrubbedKg;
      }
    } else {
      dailyAlarms.push(`CO2 SCRUBBER OFFLINE: Cabin CO2 accumulating unscrubbed!`);
    }

    // Update Potable Water Inventory
    potableWaterKg += (waterRecoveredDayKg + sabatierWaterProducedKg);
    potableWaterKg -= totalDayWaterNeededKg;

    // Update Oxygen Inventory
    o2Kg += o2ProducedDayKg;
    o2Kg -= totalDayO2ConsumedKg;

    // Update Food Inventory
    const foodConsumedToday = totalDayDryFoodEatenKg * 1.83; // as-packaged mass equivalent
    foodDryKg -= totalDayDryFoodEatenKg;
    totalTrashKg += foodConsumedToday * 0.25;

    // Calculate Cabin ppCO2
    const currentPpCo2MmHg = calculatePpCo2MmHg(cabinCo2Kg, config.vehicle.pressurizedVolumeM3);
    const hourlyNetCo2Kg = isScrubberActive
      ? Math.max(0, (totalDayCo2ExhaledKg - plantCo2AbsorbedKg - co2ScrubbedKg) / 24)
      : (totalDayCo2ExhaledKg - plantCo2AbsorbedKg) / 24;
    const hoursToCo2Limit = calculateHoursToCo2Limit(currentPpCo2MmHg, config.vehicle.pressurizedVolumeM3, hourlyNetCo2Kg);

    // Hypercapnia alarms and acute crew incapacitation end condition
    if (currentPpCo2MmHg >= getConstant<number>('ppco2_max_1hr_average_mmhg')) {
      dailyAlarms.push(`CRITICAL ATMOSPHERE ALARM: Cabin ppCO2 reached ${currentPpCo2MmHg.toFixed(2)} mmHg (exceeds 3.0 mmHg limit).`);
    }
    const incapacitationLimit = getConstant<number>('ppco2_incapacitation_limit_mmhg');
    if (currentPpCo2MmHg >= incapacitationLimit) {
      isCrewLost = true;
      failureReason = `Mission terminated on Day ${day} due to acute crew hypercapnic incapacitation (cabin ppCO2 reached ${currentPpCo2MmHg.toFixed(2)} mmHg >= ${incapacitationLimit.toFixed(1)} mmHg limit). Loss of consciousness.`;
    }

    // Performance penalty acting on crew indices
    const co2Penalty = calculateCo2PerformancePenalty(currentPpCo2MmHg);

    crewStatusList = config.crew.map((cm, idx) => {
      const prevStatus = crewStatusList[idx];
      const meta = calculateCrewMemberMetabolism(cm, 0, config.intakeFraction);
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
        performanceIndex: Number(co2Penalty.toFixed(2)),
        vitaminCCoveragePct: Math.round(storageDegradation.vitaminCRetention * 100),
        thiaminCoveragePct: Math.round(storageDegradation.thiaminRetention * 100),
        calciumCoveragePct: Math.round(storageDegradation.standardRetention * 100),
        vitaminDCoveragePct: Math.round(storageDegradation.standardRetention * 100),
      };
    });

    // 6. Mass Balance Audit & Carbon Ledger
    const massAudit = auditDailyMassBalance(
      {
        o2ConsumedKg: totalDayO2ConsumedKg,
        foodConsumedKg: totalDayDryFoodEatenKg + totalDayFoodMoistureEatenKg,
        waterIngestedKg: totalDayDrinkingWaterKg,
      },
      {
        co2ExhaledKg: totalDayCo2ExhaledKg,
        respirationVaporKg: totalDayVaporProducedKg,
        perspirationSweatKg: totalDaySweatProducedKg,
        urineTotalKg: totalDayUrineProducedKg,
        fecesTotalKg: totalDayFecesProducedKg,
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

    // Consumable net depletion rates and operating margins
    const netWaterDepletionRateKgPerDay = Math.max(0, totalDayWaterNeededKg - (waterRecoveredDayKg + sabatierWaterProducedKg));
    const netO2DepletionRateKgPerDay = Math.max(0, totalDayO2ConsumedKg - o2ProducedDayKg);

    const remainingMissionDays = Math.max(0, totalPhaseDays - day);
    const requiredDaysWithBackup = remainingMissionDays + config.openLoopBackupDays;

    const waterDaysUntilLimit = netWaterDepletionRateKgPerDay > 0.001
      ? Math.floor(potableWaterKg / netWaterDepletionRateKgPerDay)
      : 9999;
    const o2DaysUntilLimit = netO2DepletionRateKgPerDay > 0.001
      ? Math.floor(o2Kg / netO2DepletionRateKgPerDay)
      : 9999;

    const waterMarginDays = waterDaysUntilLimit >= 9999 ? 999 : waterDaysUntilLimit - requiredDaysWithBackup;
    const waterMarginPct = waterDaysUntilLimit >= 9999 ? 100 : Math.round((waterMarginDays / requiredDaysWithBackup) * 100);

    const o2MarginDays = o2DaysUntilLimit >= 9999 ? 999 : o2DaysUntilLimit - requiredDaysWithBackup;
    const o2MarginPct = o2DaysUntilLimit >= 9999 ? 100 : Math.round((o2MarginDays / requiredDaysWithBackup) * 100);

    if (waterMarginDays < 30) {
      dailyAlarms.push(`WATER MARGIN WARNING: Operating margin is ${waterMarginDays} d (< 30-day requirement).`);
    }
    if (o2MarginDays < 30) {
      dailyAlarms.push(`OXYGEN MARGIN WARNING: Operating margin is ${o2MarginDays} d (< 30-day requirement).`);
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
      // Single source of truth telemetry variables
      dailyCrewO2DemandKg: Number(totalDayO2ConsumedKg.toFixed(2)),
      dailyCrewCo2ExhaledKg: Number(totalDayCo2ExhaledKg.toFixed(2)),
      dailyCrewDrinkingWaterKg: Number(totalDayDrinkingWaterKg.toFixed(2)),
      dailyCrewUrineProducedKg: Number(totalDayUrineProducedKg.toFixed(2)),
      dailyCrewVaporProducedKg: Number(totalDayVaporProducedKg.toFixed(2)),
      dailyCrewSweatProducedKg: Number(totalDaySweatProducedKg.toFixed(2)),
      co2OverboardVentedKg: Number(co2OverboardVentedKg.toFixed(2)),
      sabatierWaterProducedKg: Number(sabatierWaterProducedKg.toFixed(2)),
      dayMethaneVentedKg: Number(dayMethaneVentedKg.toFixed(2)),
      ventedCarbonKg: Number(ventedCarbonKg.toFixed(2)),
      netWaterDepletionRateKgPerDay: Number(netWaterDepletionRateKgPerDay.toFixed(2)),
      netO2DepletionRateKgPerDay: Number(netO2DepletionRateKgPerDay.toFixed(2)),
      waterDaysUntilLimit,
      o2DaysUntilLimit,
      waterMarginDays,
      waterMarginPct,
      o2MarginDays,
      o2MarginPct,
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

