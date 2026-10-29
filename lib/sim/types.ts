export type MissionMode = 'tutorial' | 'standard' | 'long';

export type ItemCategory = 'power' | 'lifesupport' | 'shielding' | 'food' | 'spares' | 'comfort';

export type MeterType = 'powerStoredKwh' | 'o2Kg' | 'waterKg' | 'foodKg' | 'doseMsvPerCrew' | 'morale' | 'crewHealth';

export interface ItemEffect {
  type: string;
  [key: string]: unknown;
}

export interface PackableItem {
  id: string;
  name: string;
  category: ItemCategory;
  massKg: number;
  powerKw: number;
  effects: ItemEffect[];
  blurb: string;
  tradeoff: string;
  sourceId: string;
  verified: boolean;
}

export interface ConsumablesAllocation {
  waterKg: number;
  o2Kg: number;
  foodKg: number;
}

export interface Loadout {
  itemIds: string[];
  consumables: ConsumablesAllocation;
  mode: MissionMode;
  seed: number;
}

export interface ConstantEntry {
  id: string;
  value: number;
  unit: string;
  label: string;
  sourceId: string;
  verified: boolean;
  gameScale: number;
  note: string;
  sourceType?: 'MEASURED' | 'NASA STANDARD' | 'DESIGN ASSUMPTION';
}

export interface SourceEntry {
  id: string;
  title: string;
  publisher: string;
  url: string;
  accessedOn: string;
  usedFor: string;
  sourceType?: 'MEASURED' | 'NASA STANDARD' | 'DESIGN ASSUMPTION';
}

export interface EventPrecondition {
  type: 'has_item' | 'has_category' | 'min_sol';
  itemId?: string;
  category?: ItemCategory;
  sol?: number;
}

export interface EffectModifier {
  target: string;
  add?: number;
  mult?: number;
  set?: number;
  forSols?: number;
}

export interface EventChoice {
  id: string;
  label: string;
  requires?: string;
  effects: EffectModifier[];
  lesson: string;
}

export interface SimulationEvent {
  id: string;
  title: string;
  narrative: string;
  weight: number;
  earliestSol: number;
  preconditions: EventPrecondition[];
  choices: EventChoice[];
}

export interface ActiveModifier {
  id: string;
  target: string;
  add?: number;
  mult?: number;
  set?: number;
  remainingSols: number;
  source: string;
}

export interface EquipmentStatus {
  itemId: string;
  status: 'ok' | 'degraded' | 'failed';
  efficiency: number;
}

export interface LedgerCause {
  source: string;
  amount: number;
}

export interface LedgerEntry {
  sol: number;
  meter: MeterType;
  delta: number;
  causes: LedgerCause[];
}

export type EndReason =
  | 'asphyxiation'
  | 'dehydration'
  | 'starvation'
  | 'radiation_poisoning'
  | 'crew_unrest'
  | 'success';

export interface EndCondition {
  reason: EndReason;
  sol: number;
  headline: string;
  primaryCause: string;
}

export interface SimulationState {
  sol: number;
  maxSols: number;
  mode: MissionMode;
  seed: number;
  loadout: Loadout;
  crew: {
    count: number;
    health: number;
  };
  meters: {
    powerStoredKwh: number;
    o2Kg: number;
    waterKg: number;
    foodKg: number;
    doseMsvPerCrew: number;
    morale: number;
  };
  batteryCapacityKwh: number;
  status: 'running' | 'paused_event' | 'completed' | 'failed';
  endCondition?: EndCondition;
  pendingEvent?: SimulationEvent;
  consecutiveO2Zero: number;
  consecutiveWaterZero: number;
  consecutiveFoodZero: number;
  consecutiveMoraleZero: number;
  activeEffects: ActiveModifier[];
  equipment: EquipmentStatus[];
  ledger: LedgerEntry[];
  eventHistory: Array<{ sol: number; eventId: string; choiceId: string }>;
  brownoutLoadsShed: string[];
  resupplyAccepted: boolean;
}

export interface StepResult {
  state: SimulationState;
  ledgerDelta: LedgerEntry[];
}
