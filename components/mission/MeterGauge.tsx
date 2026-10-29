'use client';

import React, { useState, useEffect, useRef, memo } from 'react';
import type { LedgerEntry } from '../../lib/sim/types';
import { Tag } from '../ui/Tag';

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

const MeterGaugeComponent: React.FC<MeterGaugeProps> = ({
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
  const [flipBelow, setFlipBelow] = useState(false);
  const [crossingAnnouncement, setCrossingAnnouncement] = useState<string>('');
  const prevStatusRef = useRef(status);
  const containerRef = useRef<HTMLDivElement>(null);

  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Only announce on threshold crossings to avoid flooding screen readers at 16x warp
  useEffect(() => {
    if (prevStatusRef.current !== status) {
      if (status === 'alarm') {
        setCrossingAnnouncement(`CRITICAL ALERT: ${label} fell below 10% safety margin to ${Math.round(value)} ${unit}.`);
      } else if (status === 'caution') {
        setCrossingAnnouncement(`CAUTION ADVISORY: ${label} fell below 20% margin to ${Math.round(value)} ${unit}.`);
      } else if (status === 'nominal' && prevStatusRef.current !== 'nominal') {
        setCrossingAnnouncement(`${label} recovered to nominal reserves (${Math.round(value)} ${unit}).`);
      }
      prevStatusRef.current = status;
    }
  }, [status, label, value, unit]);

  // Handle escape to close tooltip and detect boundary flip
  useEffect(() => {
    if (!showTooltip) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTooltip(false);
      }
    };

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // If within 150px of top viewport edge, flip below
      setFlipBelow(rect.top < 160);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTooltip]);

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
      ref={containerRef}
      tabIndex={0}
      role="region"
      aria-label={`${label}: ${value.toFixed(1)} ${unit}, status ${statusLabel}, trend ${trend}`}
      onClick={() => setShowTooltip((prev) => !prev)}
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
        cursor: 'pointer',
        transition: 'border-color 0.15s ease',
      }}
    >
      {/* Screen Reader Live Announcement on Threshold Crossings ONLY */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {crossingAnnouncement}
      </div>

      {/* Top Label & Status Tag + Trend Glyph */}
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
          {/* Trend arrow encoded with text + glyph (H6) */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              color: trend === 'down' ? 'var(--caution)' : trend === 'up' ? 'var(--sage)' : 'var(--ink-dim)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              marginRight: 'var(--space-1)',
            }}
          >
            {trend === 'down' ? '▼ DWN' : trend === 'up' ? '▲ UP' : '■ FLT'}
          </span>
          <Tag label={statusLabel} variant={status} size="sm" />
        </div>
      </div>

      {/* Big Numeral + Unit (Tabular Numbers) */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
        <span
          className="tabular-nums"
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

      {/* Progress Bar with 10% Alarm and 20% Caution Threshold Ticks */}
      <div
        style={{
          height: '8px',
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
            transition: 'width 0.15s ease',
          }}
        />

        {/* 10% Alarm Threshold Tick Line */}
        <div
          title="Critical Alarm Threshold (10%)"
          style={{
            position: 'absolute',
            left: '10%',
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: 'var(--alarm)',
            zIndex: 3,
            boxShadow: '0 0 1px var(--basalt)',
          }}
        />

        {/* 20% Caution Threshold Tick Line */}
        <div
          title="Caution Threshold (20%)"
          style={{
            position: 'absolute',
            left: '20%',
            top: 0,
            bottom: 0,
            width: '1px',
            backgroundColor: 'var(--caution)',
            zIndex: 3,
            boxShadow: '0 0 1px var(--basalt)',
          }}
        />
      </div>

      {/* Keyboard, Tap & Focus Interactive Delta Tooltip Ledger */}
      {showTooltip && lastLedgerEntry && lastLedgerEntry.causes.length > 0 && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            ...(flipBelow
              ? { top: 'calc(100% + var(--space-2))' }
              : { bottom: 'calc(100% + var(--space-2))' }),
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--basalt-2)',
            border: '2px solid var(--ember)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--r-1)',
            zIndex: 100,
            width: 'max-content',
            maxWidth: '300px',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
            color: 'var(--ink)',
            lineHeight: 1.4,
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              color: 'var(--ember)',
              fontWeight: 700,
              borderBottom: '1px solid var(--rule)',
              paddingBottom: '4px',
              marginBottom: 'var(--space-1)',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 'var(--space-2)',
            }}
          >
            <span>LAST SOL LEDGER</span>
            <span className="tabular-nums">
              Net {formatDelta(lastLedgerEntry.delta)} {unit}
            </span>
          </div>
          {lastLedgerEntry.causes.map((cause, idx) => (
            <div
              key={idx}
              className="tabular-nums"
              style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-2)' }}
            >
              <span style={{ color: 'var(--ink-dim)' }}>{cause.source.replace(/_/g, ' ')}:</span>
              <span style={{ color: cause.amount >= 0 ? 'var(--sage)' : 'var(--caution)' }}>
                {formatDelta(cause.amount)} {unit}
              </span>
            </div>
          ))}
          <div
            style={{
              marginTop: '4px',
              textAlign: 'right',
              fontSize: '9px',
              color: 'var(--ink-dim)',
            }}
          >
            Click or [ESC] to dismiss
          </div>
        </div>
      )}
    </div>
  );
};

export const MeterGauge = memo(MeterGaugeComponent);
