'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '../../store/game';
import { MonteCarloChart } from '../../components/report/MonteCarloChart';
import { BreakEvenChart } from '../../components/report/BreakEvenChart';

export default function ReportPage() {
  const { coupledOutput, coupledConfig, startMission, hmiTheme, toggleTheme } = useGameStore();
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [aiMentorText, setAiMentorText] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);

  // If no output loaded yet, provide a quick launch trigger
  if (!coupledOutput) {
    return (
      <div
        style={{
          maxWidth: '800px',
          margin: '80px auto',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--hmi-surface)',
          border: '1px solid var(--hmi-border)',
          borderRadius: 'var(--r-1)',
        }}
      >
        <p style={{ color: 'var(--hmi-text-dim)', marginBottom: 'var(--space-4)' }}>
          NO ACTIVE MISSION SIMULATION TELEMETRY IN BUFFER.
        </p>
        <Link
          href="/pack"
          style={{
            padding: 'var(--space-2) var(--space-4)',
            backgroundColor: 'var(--sage)',
            color: 'var(--color-basalt)',
            textDecoration: 'none',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            borderRadius: 'var(--r-1)',
          }}
        >
          OPEN MISSION PLANNER →
        </Link>
      </div>
    );
  }

  const isSuccess = coupledOutput.success;
  const crew = coupledConfig.crew;
  const lastStep = coupledOutput.dailyResults[coupledOutput.dailyResults.length - 1];

  // Root cause attribution
  let failureAttribution = 'None: Full mission envelope achieved within required consumable, habitability, and reliability margins.';
  if (!isSuccess) {
    if (coupledOutput.bindingConstraint !== 'none') {
      failureAttribution = `Constraint violation: Sizing failed on vehicle ${coupledOutput.bindingConstraint.toUpperCase()}.`;
    } else if (lastStep && lastStep.isCrewLost) {
      failureAttribution = `Life support depletion: ${lastStep.failureReason || 'Subsystem starvation or acute atmospheric toxicity'}.`;
    } else {
      failureAttribution = 'Degraded flight envelope: consumable reserves fell below minimum critical safety floor.';
    }
  }

  const handleCopyHash = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/pack#seed=${coupledConfig.seed}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyStatus('SEEDED CHALLENGE LINK COPIED');
      setTimeout(() => setCopyStatus(''), 3000);
    });
  };

  const handleQueryMentor = async () => {
    setIsLoadingAi(true);
    try {
      const response = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engineSummary: coupledOutput.summary,
          bindingConstraint: coupledOutput.bindingConstraint,
          success: coupledOutput.success,
          totalSparesUsed: coupledOutput.totalSparesUsed,
          crewSize: crew.length,
          totalDays: coupledOutput.totalDays,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiMentorText(data.explanation || data.reply || 'Mission telemetry verified.');
      } else {
        setAiMentorText('Gemini Mentor is offline. Technical evaluation confirmed by local engine.');
      }
    } catch {
      setAiMentorText('Gemini Mentor explanation unavailable. Engine telemetry authoritative.');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--space-4)',
        boxSizing: 'border-box',
        minHeight: '100vh',
        backgroundColor: 'var(--hmi-bg)',
        color: 'var(--hmi-text)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--hmi-border)',
          paddingBottom: 'var(--space-3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Link
              href="/mission"
              style={{
                color: 'var(--hmi-text-dim)',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
              }}
            >
              ← RETURN TO MISSION
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
              POST-MISSION REVIEW & RELIABILITY REPORT
            </span>
          </div>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--hmi-text-dim)',
              marginTop: 'var(--space-quarter)',
            }}
          >
            Mission Seed #{coupledConfig.seed} // {crew.length} Crew × {coupledOutput.totalDays} Days Lifecycle
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={handleCopyHash}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            {copyStatus || 'SHARE SEEDED CHALLENGE'}
          </button>

          <Link
            href="/pack"
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--sage)',
              color: 'var(--color-basalt)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              fontWeight: 700,
              borderRadius: 'var(--r-0)',
            }}
          >
            CONFIGURE NEW FLIGHT →
          </Link>
        </div>
      </header>

      {/* Primary Mission Outcome Block */}
      <section
        style={{
          backgroundColor: 'var(--hmi-surface)',
          border: `2px solid ${isSuccess ? 'var(--sage)' : 'var(--alarm-p1)'}`,
          borderRadius: 'var(--r-1)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-giant)',
                fontWeight: 700,
                color: isSuccess ? 'var(--sage)' : 'var(--alarm-p1)',
                textTransform: 'uppercase',
              }}
            >
              {isSuccess ? 'MISSION NOMINAL // RETURN ACHIEVED' : 'MISSION CRITICAL // DEGRADED RETURN'}
            </span>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-body)',
                color: 'var(--hmi-text)',
                marginTop: 'var(--space-1)',
              }}
            >
              {coupledOutput.summary}
            </span>
          </div>

          <div
            style={{
              textAlign: 'right',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              color: 'var(--hmi-text-dim)',
            }}
          >
            <div>Total Spares Consumed: <strong style={{ color: 'var(--hmi-text)' }}>{coupledOutput.totalSparesUsed} ORUs</strong></div>
            <div>Net Habitable Volume: <strong style={{ color: 'var(--hmi-text)' }}>{coupledOutput.nhvPerPersonM3.toFixed(1)} m³/person</strong></div>
          </div>
        </div>

        {/* Root Cause Post-Mortem Box */}
        <div
          style={{
            padding: 'var(--space-3)',
            backgroundColor: isSuccess ? 'var(--hmi-surface-elevated)' : 'var(--alarm-p1-bg)',
            border: `1px solid ${isSuccess ? 'var(--hmi-border)' : 'var(--alarm-p1)'}`,
            borderRadius: 'var(--r-0)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
          }}
        >
          <strong style={{ color: isSuccess ? 'var(--sage)' : 'var(--alarm-p1)' }}>
            ROOT-CAUSE FAILURE ATTRIBUTION:
          </strong>{' '}
          <span style={{ color: 'var(--hmi-text)' }}>{failureAttribution}</span>
        </div>
      </section>

      {/* Gemini Domain Mentor Explanation Block (Rule 3) */}
      <section
        style={{
          backgroundColor: 'var(--hmi-surface)',
          border: '1px solid var(--hmi-border)',
          borderRadius: 'var(--r-1)',
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-lead)', fontWeight: 700, color: 'var(--ember)' }}>
              GEMINI DOMAIN EXPERT MENTOR
            </span>
            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
              Explains coupled engine outputs strictly without mutating values (Rule 3)
            </span>
          </div>

          <button
            type="button"
            onClick={handleQueryMentor}
            disabled={isLoadingAi}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--ember)',
              color: 'var(--color-basalt)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              fontWeight: 700,
              cursor: isLoadingAi ? 'wait' : 'pointer',
              border: 'none',
              borderRadius: 'var(--r-0)',
            }}
          >
            {isLoadingAi ? 'ANALYZING ENGINE OUTPUT...' : 'REQUEST EXPERT DEBRIEF'}
          </button>
        </div>

        {aiMentorText && (
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              borderRadius: 'var(--r-0)',
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--fs-body)',
              lineHeight: 1.6,
              color: 'var(--hmi-text)',
            }}
          >
            {aiMentorText}
          </div>
        )}
      </section>

      {/* Monte Carlo Distribution Histogram (N=1,000) */}
      <section aria-label="Monte Carlo Analysis">
        <MonteCarloChart config={coupledConfig} />
      </section>

      {/* Break-Even Trade-Off Curves Chart */}
      <section aria-label="Break-Even Trade-Off">
        <BreakEvenChart crew={crew} />
      </section>
    </div>
  );
}
