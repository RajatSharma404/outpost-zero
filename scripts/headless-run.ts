import { initializeSimulation, step } from '../lib/sim/engine';
import { buildMissionReport } from '../lib/sim/report';
import type { Loadout } from '../lib/sim/types';

function runHeadless() {
  console.log('--- OUTPOST ZERO: HEADLESS SIMULATION ---');

  const testLoadout: Loadout = {
    itemIds: [
      'solar_large',
      'fission_unit',
      'battery_bank',
      'eclss_recycler',
      'moxie_scaleup',
      'regolith_shield',
      'storm_shelter',
      'greenhouse_small',
      'spare_parts_kit',
      'medical_kit',
    ],
    consumables: {
      waterKg: 2500,
      o2Kg: 600,
      foodKg: 2000,
    },
    mode: 'standard',
    seed: 42,
  };

  let state = initializeSimulation(testLoadout);
  console.log(`Initialized mission. Target length: ${state.maxSols} sols. Seed: ${state.seed}`);

  let solCount = 0;
  while (state.status !== 'completed' && state.status !== 'failed' && solCount < 600) {
    solCount++;
    if (state.status === 'paused_event' && state.pendingEvent) {
      // Pick the first choice for headless run
      const choice = state.pendingEvent.choices[0];
      console.log(`[SOL ${state.sol}] Event: "${state.pendingEvent.title}" -> Selected: "${choice.label}"`);
      const res = step(state, choice.id);
      state = res.state;
    } else {
      const res = step(state);
      state = res.state;
    }
  }

  const report = buildMissionReport(state);

  console.log('\n--- MISSION CONCLUDED ---');
  console.log(`Status: ${report.outcome.toUpperCase()}`);
  console.log(`End Sol: ${report.endSol} of ${report.maxSols}`);
  console.log(`Headline: ${report.headline}`);
  console.log(`Score: ${report.score.totalScore}/100 (Grade: ${report.score.grade})`);
  console.log(`Remaining Reserves:`);
  console.log(`  Power: ${Math.round(state.meters.powerStoredKwh)} kWh`);
  console.log(`  Water: ${Math.round(state.meters.waterKg)} kg`);
  console.log(`  O2: ${Math.round(state.meters.o2Kg)} kg`);
  console.log(`  Food: ${Math.round(state.meters.foodKg)} kg`);
  console.log(`  Radiation Dose: ${state.meters.doseMsvPerCrew.toFixed(1)} mSv`);
  console.log(`  Crew Health: ${state.crew.health}%`);
  console.log(`  Morale: ${state.meters.morale}%`);

  console.log('\n--- CAUSE CHAIN ---');
  for (const node of report.causeChain) {
    console.log(`  [Sol ${node.sol}] [${node.category.toUpperCase()}] ${node.headline} - ${node.detail}`);
  }

  console.log('\n--- MENTOR NOTE ---');
  console.log(report.templatedMentorNote);
  console.log(`Recommendation: ${report.recommendation}`);
}

runHeadless();
