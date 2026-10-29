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

interface StructuredAdvisory {
  level: 'blocking' | 'warning' | 'info';
  title: string;
  why: string;
  fix: string;
  targetId?: string;
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

  // Prioritize warnings into structured blocking / warning / info
  const structuredAdvisories: StructuredAdvisory[] = [];

  if (mass.isOverBudget) {
    structuredAdvisories.push({
      level: 'blocking',
      title: `Cargo Limit Exceeded (+${mass.overByKg.toLocaleString()} kg)`,
      why: 'Trans-Mars Injection stages cannot accelerate payloads exceeding 40,000 kg.',
      fix: 'Unload non-essential hardware or reduce water/rations reserve.',
      targetId: 'slider-water',
    });
  }

  for (const raw of warnings) {
    if (raw.toLowerCase().includes('deficit') || raw.toLowerCase().includes('blackout') || raw.toLowerCase().includes('starvation') || raw.toLowerCase().includes('asphyxiation')) {
      structuredAdvisories.push({
        level: 'blocking',
        title: raw,
        why: 'Critical life-support or power equilibrium failure will terminate crew within sols.',
        fix: 'Increase consumable reserves or add redundant power sources.',
        targetId: 'slider-oxygen',
      });
    } else if (raw.toLowerCase().includes('unshielded') || raw.toLowerCase().includes('radiation') || raw.toLowerCase().includes('storm')) {
      structuredAdvisories.push({
        level: 'warning',
        title: raw,
        why: 'Solar Particle Events (SPE) and dust storms cause cumulative degradation and health decay.',
        fix: 'Load Regolith Shield or Water Storm Shelter before launch.',
      });
    } else {
      structuredAdvisories.push({
        level: 'info',
        title: raw,
        why: 'Subsystem operating in single-string or open-loop mode without backup.',
        fix: 'Review catalog for ECLSS Recycler or Spare Parts Kit.',
      });
    }
  }

  const handleFixClick = (targetId?: string) => {
    if (!targetId) return;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
  };

  return (
    <>
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

        {/* Dual Power Default Choice Guidance Callout */}
        <div
          style={{
            backgroundColor: 'var(--basalt)',
            borderLeft: '3px solid var(--ember)',
            padding: 'var(--space-2) var(--space-3)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
            lineHeight: 1.4,
            color: 'var(--ink-dim)',
          }}
        >
          <strong style={{ color: 'var(--ember)', display: 'block' }}>DEFAULT POWER MANIFEST:</strong>
          Both Solar Farm (2.0t) and Kilopower Fission (1.5t) are pre-loaded for dual-redundancy. Unload either module in the catalog to free up cargo mass.
        </div>

        {/* Systems Balance Telemetry Meters */}
        <div
          className="tabular-nums"
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
              {' '}({power.totalGenClearKw} kW vs {power.totalDemandKw} kW)
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

        {/* Prioritized Engineering Advisories */}
        <div>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: structuredAdvisories.length > 0 ? (mass.isOverBudget ? 'var(--alarm)' : 'var(--caution)') : 'var(--sage)',
              display: 'block',
              marginBottom: 'var(--space-1)',
              fontWeight: 700,
            }}
          >
            {structuredAdvisories.length > 0 ? `ENGINEERING ADVISORIES (${structuredAdvisories.length})` : 'SYSTEM AUDIT NOMINAL'}
          </span>

          {structuredAdvisories.length === 0 ? (
            <div
              style={{
                backgroundColor: 'var(--basalt)',
                border: '1px solid var(--sage)',
                padding: 'var(--space-2) var(--space-3)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-label)',
                color: 'var(--sage)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <span aria-hidden="true">✓</span> All systems certified for {missionLengthSols}-sol surface duration.
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
                maxHeight: '260px',
                overflowY: 'auto',
              }}
            >
              {structuredAdvisories.map((adv, idx) => {
                const borderCol = adv.level === 'blocking' ? 'var(--alarm)' : adv.level === 'warning' ? 'var(--caution)' : 'var(--sage)';
                const tagVariant = adv.level === 'blocking' ? 'alarm' : adv.level === 'warning' ? 'caution' : 'nominal';

                return (
                  <li
                    key={idx}
                    style={{
                      backgroundColor: 'var(--basalt)',
                      borderLeft: `3px solid ${borderCol}`,
                      padding: 'var(--space-2)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--fs-detail)',
                      color: 'var(--ink)',
                      lineHeight: 1.3,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: borderCol, textTransform: 'uppercase' }}>
                        [{adv.level.toUpperCase()}] {adv.title}
                      </strong>
                      {adv.targetId && (
                        <button
                          type="button"
                          onClick={() => handleFixClick(adv.targetId)}
                          style={{
                            background: 'none',
                            border: `1px solid ${borderCol}`,
                            color: borderCol,
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--fs-detail)',
                            padding: '1px 6px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                          }}
                        >
                          FIX &rarr;
                        </button>
                      )}
                    </div>
                    <div style={{ color: 'var(--ink-dim)' }}>
                      <strong>Why: </strong>{adv.why}
                    </div>
                    <div style={{ color: 'var(--ink)' }}>
                      <strong>Remedy: </strong>{adv.fix}
                    </div>
                  </li>
                );
              })}
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
                <Icon name="alert" size={18} /> OVER CAPACITY: +{mass.overByKg.toLocaleString()} KG // LAUNCH BLOCKED
              </>
            ) : (
              <>
                <Icon name="play" size={18} /> LAUNCH TO MARS
              </>
            )}
          </Button>

          {mass.isOverBudget && (
            <span
              className="tabular-nums"
              style={{
                display: 'block',
                textAlign: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-label)',
                color: 'var(--alarm)',
                marginTop: 'var(--space-2)',
              }}
            >
              Lander cargo limit is 40,000 kg. Shed {mass.overByKg.toLocaleString()} kg to proceed.
            </span>
          )}
        </div>
      </aside>

      {/* Sticky Bottom Bar for Mobile (360px) and School Laptop (1366x768) Viewports */}
      <div
        className="mobile-sticky-summary"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--basalt-2)',
          borderTop: '2px solid var(--rule)',
          padding: 'var(--space-2) var(--space-4)',
          zIndex: 80,
          display: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-3)',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.5)',
        }}
      >
        <div className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)' }}>
          <div style={{ color: mass.isOverBudget ? 'var(--alarm)' : 'var(--ink)', fontWeight: 700 }}>
            {mass.isOverBudget ? `OVER +${mass.overByKg} KG` : `${(mass.remainingMassKg / 1000).toFixed(1)}T MARGIN`}
          </div>
          <div style={{ color: power.netClearKw >= 0 ? 'var(--sage)' : 'var(--alarm)' }}>
            PWR: {power.netClearKw >= 0 ? `+${power.netClearKw.toFixed(1)}` : power.netClearKw.toFixed(1)} kW
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          disabled={mass.isOverBudget}
          onClick={onLaunch}
        >
          {mass.isOverBudget ? `OVER LIMIT (+${mass.overByKg}kg)` : 'LAUNCH TO MARS'}
        </Button>
      </div>

      <style jsx>{`
        @media (max-width: 1024px) {
          .mobile-sticky-summary {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};
