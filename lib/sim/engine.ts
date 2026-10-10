import type {
  SimulationState,
  Loadout,
  LedgerEntry,
  StepResult,
  EndCondition,
  MeterType,
} from './types';
import { Mulberry32 } from './rng';
import { CONSTANTS, ITEMS, getConstantValue, getItem } from '../data';
import { rollForEvent, applyChoice } from './events';

export function initializeSimulation(loadout: Loadout): SimulationState {
  const maxSols = loadout.mode === 'tutorial' ? 60 : loadout.mode === 'standard' ? 180 : 500;
  const crewCount = getConstantValue('crew_size', 4);

  // Compute initial battery storage capacity
  let batteryCap = 40; // baseline lander bus buffer
  for (const id of loadout.itemIds) {
    if (id === 'battery_bank') {
      batteryCap += 120;
    }
  }

  return {
    sol: 1,
    maxSols,
    mode: loadout.mode,
    seed: loadout.seed,
    loadout,
    crew: {
      count: crewCount,
      health: 100,
    },
    meters: {
      powerStoredKwh: batteryCap * 0.8, // landed with 80% charge
      o2Kg: loadout.consumables.o2Kg,
      waterKg: loadout.consumables.waterKg,
      foodKg: loadout.consumables.foodKg,
      doseMsvPerCrew: 0,
      morale: 85,
    },
    batteryCapacityKwh: batteryCap,
    status: 'running',
    consecutiveO2Zero: 0,
    consecutiveWaterZero: 0,
    consecutiveFoodZero: 0,
    consecutiveMoraleZero: 0,
    activeEffects: [],
    equipment: loadout.itemIds.map((id) => ({
      itemId: id,
      status: 'ok',
      efficiency: 1.0,
    })),
    ledger: [],
    eventHistory: [],
    brownoutLoadsShed: [],
    resupplyAccepted: false,
  };
}

/**
 * Pure step function for a single sol.
 * If decision is provided, resolves the pending event choice first.
 */
