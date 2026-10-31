'use client';

import React from 'react';
import { useGameStore } from '../../store/game';

export function ContingencyPolicyPlanner() {
  const { coupledConfig, setCoupledConfig, setContingencyDays } = useGameStore();

  const outbound = coupledConfig.phaseDurations.outbound;
  const surface = coupledConfig.phaseDurations.surface;
  const returnDays = coupledConfig.phaseDurations.return;
  const contingencyDays = coupledConfig.contingencyExtensionDays;
  const totalMissionDays = outbound + surface + returnDays + contingencyDays;

  // Approximate radiation exposure: 1.84 mSv/day cruise, 0.67 mSv/sol surface
  const cruiseDays = outbound + returnDays;
  const surfaceDays = surface;
  const rawCruiseDose = cruiseDays * 1.84;
  const rawSurfaceDose = surfaceDays * 0.67;
  const shieldAttenuation = Math.min(0.5, (coupledConfig.shieldingMassKg / 10000) * 0.4);
  const totalProjectedDoseMsv = (rawCruiseDose + rawSurfaceDose) * (1.0 - shieldAttenuation);

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
        }}
      >
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
          Mission Timeline, Contingencies & Radiation Policy
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
          DRA 5.0 900-day reference mission with NASA-STD-3001 30-day open-loop contingency baseline
        </span>
      </div>

      {/* Mission Phase Duration Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            Outbound Cruise (Days): <strong style={{ color: 'var(--hmi-text)' }}>{outbound} d</strong>
          </label>
          <input
            type="range"
            min={120}
            max={270}
            step={5}
            value={outbound}
            onChange={(e) =>
              setCoupledConfig({
                phaseDurations: { ...coupledConfig.phaseDurations, outbound: Number(e.target.value) },
              })
            }
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
            <span>120 d (Fast)</span>
            <span>180 d (Nominal)</span>
            <span>270 d (Conjunction)</span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            Surface Stay (Sols/Days): <strong style={{ color: 'var(--hmi-text)' }}>{surface} d</strong>
          </label>
          <input
            type="range"
            min={30}
            max={600}
            step={10}
            value={surface}
            onChange={(e) =>
              setCoupledConfig({
                phaseDurations: { ...coupledConfig.phaseDurations, surface: Number(e.target.value) },
              })
            }
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
            <span>30 d (Opposition)</span>
            <span>500 d (DRA 5.0)</span>
            <span>600 d</span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            Return Transit (Days): <strong style={{ color: 'var(--hmi-text)' }}>{returnDays} d</strong>
          </label>
          <input
            type="range"
            min={120}
            max={270}
            step={5}
            value={returnDays}
            onChange={(e) =>
              setCoupledConfig({
                phaseDurations: { ...coupledConfig.phaseDurations, return: Number(e.target.value) },
              })
            }
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
            <span>120 d (Fast)</span>
            <span>180 d (Nominal)</span>
            <span>270 d (Conjunction)</span>
          </div>
        </div>
      </div>

      {/* Contingency Reserve Policy Selection */}
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
        <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--hmi-text)' }}>
          Contingency Policy & Open-Loop Reserve
        </span>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setContingencyDays(30)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: contingencyDays === 30 ? 'var(--hmi-nominal)' : 'transparent',
              border: contingencyDays === 30 ? '2px solid var(--sage)' : '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              cursor: 'pointer',
              borderRadius: 'var(--r-1)',
            }}
          >
            [NASA 30-Day Open-Loop Baseline]
          </button>

          <button
            type="button"
            onClick={() => setContingencyDays(Math.round(totalMissionDays * 0.15))}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: contingencyDays > 30 && contingencyDays < 150 ? 'var(--hmi-nominal)' : 'transparent',
              border: contingencyDays > 30 && contingencyDays < 150 ? '2px solid var(--caution)' : '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              cursor: 'pointer',
              borderRadius: 'var(--r-1)',
            }}
          >
            [15% Mission Duration Scaled (~{Math.round(totalMissionDays * 0.15)} d)]
          </button>

          <button
            type="button"
            onClick={() => setContingencyDays(240)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: contingencyDays === 240 ? 'var(--hmi-nominal)' : 'transparent',
              border: contingencyDays === 240 ? '2px solid var(--ember)' : '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              cursor: 'pointer',
              borderRadius: 'var(--r-1)',
            }}
          >
            [240-Day Missed Window Staging]
          </button>

          <button
            type="button"
            onClick={() => setContingencyDays(0)}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: contingencyDays === 0 ? 'var(--alarm-p1-bg)' : 'transparent',
              border: contingencyDays === 0 ? '2px solid var(--alarm-p1)' : '1px solid var(--hmi-border)',
              color: contingencyDays === 0 ? 'var(--alarm-p1)' : 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              cursor: 'pointer',
              borderRadius: 'var(--r-1)',
            }}
          >
            [Zero Contingency (High Risk)]
          </button>
        </div>
      </div>

      {/* Radiation Shielding & Career Limit Telemetry */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-3)',
          borderTop: '1px solid var(--hmi-border)',
          paddingTop: 'var(--space-3)',
        }}
      >
        <div>
          <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            Parasitic Radiation Shielding Mass (Polyethylene / Water Jacket): <strong style={{ color: 'var(--hmi-text)' }}>{coupledConfig.shieldingMassKg} kg</strong>
          </label>
          <input
            type="range"
            min={0}
            max={10000}
            step={250}
            value={coupledConfig.shieldingMassKg}
            onChange={(e) => setCoupledConfig({ shieldingMassKg: Number(e.target.value) })}
            style={{ width: '100%', marginTop: 'var(--space-2)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
            <span>0 kg</span>
            <span>2,500 kg (Baseline)</span>
            <span>10,000 kg (Heavy)</span>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: `1px solid ${totalProjectedDoseMsv > 600 ? 'var(--alarm-p1)' : 'var(--hmi-border)'}`,
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text)' }}>
              Projected Mission Dose: <strong>{totalProjectedDoseMsv.toFixed(0)} mSv</strong>
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                color: totalProjectedDoseMsv > 600 ? 'var(--alarm-p1)' : 'var(--sage)',
                fontWeight: 700,
              }}
            >
              {totalProjectedDoseMsv > 600 ? '▲ EXCEEDS 600 mSv CAREER LIMIT' : '✓ WITHIN NASA LIMIT'}
            </span>
          </div>

          <div
            style={{
              height: '10px',
              backgroundColor: 'var(--hmi-track)',
              position: 'relative',
              borderRadius: 'var(--r-0)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: `${(600 / 800) * 100}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: 'var(--alarm-p1)',
                zIndex: 2,
              }}
              title="600 mSv NASA Standard Career Exposure Limit"
            />
            <div
              style={{
                width: `${Math.min(100, (totalProjectedDoseMsv / 800) * 100)}%`,
                height: '100%',
                backgroundColor: totalProjectedDoseMsv > 600 ? 'var(--alarm-p1)' : 'var(--oxide)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              color: 'var(--hmi-text-dim)',
              marginTop: 'var(--space-1)',
            }}
          >
            <span>0 mSv</span>
            <span>NASA Limit: 600 mSv</span>
            <span>800 mSv</span>
          </div>
        </div>
      </div>
    </div>
  );
}

