import { describe, it, expect } from 'vitest';
import { initializeSimulation, step } from '../lib/sim/engine';
import { calculateMass, analyzeLoadout } from '../lib/sim/loadout';
import type { Loadout, SimulationState } from '../lib/sim/types';

function runSteps(initialState: SimulationState, numSols: number): SimulationState {
  let state = initialState;
  for (let s = 0; s < numSols; s++) {
    if (state.status === 'completed' || state.status === 'failed') break;
    if (state.status === 'paused_event' && state.pendingEvent) {
      const choice = state.pendingEvent.choices[0];
      const res = step(state, choice.id);
      state = res.state;
    } else {
      const res = step(state);
      state = res.state;
    }
  }
  return state;
}

describe('Simulation Engine', () => {
  const baseLoadout: Loadout = {
    itemIds: [
      'fission_unit',
      'battery_bank',
      'eclss_recycler',
      'moxie_scaleup',
      'regolith_shield',
      'storm_shelter',
      'spare_parts_kit',
    ],
    consumables: {
      waterKg: 2000,
      o2Kg: 500,
      foodKg: 1500,
    },
    mode: 'tutorial',
    seed: 42,
  };

  it('guarantees 100% determinism for identical seed and decisions', () => {
    const stateA = runSteps(initializeSimulation(baseLoadout), 25);
    const stateB = runSteps(initializeSimulation(baseLoadout), 25);

    expect(stateA.sol).toBe(stateB.sol);
    expect(stateA.meters.powerStoredKwh).toBeCloseTo(stateB.meters.powerStoredKwh, 4);
    expect(stateA.meters.waterKg).toBeCloseTo(stateB.meters.waterKg, 4);
    expect(stateA.meters.o2Kg).toBeCloseTo(stateB.meters.o2Kg, 4);
    expect(stateA.meters.foodKg).toBeCloseTo(stateB.meters.foodKg, 4);
    expect(stateA.meters.doseMsvPerCrew).toBeCloseTo(stateB.meters.doseMsvPerCrew, 4);
    expect(stateA.ledger.length).toBe(stateB.ledger.length);
  });

  it('accurately validates 40-tonne cargo mass limits', () => {
    const underBudget = calculateMass(baseLoadout);
    expect(underBudget.isOverBudget).toBe(false);
    expect(underBudget.remainingMassKg).toBeGreaterThan(0);

    const overLoadout: Loadout = {
      ...baseLoadout,
      consumables: {
        waterKg: 25000,
        o2Kg: 5000,
        foodKg: 10000,
      },
    };
    const overBudget = calculateMass(overLoadout);
    expect(overBudget.isOverBudget).toBe(true);
    expect(overBudget.overByKg).toBeGreaterThan(0);

    const analysis = analyzeLoadout(overLoadout, 60);
    expect(analysis.warnings.some((w) => w.includes('overloaded'))).toBe(true);
  });

  it('triggers Asphyxiation failure after 2 consecutive sols without oxygen', () => {
    const noO2Loadout: Loadout = {
      itemIds: ['fission_unit', 'battery_bank'],
      consumables: { waterKg: 2000, o2Kg: 0, foodKg: 2000 },
      mode: 'tutorial',
      seed: 10,
    };

    const finalState = runSteps(initializeSimulation(noO2Loadout), 10);
    expect(finalState.status).toBe('failed');
    expect(finalState.endCondition?.reason).toBe('asphyxiation');
    expect(finalState.sol).toBeLessThanOrEqual(5);
  });

  it('triggers Dehydration failure after 3 consecutive sols without water', () => {
    const noWaterLoadout: Loadout = {
      itemIds: ['fission_unit', 'battery_bank', 'moxie_scaleup'],
      consumables: { waterKg: 0, o2Kg: 1000, foodKg: 2000 },
      mode: 'tutorial',
      seed: 11,
    };

    const finalState = runSteps(initializeSimulation(noWaterLoadout), 15);
    expect(finalState.status).toBe('failed');
    expect(finalState.endCondition?.reason).toBe('dehydration');
    expect(finalState.sol).toBeLessThanOrEqual(6);
  });

  it('triggers Starvation failure after 6 consecutive sols without food', () => {
    const noFoodLoadout: Loadout = {
      itemIds: ['fission_unit', 'battery_bank', 'eclss_recycler', 'moxie_scaleup'],
      consumables: { waterKg: 3000, o2Kg: 1000, foodKg: 0 },
      mode: 'tutorial',
      seed: 12,
    };

    const finalState = runSteps(initializeSimulation(noFoodLoadout), 20);
    expect(finalState.status).toBe('failed');
    expect(finalState.endCondition?.reason).toBe('starvation');
    expect(finalState.sol).toBeLessThanOrEqual(9);
  });

  it('triggers Radiation Poisoning abort when cumulative dose breaches 250 mSv', () => {
    let state = initializeSimulation({
      ...baseLoadout,
      itemIds: ['fission_unit', 'battery_bank'], // no shielding
    });
    // Force radiation dose to 249.5 mSv to test limit breach
    state.meters.doseMsvPerCrew = 249.5;

    const res = step(state);
    expect(res.state.status).toBe('failed');
    expect(res.state.endCondition?.reason).toBe('radiation_poisoning');
  });

  it('completes mission with Success when surviving full duration', () => {
    const balancedLoadout: Loadout = {
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
        waterKg: 2200,
        o2Kg: 400,
        foodKg: 1800,
      },
      mode: 'tutorial',
      seed: 99,
    };

    const finalState = runSteps(initializeSimulation(balancedLoadout), 70);
    expect(finalState.status).toBe('completed');
    expect(finalState.endCondition?.reason).toBe('success');
    expect(finalState.sol).toBeGreaterThanOrEqual(60);
  });

  it('conserves ledger contributions: causes sum equals delta for every meter entry', () => {
    const state = runSteps(initializeSimulation(baseLoadout), 15);
    expect(state.ledger.length).toBeGreaterThan(0);

    for (const entry of state.ledger) {
      if (entry.causes.length > 0) {
        const sumOfCauses = entry.causes.reduce((sum, c) => sum + c.amount, 0);
        expect(sumOfCauses).toBeCloseTo(entry.delta, 2);
      }
    }
  });
});
