/**
 * Outpost Zero: Seeded Monte Carlo Reliability Runner
 * Runs N stochastic simulations (default N=1000) to evaluate component breakdown distributions,
 * spare parts depletion, and loss-of-crew probabilities across mission timelines.
 * 
 * Formal Label: "Educational estimate, not a safety analysis."
 */

import type { SimulationConfig } from './types';
import { runFullSimulation } from './sim';
import { Mulberry32 } from '../../lib/sim/rng';

export interface MonteCarloHistogramBucket {
  rangeLabel: string;
  minVal: number;
  maxVal: number;
  count: number;
  percentage: number;
}

export interface MonteCarloSummary {
  iterations: number;
  label: string;
  successRatePct: number;
  lossOfCrewProbabilityPct: number;
  medianSparesUsed: number;
  meanWaterReservesRemainingKg: number;
  meanO2ReservesRemainingKg: number;
  meanFoodReservesRemainingKg: number;
  sparesHistogram: MonteCarloHistogramBucket[];
  reserveDaysHistogram: MonteCarloHistogramBucket[];
  commonFailurePoints: { unitName: string; failureCount: number; failureRatePct: number }[];
}

/**
 * Runs N Monte Carlo iterations across varied PRNG seeds.
 */
export function runMonteCarloSimulation(
  baseConfig: SimulationConfig,
  iterations = 1000,
): MonteCarloSummary {
  const masterRng = new Mulberry32(baseConfig.seed || 404);
  let successfulRuns = 0;
  let crewLostRuns = 0;

  const sparesUsedList: number[] = [];
  const reserveDaysList: number[] = [];
  const unitFailureCounts: Record<string, number> = {};

  let totalWaterEnd = 0;
  let totalO2End = 0;
  let totalFoodEnd = 0;

  for (let i = 0; i < iterations; i++) {
    const iterationSeed = Math.floor(masterRng.next() * 0xffffffff) >>> 0;
    const config: SimulationConfig = {
      ...baseConfig,
      seed: iterationSeed,
    };

    const simResult = runFullSimulation(config);

    if (simResult.success) {
      successfulRuns++;
    } else {
      crewLostRuns++;
    }

    sparesUsedList.push(simResult.totalSparesUsed);

    // Calculate approximate reserve days at mission end
    const lastDay = simResult.dailyResults[simResult.dailyResults.length - 1];
    if (lastDay) {
      const remainingWaterDays = Math.max(0, Math.floor(lastDay.potableWaterRemainingKg / (config.crew.length * 2.5)));
      reserveDaysList.push(remainingWaterDays);

      totalWaterEnd += lastDay.potableWaterRemainingKg;
      totalO2End += lastDay.o2RemainingKg;
      totalFoodEnd += lastDay.foodRemainingKg;

      for (const event of lastDay.unitEvents) {
        if (event.includes('FAILURE:')) {
          const match = event.match(/FAILURE:\s(.*?)\smalfunctioned/);
          if (match && match[1]) {
            unitFailureCounts[match[1]] = (unitFailureCounts[match[1]] || 0) + 1;
          }
        }
      }
    }
  }

  // Sort lists to compute medians and percentiles
  sparesUsedList.sort((a, b) => a - b);
  reserveDaysList.sort((a, b) => a - b);

  const medianSparesUsed = sparesUsedList[Math.floor(sparesUsedList.length / 2)] || 0;

  // Build Spares Histogram (Buckets: 0, 1-2, 3-4, 5-6, 7+)
  const sparesBuckets: MonteCarloHistogramBucket[] = [
    { rangeLabel: '0 Spares', minVal: 0, maxVal: 0, count: 0, percentage: 0 },
    { rangeLabel: '1 - 2 Spares', minVal: 1, maxVal: 2, count: 0, percentage: 0 },
    { rangeLabel: '3 - 4 Spares', minVal: 3, maxVal: 4, count: 0, percentage: 0 },
    { rangeLabel: '5 - 6 Spares', minVal: 5, maxVal: 6, count: 0, percentage: 0 },
    { rangeLabel: '7+ Spares', minVal: 7, maxVal: 999, count: 0, percentage: 0 },
  ];

  for (const count of sparesUsedList) {
    if (count === 0) sparesBuckets[0].count++;
    else if (count <= 2) sparesBuckets[1].count++;
    else if (count <= 4) sparesBuckets[2].count++;
    else if (count <= 6) sparesBuckets[3].count++;
    else sparesBuckets[4].count++;
  }
  for (const b of sparesBuckets) {
    b.percentage = Math.round((b.count / iterations) * 100);
  }

  // Build Reserve Days Histogram (Buckets: 0 d, 1-15 d, 16-30 d, 31-60 d, >60 d)
  const reserveBuckets: MonteCarloHistogramBucket[] = [
    { rangeLabel: '0 d (Exhausted)', minVal: 0, maxVal: 0, count: 0, percentage: 0 },
    { rangeLabel: '1 - 15 d', minVal: 1, maxVal: 15, count: 0, percentage: 0 },
    { rangeLabel: '16 - 30 d', minVal: 16, maxVal: 30, count: 0, percentage: 0 },
    { rangeLabel: '31 - 60 d', minVal: 31, maxVal: 60, count: 0, percentage: 0 },
    { rangeLabel: '> 60 d', minVal: 61, maxVal: 9999, count: 0, percentage: 0 },
  ];

  for (const days of reserveDaysList) {
    if (days === 0) reserveBuckets[0].count++;
    else if (days <= 15) reserveBuckets[1].count++;
    else if (days <= 30) reserveBuckets[2].count++;
    else if (days <= 60) reserveBuckets[3].count++;
    else reserveBuckets[4].count++;
  }
  for (const b of reserveBuckets) {
    b.percentage = Math.round((b.count / iterations) * 100);
  }

  const commonFailurePoints = Object.entries(unitFailureCounts)
    .map(([unitName, count]) => ({
      unitName,
      failureCount: count,
      failureRatePct: Math.round((count / iterations) * 100),
    }))
    .sort((a, b) => b.failureCount - a.failureCount);

  return {
    iterations,
    label: 'Educational estimate, not a safety analysis.',
    successRatePct: Math.round((successfulRuns / iterations) * 100),
    lossOfCrewProbabilityPct: Math.round((crewLostRuns / iterations) * 100),
    medianSparesUsed,
    meanWaterReservesRemainingKg: Math.round(totalWaterEnd / iterations),
    meanO2ReservesRemainingKg: Math.round(totalO2End / iterations),
    meanFoodReservesRemainingKg: Math.round(totalFoodEnd / iterations),
    sparesHistogram: sparesBuckets,
    reserveDaysHistogram: reserveBuckets,
    commonFailurePoints,
  };
}
