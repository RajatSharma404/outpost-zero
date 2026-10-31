'use client';

import React, { useMemo } from 'react';
import type { SimulationConfig, MonteCarloSummary } from '../../src/engine';
import { runMonteCarloSimulation } from '../../src/engine';

interface MonteCarloChartProps {
  config: SimulationConfig;
}

export function MonteCarloChart({ config }: MonteCarloChartProps) {
  // Run N=1000 Monte Carlo simulation
  const mcResult: MonteCarloSummary = useMemo(() => {
    return runMonteCarloSimulation(config, 1000);
  }, [config]);

  const pLossOfCrewPct = mcResult.lossOfCrewProbabilityPct.toFixed(1);
  const successPct = mcResult.successRatePct.toFixed(1);

  const histogramBuckets = mcResult.sparesHistogram;
  const maxFrequency = Math.max(1, ...histogramBuckets.map((b) => b.count));

  return (
    <div
      style={{
        backgroundColor: 'var(--hmi-surface)',
        border: '1px solid var(--hmi-border)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-lead)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--hmi-text)',
              fontWeight: 700,
            }}
          >
            Monte Carlo Reliability Distribution (N=1,000 Runs)
          </span>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              color: 'var(--hmi-text-dim)',
            }}
          >
            {mcResult.label} (Poisson hardware failure hazard simulation)
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <div
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: mcResult.lossOfCrewProbabilityPct > 0 ? 'var(--alarm-p1-bg)' : 'var(--color-greenhouse-lit)',
              border: `1px solid ${mcResult.lossOfCrewProbabilityPct > 0 ? 'var(--alarm-p1)' : 'var(--sage)'}`,
              borderRadius: 'var(--r-0)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
            }}
          >
            P(LOSS OF CREW): <strong style={{ color: mcResult.lossOfCrewProbabilityPct > 0 ? 'var(--alarm-p1)' : 'var(--sage)' }}>{pLossOfCrewPct}%</strong>
          </div>

          <div
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              borderRadius: 'var(--r-0)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
            }}
          >
            MISSION SUCCESS: <strong style={{ color: 'var(--sage)' }}>{successPct}%</strong>
          </div>
        </div>
      </div>

      {/* SVG Histogram */}
      <div
        style={{
          backgroundColor: 'var(--hmi-surface-elevated)',
          border: '1px solid var(--hmi-border)',
          borderRadius: 'var(--r-1)',
          padding: 'var(--space-3)',
        }}
      >
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)', marginBottom: 'var(--space-2)' }}>
          FREQUENCY OF SPARES CONSUMED OVER 1,000 MISSIONS:
        </div>

        <svg
          viewBox="0 0 600 160"
          style={{ width: '100%', maxWidth: '600px', height: 'auto', margin: '0 auto' }}
          aria-label="Spares Consumed Monte Carlo Histogram"
        >
          {/* Baseline grid */}
          <line x1="40" y1="130" x2="580" y2="130" stroke="var(--hmi-border)" strokeWidth="1" />

          {histogramBuckets.map((b, i) => {
            const barWidth = Math.min(50, 480 / histogramBuckets.length - 10);
            const x = 50 + i * (barWidth + 14);
            const barHeight = (b.count / maxFrequency) * 100;
            const y = 130 - barHeight;

            return (
              <g key={b.rangeLabel}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="var(--hmi-fill)"
                  stroke="var(--hmi-border)"
                  strokeWidth="1"
                />
                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fill="var(--hmi-text)" fontSize="9" fontFamily="monospace">
                  {b.count}
                </text>
                <text x={x + barWidth / 2} y="145" textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="10" fontFamily="monospace">
                  {b.rangeLabel}
                </text>
              </g>
            );
          })}
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-1)' }}>
          <span>Median Spares Consumed: {mcResult.medianSparesUsed} ORUs</span>
          <span>Mean H2O Reserve: {mcResult.meanWaterReservesRemainingKg.toFixed(0)} kg</span>
          <span>Mean O2 Reserve: {mcResult.meanO2ReservesRemainingKg.toFixed(0)} kg</span>
        </div>
      </div>
    </div>
  );
}
