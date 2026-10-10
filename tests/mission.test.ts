import { describe, it, expect } from 'vitest';
import { initializeSimulation, step } from '../lib/sim/engine';
import type { Loadout, SimulationState } from '../lib/sim/types';

describe('Mission Simulation & 60-Sol Tutorial Playability', () => {
  const tutorialLoadout: Loadout = {
    itemIds: [
      'fission_unit',
      'solar_small',
      'battery_bank',
      'eclss_recycler',
      'moxie_scaleup',
      'regolith_shield',
      'storm_shelter',
      'spare_parts_kit',
      'medical_kit',
      'rec_module',
    ],
    consumables: {
      waterKg: 2500,
      o2Kg: 500,
      foodKg: 1800,
    },
    mode: 'tutorial',
    seed: 777,
  };

  it('runs a complete 60-sol tutorial mission successfully from sol 1 to sol 60', () => {
    let state: SimulationState = initializeSimulation(tutorialLoadout);
    expect(state.sol).toBe(1);
    expect(state.maxSols).toBe(60);
    expect(state.status).toBe('running');

    let eventsEncountered = 0;
    let safetyCounter = 0;

    while (state.status !== 'completed' && state.status !== 'failed' && safetyCounter < 100) {
      safetyCounter++;

      if (state.status === 'paused_event' && state.pendingEvent) {
        eventsEncountered++;
        // Emulate player keyboard selecting first unlocked choice
        const choice = state.pendingEvent.choices[0];
        const res = step(state, choice.id);
        state = res.state;
      } else {
        const res = step(state);
        state = res.state;
      }
    }

    // Must reach 60 sols with success
    expect(state.status).toBe('completed');
    expect(state.sol).toBeGreaterThanOrEqual(60);
    expect(state.endCondition?.reason).toBe('success');
    expect(state.crew.health).toBeGreaterThan(60);
    expect(state.meters.powerStoredKwh).toBeGreaterThan(0);
    expect(state.meters.o2Kg).toBeGreaterThan(0);
    expect(state.meters.waterKg).toBeGreaterThan(0);
    expect(state.meters.foodKg).toBeGreaterThan(0);
  });

  it('verifies meter rails maintain valid numeric state without NaN', () => {
    let state = initializeSimulation(tutorialLoadout);
    for (let s = 1; s <= 20; s++) {
      const res = step(state);
      state = res.state;
      expect(Number.isFinite(state.meters.powerStoredKwh)).toBe(true);
      expect(Number.isFinite(state.meters.o2Kg)).toBe(true);
      expect(Number.isFinite(state.meters.waterKg)).toBe(true);
      expect(Number.isFinite(state.meters.foodKg)).toBe(true);
      expect(Number.isFinite(state.meters.doseMsvPerCrew)).toBe(true);
      expect(Number.isFinite(state.meters.morale)).toBe(true);
    }
  });
});
