'use client';

import React from 'react';
import type { LoadoutAnalysis } from '../../lib/sim/loadout';
import type { MissionMode } from '../../lib/sim/types';
import { Button } from '../ui/Button';
import { Tag } from '../ui/Tag';
import { Icon } from '../ui/Icon';

interface LoadoutSummaryProps {
  analysis: LoadoutAnalysis;
  mode: MissionMode;
  seed: number;
  missionLengthSols: number;
  onSetMode: (mode: MissionMode) => void;
  onSetSeed: (seed: number) => void;
  onLaunch: () => void;
}

export const LoadoutSummary: React.FC<LoadoutSummaryProps> = ({
  analysis,
  mode,
  seed,
  missionLengthSols,
  onSetMode,
  onSetSeed,
  onLaunch,
}) => {
  const { mass, power, warnings, shieldingRating } = analysis;

  const shieldingBadge =
    shieldingRating === 'hardened'
      ? { label: 'HARDENED (DUAL)', variant: 'nominal' as const }
      : shieldingRating === 'regolith'
      ? { label: 'REGOLITH BERM (40%)', variant: 'active' as const }
      : shieldingRating === 'shelter'
      ? { label: 'WATER SHELTER (70% SPE)', variant: 'active' as const }
      : { label: 'UNSHIELDED (CRITICAL)', variant: 'alarm' as const };

  return (
    <aside
      style={{
        backgroundColor: 'var(--basalt-2)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-4)',
        position: 'sticky',
        top: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {/* Flight Director Manifest Header */}
      <div style={{ borderBottom: '1px solid var(--rule)', paddingBottom: 'var(--space-3)' }}>
        <span
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-label)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-dim)',
          }}
        >
          MISSION READINESS REVIEW
        </span>
        <h3
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-lead)',
            margin: '2px 0 0 0',
            fontWeight: 700,
            color: 'var(--ink)',
          }}
        >
          Lander Cargo Summary
        </h3>
      </div>

      {/* Mode Picker */}
      <div>
        <label
          htmlFor="mission-mode-select"
          style={{
            display: 'block',
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-label)',
            color: 'var(--ink-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 'var(--space-1)',
          }}
        >
          Mission Profile
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
          <Button
            id="mission-mode-select"
            variant={mode === 'tutorial' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onSetMode('tutorial')}
          >
            Tutorial (60s)
          </Button>
          <Button
            variant={mode === 'standard' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onSetMode('standard')}
          >
            Standard (180s)
          </Button>
          <Button
            variant={mode === 'long' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onSetMode('long')}
          >
            Long (500s)
          </Button>
        </div>
      </div>

      {/* Seed Input */}
      <div>
        <label
          htmlFor="simulation-seed-input"
          style={{
            display: 'block',
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-label)',
            color: 'var(--ink-dim)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 'var(--space-1)',
          }}
        >
          Simulation Seed (Deterministic PRNG)
        </label>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <input
            id="simulation-seed-input"
            type="number"
            min={1}
            max={999999}
            value={seed}
            onChange={(e) => onSetSeed(Number(e.target.value) || 1)}
            style={{
              backgroundColor: 'var(--basalt)',
              border: '1px solid var(--rule)',
              color: 'var(--ink)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-body)',
              padding: 'var(--space-1) var(--space-2)',
              borderRadius: 'var(--r-1)',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSetSeed(Math.floor(Math.random() * 90000) + 1000)}
            title="Randomize Seed"
          >
            Reroll
          </Button>
        </div>
      </div>

      {/* Systems Balance Meters */}
      <div
        style={{
          backgroundColor: 'var(--basalt)',
          border: '1px solid var(--rule)',
          padding: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--ink-dim)' }}>NET CLEAR POWER:</span>
          <span
            style={{
              color: power.netClearKw >= 0 ? 'var(--sage)' : 'var(--alarm)',
              fontWeight: 600,
            }}
          >
            {power.netClearKw >= 0 ? `+${power.netClearKw.toFixed(1)} kW` : `${power.netClearKw.toFixed(1)} kW`}
            {' '}({power.totalGenClearKw} kW gen vs {power.totalDemandKw} kW load)
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--ink-dim)' }}>STORM POWER DEFICIT:</span>
          <span
            style={{
              color: power.netStormKw >= 0 ? 'var(--sage)' : 'var(--caution)',
              fontWeight: 600,
            }}
          >
            {power.netStormKw >= 0 ? `+${power.netStormKw.toFixed(1)} kW` : `${power.netStormKw.toFixed(1)} kW`}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--ink-dim)' }}>BATTERY STORAGE:</span>
          <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
            {power.batteryCapacityKwh} kWh
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--ink-dim)' }}>RADIATION SHIELD:</span>
          <Tag label={shieldingBadge.label} variant={shieldingBadge.variant} />
        </div>
      </div>

      {/* Plain-Language Warnings (From loadout.ts) */}
      <div>
        <span
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-label)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: warnings.length > 0 ? 'var(--alarm)' : 'var(--sage)',
            display: 'block',
            marginBottom: 'var(--space-1)',
            fontWeight: 700,
          }}
        >
          {warnings.length > 0 ? `ENGINEERING ADVISORIES (${warnings.length})` : 'SYSTEM AUDIT NOMINAL'}
        </span>

        {warnings.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--basalt)',
              border: '1px solid var(--sage)',
              padding: 'var(--space-2) var(--space-3)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--sage)',
            }}
          >
            No critical system deficits detected for a {missionLengthSols}-sol mission.
          </div>
        ) : (
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              maxHeight: '180px',
              overflowY: 'auto',
            }}
          >
            {warnings.map((w, idx) => (
              <li
                key={idx}
                style={{
                  backgroundColor: 'var(--basalt)',
                  borderLeft: '2px solid var(--alarm)',
                  padding: 'var(--space-2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-label)',
                  color: 'var(--ink)',
                  lineHeight: 1.3,
                }}
              >
                {w}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Launch Action */}
      <div style={{ marginTop: 'var(--space-2)' }}>
        <Button
          id="launch-mission-btn"
          variant="primary"
          size="lg"
          fullWidth
          disabled={mass.isOverBudget}
          onClick={onLaunch}
        >
          {mass.isOverBudget ? (
            <>
              <Icon name="alert" size={18} /> OVER WEIGHT BUDGET
            </>
          ) : (
            <>
              <Icon name="play" size={18} /> LAUNCH TO MARS
            </>
          )}
        </Button>

        {mass.isOverBudget && (
          <span
            style={{
              display: 'block',
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--alarm)',
              marginTop: 'var(--space-2)',
            }}
          >
            Lander cannot launch over 40,000 kg. Reduce {mass.overByKg.toLocaleString()} kg.
          </span>
        )}
      </div>
    </aside>
  );
};
