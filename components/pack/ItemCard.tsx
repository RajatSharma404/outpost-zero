'use client';

import React from 'react';
import type { PackableItem } from '../../lib/sim/types';
import { Icon, type IconName } from '../ui/Icon';

interface ItemCardProps {
  item: PackableItem;
  isPacked: boolean;
  onToggle: (id: string) => void;
}

const CATEGORY_ICON_MAP: Record<string, IconName> = {
  solar_small: 'solar',
  solar_large: 'solar',
  fission_unit: 'reactor',
  battery_bank: 'battery',
  eclss_recycler: 'recycler',
  moxie_scaleup: 'moxie',
  regolith_shield: 'shield',
  storm_shelter: 'shelter',
  greenhouse_small: 'greenhouse',
  greenhouse_large: 'greenhouse',
  spare_parts_kit: 'spares',
  medical_kit: 'medical',
  rec_module: 'comfort',
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, isPacked, onToggle }) => {
  const iconName = CATEGORY_ICON_MAP[item.id] || 'cube';

  const powerDisplay =
    item.powerKw < 0
      ? `+${Math.abs(item.powerKw)} kW GEN`
      : item.powerKw > 0
      ? `-${item.powerKw} kW DRAW`
      : '0 kW PASSIVE';

  const powerColor =
    item.powerKw < 0 ? 'var(--ember)' : item.powerKw > 0 ? 'var(--caution)' : 'var(--ink-dim)';

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isPacked}
      onClick={() => onToggle(item.id)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onToggle(item.id);
        }
      }}
      style={{
        backgroundColor: isPacked ? 'var(--basalt-2)' : 'var(--basalt)',
        border: `1px solid ${isPacked ? 'var(--ember)' : 'var(--rule)'}`,
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-4)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        userSelect: 'none',
        outline: 'none',
      }}
    >
      {/* Top Header: Icon + Category + Stamped LOADED Mark */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                display: 'inline-flex',
                padding: 'var(--space-1)',
                border: '1px solid var(--rule)',
                backgroundColor: 'var(--basalt)',
                color: isPacked ? 'var(--ember)' : 'var(--ink-dim)',
              }}
            >
              <Icon name={iconName} size={22} />
            </span>
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 'var(--fs-label)',
                  textTransform: 'uppercase',
                  color: 'var(--ink-dim)',
                  letterSpacing: '0.1em',
                  display: 'block',
                }}
              >
                {item.category}
              </span>
              <strong
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 'var(--fs-lead)',
                  fontWeight: 600,
                  color: isPacked ? 'var(--ink)' : 'var(--ink-dim)',
                  lineHeight: 1.2,
                }}
              >
                {item.name}
              </strong>
            </div>
          </div>

          {/* Stamped LOADED mark (not a soft checkmark) */}
          {isPacked ? (
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-label)',
                fontWeight: 700,
                letterSpacing: '0.15em',
                color: 'var(--ember)',
                border: '1.5px solid var(--ember)',
                padding: '2px 6px',
                transform: 'rotate(-4deg)',
                display: 'inline-block',
                textTransform: 'uppercase',
              }}
            >
              LOADED
            </span>
          ) : (
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-label)',
                letterSpacing: '0.1em',
                color: 'var(--rule)',
                border: '1px dashed var(--rule)',
                padding: '2px 6px',
                textTransform: 'uppercase',
              }}
            >
              AVAILABLE
            </span>
          )}
        </div>

        {/* Blurb */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-label)',
            color: 'var(--ink)',
            lineHeight: 1.4,
            margin: 'var(--space-2) 0',
          }}
        >
          {item.blurb}
        </p>

        {/* Tradeoff Line */}
        <div
          style={{
            backgroundColor: 'var(--basalt)',
            borderLeft: '2px solid var(--oxide)',
            padding: 'var(--space-2) var(--space-3)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-caption)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--oxide)',
              display: 'block',
              fontWeight: 700,
            }}
          >
            TRADE-OFF
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--ink-dim)',
              lineHeight: 1.3,
              display: 'block',
            }}
          >
            {item.tradeoff}
          </span>
        </div>
      </div>

      {/* Footer: Mass & Power specs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid var(--rule)',
          paddingTop: 'var(--space-2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
        }}
      >
        <span style={{ color: 'var(--ink)' }}>
          MASS: <strong>{item.massKg.toLocaleString()} KG</strong>
        </span>
        <span style={{ color: powerColor }}>
          POWER: <strong>{powerDisplay}</strong>
        </span>
      </div>
    </div>
  );
};
