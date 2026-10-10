import { initializeSimulation, step } from '../lib/sim/engine';
import { ALL_BOTS, type BotStrategy } from '../lib/sim/bots';
import type { SimulationState } from '../lib/sim/types';

interface SimulationResult {
  botId: string;
  botName: string;
  totalRuns: number;
  wins: number;
  winRate: number;
  lossesByReason: Record<string, number>;
  itemWinCounts: Record<string, number>;
}

function runBotSimulation(bot: BotStrategy, numSeeds: number = 200): SimulationResult {
  let wins = 0;
  const lossesByReason: Record<string, number> = {};
  const itemWinCounts: Record<string, number> = {};

  for (let seed = 1; seed <= numSeeds; seed++) {
    const loadout = bot.createLoadout(seed);
    let state: SimulationState = initializeSimulation(loadout);

    let solCounter = 0;
    while (state.status !== 'completed' && state.status !== 'failed' && solCounter < 600) {
      solCounter++;
      if (state.status === 'paused_event' && state.pendingEvent) {
        const choiceId = bot.chooseAction(state.pendingEvent, state);
        const res = step(state, choiceId);
        state = res.state;
      } else {
        const res = step(state);
        state = res.state;
      }
    }

    if (state.status === 'completed') {
      wins++;
      for (const itemId of loadout.itemIds) {
        itemWinCounts[itemId] = (itemWinCounts[itemId] || 0) + 1;
      }
    } else if (state.endCondition) {
      const reason = state.endCondition.reason;
      lossesByReason[reason] = (lossesByReason[reason] || 0) + 1;
    }
  }

  return {
    botId: bot.id,
    botName: bot.name,
    totalRuns: numSeeds,
    wins,
    winRate: Math.round((wins / numSeeds) * 1000) / 10,
    lossesByReason,
    itemWinCounts,
  };
}

export function runAllBalanceTests(numSeeds: number = 200) {
  console.log(`\n======================================================`);
  console.log(`   OUTPOST ZERO: 200-SEED BALANCE BENCHMARK`);
  console.log(`======================================================\n`);

  const results: SimulationResult[] = [];
  const globalWinningItems: Record<string, number> = {};
  let totalGlobalWins = 0;

  for (const bot of ALL_BOTS) {
    process.stdout.write(`Simulating ${bot.name} across ${numSeeds} seeds... `);
    const start = Date.now();
    const res = runBotSimulation(bot, numSeeds);
    const duration = Date.now() - start;
    console.log(`Done (${duration}ms). Win rate: ${res.winRate}%`);
    results.push(res);

    totalGlobalWins += res.wins;
    for (const [item, count] of Object.entries(res.itemWinCounts)) {
      globalWinningItems[item] = (globalWinningItems[item] || 0) + count;
    }
  }

  console.log('\n--- BALANCE VERIFICATION TABLE ---');
  console.log('| Strategy Bot | Runs | Wins | Win Rate | Primary Failure Causes | Target Met? |');
  console.log('|:---|:---:|:---:|:---:|:---|:---:|');

  let allTargetsMet = true;

  for (const res of results) {
    const isBalanced = res.botId === 'balanced';
    const targetMet = isBalanced
      ? res.winRate >= 55 && res.winRate <= 75
      : res.winRate < 30;

    if (!targetMet) allTargetsMet = false;

    const topFailures = Object.entries(res.lossesByReason)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k} (${v})`)
      .join(', ') || 'None';

    const statusBadge = targetMet ? 'PASS' : 'FAIL';
    console.log(
      `| **${res.botName}** | ${res.totalRuns} | ${res.wins} | **${res.winRate}%** | ${topFailures} | ${statusBadge} |`,
    );
  }

  console.log('\n--- ITEM DIVERSITY IN WINNING LOADOUTS ---');
  let singleDominantItemFound = false;
  for (const [item, count] of Object.entries(globalWinningItems)) {
    const presencePercent = Math.round((count / totalGlobalWins) * 100);
    console.log(`- ${item}: present in ${presencePercent}% of winning runs (${count}/${totalGlobalWins})`);
    if (presencePercent >= 100) {
      singleDominantItemFound = true;
    }
  }

  const diversityMet = !singleDominantItemFound;
  console.log(`\nDiversity Criterion (no item in 100% of winning runs): ${diversityMet ? 'PASS' : 'FAIL'}`);
  console.log(`Overall Balance Criteria Met: ${allTargetsMet && diversityMet ? 'SUCCESS' : 'NEEDS TUNING'}\n`);

  return { results, allTargetsMet, diversityMet };
}

if (process.argv[1] && process.argv[1].includes('run-balance')) {
  runAllBalanceTests(200);
}
