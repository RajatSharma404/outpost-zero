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
  // Check if oxygen generation loop is closed/positive
  const isO2SelfSustaining = (hasMoxie && hasRecycler) || days.o2DaysEffective >= 5000;

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
          className="tabular-nums"
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label
              htmlFor="slider-water"
              style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--ink)' }}
            >
              POTABLE WATER
            </label>
            <span className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body)', color: 'var(--water)', fontWeight: 600 }}>
              {consumables.waterKg.toLocaleString()} KG
            </span>
          </div>

          <input
            id="slider-water"
            type="range"
            min={0}
            max={10000}
            step={100}
            value={consumables.waterKg}
            onChange={(e) => onChange({ waterKg: Number(e.target.value) })}
            aria-label={`Potable water cargo mass: ${consumables.waterKg} kg`}
            aria-valuemin={0}
            aria-valuemax={10000}
            aria-valuenow={consumables.waterKg}
            aria-valuetext={`${consumables.waterKg} kilograms water, ${days.waterDaysStored} stored sols`}
            style={{
              width: '100%',
              accentColor: 'var(--water)',
              cursor: 'pointer',
            }}
          />

          <div
            className="tabular-nums"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-2)',
              borderTop: '1px solid var(--rule)',
              paddingTop: 'var(--space-2)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
            }}
          >
            <div>
              <span style={{ color: 'var(--ink-dim)', display: 'block' }}>STORED RESERVE:</span>
              <strong style={{ color: 'var(--ink)' }}>{days.waterDaysStored} SOLS</strong>
            </div>
            <div>
              <span style={{ color: 'var(--ink-dim)', display: 'block' }}>EFFECTIVE MARGIN:</span>
              <strong
                style={{
                  color:
                    days.waterDaysEffective >= missionLengthSols
                      ? 'var(--sage)'
                      : 'var(--alarm)',
                }}
              >
                {days.waterDaysEffective} SOLS {hasRecycler ? '(90% LOOP)' : '(OPEN)'}
              </strong>
            </div>
          </div>
        </div>

        {/* 2. Oxygen Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label
              htmlFor="slider-oxygen"
              style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--ink)' }}
            >
              BREATHABLE OXYGEN (O2)
            </label>
            <span className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body)', color: 'var(--sage)', fontWeight: 600 }}>
              {consumables.o2Kg.toLocaleString()} KG
            </span>
          </div>

          <input
            id="slider-oxygen"
            type="range"
            min={0}
            max={2500}
            step={50}
            value={consumables.o2Kg}
            onChange={(e) => onChange({ o2Kg: Number(e.target.value) })}
            aria-label={`Breathable oxygen cargo mass: ${consumables.o2Kg} kg`}
            aria-valuemin={0}
            aria-valuemax={2500}
            aria-valuenow={consumables.o2Kg}
            aria-valuetext={`${consumables.o2Kg} kilograms oxygen`}
            style={{
              width: '100%',
              accentColor: 'var(--sage)',
              cursor: 'pointer',
            }}
          />

          <div
            className="tabular-nums"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-2)',
              borderTop: '1px solid var(--rule)',
              paddingTop: 'var(--space-2)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
            }}
          >
            <div>
              <span style={{ color: 'var(--ink-dim)', display: 'block' }}>STORED RESERVE:</span>
              <strong style={{ color: 'var(--ink)' }}>{days.o2DaysStored} SOLS</strong>
            </div>
            <div>
              <span style={{ color: 'var(--ink-dim)', display: 'block' }}>EFFECTIVE MARGIN:</span>
              {isO2SelfSustaining ? (
                <strong
                  style={{
                    color: 'var(--sage)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                  }}
                >
                  <span aria-hidden="true">●</span> SELF-SUSTAINING
                </strong>
              ) : (
                <strong
                  style={{
                    color:
                      days.o2DaysEffective >= missionLengthSols
                        ? 'var(--sage)'
                        : 'var(--alarm)',
                  }}
                >
                  {days.o2DaysEffective} SOLS {hasMoxie ? '(MOXIE)' : hasRecycler ? '(RECYCLER)' : '(OPEN)'}
                </strong>
              )}
            </div>
          </div>
        </div>

        {/* 3. Food Rations Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label
              htmlFor="slider-food"
              style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--ink)' }}
            >
              DEHYDRATED RATIONS
            </label>
            <span className="tabular-nums" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body)', color: 'var(--caution)', fontWeight: 600 }}>
              {consumables.foodKg.toLocaleString()} KG
            </span>
          </div>

          <input
            id="slider-food"
            type="range"
            min={0}
            max={6000}
            step={100}
            value={consumables.foodKg}
            onChange={(e) => onChange({ foodKg: Number(e.target.value) })}
            aria-label={`Dehydrated food rations cargo mass: ${consumables.foodKg} kg`}
            aria-valuemin={0}
            aria-valuemax={6000}
            aria-valuenow={consumables.foodKg}
            aria-valuetext={`${consumables.foodKg} kilograms food`}
            style={{
              width: '100%',
              accentColor: 'var(--caution)',
              cursor: 'pointer',
            }}
          />

          <div
            className="tabular-nums"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-2)',
              borderTop: '1px solid var(--rule)',
              paddingTop: 'var(--space-2)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
            }}
          >
            <div>
              <span style={{ color: 'var(--ink-dim)', display: 'block' }}>STORED RESERVE:</span>
              <strong style={{ color: 'var(--ink)' }}>{days.foodDaysStored} SOLS</strong>
            </div>
            <div>
              <span style={{ color: 'var(--ink-dim)', display: 'block' }}>EFFECTIVE MARGIN:</span>
              <strong
                style={{
                  color:
                    days.foodDaysEffective >= missionLengthSols
                      ? 'var(--sage)'
                      : 'var(--alarm)',
                }}
              >
                {days.foodDaysEffective} SOLS {hasGreenhouse ? '(HYDROPONICS)' : '(OPEN)'}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
