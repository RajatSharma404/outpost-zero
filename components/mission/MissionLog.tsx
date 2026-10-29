'use client';

import React, { useState, useMemo, memo } from 'react';
import type { SimulationState } from '../../lib/sim/types';

interface MissionLogProps {
  state: SimulationState;
}

type LogFilter = 'all' | 'event' | 'alert' | 'nominal';

interface LogEntry {
  id: string;
  sol: number;
  text: string;
  type: 'nominal' | 'event' | 'alert';
  isPinned?: boolean;
}

const MissionLogComponent: React.FC<MissionLogProps> = ({ state }) => {
  const [filter, setFilter] = useState<LogFilter>('all');
  const [newestFirst, setNewestFirst] = useState(true);
  const [pinCrisis, setPinCrisis] = useState(true);

  // Collect logs from event history and brownouts
  const rawEntries = useMemo(() => {
    const list: LogEntry[] = [];

    // Touchdown entry
    list.push({
      id: 'landing',
      sol: 1,
      text: `Touchdown confirmed on Martian surface. 40-tonne cargo manifest deployed. Target mission duration: ${state.maxSols} sols.`,
      type: 'nominal',
    });

    for (const hist of state.eventHistory) {
      list.push({
        id: `event-${hist.sol}-${hist.eventId}`,
        sol: hist.sol,
        text: `CRISIS EVENT: ${hist.eventId.replace(/_/g, ' ').toUpperCase()} // Executed protocol directive "${hist.choiceId.replace(/_/g, ' ')}".`,
        type: 'event',
        isPinned: true,
      });
    }

    if (state.brownoutLoadsShed.length > 0) {
      list.push({
        id: `brownout-${state.sol}`,
        sol: state.sol - 1,
        text: `GRID BROWNOUT: Electrical reserves depleted. Auxiliary shed active on: ${state.brownoutLoadsShed.join(', ')}.`,
        type: 'alert',
        isPinned: true,
      });
    }

    if (state.status === 'failed' && state.endCondition) {
      list.push({
        id: `failed-${state.sol}`,
        sol: state.sol,
        text: `MISSION TERMINATION: ${state.endCondition.headline}. ${state.endCondition.primaryCause}`,
        type: 'alert',
        isPinned: true,
      });
    } else if (state.status === 'completed') {
      list.push({
        id: `completed-${state.maxSols}`,
        sol: state.maxSols,
        text: `MISSION SUCCESS: Outpost Zero nominal duration verified across all ${state.maxSols} sols.`,
        type: 'nominal',
      });
    }

    return list;
  }, [state.eventHistory, state.brownoutLoadsShed, state.status, state.endCondition, state.sol, state.maxSols]);

  // Counts for filters
  const counts = useMemo(() => {
    return {
      all: rawEntries.length,
      event: rawEntries.filter((e) => e.type === 'event').length,
      alert: rawEntries.filter((e) => e.type === 'alert').length,
      nominal: rawEntries.filter((e) => e.type === 'nominal').length,
    };
  }, [rawEntries]);

  // Filtered & sorted list
  const displayEntries = useMemo(() => {
    let result = rawEntries;
    if (filter !== 'all') {
      result = result.filter((e) => e.type === filter);
    }
    const sorted = [...result].sort((a, b) => (newestFirst ? b.sol - a.sol : a.sol - b.sol));

    // If pinCrisis is enabled, pinned crisis entries appear at the very top
    if (pinCrisis) {
      const pinned = sorted.filter((e) => e.isPinned);
      const unpinned = sorted.filter((e) => !e.isPinned);
      return [...pinned, ...unpinned];
    }

    return sorted;
  }, [rawEntries, filter, newestFirst, pinCrisis]);

  return (
    <div
      style={{
        backgroundColor: 'var(--basalt)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        height: '260px',
      }}
    >
      {/* Flight Log Header + Controls */}
      <div
        style={{
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-2)',
          marginBottom: 'var(--space-2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              color: 'var(--ink-dim)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            MISSION OPERATIONS LOG
          </span>

          {/* Filter toggle buttons with counts */}
          <div role="group" aria-label="Filter log events" style={{ display: 'flex', gap: '2px' }}>
            {(['all', 'event', 'alert', 'nominal'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-detail)',
                  textTransform: 'uppercase',
                  padding: '1px var(--space-1)',
                  border: `1px solid ${filter === f ? 'var(--ember)' : 'var(--rule)'}`,
                  backgroundColor: filter === f ? 'var(--ember)' : 'transparent',
                  color: filter === f ? 'var(--basalt)' : 'var(--ink-dim)',
                  fontWeight: filter === f ? 700 : 400,
                  cursor: 'pointer',
                  borderRadius: 'var(--r-0)',
                }}
              >
                {f} ({counts[f]})
              </button>
            ))}
          </div>
        </div>

        {/* Chronological Sort Toggle & Pin Crisis */}
        <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
          <button
            type="button"
            onClick={() => setPinCrisis((p) => !p)}
            aria-pressed={pinCrisis}
            title="Pin incident crises to top of feed"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              textTransform: 'uppercase',
              padding: '1px var(--space-1)',
              border: `1px solid ${pinCrisis ? 'var(--caution)' : 'var(--rule)'}`,
              backgroundColor: pinCrisis ? 'var(--basalt-2)' : 'transparent',
              color: pinCrisis ? 'var(--caution)' : 'var(--ink-dim)',
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            {pinCrisis ? '★ PIN CRISIS' : '☆ CRISIS'}
          </button>

          <button
            type="button"
            onClick={() => setNewestFirst((n) => !n)}
            title="Toggle chronological sorting"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              textTransform: 'uppercase',
              padding: '1px var(--space-1)',
              border: '1px solid var(--rule)',
              backgroundColor: 'transparent',
              color: 'var(--ink-dim)',
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            {newestFirst ? 'NEWEST ↓' : 'OLDEST ↑'}
          </button>
        </div>
      </div>

      {/* Log Feed List */}
      <div
        style={{
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-detail)',
          lineHeight: 1.4,
        }}
      >
        {displayEntries.map((entry) => (
          <div
            key={entry.id}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 'var(--space-2)',
              backgroundColor: entry.isPinned && pinCrisis ? 'var(--basalt-2)' : 'transparent',
              padding: entry.isPinned && pinCrisis ? '2px var(--space-1)' : 0,
              borderLeft: entry.isPinned && pinCrisis ? '2px solid var(--ember)' : 'none',
              color:
                entry.type === 'alert'
                  ? 'var(--alarm)'
                  : entry.type === 'event'
                  ? 'var(--ember)'
                  : 'var(--ink)',
            }}
          >
            <span
              className="tabular-nums"
              style={{ color: 'var(--ink-dim)', flexShrink: 0 }}
            >
              [SOL {String(entry.sol).padStart(3, '0')}]
            </span>
            <span style={{ wordBreak: 'break-word' }}>
              {entry.isPinned && pinCrisis && (
                <span aria-hidden="true" style={{ color: 'var(--caution)', marginRight: '4px' }}>
                  ▲
                </span>
              )}
              {entry.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MissionLog = memo(MissionLogComponent);
