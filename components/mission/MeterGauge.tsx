'use client';

import React, { useState } from 'react';
import type { LedgerEntry } from '../../lib/sim/types';
import { Tag } from '../ui/Tag';
import { Icon } from '../ui/Icon';

interface MeterGaugeProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  status: 'nominal' | 'caution' | 'alarm';
  statusLabel: string;
  trend: 'up' | 'down' | 'stable';
  lastLedgerEntry?: LedgerEntry;
}

export const MeterGauge: React.FC<MeterGaugeProps> = ({
  label,
  value,
  max,
  unit,
  status,
  statusLabel,
  trend,
  lastLedgerEntry,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const barColor =
    status === 'nominal'
      ? 'var(--sage)'
      : status === 'caution'
      ? 'var(--caution)'
      : 'var(--alarm)';

  const formatDelta = (delta: number) => {
    return delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
  };

  return (
    <div
      tabIndex={0}
      role="region"
      aria-label={`${label}: ${value.toFixed(1)} ${unit}, status ${statusLabel}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      style={{
        backgroundColor: 'var(--basalt)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-3)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        outline: 'none',
        transition: 'border-color 0.15s ease',
      }}
    >
      {/* Top Label & Status Tag */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-label)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-dim)',
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          {trend === 'down' && <Icon name="arrow_down" size={14} style={{ color: 'var(--caution)' }} />}
          {trend === 'up' && <Icon name="arrow_up" size={14} style={{ color: 'var(--sage)' }} />}
          <Tag label={statusLabel} variant={status} size="sm" />
        </div>
      </div>

      {/* Big Numeral + Unit */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
        <span
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-gauge)',
            fontWeight: 700,
            lineHeight: 1,
            color: 'var(--ink)',
          }}
        >
          {Math.round(value).toLocaleString()}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-label)',
            color: 'var(--ink-dim)',
            textTransform: 'uppercase',
          }}
        >
          {unit}
        </span>
      </div>

      {/* Thin Progress Bar with safety threshold */}
      <div
        style={{
          height: '6px',
          width: '100%',
          backgroundColor: 'var(--basalt-2)',
          border: '1px solid var(--rule)',
          borderRadius: 'var(--r-0)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: barColor,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      {/* Hover / Focus Ledger Contributions Tooltip */}
      {showTooltip && lastLedgerEntry && lastLedgerEntry.causes.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '105%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--basalt-2)',
            border: '1px solid var(--ember)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--r-1)',
            zIndex: 90,
            width: 'max-content',
            maxWidth: '280px',
            boxShadow: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
            color: 'var(--ink)',
            lineHeight: 1.4,
            pointerEvents: 'none',
          }}
        >
          <div style={{ color: 'var(--ember)', fontWeight: 600, borderBottom: '1px solid var(--rule)', marginBottom: '4px' }}>
            LAST SOL CONTRIBUTIONS (Net {formatDelta(lastLedgerEntry.delta)} {unit})
          </div>
          {lastLedgerEntry.causes.map((cause, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}>
              <span style={{ color: 'var(--ink-dim)' }}>{cause.source.replace(/_/g, ' ')}:</span>
              <span style={{ color: cause.amount >= 0 ? 'var(--sage)' : 'var(--caution)' }}>
                {formatDelta(cause.amount)} {unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
