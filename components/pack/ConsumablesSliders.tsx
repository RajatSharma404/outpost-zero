'use client';

import React from 'react';
import type { ConsumablesAllocation } from '../../lib/sim/types';
import type { ConsumablesDays } from '../../lib/sim/loadout';

interface ConsumablesSlidersProps {
  consumables: ConsumablesAllocation;
  days: ConsumablesDays;
  missionLengthSols: number;
  hasRecycler: boolean;
  hasMoxie: boolean;
  hasGreenhouse: boolean;
  onChange: (consumables: { waterKg?: number; o2Kg?: number; foodKg?: number }) => void;
}

export const ConsumablesSliders: React.FC<ConsumablesSlidersProps> = ({
  consumables,
  days,
  missionLengthSols,
  hasRecycler,
  hasMoxie,
  hasGreenhouse,
  onChange,
}) => {
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
      <div
        style={{
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
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
            CONSUMABLE FLUIDS & STORES // 4-CREW METABOLIC DEMAND
          </span>
          <h2
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-lead)',
              margin: '2px 0 0 0',
              fontWeight: 600,
              color: 'var(--ink)',
            }}
          >
            Open-Loop Cargo Rations
          </h2>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-label)',
            color: 'var(--ink-dim)',
          }}
        >
          MISSION DURATION: <strong style={{ color: 'var(--ember)' }}>{missionLengthSols} SOLS</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
        {/* 1. Water Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--ink)' }}>
              POTABLE WATER
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body)', color: 'var(--water)', fontWeight: 600 }}>
              {consumables.waterKg.toLocaleString()} KG
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={10000}
            step={100}
            value={consumables.waterKg}
            onChange={(e) => onChange({ waterKg: Number(e.target.value) })}
            style={{
              width: '100%',
              accentColor: 'var(--ember)',
              cursor: 'pointer',
              marginBottom: 'var(--space-2)',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--ink-dim)',
            }}
          >
            <span>Stored: {days.waterDaysStored} sols</span>
            <span
              style={{
                color:
                  days.waterDaysEffective >= missionLengthSols
                    ? 'var(--sage)'
                    : 'var(--alarm)',
                fontWeight: 600,
              }}
            >
              Effective: {days.waterDaysEffective} sols {hasRecycler ? '(90% loop)' : '(open)'}
            </span>
          </div>
        </div>

        {/* 2. Oxygen Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--ink)' }}>
              BREATHABLE OXYGEN (O2)
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body)', color: 'var(--sage)', fontWeight: 600 }}>
              {consumables.o2Kg.toLocaleString()} KG
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={2500}
            step={50}
            value={consumables.o2Kg}
            onChange={(e) => onChange({ o2Kg: Number(e.target.value) })}
            style={{
              width: '100%',
              accentColor: 'var(--ember)',
              cursor: 'pointer',
              marginBottom: 'var(--space-2)',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--ink-dim)',
            }}
          >
            <span>Stored: {days.o2DaysStored} sols</span>
            <span
              style={{
                color:
                  days.o2DaysEffective >= missionLengthSols
                    ? 'var(--sage)'
                    : 'var(--alarm)',
                fontWeight: 600,
              }}
            >
              Effective: {days.o2DaysEffective} sols {hasMoxie ? '(MOXIE)' : hasRecycler ? '(Recycler)' : '(open)'}
            </span>
          </div>
        </div>

        {/* 3. Food Rations Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--ink)' }}>
              DEHYDRATED RATIONS
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body)', color: 'var(--caution)', fontWeight: 600 }}>
              {consumables.foodKg.toLocaleString()} KG
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={6000}
            step={100}
            value={consumables.foodKg}
            onChange={(e) => onChange({ foodKg: Number(e.target.value) })}
            style={{
              width: '100%',
              accentColor: 'var(--ember)',
              cursor: 'pointer',
              marginBottom: 'var(--space-2)',
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--ink-dim)',
            }}
          >
            <span>Stored: {days.foodDaysStored} sols</span>
            <span
              style={{
                color:
                  days.foodDaysEffective >= missionLengthSols
                    ? 'var(--sage)'
                    : 'var(--alarm)',
                fontWeight: 600,
              }}
            >
              Effective: {days.foodDaysEffective} sols {hasGreenhouse ? '(Greenhouse)' : '(rations only)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
