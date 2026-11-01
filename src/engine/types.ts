/**
 * Outpost Zero: Coupled Life-Support & Logistics Engine
 * Pure TypeScript Type Definitions
 */

export type Sex = 'male' | 'female';
export type ActivityFactor = 1.11 | 1.25;

export interface CrewMember {
  id: string;
  name: string;
  sex: Sex;
  age: number;
  massKg: number;
  heightM: number;
  activityFactor: ActivityFactor;
  evaHoursPerWeek: number;
}

export interface InventoryItem {
  kg: number;
  volumeM3: number;
}

export interface Inventories {
  potableWater: InventoryItem;
  wasteWater: InventoryItem;
  brine: InventoryItem;
  o2: InventoryItem;
  n2: InventoryItem;
  cabinCo2: InventoryItem;
  h2: InventoryItem;
  ch4Vented: InventoryItem;
  foodDry: InventoryItem;
  foodPackaged: InventoryItem;
  foodFrozen: InventoryItem;
  foodFresh: InventoryItem;
  hygieneItems: InventoryItem;
  clothing: InventoryItem;
  trash: InventoryItem;
  spares: Record<string, number>;
}

export type UnitStatus = 'nominal' | 'degraded' | 'failed' | 'offline';

export interface ECLSSUnit {
  id: string;
  name: string;
  throughputKgPerDay: number;
  efficiency: number;
  powerKw: number;
  massKg: number;
  volumeM3: number;
  mtbfHours: number;
  repairCrewHours: number;
  sparesCarried: number;
  status: UnitStatus;
  offlineHours: number;
}

export interface Vehicle {
  id: string;
  name: string;
  maxCrew: number;
  massCapacityKg: number;
  pressurizedVolumeM3: number;
  habitableVolumeM3: number;
  storageVolumeM3: number;
  systemsVolumeM3: number;
  maxStandaloneDurationDays?: number;
  sourceTier: 'REQ' | 'OBS' | 'STUDY' | 'STUDENT';
  sourceCitation: string;
}

export type MenuType = 'standard' | 'low_moisture' | 'frozen';
export type MissionPhase = 'outbound' | 'surface' | 'return';

export interface CarbonLedger {
  carbonInFoodKg: number;
  carbonOutCo2Kg: number;
  carbonOutCh4Kg: number;
  carbonOutTrashKg: number;
  carbonOutBiomassKg: number;
  carbonClosurePct: number;
}

export interface MassBalanceAudit {
  inputsKg: number;
  outputsKg: number;
  deltaKg: number;
  errorPct: number;
  withinTolerance: boolean;
}

export interface CrewDailyStatus {
  id: string;
  eerKcal: number;
  metabolicMj: number;
  bodyMassKg: number;
  boneDensityIndex: number; // 1.0 nominal baseline, degrades over time
  performanceIndex: number; // 1.0 nominal, decreases under hypercapnia
  vitaminCCoveragePct: number;
  thiaminCoveragePct: number;
  calciumCoveragePct: number;
  vitaminDCoveragePct: number;
}

export interface DailyStepResult {
  day: number;
  sol: number;
  phase: MissionPhase;
  ppCo2MmHg: number;
  hoursToCo2Limit: number;
  massBalanceAudit: MassBalanceAudit;
  carbonLedger: CarbonLedger;
  cumulativeRadiationMsv: number;
  crewStatus: CrewDailyStatus[];
  activeAlarms: string[];
  unitEvents: string[];
  isCrewLost: boolean;
  failureReason?: string;
  waterSurplusOrDeficitKg: number;
  o2SurplusOrDeficitKg: number;
  foodSurplusOrDeficitKg: number;
  potableWaterRemainingKg: number;
  o2RemainingKg: number;
  foodRemainingKg: number;
  // Coupled telemetry & single-source-of-truth variables:
  dailyCrewO2DemandKg: number;
  dailyCrewCo2ExhaledKg: number;
  dailyCrewDrinkingWaterKg: number;
  dailyCrewUrineProducedKg: number;
  dailyCrewVaporProducedKg: number;
  dailyCrewSweatProducedKg: number;
  co2OverboardVentedKg: number;
  sabatierWaterProducedKg: number;
  dayMethaneVentedKg: number;
  ventedCarbonKg: number;
  netWaterDepletionRateKgPerDay: number;
  netO2DepletionRateKgPerDay: number;
  waterDaysUntilLimit: number;
  o2DaysUntilLimit: number;
  waterMarginDays: number;
  waterMarginPct: number;
  o2MarginDays: number;
  o2MarginPct: number;
}

export interface SimulationConfig {
  seed: number;
  crew: CrewMember[];
  vehicle: Vehicle;
  menuType: MenuType;
  eclssUnits: ECLSSUnit[];
  openLoopBackupDays: number; // default 30
  intakeFraction: number; // default 1.0 (ISS cohort ate ~0.80)
  storageDegradationYears: number; // default 0.0
  predeployedFoodLeadTimeMonths: number; // default 26
  predeployedCargoSuccessProb: number; // default 0.90
  phaseDurations: {
    outbound: number; // default 180
    surface: number;  // default 500 (or 30 in Quick preset)
    return: number;   // default 180
  };
  contingencyExtensionDays: number; // 0, 30, 90, 240
  shieldingMassKg: number;
  realityFactor?: number; // default 2.0
  plantsAreaM2?: number; // optional greenhouse area
}

export interface SimulationOutput {
  success: boolean;
  totalDays: number;
  dailyResults: DailyStepResult[];
  finalInventories: Inventories;
  bindingConstraint: 'mass' | 'pressurized_volume' | 'nhv' | 'standalone_duration' | 'none';
  nhvPerPersonM3: number;
  maxCrewForPlan: number;
  maxDaysForCrew: number;
  totalSparesUsed: number;
  summary: string;
}