export function step(state: SimulationState, decisionChoiceId?: string): StepResult {
  // If game is already ended, return as is
  if (state.status === 'completed' || state.status === 'failed') {
    return { state, ledgerDelta: [] };
  }

  let currentState = state;
  const ledgerDelta: LedgerEntry[] = [];

  // If there was a pending event and user provided a choice, resolve it now
  if (currentState.pendingEvent && decisionChoiceId) {
    const resolved = applyChoice(currentState, decisionChoiceId);
    currentState = resolved.state;
    ledgerDelta.push(...resolved.ledgerDeltas);
  }

  // If still paused waiting for event choice, do not advance sol
  if (currentState.pendingEvent) {
    return { state: currentState, ledgerDelta };
  }

  const currentSol = currentState.sol;
  // Initialize seeded PRNG specific to this sol and seed for pure reproducibility
  const solSeed = (currentState.seed + currentSol * 1337) >>> 0;
  const rng = new Mulberry32(solSeed);

  // 1. Tick and expire finished active effects
  const nextActiveEffects = currentState.activeEffects
    .map((eff) => ({ ...eff, remainingSols: eff.remainingSols - 1 }))
    .filter((eff) => eff.remainingSols > 0);

  // 1b. Check and roll for new event on this sol
  const rolledEvent = rollForEvent(
    { ...currentState, activeEffects: nextActiveEffects },
    rng,
  );

  if (rolledEvent) {
    // Pause state for player choice
    const pausedState: SimulationState = {
      ...currentState,
      activeEffects: nextActiveEffects,
      status: 'paused_event',
      pendingEvent: rolledEvent,
    };
    return { state: pausedState, ledgerDelta };
  }

  // --- Physical constants ---
  const solHours = getConstantValue('sol_length_hours', 24.66);
  const baseHabPowerKw = getConstantValue('habitat_base_load_kw', 6);
  const o2PerCrew = getConstantValue('o2_per_crew_per_sol_kg', 0.84);
  const waterPerCrew = getConstantValue('water_per_crew_per_sol_kg', 3.5);
  const foodPerCrew = getConstantValue('food_dry_per_crew_per_sol_kg', 0.62);
  const dailyKcalNeed = getConstantValue('food_kcal_per_crew_per_sol', 2500) * currentState.crew.count;
  const baseDosePerSol = getConstantValue('mars_radiation_msv_per_sol', 0.67);
  const doseLimit = getConstantValue('dose_limit_mission_msv', 250);
  const radiationGameScale = getConstantValue('radiation_gameScale', 10);

  // Active environmental modifiers
  let dustFactor = 0; // 0 = clear, 0.9 = severe storm
  let additionalDemandKw = 0;
  let fissionThrottledFactor = 1.0;
  let eclssDegraded = false;

  for (const eff of nextActiveEffects) {
    if (eff.target === 'dustFactor' && eff.set !== undefined) {
      dustFactor = Math.max(dustFactor, eff.set);
    }
    if (eff.target === 'powerDemandKw' && eff.add) {
      additionalDemandKw += eff.add;
    }
    if (eff.target === 'fissionThrottled' && eff.set !== undefined) {
      fissionThrottledFactor = Math.min(fissionThrottledFactor, eff.set);
    }
    if (eff.target === 'eclssDegraded' && eff.set === 1) {
      eclssDegraded = true;
    }
  }

  // 2. Power Generation
  let solarGenKw = 0;
  let fissionGenKw = 0;

  for (const itemId of currentState.loadout.itemIds) {
    if (itemId === 'solar_small') solarGenKw += 5;
    if (itemId === 'solar_large') solarGenKw += 12;
    if (itemId === 'fission_unit') fissionGenKw += 10 * fissionThrottledFactor;
  }

  // Solar output attenuated by dust factor and seasonal orbit variation (~5% wave)
  const seasonFactor = 1.0 + 0.05 * Math.sin((currentSol / 300) * Math.PI * 2);
  const effectiveSolarKw = solarGenKw * Math.max(0.05, 1.0 - dustFactor) * seasonFactor;
  const totalPowerGenKw = effectiveSolarKw + fissionGenKw;
  const dailyGeneratedKwh = totalPowerGenKw * solHours;

  // 3. Power Demand
  let totalDemandKw = baseHabPowerKw + additionalDemandKw;
  const equipmentPowerMap: Record<string, number> = {
    rec_module: 0.5,
    greenhouse_small: 3.0,
    greenhouse_large: 6.0,
    moxie_scaleup: 4.0,
    eclss_recycler: 3.0,
    medical_kit: 0.5,
  };

  const loadsPresent: string[] = [];
  for (const itemId of currentState.loadout.itemIds) {
    if (equipmentPowerMap[itemId]) {
      totalDemandKw += equipmentPowerMap[itemId];
      loadsPresent.push(itemId);
    }
  }
  const dailyDemandKwh = totalDemandKw * solHours;

  // 4. Power Balance & Load Shedding
  let netPowerKwh = dailyGeneratedKwh - dailyDemandKwh;
  let newStoredKwh = currentState.meters.powerStoredKwh + netPowerKwh;
  const brownoutShedList: string[] = [];

  if (newStoredKwh < 0) {
    // Battery drained -> Brownout shedding in priority order:
    // Shed priority: rec_module -> greenhouse -> moxie_scaleup -> eclss_recycler -> baseline
    const shedOrder = ['rec_module', 'greenhouse_large', 'greenhouse_small', 'moxie_scaleup', 'eclss_recycler'];
    let remainingDeficitKwh = Math.abs(newStoredKwh);

    for (const load of shedOrder) {
      if (loadsPresent.includes(load) && remainingDeficitKwh > 0) {
        brownoutShedList.push(load);
        const shedSavingsKwh = (equipmentPowerMap[load] || 0) * solHours;
        remainingDeficitKwh -= shedSavingsKwh;
      }
    }

    if (remainingDeficitKwh > 0) {
      brownoutShedList.push('habitat_baseline');
    }

    newStoredKwh = Math.max(0, -remainingDeficitKwh);
    netPowerKwh = newStoredKwh - currentState.meters.powerStoredKwh;
  } else {
    // Capped at battery capacity
    newStoredKwh = Math.min(currentState.batteryCapacityKwh, newStoredKwh);
    netPowerKwh = newStoredKwh - currentState.meters.powerStoredKwh;
  }

  // Record power delta into ledger
  const powerCauses = [
    { source: 'solar_generation', amount: effectiveSolarKw * solHours },
    { source: 'fission_generation', amount: fissionGenKw * solHours },
    { source: 'habitat_base_demand', amount: -(baseHabPowerKw * solHours) },
  ];
  if (additionalDemandKw > 0) {
    powerCauses.push({ source: 'environmental_heating_demand', amount: -(additionalDemandKw * solHours) });
  }
  for (const load of loadsPresent) {
    if (!brownoutShedList.includes(load)) {
      powerCauses.push({ source: load, amount: -(equipmentPowerMap[load] * solHours) });
    }
  }
  ledgerDelta.push({
    sol: currentSol,
    meter: 'powerStoredKwh',
    delta: netPowerKwh,
    causes: powerCauses,
  });

  // 5. Oxygen Loop
  const crewO2Need = currentState.crew.count * o2PerCrew;
  let o2Production = 0;
  const o2Causes = [{ source: 'crew_respiration', amount: -crewO2Need }];

  if (currentState.loadout.itemIds.includes('eclss_recycler') && !brownoutShedList.includes('eclss_recycler')) {
    const recyclerO2 = crewO2Need * (eclssDegraded ? 0.25 : 0.50);
    o2Production += recyclerO2;
    o2Causes.push({ source: 'eclss_recycler', amount: recyclerO2 });
  }

  if (currentState.loadout.itemIds.includes('moxie_scaleup') && !brownoutShedList.includes('moxie_scaleup')) {
    const moxieO2 = 2.0;
    o2Production += moxieO2;
    o2Causes.push({ source: 'moxie_scaleup', amount: moxieO2 });
  }

  const netO2Delta = o2Production - crewO2Need;
  const newO2Kg = Math.max(0, currentState.meters.o2Kg + netO2Delta);
  ledgerDelta.push({
    sol: currentSol,
    meter: 'o2Kg',
    delta: netO2Delta,
    causes: o2Causes,
  });

  // 6. Water Loop
  const crewWaterNeed = currentState.crew.count * waterPerCrew;
  const waterCauses = [{ source: 'crew_hydration', amount: -crewWaterNeed }];
  let waterRecovered = 0;
  let greenhouseWaterUse = 0;

  if (currentState.loadout.itemIds.includes('eclss_recycler') && !brownoutShedList.includes('eclss_recycler')) {
    const recoveryRate = eclssDegraded ? 0.60 : 0.90;
    waterRecovered = crewWaterNeed * recoveryRate;
    waterCauses.push({ source: 'eclss_recycler', amount: waterRecovered });
  }

  if (currentState.loadout.itemIds.includes('greenhouse_large') && !brownoutShedList.includes('greenhouse_large')) {
    greenhouseWaterUse += 9.0;
    waterCauses.push({ source: 'greenhouse_large', amount: -9.0 });
  } else if (currentState.loadout.itemIds.includes('greenhouse_small') && !brownoutShedList.includes('greenhouse_small')) {
    greenhouseWaterUse += 4.0;
    waterCauses.push({ source: 'greenhouse_small', amount: -4.0 });
  }

  const netWaterDelta = waterRecovered - crewWaterNeed - greenhouseWaterUse;
  const newWaterKg = Math.max(0, currentState.meters.waterKg + netWaterDelta);
  ledgerDelta.push({
    sol: currentSol,
    meter: 'waterKg',
    delta: netWaterDelta,
    causes: waterCauses,
  });

  // 7. Food Loop
  const crewFoodNeedKg = currentState.crew.count * foodPerCrew;
  let dailyKcalYield = 0;
  const foodCauses = [{ source: 'crew_nutrition', amount: -crewFoodNeedKg }];

  if (currentState.loadout.itemIds.includes('greenhouse_large') && !brownoutShedList.includes('greenhouse_large')) {
    dailyKcalYield += 7500;
  } else if (currentState.loadout.itemIds.includes('greenhouse_small') && !brownoutShedList.includes('greenhouse_small')) {
    dailyKcalYield += 3000;
  }

  // Fraction of calories covered by fresh produce
  const caloriesCoveredFraction = Math.min(1.0, dailyKcalYield / dailyKcalNeed);
  const dryRationBurnKg = crewFoodNeedKg * (1.0 - caloriesCoveredFraction * 0.8);
  if (dailyKcalYield > 0) {
    foodCauses.push({ source: 'greenhouse_crop', amount: crewFoodNeedKg * caloriesCoveredFraction * 0.8 });
  }

  let newFoodKg = currentState.meters.foodKg - dryRationBurnKg;
  let foodShortfall = false;
  if (newFoodKg < 0) {
    foodShortfall = true;
    newFoodKg = 0;
  }
  ledgerDelta.push({
    sol: currentSol,
    meter: 'foodKg',
    delta: -dryRationBurnKg,
    causes: foodCauses,
  });

  // 8. Radiation Dose
  let shieldAttenuation = 0;
  if (currentState.loadout.itemIds.includes('regolith_shield')) {
    shieldAttenuation += 0.40;
  }
  if (currentState.loadout.itemIds.includes('storm_shelter')) {
    shieldAttenuation += 0.25;
  }
  shieldAttenuation = Math.min(0.60, shieldAttenuation);

  const dailyDoseMsv = baseDosePerSol * (1.0 - shieldAttenuation) * radiationGameScale;
  const newCumulativeDose = currentState.meters.doseMsvPerCrew + dailyDoseMsv;
  ledgerDelta.push({
    sol: currentSol,
    meter: 'doseMsvPerCrew',
    delta: dailyDoseMsv,
    causes: [
      { source: 'surface_cosmic_rays', amount: dailyDoseMsv },
    ],
  });

  // 9. Morale & Health Drift
  let moraleDelta = 0;
  const moraleCauses: Array<{ source: string; amount: number }> = [];

  // Recreation module boost
  if (currentState.loadout.itemIds.includes('rec_module') && !brownoutShedList.includes('rec_module')) {
    moraleDelta += 1.0;
    moraleCauses.push({ source: 'rec_module', amount: 1.0 });
  }

  // Fresh crops morale boost
  if (dailyKcalYield > 0) {
    const boost = currentState.loadout.itemIds.includes('greenhouse_large') ? 1.2 : 0.5;
    moraleDelta += boost;
    moraleCauses.push({ source: 'fresh_crops', amount: boost });
  }

  // Nominal operations recovery if life support is healthy and powered
  if (brownoutShedList.length === 0 && newWaterKg > 50 && newO2Kg > 10 && !foodShortfall && currentState.meters.morale < 85) {
    moraleDelta += 0.4;
    moraleCauses.push({ source: 'nominal_operations', amount: 0.4 });
  }

  // Penalties: brownouts, low water/food/O2, radiation fear
  if (brownoutShedList.includes('habitat_baseline')) {
    moraleDelta -= 8.0;
    moraleCauses.push({ source: 'habitat_freeze_blackout', amount: -8.0 });
  } else if (brownoutShedList.length > 0) {
    moraleDelta -= 2.5;
    moraleCauses.push({ source: 'brownout_distress', amount: -2.5 });
  }
  if (newWaterKg <= 0) {
    moraleDelta -= 5.0;
    moraleCauses.push({ source: 'dehydration_panic', amount: -5.0 });
  }
  if (newO2Kg <= 0) {
    moraleDelta -= 8.0;
    moraleCauses.push({ source: 'hypoxia_panic', amount: -8.0 });
  }
  if (foodShortfall) {
    moraleDelta -= 4.0;
    moraleCauses.push({ source: 'starvation_anxiety', amount: -4.0 });
  }

  const newMorale = Math.min(100, Math.max(0, currentState.meters.morale + moraleDelta));
  ledgerDelta.push({
    sol: currentSol,
    meter: 'morale',
    delta: moraleDelta,
    causes: moraleCauses.length > 0 ? moraleCauses : [{ source: 'routine_operations', amount: 0 }],
  });

  // Crew health impact from deprivation
  let healthDelta = 0;
  if (brownoutShedList.includes('habitat_baseline')) healthDelta -= 12;
  if (newO2Kg <= 0) healthDelta -= 25;
  if (newWaterKg <= 0) healthDelta -= 15;
  if (foodShortfall) healthDelta -= 5;
  if (newCumulativeDose > doseLimit * 0.8) healthDelta -= 2;

  // Medical kit passive treatment & recovery
  if (healthDelta < 0 && currentState.loadout.itemIds.includes('medical_kit')) {
    healthDelta = healthDelta * 0.5;
  } else if (healthDelta === 0 && currentState.crew.health < 100 && currentState.loadout.itemIds.includes('medical_kit')) {
    healthDelta = 1;
  }
  const newHealth = Math.min(100, Math.max(0, currentState.crew.health + healthDelta));
  if (healthDelta !== 0) {
    ledgerDelta.push({
      sol: currentSol,
      meter: 'crewHealth',
      delta: healthDelta,
      causes: [{ source: 'environmental_stress', amount: healthDelta }],
    });
  }

  // 10. Consecutives & End Conditions
  const nextO2Zero = newO2Kg <= 0.001 ? currentState.consecutiveO2Zero + 1 : 0;
  const nextWaterZero = newWaterKg <= 0.001 ? currentState.consecutiveWaterZero + 1 : 0;
  const nextFoodZero = newFoodKg <= 0.001 ? currentState.consecutiveFoodZero + 1 : 0;
  const nextMoraleZero = newMorale <= 0.001 ? currentState.consecutiveMoraleZero + 1 : 0;

  let endCondition: EndCondition | undefined = undefined;
  let newStatus: SimulationState['status'] = 'running';

  if (nextO2Zero >= 2) {
    newStatus = 'failed';
    endCondition = {
      reason: 'asphyxiation',
      sol: currentSol,
      headline: 'Mission Failed: Atmospheric Asphyxiation',
      primaryCause: 'Oxygen tanks depleted for 2 consecutive sols without adequate extraction or recycling.',
    };
  } else if (nextWaterZero >= 3) {
    newStatus = 'failed';
    endCondition = {
      reason: 'dehydration',
      sol: currentSol,
      headline: 'Mission Failed: Acute Dehydration',
      primaryCause: 'Potable water reserves reached zero for 3 consecutive sols.',
    };
  } else if (nextFoodZero >= 6) {
    newStatus = 'failed';
    endCondition = {
      reason: 'starvation',
      sol: currentSol,
      headline: 'Mission Failed: Caloric Starvation',
      primaryCause: 'Food rations exhausted for 6 consecutive sols without sufficient agricultural replenishment.',
    };
  } else if (newCumulativeDose >= doseLimit) {
    newStatus = 'failed';
    endCondition = {
      reason: 'radiation_poisoning',
      sol: currentSol,
      headline: 'Mission Aborted: Radiation Exposure Ceiling Exceeded',
      primaryCause: `Cumulative radiation dose breached NASA-STD-3001 threshold of ${doseLimit} mSv.`,
    };
  } else if (nextMoraleZero >= 5) {
    newStatus = 'failed';
    endCondition = {
      reason: 'crew_unrest',
      sol: currentSol,
      headline: 'Mission Scrubbed: Severe Psychological Breakdown',
      primaryCause: 'Crew morale remained at zero for 5 consecutive sols, compromising flight safety.',
    };
  } else if (currentSol >= currentState.maxSols) {
    newStatus = 'completed';
    endCondition = {
      reason: 'success',
      sol: currentSol,
      headline: 'Mission Accomplished: Nominal Surface Stay Completed',
      primaryCause: `The outpost successfully endured ${currentState.maxSols} Martian sols.`,
    };
  }

  const updatedState: SimulationState = {
    ...currentState,
    sol: currentSol + 1,
    meters: {
      powerStoredKwh: newStoredKwh,
      o2Kg: newO2Kg,
      waterKg: newWaterKg,
      foodKg: newFoodKg,
      doseMsvPerCrew: newCumulativeDose,
      morale: newMorale,
    },
    crew: {
      count: currentState.crew.count,
      health: newHealth,
    },
    activeEffects: nextActiveEffects,
    consecutiveO2Zero: nextO2Zero,
    consecutiveWaterZero: nextWaterZero,
    consecutiveFoodZero: nextFoodZero,
    consecutiveMoraleZero: nextMoraleZero,
    status: newStatus,
    endCondition,
    brownoutLoadsShed: brownoutShedList,
    ledger: [...currentState.ledger, ...ledgerDelta],
  };

  return { state: updatedState, ledgerDelta };
}
