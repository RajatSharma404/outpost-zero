import type { Loadout, PackableItem } from './types';
import { CONSTANTS, ITEMS, getConstantValue } from '../data';

export interface MassBreakdown {
  itemsMassKg: number;
  waterMassKg: number;
  o2MassKg: number;
  foodMassKg: number;
  consumablesMassKg: number;
  totalMassKg: number;
  maxMassKg: number;
  remainingMassKg: number;
  isOverBudget: boolean;
  overByKg: number;
}

export interface ConsumablesDays {
  waterDaysStored: number;
  waterDaysEffective: number;
  o2DaysStored: number;
  o2DaysEffective: number;
  foodDaysStored: number;
  foodDaysEffective: number;
}

export interface PowerAssessment {
  solarGenKw: number;
  fissionGenKw: number;
  totalGenClearKw: number;
  baseDemandKw: number;
  equipmentDemandKw: number;
  totalDemandKw: number;
  netClearKw: number;
  netStormKw: number;
  batteryCapacityKwh: number;
  hasNightPower: boolean;
}

export interface LoadoutAnalysis {
  mass: MassBreakdown;
  consumablesDays: ConsumablesDays;
  power: PowerAssessment;
  warnings: string[];
  shieldingRating: 'none' | 'regolith' | 'shelter' | 'hardened';
}

export function calculateMass(loadout: Loadout, items: PackableItem[] = ITEMS): MassBreakdown {
  const maxMassKg = getConstantValue('cargo_budget_kg', 40000);
  const itemMap = new Map(items.map((i) => [i.id, i]));

  let itemsMassKg = 0;
  for (const id of loadout.itemIds) {
    const item = itemMap.get(id);
    if (item) {
      itemsMassKg += item.massKg;
    }
  }

  const waterMassKg = Math.max(0, loadout.consumables.waterKg);
  const o2MassKg = Math.max(0, loadout.consumables.o2Kg);
  const foodMassKg = Math.max(0, loadout.consumables.foodKg);
  const consumablesMassKg = waterMassKg + o2MassKg + foodMassKg;
  const totalMassKg = itemsMassKg + consumablesMassKg;
  const remainingMassKg = maxMassKg - totalMassKg;
  const isOverBudget = remainingMassKg < 0;
  const overByKg = isOverBudget ? Math.abs(remainingMassKg) : 0;

  return {
    itemsMassKg,
    waterMassKg,
    o2MassKg,
    foodMassKg,
    consumablesMassKg,
    totalMassKg,
    maxMassKg,
    remainingMassKg,
    isOverBudget,
    overByKg,
  };
}

