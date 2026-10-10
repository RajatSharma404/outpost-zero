import { describe, it, expect } from 'vitest';
import { initializeSimulation, step } from '../lib/sim/engine';
import { buildMissionReport } from '../lib/sim/report';
import type { Loadout, SimulationState } from '../lib/sim/types';

function runUntilEnd(initialState: SimulationState): SimulationState {
  let state = initialState;
  let counter = 0;
  while (state.status !== 'completed' && state.status !== 'failed' && counter < 600) {
    counter++;
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

describe('Report Screen & Root Cause Attribution', () => {
  it('Deliberate Failure 1 (Asphyxiation): cause chain correctly identifies oxygen depletion', () => {
    const noO2Loadout: Loadout = {
      itemIds: ['fission_unit', 'battery_bank'],
      consumables: { waterKg: 3000, o2Kg: 5, foodKg: 2000 },
      mode: 'tutorial',
      seed: 42,
    };

    const endState = runUntilEnd(initializeSimulation(noO2Loadout));
    expect(endState.status).toBe('failed');
    expect(endState.endCondition?.reason).toBe('asphyxiation');

    const report = buildMissionReport(endState);
    expect(report.outcome).toBe('failure');
    expect(report.headline).toContain('Asphyxiation');

    // Cause chain must contain oxygen depletion node
    const o2Node = report.causeChain.find(
      (n) => n.headline.includes('Oxygen') || n.detail.includes('oxygen'),
    );
    expect(o2Node).toBeDefined();
    expect(o2Node?.category).toBe('lifesupport');

    // Mentor note must name oxygen and recommend MOXIE or recycler
    expect(report.templatedMentorNote).toContain('oxygen');
    expect(report.recommendation).toContain('MOXIE');
  });

  it('Deliberate Failure 2 (Dehydration): cause chain correctly identifies water exhaustion', () => {
    const noWaterLoadout: Loadout = {
      itemIds: ['fission_unit', 'battery_bank', 'moxie_scaleup'],
      consumables: { waterKg: 5, o2Kg: 1000, foodKg: 2000 },
      mode: 'tutorial',
      seed: 43,
    };

    const endState = runUntilEnd(initializeSimulation(noWaterLoadout));
    expect(endState.status).toBe('failed');
    expect(endState.endCondition?.reason).toBe('dehydration');

    const report = buildMissionReport(endState);
    expect(report.outcome).toBe('failure');
    expect(report.headline).toContain('Dehydration');

    // Cause chain must contain water depletion node
    const waterNode = report.causeChain.find(
      (n) => n.headline.includes('Water') || n.detail.includes('water'),
    );
    expect(waterNode).toBeDefined();
    expect(waterNode?.category).toBe('lifesupport');

    // Mentor note must name water and recommend Closed-Loop ECLSS Recycler
    expect(report.templatedMentorNote).toContain('water');
    expect(report.recommendation).toContain('ECLSS Recycler');
  });

  it('Deliberate Failure 3 (Radiation Poisoning): cause chain correctly identifies shielding absence', () => {
    const unshieldedLoadout: Loadout = {
      itemIds: ['fission_unit', 'battery_bank', 'eclss_recycler', 'moxie_scaleup'],
      consumables: { waterKg: 3000, o2Kg: 800, foodKg: 2000 },
      mode: 'tutorial',
      seed: 44,
    };

    let state = initializeSimulation(unshieldedLoadout);
    // Force radiation dose right at threshold to simulate breach
    state.meters.doseMsvPerCrew = 249.5;

    const endState = runUntilEnd(state);
    expect(endState.status).toBe('failed');
    expect(endState.endCondition?.reason).toBe('radiation_poisoning');

    const report = buildMissionReport(endState);
    expect(report.outcome).toBe('failure');
    expect(report.headline).toContain('Radiation');

    // Cause chain must contain radiation exposure node
    const radNode = report.causeChain.find((n) => n.category === 'radiation');
    expect(radNode).toBeDefined();

    // Mentor note must explain cosmic rays and recommend Regolith Berm or Storm Shelter
    expect(report.templatedMentorNote).toContain('radiation');
    expect(report.recommendation).toContain('Regolith Berm');
  });
});
