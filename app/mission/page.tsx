'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/game';
import { HabitatCutaway } from '../../components/mission/HabitatCutaway';
import { MeterRail } from '../../components/mission/MeterRail';
import { SolClock } from '../../components/mission/SolClock';
import { EventSheet } from '../../components/mission/EventSheet';
import { MissionLog } from '../../components/mission/MissionLog';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

export default function MissionPage() {
  const router = useRouter();
  const {
    simulationState,
    simSpeed,
    startMission,
    advanceSol,
    setSimSpeed,
  } = useGameStore();

  const [activeMobileTab, setActiveMobileTab] = useState<'cutaway' | 'meters' | 'log'>('cutaway');
  const [telemetryState, setTelemetryState] = useState<'loading' | 'live' | 'stale' | 'offline'>('loading');
  const [realtimeData, setRealtimeData] = useState<{
    level: string;
    kIndex: number;
    timestamp?: string;
    offline?: boolean;
    cached?: boolean;
    marsEphemeris?: { distMillionKm: number; signalDelayFormatted: string };
  } | null>(null);

  useEffect(() => {
    fetch('/api/space-weather')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) {
          setTelemetryState('offline');
          return;
        }
        setRealtimeData(data);
        if (data.offline) {
          setTelemetryState('offline');
        } else if (data.cached) {
          setTelemetryState('stale');
        } else {
          setTelemetryState('live');
        }
      })
      .catch(() => {
        setTelemetryState('offline');
      });
  }, []);

  // Auto-initialize if opened directly without prior pack launch
  useEffect(() => {
    if (!simulationState) {
      startMission();
    }
  }, [simulationState, startMission]);

  // Drift-corrected simulation timer loop with document.hidden auto-pause
  useEffect(() => {
    if (!simulationState || simulationState.status !== 'running' || simSpeed === 0) return;

    const intervalMap: Record<number, number> = {
      1: 850,
      4: 220,
      16: 50,
    };

    const intervalMs = intervalMap[simSpeed] || 850;
    let timeoutId: NodeJS.Timeout | null = null;
    let expected = performance.now() + intervalMs;

    const step = () => {
      if (document.hidden) {
        // Paused while tab is hidden, check again in 500ms
        timeoutId = setTimeout(step, 500);
        return;
      }

      const now = performance.now();
      const drift = now - expected;
      advanceSol();
      expected += intervalMs;
      const nextDelay = Math.max(0, intervalMs - drift);
      timeoutId = setTimeout(step, nextDelay);
    };

    timeoutId = setTimeout(step, intervalMs);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        expected = performance.now() + intervalMs;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [simulationState?.status, simSpeed, advanceSol]);

  // Fast-forward until next event or mission end
  const handleSkipToEvent = useCallback(() => {
    if (!simulationState || simulationState.status !== 'running') return;
    let limit = 0;
    // Step forward until event or end condition
    while (limit < 300) {
      limit++;
      advanceSol();
      const current = useGameStore.getState().simulationState;
      if (!current || current.status !== 'running') break;
    }
  }, [simulationState, advanceSol]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If event modal is open, numbers 1-9 choose option
      if (simulationState?.status === 'paused_event' && simulationState.pendingEvent) {
        const choiceIdx = parseInt(e.key, 10) - 1;
        if (
          !isNaN(choiceIdx) &&
          choiceIdx >= 0 &&
          choiceIdx < simulationState.pendingEvent.choices.length
        ) {
          const choice = simulationState.pendingEvent.choices[choiceIdx];
          advanceSol(choice.id);
          return;
        }
      }

      if (e.key === ' ' || e.key === '0') {
        e.preventDefault();
        setSimSpeed(simSpeed === 0 ? 1 : 0);
      } else if (e.key === '1') {
        setSimSpeed(1);
      } else if (e.key === '2') {
        setSimSpeed(4);
      } else if (e.key === '3' || e.key === '4') {
        setSimSpeed(16);
      } else if (e.key === 'e' || e.key === 'E') {
        handleSkipToEvent();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [simulationState, simSpeed, setSimSpeed, advanceSol, handleSkipToEvent]);

  if (!simulationState) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
        INITIALIZING OUTPOST ZERO SURFACE TELEMETRY...
      </div>
    );
  }

  const isCompleted = simulationState.status === 'completed';
  const isFailed = simulationState.status === 'failed';
  const isConcluded = isCompleted || isFailed;

  return (
    <div
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--space-3) var(--space-4)',
        boxSizing: 'border-box',
      }}
    >
      {/* Flight Control Top Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-2)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              color: 'var(--oxide)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            MISSION OPERATIONS // OUTPOST ZERO TELEMETRY
          </span>
          <span style={{ color: 'var(--rule)' }}>|</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)' }}>
            CREW: {simulationState.crew.count} // HEALTH: {simulationState.crew.health}%
          </span>
        </div>

        <nav style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link
            href="/pack"
            style={{
              color: 'var(--ink-dim)',
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '2px 8px',
              border: '1px solid var(--rule)',
            }}
          >
            Re-Pack Cargo
          </Link>
          <Link
            href="/how-it-works"
            style={{
              color: 'var(--ink-dim)',
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '2px 8px',
              border: '1px solid var(--rule)',
            }}
          >
            Model Specs
          </Link>
        </nav>
      </header>

      {/* Telemetry Ribbon with all states (loading skeleton, live timestamp, stale indicator) */}
      <div
        className="tabular-nums"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          backgroundColor: 'var(--basalt-2)',
          border: '1px solid var(--rule)',
          padding: 'var(--space-1) var(--space-3)',
          marginBottom: 'var(--space-2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-detail)',
          color: 'var(--ink-dim)',
          minHeight: '28px',
        }}
      >
        {telemetryState === 'loading' ? (
          <div style={{ color: 'var(--ink-dim)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ color: 'var(--ember)' }}>[TELEMETRY SYNC]</span> Querying NASA Horizons & NOAA SWPC Gateway...
          </div>
        ) : telemetryState === 'offline' || !realtimeData?.marsEphemeris ? (
          <>
            <div>
              <span style={{ color: 'var(--ink-dim)', fontWeight: 600 }}>[OFFLINE MODEL]:</span> Mars Range 225.0M km | 1-Way Latency: 12.5m (Simulated Orbit)
            </div>
            <div>
              Space Weather: <span style={{ color: 'var(--sage)' }}>Kp 2 (QUIET BASELINE)</span>
            </div>
          </>
        ) : (
          <>
            <div>
              <span style={{ color: telemetryState === 'stale' ? 'var(--caution)' : 'var(--ember)', fontWeight: 600 }}>
                {telemetryState === 'stale' ? '[CACHED TELEMETRY]:' : '[LIVE NASA/JPL TELEMETRY]:'}
              </span>{' '}
              Range {realtimeData.marsEphemeris.distMillionKm}M km | 1-Way Comms Latency:{' '}
              <strong style={{ color: 'var(--ink)' }}>{realtimeData.marsEphemeris.signalDelayFormatted}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span>
                Space Weather:{' '}
                <span
                  style={{
                    color:
                      realtimeData.level === 'storm'
                        ? 'var(--alarm)'
                        : realtimeData.level === 'active'
                        ? 'var(--caution)'
                        : 'var(--sage)',
                    fontWeight: 600,
                  }}
                >
                  Kp {realtimeData.kIndex} ({realtimeData.level.toUpperCase()})
                </span>
              </span>
              {realtimeData.timestamp && (
                <span style={{ color: 'var(--ink-dim)', fontSize: 'var(--fs-caption)' }}>
                  [{realtimeData.timestamp.slice(11, 16)} UTC]
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Clock and Simulation Speed Rail */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <SolClock
          currentSol={simulationState.sol}
          maxSols={simulationState.maxSols}
          speed={simSpeed}
          isPausedForEvent={simulationState.status === 'paused_event'}
          onSetSpeed={setSimSpeed}
          onSkipToEvent={handleSkipToEvent}
        />
      </div>

      {/* Mobile Tab Switcher (< 768px viewports) */}
      <div
        className="mobile-tab-bar"
        style={{
          display: 'none',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <Button
          variant={activeMobileTab === 'cutaway' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveMobileTab('cutaway')}
        >
          Habitat Cutaway
        </Button>
        <Button
          variant={activeMobileTab === 'meters' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveMobileTab('meters')}
        >
          System Meters
        </Button>
        <Button
          variant={activeMobileTab === 'log' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveMobileTab('log')}
        >
          Mission Log
        </Button>
      </div>

      {/* Mission Concluded Banner */}
      {isConcluded && (
        <div
          style={{
            backgroundColor: isCompleted ? 'var(--basalt-2)' : 'var(--alarm-dark)',
            border: `2px solid ${isCompleted ? 'var(--sage)' : 'var(--alarm)'}`,
            borderRadius: 'var(--r-1)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-label)',
                color: isCompleted ? 'var(--sage)' : 'var(--alarm)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              MISSION LIFECYCLE CONCLUDED
            </span>
            <h2
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-lead)',
                margin: '2px 0 0 0',
                color: 'var(--ink)',
              }}
            >
              {simulationState.endCondition?.headline}
            </h2>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-label)',
                color: 'var(--ink-dim)',
                margin: '4px 0 0 0',
              }}
            >
              {simulationState.endCondition?.primaryCause}
            </p>
          </div>

          <Button
            id="view-report-btn"
            variant="primary"
            size="lg"
            onClick={() => router.push('/report')}
          >
            VIEW FULL MISSION REPORT & CAUSE CHAIN &rarr;
          </Button>
        </div>
      )}

      {/* Main 3-Column Desktop / Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1.1fr)',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
        }}
      >
        {/* Left Column: Hand-drawn Habitat Cutaway Visual */}
        <div>
          <HabitatCutaway state={simulationState} />
        </div>

        {/* Right Column: Gauges Rail & Telemetry */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <MeterRail state={simulationState} />
          <MissionLog state={simulationState} />
        </div>
      </div>

      {/* Slide-Up Event Sheet Modal (When paused for event) */}
      {simulationState.status === 'paused_event' && simulationState.pendingEvent && (
        <EventSheet
          event={simulationState.pendingEvent}
          state={simulationState}
          onSelectChoice={(choiceId) => advanceSol(choiceId)}
        />
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-tab-bar {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
