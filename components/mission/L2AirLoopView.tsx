'use client';

import React from 'react';
import { useGameStore } from '../../store/game';
import type { DailyStepResult } from '../../src/engine';

interface L2AirLoopViewProps {
  currentStep: DailyStepResult;
}

export function L2AirLoopView({ currentStep }: L2AirLoopViewProps) {
  const { coupledConfig } = useGameStore();
  const crew = coupledConfig.crew;
  const crewCount = crew.length;

  const hasSabatier = coupledConfig.eclssUnits.some((u) => u.id === 'eclss_sabatier');
  const hasBosch = coupledConfig.eclssUnits.some((u) => u.id === 'eclss_bosch');
  const hasPlants = coupledConfig.eclssUnits.some((u) => u.id === 'eclss_plants');

  // Single source of truth read directly from simulation telemetry
  const o2ConsumedPerDay = currentStep.dailyCrewO2DemandKg;
  const co2ExhaledPerDay = currentStep.dailyCrewCo2ExhaledKg;
  const h2ProducedFromO2Electrolysis = o2ConsumedPerDay * (4.032 / 31.998);
  const waterRecoveredFromSabatier = currentStep.sabatierWaterProducedKg;
  const ch4Vented = currentStep.dayMethaneVentedKg;
  const co2OverboardVented = currentStep.co2OverboardVentedKg;
  const emergentO2RecoveryPct = o2ConsumedPerDay > 0
    ? (waterRecoveredFromSabatier * (31.998 / 36.03) / o2ConsumedPerDay) * 100
    : 0;

  const ppCo2 = currentStep.ppCo2MmHg;
  const hoursToLimit = currentStep.hoursToCo2Limit;
  const carbonLedger = currentStep.carbonLedger;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--hmi-surface)',
        border: '1px solid var(--hmi-border)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-4)',
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid var(--hmi-border)',
          paddingBottom: 'var(--space-3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
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
            L2 Subsystem: Atmosphere, Stoichiometry & Carbon Ledger
          </span>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--hmi-text-dim)',
              marginTop: 'var(--space-quarter)',
            }}
          >
            Ideal-gas partial pressures (P = nRT/V), Sabatier 50% O2 ceiling, and acute cognitive degradation
          </span>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: `1px solid ${ppCo2 > 3.0 ? 'var(--alarm-p1)' : 'var(--hmi-border)'}`,
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--r-0)',
          }}
        >
          CABIN ppCO2: <strong style={{ color: ppCo2 > 3.0 ? 'var(--alarm-p1)' : ppCo2 > 2.5 ? 'var(--caution)' : 'var(--sage)' }}>{ppCo2.toFixed(2)} mmHg</strong>
          <span style={{ color: 'var(--hmi-text-dim)', marginLeft: 'var(--space-2)' }}>
            (Time-to-Limit: {hoursToLimit.toFixed(1)} h)
          </span>
        </div>
      </div>

      {/* Stoichiometric Air Balance & Reaction Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {/* O2 Generation & Respiration */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--hmi-text)' }}>
            O2 DEMAND & ELECTROLYSIS
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text)' }}>
            Crew Oxygen Intake: <strong>{o2ConsumedPerDay.toFixed(2)} kg/day</strong>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            Electrolysis Water Input: {(o2ConsumedPerDay * (36.03 / 31.998)).toFixed(2)} kg/day
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            Generated H2 Byproduct: {h2ProducedFromO2Electrolysis.toFixed(3)} kg/day
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)', borderTop: '1px solid var(--hmi-border)', paddingTop: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
            Reaction: 2 H2O → 2 H2 + O2 (100% electrolytic efficiency)
          </div>
        </div>

        {/* CO2 Reduction & Sabatier Ceiling */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--hmi-text)' }}>
              SABATIER CO2 REDUCTION
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: emergentO2RecoveryPct > 45 ? 'var(--hmi-text-dim)' : 'var(--alarm-p2)', fontWeight: 700 }}>
              [{emergentO2RecoveryPct.toFixed(1)}% O2 RECOVERY]
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text)' }}>
            Crew Exhaled CO2: <strong>{co2ExhaledPerDay.toFixed(2)} kg/day</strong>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            Sabatier Water Recovered: +{waterRecoveredFromSabatier.toFixed(2)} kg/day
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            Methane (CH4) Vented: -{ch4Vented.toFixed(2)} kg/day
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            Overboard CO2 Vented: -{co2OverboardVented.toFixed(2)} kg/day
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)', borderTop: '1px solid var(--hmi-border)', paddingTop: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
            Reaction: CO2 + 4 H2 → CH4 (vented) + 2 H2O
          </div>
        </div>

        {/* Elemental Carbon Ledger */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--hmi-text)' }}>
              CARBON ATOM LEDGER
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)', fontWeight: 700 }}>
              [{carbonLedger.carbonClosurePct.toFixed(1)}% RECYCLED]
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text)' }}>
            Food Carbon In: <strong>{carbonLedger.carbonInFoodKg.toFixed(2)} kg C/d</strong>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            Exhaled CO2 Carbon: {carbonLedger.carbonOutCo2Kg.toFixed(2)} kg C/d
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            Vented CH4 Carbon: {carbonLedger.carbonOutCh4Kg.toFixed(2)} kg C/d
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)', borderTop: '1px solid var(--hmi-border)', paddingTop: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
            Exhaled C Returned to Food Biomass: {carbonLedger.carbonClosurePct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Acute Cognitive Degradation Curve Graph */}
      <div
        style={{
          backgroundColor: 'var(--hmi-surface-elevated)',
          border: '1px solid var(--hmi-border)',
          padding: 'var(--space-3)',
          borderRadius: 'var(--r-1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', fontWeight: 700, color: 'var(--hmi-text)' }}>
            ppCO2 vs. ACUTE COGNITIVE PERFORMANCE DEGRADATION
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
            NASA-STD-3001 Vol 2 Rev D & Satish et al. (2012)
          </span>
        </div>

        <svg
          viewBox="0 0 600 160"
          style={{ width: '100%', maxWidth: '600px', height: 'auto', margin: '0 auto' }}
          aria-label="Cognitive Degradation Curve Graph"
        >
          {/* Grid lines */}
          <line x1="50" y1="20" x2="570" y2="20" stroke="var(--hmi-track)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="50" y1="60" x2="570" y2="60" stroke="var(--hmi-track)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="50" y1="100" x2="570" y2="100" stroke="var(--hmi-track)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="50" y1="140" x2="570" y2="140" stroke="var(--hmi-border)" strokeWidth="1" />
          <line x1="50" y1="20" x2="50" y2="140" stroke="var(--hmi-border)" strokeWidth="1" />

          {/* Y Axis Labels */}
          <text x="40" y="25" textAnchor="end" fill="var(--hmi-text-dim)" fontSize="9" fontFamily="monospace">100%</text>
          <text x="40" y="65" textAnchor="end" fill="var(--hmi-text-dim)" fontSize="9" fontFamily="monospace">80%</text>
          <text x="40" y="105" textAnchor="end" fill="var(--hmi-text-dim)" fontSize="9" fontFamily="monospace">50%</text>
          <text x="40" y="145" textAnchor="end" fill="var(--hmi-text-dim)" fontSize="9" fontFamily="monospace">0%</text>

          {/* X Axis Labels */}
          <text x="50" y="155" textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="9" fontFamily="monospace">0 mmHg</text>
          <text x="180" y="155" textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="9" fontFamily="monospace">2.0 mmHg</text>
          <text x="245" y="155" textAnchor="middle" fill="var(--alarm-p1)" fontSize="9" fontWeight="bold" fontFamily="monospace">3.0 (Limit)</text>
          <text x="375" y="155" textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="9" fontFamily="monospace">5.0 mmHg</text>
          <text x="570" y="155" textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="9" fontFamily="monospace">8.0 mmHg</text>

          {/* 3.0 mmHg NASA Limit Vertical Line */}
          <line x1="245" y1="20" x2="245" y2="140" stroke="var(--alarm-p1)" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Sigmoidal Cognitive Degradation Curve */}
          <path
            d="M 50,20 L 180,22 C 220,25 245,45 280,65 C 340,95 400,120 570,135"
            fill="none"
            stroke="var(--ember)"
            strokeWidth="2.5"
          />

          {/* Current Operating Point Marker with Off-Scale Indicator */}
          {(() => {
            const isOffScale = ppCo2 > 8.0;
            const clampPpCo2 = Math.min(8.0, Math.max(0, ppCo2));
            const x = 50 + (clampPpCo2 / 8.0) * 520;
            let perf = 1.0;
            if (clampPpCo2 > 2.0) {
              perf = Math.max(0.1, 1.0 - Math.min(0.9, Math.pow((clampPpCo2 - 2.0) / 4.0, 1.8)));
            }
            const y = 140 - perf * 120;

            if (isOffScale) {
              return (
                <g>
                  {/* Off-scale marker at the right boundary */}
                  <line x1="570" y1="20" x2="570" y2="140" stroke="var(--alarm-p1)" strokeWidth="2.5" />
                  <polygon points="565,60 575,65 565,70" fill="var(--alarm-p1)" />
                  <rect x="420" y="45" width="145" height="24" rx="2" fill="var(--alarm-p1)" />
                  <text x="492" y="61" textAnchor="middle" fill="var(--color-basalt)" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    ▶ OFF-SCALE [{ppCo2.toFixed(1)} mmHg]
                  </text>
                </g>
              );
            }

            return (
              <g>
                <circle cx={x} cy={y} r="5" fill={ppCo2 > 3.0 ? 'var(--alarm-p1)' : 'var(--sage)'} stroke="var(--ink)" strokeWidth="1.5" />
                <text x={x} y={y - 10} textAnchor="middle" fill="var(--hmi-text)" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  Current: {ppCo2.toFixed(1)} mmHg ({(perf * 100).toFixed(0)}%)
                </text>
              </g>
            );
          })()}
        </svg>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
          * Continuous exposure to ppCO2 &gt; 3.0 mmHg impairs executive function, strategizing, and operational throughput (NASA-STD-3001 1-hour average limit).
        </div>
      </div>
    </div>
  );
}

