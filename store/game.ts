import { create } from 'zustand';
import type { Loadout, MissionMode, SimulationState } from '../lib/sim/types';
import { initializeSimulation, step } from '../lib/sim/engine';

interface GameStore {
  loadout: Loadout;
  simulationState: SimulationState | null;
  simSpeed: 0 | 1 | 4 | 16;

  // Loadout actions
  toggleItem: (itemId: string) => void;
  setItemPacked: (itemId: string, packed: boolean) => void;
  setConsumables: (consumables: { waterKg?: number; o2Kg?: number; foodKg?: number }) => void;
  setMode: (mode: MissionMode) => void;
  setSeed: (seed: number) => void;
  setLoadout: (loadout: Loadout) => void;
  resetLoadout: () => void;

  // Simulation actions
  startMission: () => void;
  advanceSol: (choiceId?: string) => void;
  setSimSpeed: (speed: 0 | 1 | 4 | 16) => void;
  resetSimulation: () => void;
}

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
    set((state) => ({
      loadout: { ...state.loadout, seed: Math.max(1, Math.floor(seed)) },
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
    set({ simulationState: initialized, simSpeed: 1 });
  },

  advanceSol: (choiceId?: string) => {
    const currentSim = get().simulationState;
    if (!currentSim) return;
    const res = step(currentSim, choiceId);
    set({ simulationState: res.state });
  },

  setSimSpeed: (speed: 0 | 1 | 4 | 16) => {
    set({ simSpeed: speed });
  },

  resetSimulation: () => {
    set({ simulationState: null, simSpeed: 1 });
  },
}));
