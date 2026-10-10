'use client';

import React from 'react';
import type { MassBreakdown } from '../../lib/sim/loadout';
import type { PackableItem } from '../../lib/sim/types';

interface MassBarProps {
  mass: MassBreakdown;
  packedItems: PackableItem[];
}

export const MassBar: React.FC<MassBarProps> = ({ mass, packedItems }) => {
  const maxMass = mass.maxMassKg; // 40,000 kg

  // Group masses by category
  const categoryTotals: Record<string, number> = {
    power: 0,
    lifesupport: 0,
    shielding: 0,
    food: 0,
    spares: 0,
    comfort: 0,
  };

  for (const item of packedItems) {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.massKg;
  }

  const categoryColors: Record<string, string> = {
    power: 'var(--ember)',
    lifesupport: 'var(--sage)',
    shielding: 'var(--oxide)',
    food: 'var(--caution)',
    spares: 'var(--ink-dim)',
    comfort: 'var(--rule)',
  };

  // Convert to percent of max mass
  const getPct = (val: number) => Math.min(100, (val / maxMass) * 100);

  return (
    <div
      style={{
        backgroundColor: 'var(--basalt-2)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
      }}
    >
      {/* Manifest tape header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ink-dim)',
            }}
          >
            CARGO MANIFEST TAPE // 40-TONNE LIMIT
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-numeral)',
                fontWeight: 700,
                lineHeight: 1,
                color: mass.isOverBudget ? 'var(--alarm)' : 'var(--ink)',
              }}
            >
              {mass.isOverBudget
                ? `+${mass.overByKg.toLocaleString()} KG`
                : `${(mass.remainingMassKg / 1000).toFixed(1)} T`}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-label)',
                color: mass.isOverBudget ? 'var(--alarm)' : 'var(--ink-dim)',
                textTransform: 'uppercase',
              }}
            >
              {mass.isOverBudget ? 'OVER BUDGET' : 'REMAINING CARGO MARGIN'}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-body)',
              fontWeight: 600,
              color: mass.isOverBudget ? 'var(--alarm)' : 'var(--ember)',
            }}
          >
            {mass.totalMassKg.toLocaleString()} / {maxMass.toLocaleString()} KG
          </div>
          <div
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              color: 'var(--ink-dim)',
              letterSpacing: '0.08em',
            }}
          >
            LANDED PAYLOAD MASS ({(mass.totalMassKg / 1000).toFixed(2)} T)
          </div>
        </div>
      </div>

      {/* Manifest Segment Bar */}
      <div
        style={{
          height: '20px',
          width: '100%',
          backgroundColor: 'var(--basalt)',
          border: `1px solid ${mass.isOverBudget ? 'var(--alarm)' : 'var(--rule)'}`,
          position: 'relative',
          display: 'flex',
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={mass.totalMassKg}
        aria-valuemin={0}
        aria-valuemax={maxMass}
        aria-label="Cargo mass budget progress bar"
      >
        {/* Item categories */}
        {Object.entries(categoryTotals).map(([cat, amount]) => {
          if (amount <= 0) return null;
          return (
            <div
              key={cat}
              title={`${cat.toUpperCase()}: ${amount.toLocaleString()} kg`}
              style={{
                width: `${getPct(amount)}%`,
                height: '100%',
                backgroundColor: categoryColors[cat] || 'var(--ink-dim)',
                borderRight: '1px solid var(--basalt)',
              }}
            />
          );
        })}

        {/* Consumables */}
        {mass.waterMassKg > 0 && (
          <div
            title={`WATER: ${mass.waterMassKg.toLocaleString()} kg`}
            style={{
              width: `${getPct(mass.waterMassKg)}%`,
              height: '100%',
              backgroundColor: 'var(--water)',
              borderRight: '1px solid var(--basalt)',
            }}
          />
        )}
        {mass.o2MassKg > 0 && (
          <div
            title={`OXYGEN: ${mass.o2MassKg.toLocaleString()} kg`}
            style={{
              width: `${getPct(mass.o2MassKg)}%`,
              height: '100%',
              backgroundColor: 'var(--sage)',
              borderRight: '1px solid var(--basalt)',
            }}
          />
        )}
        {mass.foodMassKg > 0 && (
          <div
            title={`FOOD: ${mass.foodMassKg.toLocaleString()} kg`}
            style={{
              width: `${getPct(mass.foodMassKg)}%`,
              height: '100%',
              backgroundColor: 'var(--caution)',
              borderRight: '1px solid var(--basalt)',
            }}
          />
        )}

        {/* Over-budget overflow flash */}
        {mass.isOverBudget && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '100%',
              backgroundColor: 'var(--alarm)',
              opacity: 0.35,
              animation: 'pulse 1s infinite alternate',
            }}
          />
        )}
      </div>

      {/* Legend & Category breakdown */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          marginTop: 'var(--space-3)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
          color: 'var(--ink-dim)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--ember)' }} /> Power ({(categoryTotals.power / 1000).toFixed(1)}t)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--sage)' }} /> Life Support ({(categoryTotals.lifesupport / 1000).toFixed(1)}t)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--oxide)' }} /> Shielding ({(categoryTotals.shielding / 1000).toFixed(1)}t)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--caution)' }} /> Food Modules ({(categoryTotals.food / 1000).toFixed(1)}t)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--water)' }} /> Water ({(mass.waterMassKg / 1000).toFixed(1)}t)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--sage)' }} /> O2 ({(mass.o2MassKg / 1000).toFixed(1)}t)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: '8px', height: '8px', backgroundColor: 'var(--caution)' }} /> Dry Rations ({(mass.foodMassKg / 1000).toFixed(1)}t)
        </span>
      </div>
    </div>
  );
};
