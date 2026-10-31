/**
 * Outpost Zero: Food Logistics, Menus & Nutritional Degradation
 * Implements BVAD Table 4-60 menus, nutrient coverage, ambient storage degradation, and body mass / bone density indices.
 */

import type { MenuType, CrewMember } from './types';
import { getConstant } from './constants';
import { calculateCrewMemberEER, kcalToMetabolicMj } from './crew';

export interface MenuDailySpecs {
  dryFoodKg: number;
  asShippedFoodKg: number;
  packagingKg: number;
  lockerMassKg: number;
  lockerVolumeM3: number;
  trashMassKg: number;
  freezerMassKg: number;
  freezerVolumeM3: number;
  rehydrationWaterNeededKg: number;
}

export interface NutrientCoverage {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
  vitaminCPct: number;
  thiaminPct: number;
  calciumPct: number;
  vitaminDPct: number;
  ironPct: number;
}

export interface CrewHealthIndices {
  bodyMassDeltaKg: number;
  newBodyMassKg: number;
  boneDensityIndex: number; // 1.0 nominal baseline
}

/**
 * Computes daily food mass and volume specifications for a given crew member and menu type.
 * Scaled proportionally to the crewmember's EER relative to the 11.82 MJ reference base.
 */
export function calculateMenuDailySpecs(
  member: CrewMember,
  menuType: MenuType,
  dailyEvaHours = 0,
): MenuDailySpecs {
  const eerKcal = calculateCrewMemberEER(member, dailyEvaHours);
  const metabolicMj = kcalToMetabolicMj(eerKcal);
  const energyScale = metabolicMj / 11.82; // BVAD Table 4-60 normalized to 11.82 MJ

  if (menuType === 'low_moisture') {
    const dry = getConstant<number>('menu_low_moisture_dry_kg') * energyScale; // 0.71 kg
    const shipped = getConstant<number>('menu_low_moisture_shipped_kg') * energyScale; // 0.99 kg
    const packaging = getConstant<number>('menu_low_moisture_packaging_kg') * energyScale; // 0.29 kg
    const locker = getConstant<number>('menu_low_moisture_locker_kg') * energyScale; // 0.35 kg
    const lockerVol = getConstant<number>('menu_low_moisture_locker_vol_m3') * energyScale; // 0.00486 m³
    const trash = getConstant<number>('menu_low_moisture_trash_kg') * energyScale; // 0.34 kg
    // Low moisture has 28% water; as-consumed food requires ~1.42 kg reconstitution water
    const rehydrationWater = (dry / 0.35) - shipped;

    return {
      dryFoodKg: dry,
      asShippedFoodKg: shipped,
      packagingKg: packaging,
      lockerMassKg: locker,
      lockerVolumeM3: lockerVol,
      trashMassKg: trash,
      freezerMassKg: 0,
      freezerVolumeM3: 0,
      rehydrationWaterNeededKg: Math.max(0.5, rehydrationWater),
    };
  }

  if (menuType === 'frozen') {
    const dry = getConstant<number>('menu_frozen_dry_kg') * energyScale; // 0.72 kg
    const shipped = getConstant<number>('menu_frozen_shipped_kg') * energyScale; // 1.48 kg
    const packaging = getConstant<number>('menu_frozen_packaging_kg') * energyScale; // 0.26 kg
    const locker = getConstant<number>('menu_frozen_locker_kg') * energyScale; // 0.27 kg
    const lockerVol = getConstant<number>('menu_frozen_locker_vol_m3') * energyScale; // 0.00381 m³
    const trash = getConstant<number>('menu_frozen_trash_kg') * energyScale; // 0.31 kg
    const freezer = getConstant<number>('menu_frozen_freezer_kg') * energyScale; // 0.866 kg
    const freezerVol = getConstant<number>('menu_frozen_freezer_vol_m3') * energyScale; // 0.00231 m³
    // Frozen requires minimal rehydration water (~1.08 kg)
    const rehydrationWater = 1.08 * energyScale;

    return {
      dryFoodKg: dry,
      asShippedFoodKg: shipped,
      packagingKg: packaging,
      lockerMassKg: locker,
      lockerVolumeM3: lockerVol,
      trashMassKg: trash,
      freezerMassKg: freezer,
      freezerVolumeM3: freezerVol,
      rehydrationWaterNeededKg: rehydrationWater,
    };
  }

  // Standard Menu (Default)
  const dry = getConstant<number>('menu_standard_dry_kg') * energyScale; // 0.71 kg
  const shipped = getConstant<number>('menu_standard_shipped_kg') * energyScale; // 1.23 kg
  const packaging = getConstant<number>('menu_standard_packaging_kg') * energyScale; // 0.28 kg
  const locker = getConstant<number>('menu_standard_locker_kg') * energyScale; // 0.37 kg
  const lockerVol = getConstant<number>('menu_standard_locker_vol_m3') * energyScale; // 0.00519 m³
  const trash = getConstant<number>('menu_standard_trash_kg') * energyScale; // 0.35 kg
  const rehydrationWater = 1.35 * energyScale;

  return {
    dryFoodKg: dry,
    asShippedFoodKg: shipped,
    packagingKg: packaging,
    lockerMassKg: locker,
    lockerVolumeM3: lockerVol,
    trashMassKg: trash,
    freezerMassKg: 0,
    freezerVolumeM3: 0,
    rehydrationWaterNeededKg: rehydrationWater,
  };
}

