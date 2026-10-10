'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/game';
import { buildMissionReport } from '../../lib/sim/report';
import { encodeChallenge } from '../../lib/share';
import { Timeline } from '../../components/report/Timeline';
import { CauseChain } from '../../components/report/CauseChain';
import { MeterSparkline } from '../../components/report/MeterSparkline';
import { ScoreBlock } from '../../components/report/ScoreBlock';
import { MentorNote } from '../../components/report/MentorNote';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';

export default function ReportPage() {
  const router = useRouter();
  const { simulationState, loadout, setSeed, startMission } = useGameStore();
  const [copyStatus, setCopyStatus] = useState<string>('');
  const [aiText, setAiText] = useState<string | undefined>(undefined);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // If directly navigated without active simulation state, fallback
  if (!simulationState) {
    return (
      <div
        style={{
          maxWidth: '800px',
          margin: '60px auto',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          padding: 'var(--space-4)',
        }}
      >
        <p style={{ color: 'var(--ink-dim)', marginBottom: 'var(--space-4)' }}>
          NO ACTIVE MISSION REPORT IN LOCAL TELEMETRY BUFFER.
        </p>
        <Link href="/pack" style={{ textDecoration: 'none' }}>
          <Button variant="primary" size="md">
            Go to Pack Screen &rarr;
          </Button>
        </Link>
      </div>
    );
  }

  const report = useMemo(() => {
    return buildMissionReport(simulationState);
  }, [simulationState]);

  const handleCopyChallenge = () => {
    const encoded = encodeChallenge(loadout);
    const url = `${window.location.origin}/pack#${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopyStatus('CHALLENGE LINK COPIED TO CLIPBOARD');
      setTimeout(() => setCopyStatus(''), 3000);
    });
  };

  const handleRetrySameSeed = () => {
    router.push('/pack');
  };

  const handleRetryNewSeed = () => {
    const nextSeed = Math.floor(Math.random() * 90000) + 1000;
    setSeed(nextSeed);
    startMission();
    router.push('/mission');
  };

  const handleFetchAiMentor = async () => {
    setIsLoadingAi(true);
    try {
      const payload = {
        outcome: report.outcome,
        endSol: report.endSol,
        loadoutIds: loadout.itemIds,
        topCauses: report.topCauses.map((c) => `${c.source} (${c.totalImpact} on ${c.meter})`),
        eventsFaced: simulationState.eventHistory.map((h) => h.eventId),
        keyNumbers: {
          finalPowerKwh: Math.round(simulationState.meters.powerStoredKwh),
          finalWaterKg: Math.round(simulationState.meters.waterKg),
          finalO2Kg: Math.round(simulationState.meters.o2Kg),
          finalFoodKg: Math.round(simulationState.meters.foodKg),
          finalDoseMsv: Number(simulationState.meters.doseMsvPerCrew.toFixed(1)),
          finalHealth: simulationState.crew.health,
          finalMorale: Math.round(simulationState.meters.morale),
        },
      };

      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setAiText(data.text);
      } else {
        setAiText(report.templatedMentorNote);
      }
    } catch {
      setAiText(report.templatedMentorNote);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const isSuccess = report.outcome === 'success';

  return (
    <div
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--space-4)',
        boxSizing: 'border-box',
      }}
    >
      {/* Flight Control Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              color: isSuccess ? 'var(--sage)' : 'var(--alarm)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            FLIGHT DEBRIEFING // POST-MISSION INVESTIGATION
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-display)',
              margin: '2px 0 0 0',
              fontWeight: 700,
              color: 'var(--ink)',
              lineHeight: 1,
            }}
          >
            MISSION REPORT
          </h1>
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
            Pack Screen
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
            How it Works
          </Link>
          <Link
            href="/sources"
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
            Sources
          </Link>
        </nav>
      </header>

      {/* Outcome Headline Banner */}
      <div
        style={{
          backgroundColor: isSuccess ? 'var(--basalt-2)' : 'var(--fail-bg)',
          border: `2px solid ${isSuccess ? 'var(--sage)' : 'var(--alarm)'}`,
          borderRadius: 'var(--r-1)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-label)',
            color: isSuccess ? 'var(--sage)' : 'var(--alarm)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 700,
            display: 'block',
            marginBottom: '2px',
          }}
        >
          {isSuccess ? 'MISSION STATUS: SUCCESS' : 'MISSION STATUS: TERMINATED'}
        </span>
        <h2
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-lead)',
            margin: '0 0 var(--space-2) 0',
            color: 'var(--ink)',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          {report.headline}
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-body)',
            color: 'var(--ink-dim)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {report.summary}
        </p>
      </div>

      {/* Interactive Sols Timeline */}
      <Timeline state={simulationState} />

      {/* Main 2-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr)',
          gap: 'var(--space-6)',
          alignItems: 'start',
          marginBottom: 'var(--space-6)',
        }}
      >
        {/* Left Column: Cause Chain (Heart of learning loop) & Mentor Note */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <CauseChain nodes={report.causeChain} outcome={report.outcome} />
          <MentorNote
            templatedText={report.templatedMentorNote}
            recommendation={report.recommendation}
            aiExplanation={aiText}
            isLoadingAi={isLoadingAi}
            onRequestAi={handleFetchAiMentor}
          />
        </div>

        {/* Right Column: Score Block & Sparklines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <ScoreBlock
            score={report.score}
            maxSols={report.maxSols}
            endSol={report.endSol}
          />

          {/* Resource Sparklines */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-label)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ink-dim)',
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontWeight: 700,
              }}
            >
              RESOURCE TELEMETRY TRENDS
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-2)' }}>
              <MeterSparkline
                label="Stored Power"
                data={report.sparklines.powerStoredKwh}
                unit="kWh"
                color="var(--ember)"
              />
              <MeterSparkline
                label="Oxygen (O2)"
                data={report.sparklines.o2Kg}
                unit="kg"
                color="var(--sage)"
              />
              <MeterSparkline
                label="Potable Water"
                data={report.sparklines.waterKg}
                unit="kg"
                color="var(--water-accent)"
              />
              <MeterSparkline
                label="Dry Rations"
                data={report.sparklines.foodKg}
                unit="kg"
                color="var(--caution)"
              />
              <MeterSparkline
                label="Radiation Dose"
                data={report.sparklines.doseMsvPerCrew}
                unit="mSv"
                color="var(--alarm)"
                maxBaseline={250}
              />
              <MeterSparkline
                label="Crew Morale"
                data={report.sparklines.morale}
                unit="%"
                color="var(--ember)"
                maxBaseline={100}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div
        style={{
          borderTop: '1px solid var(--rule)',
          paddingTop: 'var(--space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <Button variant="primary" size="md" onClick={handleRetrySameSeed}>
            Try Different Loadout (Keep Seed)
          </Button>
          <Button variant="secondary" size="md" onClick={handleRetryNewSeed}>
            Same Loadout, New Seed
          </Button>
          <Button variant="secondary" size="md" onClick={handleCopyChallenge}>
            <Icon name="cube" size={16} /> Copy Challenge Link
          </Button>
        </div>

        {copyStatus && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--sage)',
              fontWeight: 600,
            }}
          >
            {copyStatus}
          </span>
        )}
      </div>
    </div>
  );
}
