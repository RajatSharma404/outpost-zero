'use client';

import React from 'react';
import { useGameStore } from '../../store/game';
import { ALL_AVAILABLE_ECLSS_UNITS, type ECLSSUnit } from '../../src/engine';

export function LifeSupportArchitecture() {
  const { coupledConfig, toggleEclssUnit } = useGameStore();
  const selectedUnits = coupledConfig.eclssUnits;

  const hasWrs = selectedUnits.some((u) => u.id === 'eclss_wrs');
  const hasBpa = selectedUnits.some((u) => u.id === 'eclss_bpa');
  const hasOgs = selectedUnits.some((u) => u.id === 'eclss_ogs');
  const hasSabatier = selectedUnits.some((u) => u.id === 'eclss_sabatier');
  const hasBosch = selectedUnits.some((u) => u.id === 'eclss_bosch');
  const hasPyrolysis = selectedUnits.some((u) => u.id === 'eclss_pyrolysis');
  const hasPlants = selectedUnits.some((u) => u.id === 'eclss_plants');

  // Live calculated metrics
  const waterRecoveryPct = hasWrs ? (hasBpa ? 98.0 : 93.5) : 0.0;
  const o2RecoveryPct = hasBosch
    ? 98.0
    : hasSabatier && hasPyrolysis
    ? 95.0
    : hasSabatier
    ? 47.5
    : 0.0;

  const totalPowerKw = selectedUnits.reduce((sum, u) => sum + u.powerKw, 0);
  const totalMassKg = selectedUnits.reduce((sum, u) => sum + u.massKg, 0);
  const totalVolumeM3 = selectedUnits.reduce((sum, u) => sum + u.volumeM3, 0);
  const totalSpares = selectedUnits.reduce((sum, u) => sum + u.sparesCarried, 0);

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
            Closed-Loop ECLSS Architecture
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
            Stoichiometric gas and water recovery systems with physical mass balance
          </span>
        </div>

        {/* Live Aggregates Header */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div>
            H2O Loop: <strong style={{ color: 'var(--sage)' }}>{waterRecoveryPct.toFixed(1)}%</strong>
          </div>
          <div>
            O2 Loop: <strong style={{ color: o2RecoveryPct <= 50 ? 'var(--caution)' : 'var(--sage)' }}>{o2RecoveryPct.toFixed(1)}%</strong>
          </div>
          <div>
            Power: <strong style={{ color: 'var(--ember)' }}>{totalPowerKw.toFixed(1)} kW</strong>
          </div>
          <div>
            Hardware: <strong style={{ color: 'var(--hmi-text)' }}>{(totalMassKg / 1000).toFixed(2)} t</strong>
          </div>
        </div>
      </div>

      {/* Selectable Technology Units Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {ALL_AVAILABLE_ECLSS_UNITS.map((unit) => {
          const isEnabled = selectedUnits.some((u) => u.id === unit.id);
          return (
            <div
              key={unit.id}
              onClick={() => toggleEclssUnit(unit.id)}
              style={{
                padding: 'var(--space-3)',
                backgroundColor: isEnabled ? 'var(--hmi-surface-elevated)' : 'transparent',
                border: isEnabled ? '2px solid var(--sage)' : '1px solid var(--hmi-border)',
                borderRadius: 'var(--r-1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
                userSelect: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-condensed)',
                    fontSize: 'var(--fs-body)',
                    fontWeight: 700,
                    color: 'var(--hmi-text)',
                  }}
                >
                  {unit.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-caption)',
                    padding: 'var(--space-quarter) var(--space-1)',
                    backgroundColor: isEnabled ? 'var(--sage)' : 'var(--hmi-track)',
                    color: isEnabled ? 'var(--color-basalt)' : 'var(--hmi-text-dim)',
                    fontWeight: 700,
                    borderRadius: 'var(--r-0)',
                  }}
                >
                  {isEnabled ? '[ONLINE]' : '[OFFLINE]'}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-1)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-detail)',
                  color: 'var(--hmi-text-dim)',
                }}
              >
                <div>Throughput: <strong style={{ color: 'var(--hmi-text)' }}>{unit.throughputKgPerDay} kg/d</strong></div>
                <div>Efficiency: <strong style={{ color: 'var(--hmi-text)' }}>{(unit.efficiency * 100).toFixed(1)}%</strong></div>
                <div>Power: <strong style={{ color: 'var(--ember)' }}>{unit.powerKw} kW</strong></div>
                <div>Mass: <strong style={{ color: 'var(--hmi-text)' }}>{unit.massKg} kg</strong></div>
                <div>Volume: <strong style={{ color: 'var(--hmi-text)' }}>{unit.volumeM3} m³</strong></div>
                <div>MTBF: <strong style={{ color: 'var(--hmi-text)' }}>{unit.mtbfHours.toLocaleString()} h</strong></div>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-caption)',
                  color: 'var(--hmi-text-dim)',
                  borderTop: '1px solid var(--hmi-border)',
                  paddingTop: 'var(--space-1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Spares: {unit.sparesCarried} ORUs</span>
                <span>Repair: {unit.repairCrewHours} crew-hours</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Physics / Stoichiometry Notes */}
      <div
        style={{
          borderTop: '1px solid var(--hmi-border)',
          paddingTop: 'var(--space-2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-caption)',
          color: 'var(--hmi-text-dim)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
        }}
      >
        <div>
          * <strong>Sabatier Oxygen Ceiling</strong>: Sabatier reaction ($CO_2 + 4 H_2 \rightarrow CH_4 + 2 H_2O$) vents methane, permanently losing 50% of metabolic hydrogen. Emergent $O_2$ recovery relative to crew consumption naturally caps at 50.0% (47.5% at 95% efficiency).
        </div>
        <div>
          * <strong>Brine Processor Assembly (BPA)</strong>: Recovers an additional 4.5% water from vacuum-distilled urine brine, raising total water loop closure from 93.5% to 98.0%.
        </div>
        <div>
          * <strong>Bosch / Pyrolysis Option</strong>: Recovers the remaining 50% $O_2$ by depositing solid carbon rather than venting methane, but incurs higher power and maintenance penalty.
        </div>
      </div>
    </div>
  );
}

