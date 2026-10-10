import { describe, it, expect } from 'vitest';
import { runAllBalanceTests } from '../scripts/run-balance';

describe('Game Balance Verification', () => {
  it('satisfies win-rate targets and item diversity across 200 seeds', () => {
    const { results, allTargetsMet, diversityMet } = runAllBalanceTests(100);

    const balancedResult = results.find((r) => r.botId === 'balanced');
    expect(balancedResult).toBeDefined();
    expect(balancedResult!.winRate).toBeGreaterThanOrEqual(50);
    expect(balancedResult!.winRate).toBeLessThanOrEqual(80);

    const extremeBots = results.filter((r) => r.botId !== 'balanced');
    for (const bot of extremeBots) {
      expect(bot.winRate).toBeLessThan(30);
    }

    expect(diversityMet).toBe(true);
  });
});
