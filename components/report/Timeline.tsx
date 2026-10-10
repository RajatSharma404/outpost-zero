'use client';

import React, { useState } from 'react';
import type { SimulationState } from '../../lib/sim/types';

interface TimelineProps {
  state: SimulationState;
}

export const Timeline: React.FC<TimelineProps> = ({ state }) => {
  const [activeMarker, setActiveMarker] = useState<{
    sol: number;
    title: string;
    detail: string;
    x: number;
  } | null>(null);

  const endSol = state.sol;
  const maxSols = state.maxSols;
  const width = 800;
  const height = 90;
  const paddingX = 40;
  const usableWidth = width - paddingX * 2;

  const getX = (sol: number) => {
    return paddingX + (Math.min(sol, endSol) / Math.max(1, endSol)) * usableWidth;
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
        <span>{state.eventHistory.length} INCIDENTS LOGGED</span>
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
          fontSize="var(--fs-caption)"
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
          fontSize="var(--fs-caption)"
          fontFamily="var(--font-mono)"
          textAnchor="middle"
          fontWeight="bold"
        >
          SOL {String(endSol).padStart(3, '0')}
        </text>

        {/* Event Markers */}
        {state.eventHistory.map((hist, idx) => {
          const cx = getX(hist.sol);
          return (
            <g
              key={idx}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() =>
                setActiveMarker({
                  sol: hist.sol,
                  title: hist.eventId.replace(/_/g, ' ').toUpperCase(),
                  detail: `Directive executed: "${hist.choiceId.replace(/_/g, ' ')}"`,
                  x: cx,
                })
              }
              onMouseLeave={() => setActiveMarker(null)}
            >
              {/* Vertical Tick */}
              <line x1={cx} y1={25} x2={cx} y2={45} stroke="var(--ember)" strokeWidth="1.5" />
              {/* Diamond Marker */}
              <polygon
                points={`${cx},20 ${cx + 5},25 ${cx},30 ${cx - 5},25`}
                fill="var(--basalt-2)"
                stroke="var(--ember)"
                strokeWidth="1.5"
              />
              <text
                x={cx}
                y={15}
                fill="var(--ember)"
                fontSize="var(--fs-micro)"
                fontFamily="var(--font-mono)"
                textAnchor="middle"
              >
                {hist.sol}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Hover Popup for Event Marker */}
      {activeMarker && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: `${(activeMarker.x / width) * 100}%`,
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--basalt-2)',
            border: '1px solid var(--ember)',
            padding: 'var(--space-2) var(--space-3)',
            borderRadius: 'var(--r-1)',
            zIndex: 50,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--ember)', fontWeight: 600 }}>
            SOL {activeMarker.sol}: {activeMarker.title}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--ink-dim)' }}>
            {activeMarker.detail}
          </div>
        </div>
      )}
    </div>
  );
};
