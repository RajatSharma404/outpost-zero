'use client';

import React from 'react';
import { useGameStore } from '../../store/game';
import type { DailyStepResult } from '../../src/engine';

interface L2WaterLoopViewProps {
  currentStep: DailyStepResult;
}

export function L2WaterLoopView({ currentStep }: L2WaterLoopViewProps) {
  const { coupledConfig } = useGameStore();
  const crew = coupledConfig.crew;
  const hasBpa = coupledConfig.eclssUnits.some((u) => u.id === 'eclss_bpa');

  const crewCount = crew.length;
  const drinkingPrepPerDay = crewCount * 2.5;
  const hygienePerDay = crewCount * 0.4;
  const flushPerDay = crewCount * 0.3;
  const totalWaterInKg = drinkingPrepPerDay + hygienePerDay + flushPerDay;

  const urineWaterKg = crewCount * 1.84;
  const vaporWaterKg = crewCount * 2.38;
  const sweatWaterKg = crewCount * 0.32;
  const fecesWaterKg = crewCount * 0.09;
  const wastewaterKg = urineWaterKg + vaporWaterKg + sweatWaterKg;

  const recoveryEfficiency = hasBpa ? 0.98 : 0.935;
  const recoveredPotableKg = wastewaterKg * recoveryEfficiency;
  const brineLossKg = wastewaterKg * (1 - recoveryEfficiency);

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
            L2 Subsystem: Closed-Loop Water Recovery (WRS + BPA)
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
            Physical fluid routing, condensation collection, catalytic distillation, and brine vacuum processing
          </span>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--r-0)',
          }}
        >
          RECOVERY CLOSURE: <strong style={{ color: 'var(--sage)' }}>{(recoveryEfficiency * 100).toFixed(1)}%</strong>
          <span style={{ color: 'var(--hmi-text-dim)', marginLeft: 'var(--space-2)' }}>
            ({hasBpa ? 'WRS + BPA Vacuum Distillation' : 'WRS Distillation Only, No BPA'})
          </span>
        </div>
      </div>

      {/* SVG Water Flow Diagram */}
      <div
        style={{
          backgroundColor: 'var(--hmi-surface-elevated)',
          border: '1px solid var(--hmi-border)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--r-1)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 720 280"
          style={{ width: '100%', maxWidth: '720px', height: 'auto' }}
          aria-label="Water Loop Flow Diagram"
        >
          {/* Blocks */}
          {/* 1. Potable Storage Tank */}
          <rect x="20" y="80" width="130" height="80" fill="var(--hmi-surface)" stroke="var(--water)" strokeWidth="2" />
          <text x="85" y="110" textAnchor="middle" fill="var(--water-text)" fontSize="12" fontWeight="bold" fontFamily="monospace">
            POTABLE TANK
          </text>
          <text x="85" y="130" textAnchor="middle" fill="var(--hmi-text)" fontSize="14" fontWeight="bold" fontFamily="monospace">
            {currentStep.potableWaterRemainingKg.toFixed(0)} kg
          </text>
          <text x="85" y="148" textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="10" fontFamily="monospace">
            {drinkingPrepPerDay.toFixed(1)} kg/d draw
          </text>

          {/* Flow Line Tank -> Crew */}
          <path d="M 150 120 L 220 120" stroke="var(--water)" strokeWidth="2" strokeDasharray="4 4" />
          <polygon points="220,116 228,120 220,124" fill="var(--water)" />

          {/* 2. Crew Metabolism & Habitat */}
          <rect x="230" y="50" width="160" height="140" fill="var(--hmi-surface)" stroke="var(--rule)" strokeWidth="2" />
          <text x="310" y="75" textAnchor="middle" fill="var(--hmi-text)" fontSize="12" fontWeight="bold" fontFamily="monospace">
            CREW HABITAT ({crewCount}P)
          </text>
          <text x="310" y="100" textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="11" fontFamily="monospace">
            Drinking: {drinkingPrepPerDay.toFixed(1)} kg/d
          </text>
          <text x="310" y="120" textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="11" fontFamily="monospace">
            Hygiene: {hygienePerDay.toFixed(1)} kg/d
          </text>
          <text x="310" y="140" textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="11" fontFamily="monospace">
            Urinal Flush: {flushPerDay.toFixed(1)} kg/d
          </text>
          <text x="310" y="165" textAnchor="middle" fill="var(--sage)" fontSize="11" fontWeight="bold" fontFamily="monospace">
            Vapor + Urine: {wastewaterKg.toFixed(1)} kg/d
          </text>

          {/* Flow Line Crew -> WRS */}
          <path d="M 390 120 L 460 120" stroke="var(--ember)" strokeWidth="2" strokeDasharray="4 4" />
          <polygon points="460,116 468,120 460,124" fill="var(--ember)" />

          {/* 3. Water Recovery System (WRS) */}
          <rect x="470" y="70" width="130" height="100" fill="var(--hmi-surface)" stroke="var(--sage)" strokeWidth="2" />
          <text x="535" y="95" textAnchor="middle" fill="var(--sage)" fontSize="12" fontWeight="bold" fontFamily="monospace">
            WRS PROCESSOR
          </text>
          <text x="535" y="115" textAnchor="middle" fill="var(--hmi-text)" fontSize="11" fontFamily="monospace">
            Rotary Distiller
          </text>
          <text x="535" y="135" textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="10" fontFamily="monospace">
            93.5% Baseline
          </text>
          <text x="535" y="155" textAnchor="middle" fill="var(--sage)" fontSize="11" fontWeight="bold" fontFamily="monospace">
            +{(wastewaterKg * 0.935).toFixed(1)} kg/d
          </text>

          {/* Flow Line WRS -> BPA */}
          <path d="M 535 170 L 535 210" stroke="var(--caution)" strokeWidth="2" strokeDasharray="4 4" />
          <polygon points="531,210 535,218 539,210" fill="var(--caution)" />

          {/* 4. Brine Processor Assembly (BPA) */}
          <rect x="470" y="220" width="130" height="50" fill="var(--hmi-surface)" stroke={hasBpa ? 'var(--sage)' : 'var(--rule)'} strokeWidth="2" />
          <text x="535" y="240" textAnchor="middle" fill={hasBpa ? 'var(--sage)' : 'var(--hmi-text-dim)'} fontSize="11" fontWeight="bold" fontFamily="monospace">
            BPA (BRINE UNIT)
          </text>
          <text x="535" y="258" textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="10" fontFamily="monospace">
            {hasBpa ? '+4.5% extra -> 98%' : 'OFFLINE (Vent Brine)'}
          </text>

          {/* Return Line BPA/WRS -> Potable Storage Tank */}
          <path d="M 535 70 L 535 25 L 85 25 L 85 80" fill="none" stroke="var(--water)" strokeWidth="2" />
          <polygon points="81,75 85,83 89,75" fill="var(--water)" />
          <text x="310" y="20" textAnchor="middle" fill="var(--water-text)" fontSize="11" fontWeight="bold" fontFamily="monospace">
            RECYCLED POTABLE WATER FLOW: +{recoveredPotableKg.toFixed(1)} kg/day
          </text>

          {/* Brine Waste Discharge Flow */}
          <path d="M 600 245 L 670 245" stroke="var(--alarm-p1)" strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="670,241 678,245 670,249" fill="var(--alarm-p1)" />
          <text x="685" y="240" fill="var(--alarm-p1)" fontSize="10" fontFamily="monospace">
            BRINE LOSS
          </text>
          <text x="685" y="255" fill="var(--hmi-text-dim)" fontSize="10" fontFamily="monospace">
            -{brineLossKg.toFixed(2)} kg/d
          </text>
        </svg>
      </div>

      {/* Numerical Mass Flow Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--hmi-border)', color: 'var(--hmi-text-dim)' }}>
              <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Fluid Subsystem Node</th>
              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Daily Rate (kg/d)</th>
              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Per Crew-Day (kg/CM-d)</th>
              <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Source Citation</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--hmi-border)' }}>
              <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>Potable Water Ingestion (Drinking + Food Rehydration)</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>{drinkingPrepPerDay.toFixed(2)}</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>2.50</td>
              <td style={{ padding: 'var(--space-2)', color: 'var(--tier-req)' }}>NASA-STD-3001 Vol 2</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--hmi-border)' }}>
              <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>Hygiene & Urinal Flush Water Draw</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>{(hygienePerDay + flushPerDay).toFixed(2)}</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>0.70</td>
              <td style={{ padding: 'var(--space-2)', color: 'var(--tier-obs)' }}>ISS Baseline (0.4 hygiene + 0.3 flush)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--hmi-border)' }}>
              <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>Respiration & Perspiration Vapor Condensate</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>{(vaporWaterKg + sweatWaterKg).toFixed(2)}</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>2.70</td>
              <td style={{ padding: 'var(--space-2)', color: 'var(--tier-obs)' }}>BVAD Rev 2 Table 3-24</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--hmi-border)' }}>
              <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>Urine Water Excretion</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>{urineWaterKg.toFixed(2)}</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>1.84</td>
              <td style={{ padding: 'var(--space-2)', color: 'var(--tier-obs)' }}>ISS 2010-2018 Empirical Mean (1.85 L/d)</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--hmi-border)' }}>
              <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>Feces Moisture (Unrecovered)</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--alarm-p2)' }}>{fecesWaterKg.toFixed(2)}</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--alarm-p2)' }}>0.09</td>
              <td style={{ padding: 'var(--space-2)', color: 'var(--tier-obs)' }}>BVAD Table 4-51</td>
            </tr>
            <tr style={{ borderTop: '2px solid var(--hmi-border)', fontWeight: 700 }}>
              <td style={{ padding: 'var(--space-2)', color: 'var(--sage)' }}>Net Potable Water Recovered</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--sage)' }}>+{recoveredPotableKg.toFixed(2)}</td>
              <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--sage)' }}>{(recoveredPotableKg / crewCount).toFixed(2)}</td>
              <td style={{ padding: 'var(--space-2)', color: 'var(--sage)' }}>WRS {(recoveryEfficiency * 100).toFixed(1)}% Closed Loop</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
