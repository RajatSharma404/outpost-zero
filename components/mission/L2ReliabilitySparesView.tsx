'use client';

import React from 'react';
import { useGameStore } from '../../store/game';
import type { DailyStepResult } from '../../src/engine';

interface L2ReliabilitySparesViewProps {
  currentStep: DailyStepResult;
}

export function L2ReliabilitySparesView({ currentStep }: L2ReliabilitySparesViewProps) {
  const { coupledConfig } = useGameStore();
  const eclssUnits = coupledConfig.eclssUnits;
  const realityFactor = coupledConfig.realityFactor ?? 2.0;

  // Failure event log
  const unitEvents = currentStep.unitEvents;

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
            L2 Subsystem: Reliability, Hardware MTBF & Spares Depletion
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
            Poisson-distributed failure hazard with reality factor {realityFactor.toFixed(1)}x over design MTBF
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
          REPAIR BACKLOG: <strong style={{ color: 'var(--hmi-text)' }}>0.0 h</strong>
        </div>
      </div>

      {/* Hardware Reliability MTBF Table */}
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
              <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>ECLSS Subsystem Unit</th>
              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Design MTBF (h)</th>
              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Derated MTBF (h)</th>
              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Spares Carried</th>
              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Repair Labor (h)</th>
              <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {eclssUnits.map((u) => {
              const deratedMtbf = u.mtbfHours / realityFactor;
              return (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--hmi-border)' }}>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>{u.mtbfHours.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>{deratedMtbf.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>{u.sparesCarried} ORUs</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>{u.repairCrewHours.toFixed(1)}</td>
                  <td style={{ padding: 'var(--space-2)' }}>
                    <span
                      style={{
                        padding: 'var(--space-quarter) var(--space-1)',
                        backgroundColor: u.status === 'nominal' ? 'var(--hmi-track)' : 'var(--alarm-p1-bg)',
                        color: u.status === 'nominal' ? 'var(--sage)' : 'var(--alarm-p1)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--fs-caption)',
                        fontWeight: 700,
                        borderRadius: 'var(--r-0)',
                      }}
                    >
                      [{u.status.toUpperCase()}]
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Poisson Simulated Failure Log */}
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
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', fontWeight: 700, color: 'var(--hmi-text)' }}>
          SUBSYSTEM EVENT & ANOMALY LOG (MISSION DAY {currentStep.day})
        </span>

        {unitEvents.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--sage)' }}>
            ✓ All active life-support assemblies operating within nominal thermal, pressure, and throughput envelopes. Zero active faults.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {unitEvents.map((ev, i) => (
              <div
                key={i}
                style={{
                  padding: 'var(--space-1) var(--space-2)',
                  backgroundColor: 'var(--alarm-p2-bg)',
                  border: '1px solid var(--alarm-p2)',
                  color: 'var(--alarm-p2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-detail)',
                  borderRadius: 'var(--r-0)',
                }}
              >
                ▲ [SOL {currentStep.sol}] {ev}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
