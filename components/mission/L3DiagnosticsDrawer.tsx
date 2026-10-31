'use client';

import React from 'react';
import Link from 'next/link';
import type { DailyStepResult } from '../../src/engine';

interface L3DiagnosticsDrawerProps {
  currentStep: DailyStepResult;
  onClose: () => void;
}

export function L3DiagnosticsDrawer({ currentStep, onClose }: L3DiagnosticsDrawerProps) {
  const audit = currentStep.massBalanceAudit;
  const carbon = currentStep.carbonLedger;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '560px',
        backgroundColor: 'var(--hmi-surface)',
        borderLeft: '2px solid var(--hmi-border)',
        padding: 'var(--space-4)',
        boxSizing: 'border-box',
        overflowY: 'auto',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.5)',
      }}
    >
      {/* Drawer Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid var(--hmi-border)',
          paddingBottom: 'var(--space-2)',
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
            L3/L4 Technical Diagnostics
          </span>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              color: 'var(--hmi-text-dim)',
            }}
          >
            SOL {currentStep.sol} / DAY {currentStep.day} Physical Conservation Audit
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            padding: 'var(--space-1) var(--space-3)',
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            color: 'var(--hmi-text)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
            cursor: 'pointer',
            borderRadius: 'var(--r-0)',
          }}
        >
          [CLOSE ✕]
        </button>
      </div>

      {/* Daily Mass-Balance Audit Ledger Table */}
      <div
        style={{
          backgroundColor: 'var(--hmi-surface-elevated)',
          border: `1px solid ${audit.withinTolerance ? 'var(--hmi-border)' : 'var(--alarm-p1)'}`,
          padding: 'var(--space-3)',
          borderRadius: 'var(--r-1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', fontWeight: 700, color: 'var(--hmi-text)' }}>
            DAILY CONSERVATION OF MASS AUDIT
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              padding: 'var(--space-quarter) var(--space-1)',
              backgroundColor: audit.withinTolerance ? 'var(--sage)' : 'var(--alarm-p1)',
              color: 'var(--color-basalt)',
              fontWeight: 700,
              borderRadius: 'var(--r-0)',
            }}
          >
            {audit.withinTolerance ? '✓ CONSERVED (<=2%)' : '▲ IMBALANCE (>2%)'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)' }}>
          <div>Total Inputs: <strong style={{ color: 'var(--hmi-text)' }}>{audit.inputsKg.toFixed(3)} kg</strong></div>
          <div>Total Outputs: <strong style={{ color: 'var(--hmi-text)' }}>{audit.outputsKg.toFixed(3)} kg</strong></div>
          <div>Delta: <strong style={{ color: audit.withinTolerance ? 'var(--sage)' : 'var(--alarm-p1)' }}>{audit.deltaKg.toFixed(3)} kg</strong></div>
          <div>Error Rate: <strong style={{ color: audit.withinTolerance ? 'var(--sage)' : 'var(--alarm-p1)' }}>{audit.errorPct.toFixed(2)}%</strong></div>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)', borderTop: '1px solid var(--hmi-border)', paddingTop: 'var(--space-1)' }}>
          Physical Law: Σ Inputs (O2 + Food + Ingested Water) = Σ Outputs (CO2 + Urine + Respiration Vapor + Sweat + Feces + Solids). Tolerance threshold: 2.0%.
        </div>
      </div>

      {/* Carbon Ledger Balance */}
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
          ELEMENTAL CARBON RECYCLING LEDGER
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)' }}>
          <div>Food Carbon In: <strong style={{ color: 'var(--hmi-text)' }}>{carbon.carbonInFoodKg.toFixed(2)} kg C</strong></div>
          <div>CO2 Carbon Out: <strong style={{ color: 'var(--hmi-text)' }}>{carbon.carbonOutCo2Kg.toFixed(2)} kg C</strong></div>
          <div>CH4 Carbon Vented: <strong style={{ color: 'var(--alarm-p2)' }}>{carbon.carbonOutCh4Kg.toFixed(2)} kg C</strong></div>
          <div>Trash Carbon Out: <strong style={{ color: 'var(--hmi-text-dim)' }}>{carbon.carbonOutTrashKg.toFixed(2)} kg C</strong></div>
          <div>Biomass Recycled: <strong style={{ color: 'var(--sage)' }}>{carbon.carbonOutBiomassKg.toFixed(2)} kg C</strong></div>
          <div>Carbon Closure: <strong style={{ color: 'var(--sage)' }}>{carbon.carbonClosurePct.toFixed(1)}%</strong></div>
        </div>
      </div>

      {/* Link to Full Constants Registry */}
      <div
        style={{
          marginTop: 'auto',
          padding: 'var(--space-3)',
          backgroundColor: 'var(--hmi-surface-elevated)',
          border: '1px solid var(--hmi-border)',
          borderRadius: 'var(--r-1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', fontWeight: 700, color: 'var(--hmi-text)', display: 'block' }}>
            ENGINE CONSTANTS REGISTRY
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
            Search, filter, and inspect NASA-STD-3001 & BVAD citations
          </span>
        </div>

        <Link
          href="/sources"
          style={{
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: 'var(--ember)',
            color: 'var(--color-basalt)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-caption)',
            fontWeight: 700,
            textDecoration: 'none',
            borderRadius: 'var(--r-0)',
          }}
        >
          BROWSE REGISTRY →
        </Link>
      </div>
    </div>
  );
}
