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

  const o2ConsumedPerDay = crewCount * 0.84;
  const co2ExhaledPerDay = crewCount * 1.02;

  // Stoichiometry
  const h2ProducedFromO2Electrolysis = o2ConsumedPerDay * (4.032 / 31.998); // 0.126 kg H2 / kg O2
  const sabatierCo2Reacted = hasSabatier ? Math.min(co2ExhaledPerDay, h2ProducedFromO2Electrolysis * (44.01 / 16.128)) : 0;
  const ch4Vented = hasSabatier ? sabatierCo2Reacted * (16.04 / 44.01) : 0;
  const waterRecoveredFromSabatier = hasSabatier ? sabatierCo2Reacted * (36.03 / 44.01) : 0;
  const emergentO2RecoveryPct = hasBosch ? 98.0 : hasSabatier ? 47.5 : 0.0;

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
          <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--tier-req)' }}>
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
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--sage)' }}>
              SABATIER CO2 REDUCTION
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--caution)', fontWeight: 700 }}>
              [{emergentO2RecoveryPct.toFixed(1)}% O2 CAP]
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text)' }}>
            Crew Exhaled CO2: <strong>{co2ExhaledPerDay.toFixed(2)} kg/day</strong>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            Sabatier Water Recovered: +{waterRecoveredFromSabatier.toFixed(2)} kg/day
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--alarm-p2)' }}>
            Methane (CH4) Vented Loss: -{ch4Vented.toFixed(2)} kg/day
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
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--ember)' }}>
              CARBON ATOM LEDGER
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--sage)', fontWeight: 700 }}>
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

          {/* Current Operating Point Marker */}
          {(() => {
            const clampPpCo2 = Math.min(8.0, Math.max(0, ppCo2));
            const x = 50 + (clampPpCo2 / 8.0) * 520;
            // approximate performance y
            let perf = 1.0;
            if (clampPpCo2 > 2.0) {
              perf = 1.0 - Math.min(0.9, Math.pow((clampPpCo2 - 2.0) / 4.0, 1.8));
            }
            const y = 140 - perf * 120;
            return (
              <g>
                <circle cx={x} cy={y} r="5" fill="var(--alarm-p1)" stroke="var(--ink)" strokeWidth="1.5" />
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
