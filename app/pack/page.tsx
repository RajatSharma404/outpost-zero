'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/game';
import { decodeChallenge } from '../../lib/share';
import { CrewRosterPlanner } from '../../components/pack/CrewRosterPlanner';
import { VehicleSelector } from '../../components/pack/VehicleSelector';
import { ManifestStowageView } from '../../components/pack/ManifestStowageView';
import { LifeSupportArchitecture } from '../../components/pack/LifeSupportArchitecture';
import { ContingencyPolicyPlanner } from '../../components/pack/ContingencyPolicyPlanner';

export type WizardStep = 'crew' | 'vehicle' | 'manifest' | 'eclss' | 'contingency';

export default function PackPage() {
  const router = useRouter();
  const {
    coupledConfig,
    setLoadout,
    startMission,
    loadPreset,
    hmiTheme,
    toggleTheme,
    audioMuted,
    toggleAudioMute,
  } = useGameStore();

  const [activeStep, setActiveStep] = useState<WizardStep>('crew');

  // Check URL hash for shared challenge fragment (H3 constraint)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const decoded = decodeChallenge(window.location.hash);
      if (decoded) {
        setLoadout(decoded);
      }
    }
  }, [setLoadout]);

  const handleLaunch = () => {
    startMission();
    router.push('/mission');
  };

  const handleQuickStart = () => {
    loadPreset('quick30');
    startMission();
    router.push('/mission');
  };

  const steps: { id: WizardStep; label: string; index: string }[] = [
    { id: 'crew', label: 'Crew Roster', index: '01' },
    { id: 'vehicle', label: 'Vehicle Architecture', index: '02' },
    { id: 'manifest', label: 'Payload Manifest', index: '03' },
    { id: 'eclss', label: 'Life Support ECLSS', index: '04' },
    { id: 'contingency', label: 'Timeline & Margins', index: '05' },
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
      {/* Top Header / Flight Tape */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          borderBottom: '1px solid var(--hmi-border)',
          paddingBottom: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link
            href="/"
            style={{
              color: 'var(--hmi-text-dim)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
            }}
          >
            ← MISSION CONTROL
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
            OUTPOST ZERO // MISSION PLANNER WIZARD
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* Quick Start 30-sol preset button */}
          <button
            type="button"
            onClick={handleQuickStart}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--caution)',
              color: 'var(--caution)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              fontWeight: 700,
              cursor: 'pointer',
              borderRadius: 'var(--r-1)',
            }}
            title="Launch 30-sol Martian surface game on coupled physics engine"
          >
            ⚡ QUICK START (30 SOLS)
          </button>

          {/* Theme Switcher: ISA-101 Day vs Basalt Night */}
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
              borderRadius: 'var(--r-1)',
            }}
          >
            {hmiTheme === 'night' ? '☀ HMI DAY' : '☾ BASALT NIGHT'}
          </button>

          {/* Audio alarm mute */}
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
              borderRadius: 'var(--r-1)',
            }}
          >
            {audioMuted ? 'MUTED' : 'AUDIO ON'}
          </button>

          {/* Registry Browser Link */}
          <Link
            href="/sources"
            style={{
              padding: 'var(--space-1) var(--space-2)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              borderRadius: 'var(--r-1)',
            }}
          >
            CONSTANTS REGISTRY
          </Link>
        </div>
      </header>

      {/* Stepper Navigation Bar */}
      <nav
        aria-label="Wizard Steps"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--hmi-border)',
          paddingBottom: 'var(--space-2)',
        }}
      >
        {steps.map((s) => {
          const isActive = activeStep === s.id;
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => setActiveStep(s.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: isActive ? 'var(--hmi-surface-elevated)' : 'transparent',
                border: isActive ? '2px solid var(--ember)' : '1px solid var(--hmi-border)',
                borderRadius: 'var(--r-1)',
                cursor: 'pointer',
                textAlign: 'left',
                color: 'var(--hmi-text)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-caption)',
                  color: isActive ? 'var(--ember)' : 'var(--hmi-text-dim)',
                  fontWeight: 700,
                }}
              >
                {s.index}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 'var(--fs-body)',
                  fontWeight: isActive ? 700 : 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {s.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Active Wizard Step Content */}
      <main style={{ flex: 1 }}>
        {activeStep === 'crew' && <CrewRosterPlanner />}
        {activeStep === 'vehicle' && <VehicleSelector />}
        {activeStep === 'manifest' && <ManifestStowageView />}
        {activeStep === 'eclss' && <LifeSupportArchitecture />}
        {activeStep === 'contingency' && <ContingencyPolicyPlanner />}
      </main>

      {/* Bottom Launch & Stepper Control Footer */}
      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          borderTop: '1px solid var(--hmi-border)',
          paddingTop: 'var(--space-3)',
          marginTop: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {activeStep !== 'crew' && (
            <button
              type="button"
              onClick={() => {
                const idx = steps.findIndex((s) => s.id === activeStep);
                if (idx > 0) setActiveStep(steps[idx - 1].id);
              }}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: 'var(--hmi-surface)',
                border: '1px solid var(--hmi-border)',
                color: 'var(--hmi-text)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                cursor: 'pointer',
                borderRadius: 'var(--r-1)',
              }}
            >
              ← PREVIOUS STEP
            </button>
          )}

          {activeStep !== 'contingency' && (
            <button
              type="button"
              onClick={() => {
                const idx = steps.findIndex((s) => s.id === activeStep);
                if (idx < steps.length - 1) setActiveStep(steps[idx + 1].id);
              }}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: 'var(--hmi-surface)',
                border: '1px solid var(--hmi-border)',
                color: 'var(--hmi-text)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                cursor: 'pointer',
                borderRadius: 'var(--r-1)',
              }}
            >
              NEXT STEP →
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleLaunch}
          style={{
            padding: 'var(--space-3) var(--space-8)',
            backgroundColor: 'var(--sage)',
            color: 'var(--color-basalt)',
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-lead)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            border: 'none',
            borderRadius: 'var(--r-1)',
          }}
        >
          🚀 LAUNCH MISSION TELEMETRY
        </button>
      </footer>
    </div>
  );
}
