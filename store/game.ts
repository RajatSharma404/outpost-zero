import { create } from 'zustand';
import type { Loadout, MissionMode, SimulationState } from '../lib/sim/types';
import { initializeSimulation, step } from '../lib/sim/engine';
import {
  type SimulationConfig,
  type SimulationOutput,
  type CrewMember,
  type Vehicle,
  type MenuType,
  type ECLSSUnit,
  DEFAULT_REFERENCE_CREW,
  VEHICLE_PRESETS,
  createDefaultEclssSuite,
  ALL_AVAILABLE_ECLSS_UNITS,
  runFullSimulation,
} from '../src/engine';
import { getAudioMuted, toggleAudio } from '../lib/sound';

export type HMISystemTheme = 'night' | 'day';

interface GameStore {
  loadout: Loadout;
  simulationState: SimulationState | null;
  simSpeed: 0 | 1 | 4 | 16;

  // Coupled Engine State
  isCoupledMode: boolean;
  coupledConfig: SimulationConfig;
  coupledOutput: SimulationOutput | null;
  activeSolIndex: number;
  hmiTheme: HMISystemTheme;
  audioMuted: boolean;

  // Loadout actions (legacy/outpost)
  toggleItem: (itemId: string) => void;
  setItemPacked: (itemId: string, packed: boolean) => void;
  setConsumables: (consumables: { waterKg?: number; o2Kg?: number; foodKg?: number }) => void;
  setMode: (mode: MissionMode) => void;
  setSeed: (seed: number) => void;
  setLoadout: (loadout: Loadout) => void;
  resetLoadout: () => void;

  // Simulation actions (legacy)
  startMission: () => void;
  advanceSol: (choiceId?: string) => void;
  setSimSpeed: (speed: 0 | 1 | 4 | 16) => void;
  resetSimulation: () => void;

  // Coupled Engine Actions
  setCoupledMode: (enabled: boolean) => void;
  setCoupledConfig: (updates: Partial<SimulationConfig>) => void;
  setCrewRoster: (crew: CrewMember[]) => void;
  addCrewMember: (member: CrewMember) => void;
  removeCrewMember: (id: string) => void;
  updateCrewMember: (id: string, updates: Partial<CrewMember>) => void;
  setVehicle: (vehicle: Vehicle) => void;
  setMenuType: (menu: MenuType) => void;
  toggleEclssUnit: (unitId: string) => void;
  setContingencyDays: (days: number) => void;
  loadPreset: (preset: 'bvad4' | 'mixed6' | 'low5th' | 'high95th' | 'quick30') => void;
  runCoupledSim: () => SimulationOutput;
  stepCoupledSol: () => void;
  jumpToCoupledSol: (index: number) => void;
  toggleTheme: () => void;
  toggleAudioMute: () => void;
}

const DEFAULT_COUPLED_CONFIG: SimulationConfig = {
  seed: 42,
  crew: DEFAULT_REFERENCE_CREW,
  vehicle: VEHICLE_PRESETS.nasa_mth_2020,
  menuType: 'standard',
  eclssUnits: createDefaultEclssSuite(),
  openLoopBackupDays: 30,
  intakeFraction: 1.0,
  storageDegradationYears: 0.0,
  predeployedFoodLeadTimeMonths: 26,
  predeployedCargoSuccessProb: 0.90,
  phaseDurations: {
    outbound: 180,
    surface: 500,
    return: 180,
  },
  contingencyExtensionDays: 30,
  shieldingMassKg: 2500,
  realityFactor: 2.0,
};

const DEFAULT_LOADOUT: Loadout = {
  itemIds: [
    'solar_large',
    'fission_unit',
    'battery_bank',
    'eclss_recycler',
    'moxie_scaleup',
    'regolith_shield',
    'spare_parts_kit',
  ],
  consumables: {
    waterKg: 3000,
    o2Kg: 600,
    foodKg: 2000,
  },
  mode: 'standard',
  seed: 42,
};

