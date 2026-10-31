'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/game';
import { L1MissionOverview } from '../../components/mission/L1MissionOverview';
import { L2WaterLoopView } from '../../components/mission/L2WaterLoopView';
import { L2AirLoopView } from '../../components/mission/L2AirLoopView';
import { L2NutritionView } from '../../components/mission/L2NutritionView';
import { L2VehicleStowageView } from '../../components/mission/L2VehicleStowageView';
import { L2ReliabilitySparesView } from '../../components/mission/L2ReliabilitySparesView';
import { L3DiagnosticsDrawer } from '../../components/mission/L3DiagnosticsDrawer';

export type L2SubsystemTab = 'water' | 'air' | 'nutrition' | 'stowage' | 'reliability';

export default function MissionPage() {
  const router = useRouter();
  const {
    coupledOutput,
    activeSolIndex,
    stepCoupledSol,
    jumpToCoupledSol,
    simSpeed,
    setSimSpeed,
    startMission,
    hmiTheme,
    toggleTheme,
    audioMuted,
    toggleAudioMute,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<L2SubsystemTab>('water');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);

  // Auto-initialize if opened directly
  useEffect(() => {
    if (!coupledOutput) {
      startMission();
    }
  }, [coupledOutput, startMission]);

  // Simulation timer loop
  useEffect(() => {
    if (!coupledOutput || simSpeed === 0) return;

    const intervalMap: Record<number, number> = {
      1: 850,
      4: 220,
      16: 50,
    };

    const intervalMs = intervalMap[simSpeed] || 850;
    const interval = setInterval(() => {
      if (document.hidden) return;
      if (activeSolIndex >= coupledOutput.dailyResults.length - 1) {
        setSimSpeed(0);
        return;
      }
      stepCoupledSol();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [coupledOutput, simSpeed, activeSolIndex, stepCoupledSol, setSimSpeed]);

  if (!coupledOutput) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--hmi-bg)',
          color: 'var(--hmi-text)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        INITIALIZING COUPLED LIFE-SUPPORT TELEMETRY BUS...
      </div>
    );
  }

  const currentStep = coupledOutput.dailyResults[activeSolIndex] || coupledOutput.dailyResults[0];
  const totalDays = coupledOutput.totalDays;
  const isMissionFinished = activeSolIndex >= coupledOutput.dailyResults.length - 1;

  const handleFinishMission = () => {
    router.push('/report');
  };

  const tabs: { id: L2SubsystemTab; label: string }[] = [
    { id: 'water', label: 'Water Recovery Loop' },
    { id: 'air', label: 'Air Loop & Carbon Ledger' },
    { id: 'nutrition', label: 'Food, Vitamins & Health' },
    { id: 'stowage', label: 'Vehicle Hab & Stowage' },
    { id: 'reliability', label: 'MTBF & Spares Log' },
  ];

  return (
    <div
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--space-4)',
        boxSizing: 'border-box',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--hmi-bg)',
        color: 'var(--hmi-text)',
      }}
    >
      {/* Top Header & Simulation Controls */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--hmi-border)',
          paddingBottom: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Link
            href="/pack"
            style={{
              color: 'var(--hmi-text-dim)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
            }}
          >
            ← PLANNER
          </Link>
          <span style={{ color: 'var(--hmi-border)' }}>|</span>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-lead)',
              color: 'var(--oxide)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            MISSION TELEMETRY BUS // ISA-101 HMI
          </span>
        </div>

        {/* Playback & Speed Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {/* Pause / Play */}
          <button
            type="button"
            onClick={() => setSimSpeed(simSpeed === 0 ? 1 : 0)}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: simSpeed === 0 ? 'var(--caution)' : 'var(--sage)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            {simSpeed === 0 ? '▶ RESUME' : '❚❚ PAUSE'}
          </button>

          {/* Speed Buttons */}
          <div style={{ display: 'flex', border: '1px solid var(--hmi-border)', borderRadius: 'var(--r-0)' }}>
            {([1, 4, 16] as const).map((spd) => (
              <button
                type="button"
                key={spd}
                onClick={() => setSimSpeed(spd)}
                style={{
                  padding: 'var(--space-1) var(--space-2)',
                  backgroundColor: simSpeed === spd ? 'var(--hmi-nominal)' : 'transparent',
                  border: 'none',
                  color: simSpeed === spd ? 'var(--hmi-text)' : 'var(--hmi-text-dim)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-caption)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {spd}X
              </button>
            ))}
          </div>

          {/* Single Step Sol Button */}
          <button
            type="button"
            onClick={stepCoupledSol}
            disabled={simSpeed !== 0 || isMissionFinished}
            style={{
              padding: 'var(--space-1) var(--space-2)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              cursor: simSpeed === 0 && !isMissionFinished ? 'pointer' : 'not-allowed',
              opacity: simSpeed === 0 && !isMissionFinished ? 1 : 0.5,
              borderRadius: 'var(--r-0)',
            }}
          >
            +1 SOL →
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              padding: 'var(--space-1) var(--space-2)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            {hmiTheme === 'night' ? '☀ DAY' : '☾ NIGHT'}
          </button>

          {/* Audio Alarm Toggle */}
          <button
            type="button"
            onClick={toggleAudioMute}
            style={{
              padding: 'var(--space-1) var(--space-2)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: audioMuted ? 'var(--hmi-text-dim)' : 'var(--sage)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            {audioMuted ? 'MUTED' : 'AUDIO ON'}
          </button>

          {/* L3 Diagnostics Drawer Button */}
          <button
            type="button"
            onClick={() => setShowDiagnostics(true)}
            style={{
              padding: 'var(--space-1) var(--space-2)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--ember)',
              color: 'var(--ember)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            [L3 DIAGNOSTICS]
          </button>

          {/* Finish / Review Report Button */}
          <button
            type="button"
            onClick={handleFinishMission}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: isMissionFinished ? 'var(--sage)' : 'var(--hmi-surface-elevated)',
              color: isMissionFinished ? 'var(--color-basalt)' : 'var(--hmi-text)',
              border: '1px solid var(--hmi-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            {isMissionFinished ? 'VIEW MISSION REPORT →' : 'REVIEW REPORT'}
          </button>
        </div>
      </header>

      {/* Level 1: Fleet Overview & Primary Telemetry */}
      <section aria-label="Level 1 Mission Overview">
        <L1MissionOverview currentStep={currentStep} totalDays={totalDays} />
      </section>

      {/* Sol Scrub Slider / Timeline Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          backgroundColor: 'var(--hmi-surface)',
          border: '1px solid var(--hmi-border)',
          borderRadius: 'var(--r-1)',
          padding: 'var(--space-2) var(--space-3)',
        }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)', whiteSpace: 'nowrap' }}>
          TIMELINE SCRUBBER:
        </span>
        <input
          type="range"
          min={0}
          max={coupledOutput.dailyResults.length - 1}
          value={activeSolIndex}
          onChange={(e) => {
            setSimSpeed(0);
            jumpToCoupledSol(Number(e.target.value));
          }}
          style={{ flex: 1 }}
        />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text)', whiteSpace: 'nowrap' }}>
          DAY {currentStep.day} / {totalDays}
        </span>
      </div>

      {/* Level 2: Subsystem Switcher Tabs */}
      <nav
        aria-label="Level 2 Subsystems"
        style={{
          display: 'flex',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--hmi-border)',
          paddingBottom: 'var(--space-1)',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: isActive ? 'var(--hmi-surface-elevated)' : 'transparent',
                border: isActive ? '2px solid var(--ember)' : '1px solid var(--hmi-border)',
                borderRadius: 'var(--r-1)',
                cursor: 'pointer',
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-body)',
                fontWeight: isActive ? 700 : 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--hmi-text)',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* Active Level 2 Subsystem View */}
      <main style={{ flex: 1 }}>
        {activeTab === 'water' && <L2WaterLoopView currentStep={currentStep} />}
        {activeTab === 'air' && <L2AirLoopView currentStep={currentStep} />}
        {activeTab === 'nutrition' && <L2NutritionView currentStep={currentStep} />}
        {activeTab === 'stowage' && <L2VehicleStowageView currentStep={currentStep} />}
        {activeTab === 'reliability' && <L2ReliabilitySparesView currentStep={currentStep} />}
      </main>

      {/* Level 3 Diagnostics Drawer */}
      {showDiagnostics && (
        <L3DiagnosticsDrawer
          currentStep={currentStep}
          onClose={() => setShowDiagnostics(false)}
        />
      )}
    </div>
  );
}
