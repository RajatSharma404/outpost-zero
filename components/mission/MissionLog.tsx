'use client';

import React from 'react';
import type { SimulationState } from '../../lib/sim/types';

interface MissionLogProps {
  state: SimulationState;
}

export const MissionLog: React.FC<MissionLogProps> = ({ state }) => {
  // Collect logs from event history and brownouts
  const logEntries: Array<{ sol: number; text: string; type: 'nominal' | 'event' | 'alert' }> = [];

  // Start with landing entry
  logEntries.push({
    sol: 1,
    text: `Touchdown confirmed on Martian surface. 40-tonne cargo manifest deployed. Target mission duration: ${state.maxSols} sols.`,
    type: 'nominal',
  });

  for (const hist of state.eventHistory) {
    logEntries.push({
      sol: hist.sol,
      text: `CRISIS EVENT: ${hist.eventId.replace(/_/g, ' ').toUpperCase()} // Executed protocol directive "${hist.choiceId.replace(/_/g, ' ')}".`,
      type: 'event',
    });
  }

  if (state.brownoutLoadsShed.length > 0) {
    logEntries.push({
      sol: state.sol - 1,
      text: `GRID BROWNOUT: Electrical reserves depleted. Auxiliary shed active on: ${state.brownoutLoadsShed.join(', ')}.`,
      type: 'alert',
    });
  }

  if (state.status === 'failed' && state.endCondition) {
    logEntries.push({
      sol: state.sol,
      text: `MISSION TERMINATION: ${state.endCondition.headline}. ${state.endCondition.primaryCause}`,
      type: 'alert',
    });
  } else if (state.status === 'completed') {
    logEntries.push({
      sol: state.maxSols,
      text: `MISSION SUCCESS: Outpost Zero nominal duration verified across all ${state.maxSols} sols.`,
      type: 'nominal',
    });
  }

  // Reverse chronological order (newest first)
  const reversed = [...logEntries].reverse();

  return (
    <div
      style={{
        backgroundColor: 'var(--basalt)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        height: '240px',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-condensed)',
          fontSize: 'var(--fs-label)',
          color: 'var(--ink-dim)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-1)',
          marginBottom: 'var(--space-2)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>MISSION OPERATIONS LOG</span>
        <span>LIVE TELEMETRY FEED</span>
      </div>

      <div
        style={{
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
          lineHeight: 1.4,
        }}
      >
        {reversed.map((entry, idx) => (
          <div
            key={idx}
            style={{
              color:
                entry.type === 'alert'
                  ? 'var(--alarm)'
                  : entry.type === 'event'
                  ? 'var(--ember)'
                  : 'var(--ink)',
            }}
          >
            <span style={{ color: 'var(--ink-dim)', marginRight: '6px' }}>
              [SOL {String(entry.sol).padStart(3, '0')}]
            </span>
            {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
};