export const useGameStore = create<GameStore>((set, get) => ({
  loadout: DEFAULT_LOADOUT,
  simulationState: null,
  simSpeed: 1,

  isCoupledMode: true,
  coupledConfig: DEFAULT_COUPLED_CONFIG,
  coupledOutput: null,
  activeSolIndex: 0,
  hmiTheme: 'night',
  audioMuted: getAudioMuted(),

  toggleItem: (itemId: string) => {
    const current = get().loadout.itemIds;
    const exists = current.includes(itemId);
    const updated = exists ? current.filter((id) => id !== itemId) : [...current, itemId];
    set((state) => ({
      loadout: { ...state.loadout, itemIds: updated },
    }));
  },

  setItemPacked: (itemId: string, packed: boolean) => {
    const current = get().loadout.itemIds;
    const exists = current.includes(itemId);
    if (packed && !exists) {
      set((state) => ({
        loadout: { ...state.loadout, itemIds: [...current, itemId] },
      }));
    } else if (!packed && exists) {
      set((state) => ({
        loadout: { ...state.loadout, itemIds: current.filter((id) => id !== itemId) },
      }));
    }
  },

  setConsumables: (consumables) => {
    set((state) => ({
      loadout: {
        ...state.loadout,
        consumables: {
          waterKg: consumables.waterKg !== undefined ? consumables.waterKg : state.loadout.consumables.waterKg,
          o2Kg: consumables.o2Kg !== undefined ? consumables.o2Kg : state.loadout.consumables.o2Kg,
          foodKg: consumables.foodKg !== undefined ? consumables.foodKg : state.loadout.consumables.foodKg,
        },
      },
    }));
  },

  setMode: (mode: MissionMode) => {
    set((state) => ({
      loadout: { ...state.loadout, mode },
    }));
  },

  setSeed: (seed: number) => {
    const validSeed = Math.max(1, Math.floor(seed));
    set((state) => ({
      loadout: { ...state.loadout, seed: validSeed },
      coupledConfig: { ...state.coupledConfig, seed: validSeed },
    }));
  },

  setLoadout: (loadout: Loadout) => {
    set({ loadout });
  },

  resetLoadout: () => {
    set({ loadout: DEFAULT_LOADOUT });
  },

  startMission: () => {
    const currentLoadout = get().loadout;
    const initialized = initializeSimulation(currentLoadout);
    // Also run coupled simulation eagerly so coupled telemetry is ready immediately
    const coupledSim = runFullSimulation(get().coupledConfig);
    set({
      simulationState: initialized,
      coupledOutput: coupledSim,
      activeSolIndex: 0,
      simSpeed: 1,
    });
  },

  advanceSol: (choiceId?: string) => {
    const currentSim = get().simulationState;
    if (currentSim) {
      const res = step(currentSim, choiceId);
      set({ simulationState: res.state });
    }
    // Also advance coupled sol
    get().stepCoupledSol();
  },

  setSimSpeed: (speed: 0 | 1 | 4 | 16) => {
    set({ simSpeed: speed });
  },

  resetSimulation: () => {
    set({ simulationState: null, coupledOutput: null, activeSolIndex: 0, simSpeed: 1 });
  },

  // Coupled Engine Actions
  setCoupledMode: (enabled: boolean) => {
    set({ isCoupledMode: enabled });
  },

  setCoupledConfig: (updates: Partial<SimulationConfig>) => {
    set((state) => ({
      coupledConfig: { ...state.coupledConfig, ...updates },
    }));
  },

  setCrewRoster: (crew: CrewMember[]) => {
    set((state) => ({
      coupledConfig: { ...state.coupledConfig, crew },
    }));
  },

  addCrewMember: (member: CrewMember) => {
    set((state) => ({
      coupledConfig: { ...state.coupledConfig, crew: [...state.coupledConfig.crew, member] },
    }));
  },

  removeCrewMember: (id: string) => {
    set((state) => ({
      coupledConfig: {
        ...state.coupledConfig,
        crew: state.coupledConfig.crew.filter((c) => c.id !== id),
      },
    }));
  },

  updateCrewMember: (id: string, updates: Partial<CrewMember>) => {
    set((state) => ({
      coupledConfig: {
        ...state.coupledConfig,
        crew: state.coupledConfig.crew.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      },
    }));
  },

  setVehicle: (vehicle: Vehicle) => {
    set((state) => ({
      coupledConfig: { ...state.coupledConfig, vehicle },
    }));
  },

  setMenuType: (menuType: MenuType) => {
    set((state) => ({
      coupledConfig: { ...state.coupledConfig, menuType },
    }));
  },

  toggleEclssUnit: (unitId: string) => {
    set((state) => {
      const units = state.coupledConfig.eclssUnits;
      const exists = units.some((u) => u.id === unitId);
      let updated: ECLSSUnit[];
      if (exists) {
        updated = units.filter((u) => u.id !== unitId);
      } else {
        const found = ALL_AVAILABLE_ECLSS_UNITS.find((u) => u.id === unitId);
        updated = found ? [...units, found] : units;
      }
      return {
        coupledConfig: { ...state.coupledConfig, eclssUnits: updated },
      };
    });
  },

  setContingencyDays: (days: number) => {
    set((state) => ({
      coupledConfig: { ...state.coupledConfig, contingencyExtensionDays: days },
    }));
  },

  loadPreset: (preset: 'bvad4' | 'mixed6' | 'low5th' | 'high95th' | 'quick30') => {
    set((state) => {
      switch (preset) {
        case 'bvad4':
          return {
            coupledConfig: {
              ...state.coupledConfig,
              crew: DEFAULT_REFERENCE_CREW,
              vehicle: VEHICLE_PRESETS.nasa_mth_2020,
              menuType: 'standard',
              phaseDurations: { outbound: 180, surface: 500, return: 180 },
              contingencyExtensionDays: 30,
            },
          };
        case 'mixed6':
          return {
            coupledConfig: {
              ...state.coupledConfig,
              crew: [
                ...DEFAULT_REFERENCE_CREW,
                { id: 'cm_geo', name: 'Dr. Sarah Connor', sex: 'female', age: 34, massKg: 61.2, heightM: 1.65, activityFactor: 1.25, evaHoursPerWeek: 4 },
                { id: 'cm_bot', name: 'Dr. Mark Watney', sex: 'male', age: 41, massKg: 78.5, heightM: 1.76, activityFactor: 1.25, evaHoursPerWeek: 6 },
              ],
              vehicle: VEHICLE_PRESETS.starship_dlr_conservative,
              menuType: 'standard',
              phaseDurations: { outbound: 180, surface: 500, return: 180 },
              contingencyExtensionDays: 30,
            },
          };
        case 'low5th':
          return {
            coupledConfig: {
              ...state.coupledConfig,
              crew: [
                { id: 'cm_5th_1', name: 'Astronaut A (5th Pct)', sex: 'female', age: 30, massKg: 52.0, heightM: 1.55, activityFactor: 1.11, evaHoursPerWeek: 2 },
                { id: 'cm_5th_2', name: 'Astronaut B (5th Pct)', sex: 'female', age: 32, massKg: 54.0, heightM: 1.57, activityFactor: 1.11, evaHoursPerWeek: 2 },
                { id: 'cm_5th_3', name: 'Astronaut C (5th Pct)', sex: 'female', age: 35, massKg: 51.5, heightM: 1.54, activityFactor: 1.11, evaHoursPerWeek: 2 },
                { id: 'cm_5th_4', name: 'Astronaut D (5th Pct)', sex: 'female', age: 38, massKg: 53.0, heightM: 1.56, activityFactor: 1.11, evaHoursPerWeek: 2 },
              ],
              vehicle: VEHICLE_PRESETS.nasa_2011_500d_habitat,
              menuType: 'low_moisture',
              phaseDurations: { outbound: 180, surface: 500, return: 180 },
              contingencyExtensionDays: 30,
            },
          };
        case 'high95th':
          return {
            coupledConfig: {
              ...state.coupledConfig,
              crew: [
                { id: 'cm_95th_1', name: 'Astronaut A (95th Pct)', sex: 'male', age: 44, massKg: 98.0, heightM: 1.93, activityFactor: 1.25, evaHoursPerWeek: 6 },
                { id: 'cm_95th_2', name: 'Astronaut B (95th Pct)', sex: 'male', age: 42, massKg: 96.5, heightM: 1.91, activityFactor: 1.25, evaHoursPerWeek: 6 },
                { id: 'cm_95th_3', name: 'Astronaut C (95th Pct)', sex: 'male', age: 46, massKg: 99.0, heightM: 1.94, activityFactor: 1.25, evaHoursPerWeek: 6 },
                { id: 'cm_95th_4', name: 'Astronaut D (95th Pct)', sex: 'male', age: 40, massKg: 95.0, heightM: 1.90, activityFactor: 1.25, evaHoursPerWeek: 6 },
              ],
              vehicle: VEHICLE_PRESETS.starship_spacex_concept,
              menuType: 'frozen',
              phaseDurations: { outbound: 180, surface: 500, return: 180 },
              contingencyExtensionDays: 30,
            },
          };
        case 'quick30':
          return {
            coupledConfig: {
              ...state.coupledConfig,
              crew: DEFAULT_REFERENCE_CREW,
              vehicle: VEHICLE_PRESETS.nasa_mth_2020,
              menuType: 'standard',
              phaseDurations: { outbound: 0, surface: 30, return: 0 },
              contingencyExtensionDays: 0,
            },
          };
        default:
          return state;
      }
    });
  },

  runCoupledSim: () => {
    const config = get().coupledConfig;
    const output = runFullSimulation(config);
    set({ coupledOutput: output, activeSolIndex: 0 });
    return output;
  },

  stepCoupledSol: () => {
    set((state) => {
      if (!state.coupledOutput) return state;
      const next = Math.min(state.activeSolIndex + 1, state.coupledOutput.dailyResults.length - 1);
      return { activeSolIndex: next };
    });
  },

  jumpToCoupledSol: (index: number) => {
    set((state) => {
      if (!state.coupledOutput) return state;
      const valid = Math.max(0, Math.min(index, state.coupledOutput.dailyResults.length - 1));
      return { activeSolIndex: valid };
    });
  },

  toggleTheme: () => {
    const nextTheme: HMISystemTheme = get().hmiTheme === 'night' ? 'day' : 'night';
    set({ hmiTheme: nextTheme });
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
  },

  toggleAudioMute: () => {
    const muted = toggleAudio();
    set({ audioMuted: muted });
  },
}));