/**
 * Calculates nutrient retention factor following ambient storage and mission elapsed time.
 * Pre-deployed food includes lead time elapsed before crew arrival.
 */
export function calculateStorageDegradationFactor(
  elapsedDays: number,
  predeployedMonths = 26,
): { thiaminRetention: number; vitaminCRetention: number; standardRetention: number } {
  const totalMonths = (elapsedDays / 30.4) + predeployedMonths;
  const totalYears = totalMonths / 12.0;

  // Thiamin and Vitamin C degrade fast under room temperature ambient storage (~15% per year)
  const thiaminRetention = Math.max(0.20, Math.exp(-0.15 * totalYears));
  const vitaminCRetention = Math.max(0.20, Math.exp(-0.14 * totalYears));
  // Other macronutrients and minerals remain relatively stable (~3% loss per year)
  const standardRetention = Math.max(0.50, Math.exp(-0.03 * totalYears));

  return {
    thiaminRetention,
    vitaminCRetention,
    standardRetention,
  };
}

/**
 * Computes illustrative crew health indices:
 * - Body mass delta: ~7,700 kcal energy imbalance = 1 kg body mass delta.
 * - Bone density index: ~0.8%/month (0.5 - 1.5%) deconditioning, mitigated by exercise and calcium/vitamin D.
 */
export function calculateHealthIndices(
  currentMassKg: number,
  eerKcal: number,
  actualIntakeKcal: number,
  currentBoneDensityIndex: number,
  activityFactor: number,
  calciumCoverage: number,
  vitaminDCoverage: number,
  solsElapsed = 1,
): CrewHealthIndices {
  // Energy imbalance
  const dailyKcalDelta = actualIntakeKcal - eerKcal;
  // 7,700 kcal per kg adipose/muscle tissue
  const bodyMassDeltaKg = (dailyKcalDelta * solsElapsed) / 7700;
  const newBodyMassKg = Math.max(40, currentMassKg + bodyMassDeltaKg);

  // Bone demineralization baseline in microgravity (~0.8% per month = ~0.0267% per day)
  const baseLossPerSol = 0.008 / 30.4;
  // Exercise countermeasure factor (active 1.25 reduces loss by 40%)
  const exerciseBenefit = activityFactor >= 1.25 ? 0.60 : 1.0;
  // Nutrition countermeasure factor (adequate Ca & Vit D reduces loss by 20%)
  const nutritionBenefit = (calciumCoverage >= 0.9 && vitaminDCoverage >= 0.9) ? 0.80 : 1.1;

  const dailyBoneLoss = baseLossPerSol * exerciseBenefit * nutritionBenefit * solsElapsed;
  const boneDensityIndex = Math.max(0.60, currentBoneDensityIndex - dailyBoneLoss);

  return {
    bodyMassDeltaKg,
    newBodyMassKg,
    boneDensityIndex,
  };
}

