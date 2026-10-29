'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { MassBreakdown } from '../../lib/sim/loadout';
import type { PackableItem } from '../../lib/sim/types';

interface MassBarProps {
  mass: MassBreakdown;
  packedItems: PackableItem[];
}

interface SegmentMeta {
  id: string;
  label: string;
  shortLabel: string;
  amountKg: number;
  color: string;
  patternId: string;
  items: string[];
}

export const MassBar: React.FC<MassBarProps> = ({ mass, packedItems }) => {
  const maxMass = mass.maxMassKg; // 40,000 kg
  const [activeSegment, setActiveSegment] = useState<SegmentMeta | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Group masses and loaded items by category
  const categoryTotals: Record<string, number> = {
    power: 0,
    lifesupport: 0,
    shielding: 0,
    food: 0,
    spares: 0,
    comfort: 0,
  };

  const categoryItems: Record<string, string[]> = {
    power: [],
    lifesupport: [],
    shielding: [],
    food: [],
    spares: [],
    comfort: [],
  };

  for (const item of packedItems) {
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.massKg;
    categoryItems[item.category] = categoryItems[item.category] || [];
    categoryItems[item.category].push(`${item.name} (${item.massKg.toLocaleString()} kg)`);
  }

  // Build unified segments list
  const segments: SegmentMeta[] = [
    {
      id: 'power',
      label: 'Power Generation',
      shortLabel: 'PWR',
      amountKg: categoryTotals.power,
      color: 'var(--ember)',
      patternId: 'pat-power',
      items: categoryItems.power,
    },
    {
      id: 'lifesupport',
      label: 'Life Support Systems',
      shortLabel: 'ECLSS',
      amountKg: categoryTotals.lifesupport,
      color: 'var(--sage)',
      patternId: 'pat-lifesupport',
      items: categoryItems.lifesupport,
    },
    {
      id: 'shielding',
      label: 'Radiation Shielding',
      shortLabel: 'SHIELD',
      amountKg: categoryTotals.shielding,
      color: 'var(--oxide)',
      patternId: 'pat-shielding',
      items: categoryItems.shielding,
    },
    {
      id: 'food',
      label: 'Food Modules & Hydroponics',
      shortLabel: 'FOOD',
      amountKg: categoryTotals.food,
      color: 'var(--caution)',
      patternId: 'pat-food',
      items: categoryItems.food,
    },
    {
      id: 'spares',
      label: 'Spares & 3D Fabrication',
      shortLabel: 'SPARES',
      amountKg: categoryTotals.spares,
      color: 'var(--ink-dim)',
      patternId: 'pat-spares',
      items: categoryItems.spares,
    },
    {
      id: 'comfort',
      label: 'Crew Habitability & Rec',
      shortLabel: 'HAB',
      amountKg: categoryTotals.comfort,
      color: 'var(--rule)',
      patternId: 'pat-comfort',
      items: categoryItems.comfort,
    },
    {
      id: 'water',
      label: 'Water Consumables',
      shortLabel: 'H2O',
      amountKg: mass.waterMassKg,
      color: 'var(--water)',
      patternId: 'pat-water',
      items: [`Potable Water Store (${mass.waterMassKg.toLocaleString()} kg)`],
    },
    {
      id: 'o2',
      label: 'Oxygen Reserves',
      shortLabel: 'O2',
      amountKg: mass.o2MassKg,
      color: 'var(--sage)',
      patternId: 'pat-o2',
      items: [`Liquid O2 Tanks (${mass.o2MassKg.toLocaleString()} kg)`],
    },
    {
      id: 'dryfood',
      label: 'Dry Rations',
      shortLabel: 'RATION',
      amountKg: mass.foodMassKg,
      color: 'var(--caution)',
      patternId: 'pat-dryfood',
      items: [`Dehydrated Caloric Rations (${mass.foodMassKg.toLocaleString()} kg)`],
    },
  ].filter((s) => s.amountKg > 0);

  // Close popover on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveSegment(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getPct = (val: number) => Math.min(100, (val / maxMass) * 100);

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: 'var(--basalt-2)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        position: 'relative',
      }}
    >
      {/* SVG Pattern Definitions for Non-Color Accessibility (H6) */}
      <svg
        aria-hidden="true"
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      >
        <defs>
          {/* Power: 45deg stripes */}
          <pattern id="pat-power" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="var(--basalt)" strokeWidth="2" opacity="0.35" />
          </pattern>
          {/* Life support: stipple dots */}
          <pattern id="pat-lifesupport" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.2" fill="var(--basalt)" opacity="0.4" />
          </pattern>
          {/* Shielding: crosshatch */}
          <pattern id="pat-shielding" width="8" height="8" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="8" y2="8" stroke="var(--basalt)" strokeWidth="1.5" opacity="0.35" />
            <line x1="8" y1="0" x2="0" y2="8" stroke="var(--basalt)" strokeWidth="1.5" opacity="0.35" />
          </pattern>
          {/* Food: vertical stripes */}
          <pattern id="pat-food" width="6" height="6" patternUnits="userSpaceOnUse">
            <line x1="3" y1="0" x2="3" y2="6" stroke="var(--basalt)" strokeWidth="2" opacity="0.3" />
          </pattern>
          {/* Spares: diagonal dashes */}
          <pattern id="pat-spares" width="10" height="10" patternTransform="rotate(-45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="10" y2="0" stroke="var(--basalt)" strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
          </pattern>
          {/* Comfort: horizontal lines */}
          <pattern id="pat-comfort" width="6" height="6" patternUnits="userSpaceOnUse">
            <line x1="0" y1="3" x2="6" y2="3" stroke="var(--basalt)" strokeWidth="1.5" opacity="0.35" />
          </pattern>
          {/* Water: wavy/dashed lines */}
          <pattern id="pat-water" width="8" height="8" patternUnits="userSpaceOnUse">
            <line x1="0" y1="2" x2="8" y2="2" stroke="var(--basalt)" strokeWidth="1.5" opacity="0.3" />
            <line x1="0" y1="6" x2="8" y2="6" stroke="var(--basalt)" strokeWidth="1.5" opacity="0.3" />
          </pattern>
          {/* Oxygen: fine grid */}
          <pattern id="pat-o2" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1" fill="var(--basalt)" opacity="0.4" />
          </pattern>
          {/* Dry food: zigzag dots */}
          <pattern id="pat-dryfood" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="var(--basalt)" opacity="0.4" />
            <circle cx="6" cy="6" r="1.2" fill="var(--basalt)" opacity="0.4" />
          </pattern>
          {/* Overflow: severe warning hatch */}
          <pattern id="pat-overflow" width="10" height="10" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="var(--alarm)" strokeWidth="3" />
            <line x1="5" y1="0" x2="5" y2="10" stroke="var(--basalt)" strokeWidth="2" />
          </pattern>
        </defs>
      </svg>

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
            CARGO MANIFEST TAPE // 40-TONNE LIMIT (NASA SPACE APPS SPEC)
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)' }}>
            <span
              className="tabular-nums"
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
              }}
            >
              {mass.isOverBudget ? (
                <>
                  <span aria-hidden="true">▲</span> OVER BUDGET // LAUNCH BLOCKED
                </>
              ) : (
                <>
                  <span aria-hidden="true">■</span> REMAINING CARGO MARGIN
                </>
              )}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            className="tabular-nums"
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
          height: '28px',
          width: '100%',
          backgroundColor: 'var(--basalt)',
          border: `1px solid ${mass.isOverBudget ? 'var(--alarm)' : 'var(--rule)'}`,
          borderRadius: 'var(--r-0)',
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
        {segments.map((seg) => {
          const pct = getPct(seg.amountKg);
          const isSelected = activeSegment?.id === seg.id;

          return (
            <button
              key={seg.id}
              type="button"
              onClick={() => setActiveSegment(isSelected ? null : seg)}
              onFocus={() => setActiveSegment(seg)}
              onBlur={() => {
                // Short delay to allow clicking popover content
                setTimeout(() => {
                  if (activeSegment?.id === seg.id) {
                    setActiveSegment(null);
                  }
                }, 200);
              }}
              aria-label={`${seg.label}: ${seg.amountKg.toLocaleString()} kg (${pct.toFixed(1)}% of 40t)`}
              aria-expanded={isSelected}
              style={{
                width: `${pct}%`,
                height: '100%',
                position: 'relative',
                backgroundColor: seg.color,
                border: 'none',
                borderRight: '1px solid var(--basalt)',
                cursor: 'pointer',
                padding: 0,
                margin: 0,
                outline: isSelected ? '2px solid var(--ember)' : 'none',
                outlineOffset: '-2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Pattern Texture Overlay for Non-Color Accessibility (H6) */}
              <svg
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                }}
              >
                <rect width="100%" height="100%" fill={`url(#${seg.patternId})`} />
              </svg>

              {/* In-bar text label if segment width is sufficiently wide */}
              {pct >= 7 && (
                <span
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-detail)',
                    fontWeight: 700,
                    color: 'var(--basalt)',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    textShadow: '0 0 2px rgba(255, 255, 255, 0.4)',
                  }}
                >
                  {seg.shortLabel} {(seg.amountKg / 1000).toFixed(1)}t
                </span>
              )}
            </button>
          );
        })}

        {/* Over-budget hatched overflow segment */}
        {mass.isOverBudget && (
          <div
            aria-label={`Cargo budget exceeded by ${mass.overByKg.toLocaleString()} kilograms`}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: `${Math.min(100, (mass.overByKg / maxMass) * 100)}%`,
              minWidth: '24px',
              backgroundColor: 'var(--alarm-dark)',
              borderLeft: '2px solid var(--alarm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <svg
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
              }}
            >
              <rect width="100%" height="100%" fill="url(#pat-overflow)" />
            </svg>
            <span
              style={{
                position: 'relative',
                zIndex: 2,
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                fontWeight: 700,
                color: 'var(--alarm)',
                backgroundColor: 'var(--basalt)',
                padding: '1px var(--space-1)',
                border: '1px solid var(--alarm)',
              }}
            >
              +{mass.overByKg}kg
            </span>
          </div>
        )}
      </div>

      {/* Interactive Popover Ledger for Active Segment */}
      {activeSegment && (
        <div
          role="dialog"
          aria-label={`${activeSegment.label} cargo breakdown`}
          style={{
            position: 'absolute',
            top: 'calc(100% + var(--space-2))',
            left: 'var(--space-4)',
            right: 'var(--space-4)',
            backgroundColor: 'var(--basalt-2)',
            border: '2px solid var(--ember)',
            borderRadius: 'var(--r-1)',
            padding: 'var(--space-3)',
            zIndex: 100,
            boxShadow: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--rule)',
              paddingBottom: 'var(--space-2)',
              marginBottom: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: activeSegment.color,
                  border: '1px solid var(--rule)',
                }}
              />
              <strong
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 'var(--fs-lead)',
                  color: 'var(--ink)',
                  textTransform: 'uppercase',
                }}
              >
                {activeSegment.label}
              </strong>
            </div>

            <div
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                color: 'var(--ember)',
                fontWeight: 600,
              }}
            >
              {activeSegment.amountKg.toLocaleString()} KG (
              {((activeSegment.amountKg / maxMass) * 100).toFixed(1)}% OF 40T)
            </div>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              color: 'var(--ink)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)',
            }}
          >
            <span style={{ color: 'var(--ink-dim)', textTransform: 'uppercase' }}>
              Contributing Hardware & Stores:
            </span>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', listStyle: 'square' }}>
              {activeSegment.items.map((it, idx) => (
                <li key={idx} style={{ color: 'var(--ink)' }}>
                  {it}
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              marginTop: 'var(--space-2)',
              textAlign: 'right',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              color: 'var(--ink-dim)',
            }}
          >
            Press [ESC] to dismiss
          </div>
        </div>
      )}

      {/* Comprehensive Legend: All 9 Macro Cargo Segments */}
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
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--ember)', border: '1px solid var(--rule)' }} /> Power ({(categoryTotals.power / 1000).toFixed(1)}t)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--sage)', border: '1px solid var(--rule)' }} /> Life Support ({(categoryTotals.lifesupport / 1000).toFixed(1)}t)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--oxide)', border: '1px solid var(--rule)' }} /> Shielding ({(categoryTotals.shielding / 1000).toFixed(1)}t)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--caution)', border: '1px solid var(--rule)' }} /> Food Modules ({(categoryTotals.food / 1000).toFixed(1)}t)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--ink-dim)', border: '1px solid var(--rule)' }} /> Spares & 3D Fab ({(categoryTotals.spares / 1000).toFixed(1)}t)
        </span>
        {categoryTotals.comfort > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--rule)', border: '1px solid var(--rule)' }} /> Habitability ({(categoryTotals.comfort / 1000).toFixed(1)}t)
          </span>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--water)', border: '1px solid var(--rule)' }} /> Water ({(mass.waterMassKg / 1000).toFixed(1)}t)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--sage)', border: '1px solid var(--rule)' }} /> O2 ({(mass.o2MassKg / 1000).toFixed(1)}t)
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <span style={{ width: '10px', height: '10px', backgroundColor: 'var(--caution)', border: '1px solid var(--rule)' }} /> Dry Rations ({(mass.foodMassKg / 1000).toFixed(1)}t)
        </span>
      </div>
    </div>
  );
};
