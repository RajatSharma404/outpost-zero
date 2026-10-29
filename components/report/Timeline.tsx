'use client';

import React, { useState, useEffect } from 'react';
import type { SimulationState } from '../../lib/sim/types';

interface TimelineProps {
  state: SimulationState;
}

export const Timeline: React.FC<TimelineProps> = ({ state }) => {
  const [activeMarker, setActiveMarker] = useState<{
    sol: number;
    title: string;
    detail: string;
    category: string;
    x: number;
  } | null>(null);

  // Esc key closes active popover
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMarker(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const endSol = state.sol;
  const width = 800;
  const height = 90;
  const paddingX = 40;
  const usableWidth = width - paddingX * 2;

  const getX = (sol: number) => {
    return paddingX + (Math.min(sol, endSol) / Math.max(1, endSol)) * usableWidth;
  };

  const getCategoryGlyph = (eventId: string) => {
    if (eventId.includes('storm') || eventId.includes('dust')) return '▲';
    if (eventId.includes('flare') || eventId.includes('rad')) return '◆';
    if (eventId.includes('leak') || eventId.includes('water')) return '●';
    if (eventId.includes('brownout') || eventId.includes('power')) return '■';
    return '★';
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--basalt)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-3)',
        marginBottom: 'var(--space-4)',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-condensed)',
          fontSize: 'var(--fs-label)',
          color: 'var(--ink-dim)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 'var(--space-2)',
        }}
      >
        <span>MISSION TIMELINE CHRONOLOGY // SOL 1 TO {endSol}</span>
        <span className="tabular-nums">{state.eventHistory.length} INCIDENTS LOGGED</span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label="Chronological mission timeline with incident markers"
      >
        {/* Baseline Rule */}
        <line
          x1={paddingX}
          y1={45}
          x2={width - paddingX}
          y2={45}
          stroke="var(--rule)"
          strokeWidth="2"
        />

        {/* Elapsed Mission Progress Segment */}
        <line
          x1={paddingX}
          y1={45}
          x2={getX(endSol)}
          y2={45}
          stroke="var(--ember)"
          strokeWidth="2"
        />

        {/* Start Tick (Sol 1) */}
        <circle cx={paddingX} cy={45} r={4} fill="var(--ember)" />
        <text
          x={paddingX}
          y={65}
          fill="var(--ink-dim)"
          fontSize="var(--fs-detail)"
          fontFamily="var(--font-mono)"
          textAnchor="middle"
        >
          SOL 001
        </text>

        {/* End Tick */}
        <circle cx={getX(endSol)} cy={45} r={5} fill={state.status === 'completed' ? 'var(--sage)' : 'var(--alarm)'} />
        <text
          x={getX(endSol)}
          y={65}
          fill={state.status === 'completed' ? 'var(--sage)' : 'var(--alarm)'}
          fontSize="var(--fs-detail)"
          fontFamily="var(--font-mono)"
          textAnchor="middle"
          fontWeight="bold"
        >
          SOL {String(endSol).padStart(3, '0')}
        </text>

        {/* Event Markers (Keyboard-Focusable & Glyph-Encoded) */}
        {state.eventHistory.map((hist, idx) => {
          const cx = getX(hist.sol);
          const glyph = getCategoryGlyph(hist.eventId);

          return (
            <g
              key={idx}
              tabIndex={0}
              role="button"
              aria-label={`Sol ${hist.sol} incident: ${hist.eventId.replace(/_/g, ' ')}`}
              style={{ cursor: 'pointer', outline: 'none' }}
              onClick={() =>
                setActiveMarker({
                  sol: hist.sol,
                  title: hist.eventId.replace(/_/g, ' ').toUpperCase(),
                  detail: `Directive executed: "${hist.choiceId.replace(/_/g, ' ')}"`,
                  category: glyph,
                  x: cx,
                })
              }
              onFocus={() =>
                setActiveMarker({
                  sol: hist.sol,
                  title: hist.eventId.replace(/_/g, ' ').toUpperCase(),
                  detail: `Directive executed: "${hist.choiceId.replace(/_/g, ' ')}"`,
                  category: glyph,
                  x: cx,
                })
              }
              onBlur={() => {
                setTimeout(() => setActiveMarker(null), 250);
              }}
              onMouseEnter={() =>
                setActiveMarker({
                  sol: hist.sol,
                  title: hist.eventId.replace(/_/g, ' ').toUpperCase(),
                  detail: `Directive executed: "${hist.choiceId.replace(/_/g, ' ')}"`,
                  category: glyph,
                  x: cx,
                })
              }
              onMouseLeave={() => setActiveMarker(null)}
            >
              {/* Vertical Tick */}
              <line x1={cx} y1={25} x2={cx} y2={45} stroke="var(--ember)" strokeWidth="1.5" />
              {/* Diamond Marker */}
              <polygon
                points={`${cx},20 ${cx + 6},26 ${cx},32 ${cx - 6},26`}
                fill="var(--basalt-2)"
                stroke="var(--ember)"
                strokeWidth="1.5"
              />
              {/* Glyph Inside Diamond for non-color meaning */}
              <text
                x={cx}
                y={29}
                fill="var(--ember)"
                fontSize="8px"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {glyph}
              </text>
              <text
                x={cx}
                y={15}
                fill="var(--ember)"
                fontSize="var(--fs-detail)"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {hist.sol}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Popover Ledger Tooltip with boundary positioning */}
      {activeMarker && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + var(--space-2))',
            left: `${Math.max(10, Math.min(85, (activeMarker.x / width) * 100))}%`,
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--basalt-2)',
            border: '2px solid var(--ember)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--r-1)',
            zIndex: 90,
            boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
            whiteSpace: 'nowrap',
          }}
        >
          <div
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              color: 'var(--ember)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
            }}
          >
            <span>{activeMarker.category}</span>
            <span>SOL {activeMarker.sol}: {activeMarker.title}</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--ink-dim)' }}>
            {activeMarker.detail}
          </div>
        </div>
      )}
    </div>
  );
};