export function analyzeLoadout(
  loadout: Loadout,
  missionLengthSols: number,
  items: PackableItem[] = ITEMS,
): LoadoutAnalysis {
  const mass = calculateMass(loadout, items);
  const itemMap = new Map(items.map((i) => [i.id, i]));
  const packedItems = loadout.itemIds.map((id) => itemMap.get(id)).filter((i): i is PackableItem => Boolean(i));

  const crewSize = getConstantValue('crew_size', 4);
  const o2PerCrewSol = getConstantValue('o2_per_crew_per_sol_kg', 0.84);
  const waterPerCrewSol = getConstantValue('water_per_crew_per_sol_kg', 3.5);
  const foodPerCrewSol = getConstantValue('food_dry_per_crew_per_sol_kg', 0.62);
  const baseLoadKw = getConstantValue('habitat_base_load_kw', 6);

  const dailyCrewO2 = crewSize * o2PerCrewSol;
  const dailyCrewWater = crewSize * waterPerCrewSol;
  const dailyCrewFood = crewSize * foodPerCrewSol;

  // Packed systems inspection
  const hasRecycler = loadout.itemIds.includes('eclss_recycler');
  const hasMoxie = loadout.itemIds.includes('moxie_scaleup');
  const hasBattery = loadout.itemIds.includes('battery_bank');
  const hasFission = loadout.itemIds.includes('fission_unit');
  const hasRegolith = loadout.itemIds.includes('regolith_shield');
  const hasShelter = loadout.itemIds.includes('storm_shelter');
  const hasSmallGreenhouse = loadout.itemIds.includes('greenhouse_small');
  const hasLargeGreenhouse = loadout.itemIds.includes('greenhouse_large');

  // Days of consumables stored
  const o2DaysStored = dailyCrewO2 > 0 ? Math.floor(loadout.consumables.o2Kg / dailyCrewO2) : 0;
  const waterDaysStored = dailyCrewWater > 0 ? Math.floor(loadout.consumables.waterKg / dailyCrewWater) : 0;
  const foodDaysStored = dailyCrewFood > 0 ? Math.floor(loadout.consumables.foodKg / dailyCrewFood) : 0;

  // Effective days with recycling systems (assuming powered)
  // Recycler recovers 90% water -> effective net water use = 10%
  const effectiveWaterBurn = hasRecycler ? dailyCrewWater * 0.1 : dailyCrewWater;
  const waterDaysEffective = effectiveWaterBurn > 0 ? Math.floor(loadout.consumables.waterKg / effectiveWaterBurn) : waterDaysStored;

  // Recycler 50% + MOXIE 2.0 kg/sol
  const moxieGen = hasMoxie ? 2.0 : 0;
  const recyclerO2Gen = hasRecycler ? dailyCrewO2 * 0.5 : 0;
  const netO2Burn = Math.max(0.1, dailyCrewO2 - (moxieGen + recyclerO2Gen));
  const o2DaysEffective = Math.floor(loadout.consumables.o2Kg / netO2Burn);

  // Greenhouse supplementation
  let dailyKcalSupplement = 0;
  if (hasLargeGreenhouse) dailyKcalSupplement += 7500;
  else if (hasSmallGreenhouse) dailyKcalSupplement += 3000;
  const totalDailyKcalNeed = crewSize * getConstantValue('food_kcal_per_crew_per_sol', 2500);
  const netKcalDeficitFraction = Math.max(0.2, (totalDailyKcalNeed - dailyKcalSupplement) / totalDailyKcalNeed);
  const foodDaysEffective = Math.floor(foodDaysStored / netKcalDeficitFraction);

  // Power assessment
  let solarGenKw = 0;
  let fissionGenKw = 0;
  let equipmentDemandKw = 0;
  let batteryCapacityKwh = 40; // Lander baseline bus

  for (const item of packedItems) {
    if (item.id === 'solar_small') solarGenKw += 5;
    if (item.id === 'solar_large') solarGenKw += 12;
    if (item.id === 'fission_unit') fissionGenKw += 10;
    if (item.id === 'battery_bank') batteryCapacityKwh += 120;
    if (item.powerKw > 0) {
      equipmentDemandKw += item.powerKw;
    }
  }

  const totalGenClearKw = solarGenKw + fissionGenKw;
  const totalDemandKw = baseLoadKw + equipmentDemandKw;
  const netClearKw = totalGenClearKw - totalDemandKw;
  // Under 90% dust storm, solar delivers only 10%
  const netStormKw = (solarGenKw * 0.1 + fissionGenKw) - totalDemandKw;
  const hasNightPower = fissionGenKw >= baseLoadKw || batteryCapacityKwh >= baseLoadKw * 12;

  // Shielding rating
  let shieldingRating: 'none' | 'regolith' | 'shelter' | 'hardened' = 'none';
  if (hasRegolith && hasShelter) shieldingRating = 'hardened';
  else if (hasRegolith) shieldingRating = 'regolith';
  else if (hasShelter) shieldingRating = 'shelter';

  // Plain-language actionable warnings
  const warnings: string[] = [];

  if (mass.isOverBudget) {
    warnings.push(`Lander is overloaded by ${mass.overByKg.toLocaleString()} kg. Mission cannot launch over 40 tonnes.`);
  }

  if (totalGenClearKw < totalDemandKw) {
    warnings.push(`Power generation (${totalGenClearKw} kW) is below baseline habitat demand (${totalDemandKw} kW). The base will run in constant deficit.`);
  }

  if (solarGenKw > 0 && fissionGenKw === 0 && !hasBattery) {
    warnings.push('No battery bank packed. The habitat will blackout every night when the sun sets.');
  }

  if (solarGenKw > 0 && fissionGenKw === 0 && netStormKw < 0) {
    warnings.push('Relying entirely on solar power leaves the colony vulnerable to catastrophic brownouts during Martian dust storms.');
  }

  if (!hasRecycler && !hasMoxie && o2DaysStored < missionLengthSols) {
    warnings.push(`No way to make oxygen after stored tanks deplete on sol ${o2DaysStored}.`);
  }

  if (!hasRecycler && waterDaysStored < missionLengthSols) {
    warnings.push(`No water recycler packed. Stored water will run dry on sol ${waterDaysStored}.`);
  }

  if (!hasSmallGreenhouse && !hasLargeGreenhouse && foodDaysStored < missionLengthSols) {
    warnings.push(`No greenhouse packed. Dry rations will run out on sol ${foodDaysStored}.`);
  }

  if (!hasRegolith && !hasShelter) {
    warnings.push('Zero radiation shielding packed. Crew will absorb heavy cosmic ray and solar flare doses.');
  } else if (!hasShelter) {
    warnings.push('No water-jacket storm shelter packed. High-energy solar particle events will deliver severe radiation bursts.');
  }

  if (!loadout.itemIds.includes('spare_parts_kit')) {
    warnings.push('No spare parts kit packed. Mechanical failures cannot be repaired without consuming emergency resources.');
  }

  return {
    mass,
    consumablesDays: {
      waterDaysStored,
      waterDaysEffective,
      o2DaysStored,
      o2DaysEffective,
      foodDaysStored,
      foodDaysEffective,
    },
    power: {
      solarGenKw,
      fissionGenKw,
      totalGenClearKw,
      baseDemandKw: baseLoadKw,
      equipmentDemandKw,
      totalDemandKw,
      netClearKw,
      netStormKw,
      batteryCapacityKwh,
      hasNightPower,
    },
    warnings,
    shieldingRating,
  };
}
