'use client';

import React from 'react';
import type { ScoreBreakdown } from '../../lib/sim/scoring';

interface ScoreBlockProps {
  score: ScoreBreakdown;
  maxSols: number;
  endSol: number;
}

export const ScoreBlock: React.FC<ScoreBlockProps> = ({ score, maxSols, endSol }) => {
  const gradeColors: Record<string, string> = {
    S: 'var(--ember)',
    A: 'var(--sage)',
    B: 'var(--sage)',
    C: 'var(--caution)',
    F: 'var(--alarm)',
  };

  const gradeColor = gradeColors[score.grade] || 'var(--ink)';
  const isSurviving = endSol >= maxSols;

  return (
    <div
      style={{
        backgroundColor: 'var(--basalt-2)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-label)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ink-dim)',
            fontWeight: 700,
          }}
        >
          NASA FLIGHT CERTIFICATION // EVALUATION
        </span>
        <span
          className="tabular-nums"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)' }}
        >
          {endSol} / {maxSols} SOLS
        </span>
      </div>

      {/* Grade & Total Points with Sub-label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div
          style={{
            width: '90px',
            height: '90px',
            backgroundColor: 'var(--basalt)',
            border: `2px solid ${gradeColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            borderRadius: 'var(--r-1)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-giant)',
              fontWeight: 700,
              color: gradeColor,
              lineHeight: 1,
            }}
          >
            {score.grade}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              fontWeight: 700,
              color: isSurviving ? 'var(--sage)' : 'var(--alarm)',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            {isSurviving ? 'SURVIVED' : `SOL ${endSol}`}
          </span>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-numeral)',
                fontWeight: 700,
                color: 'var(--ink)',
                lineHeight: 1,
              }}
            >
              {score.totalScore}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-body)',
                color: 'var(--ink-dim)',
              }}
            >
              / 100 POINTS
            </span>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-lead)',
              color: isSurviving ? 'var(--sage)' : 'var(--alarm)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              margin: '2px 0',
            }}
          >
            {isSurviving ? 'MISSION SURVIVED TO COMPLETION' : `MISSION TERMINATED ON SOL ${endSol}`}
          </div>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--ink-dim)',
              margin: '2px 0 0 0',
              lineHeight: 1.3,
            }}
          >
            {score.summary}
          </p>
        </div>
      </div>

      {/* 4 Pillars Breakdown as Aligned Numeric Rows with Tabular Numerals */}
      <div
        className="tabular-nums"
        style={{
          borderTop: '1px solid var(--rule)',
          paddingTop: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--ink)' }}>
            CREW HEALTH &amp; PHYSIOLOGY{' '}
            <span style={{ fontSize: 'var(--fs-detail)', color: 'var(--ink-dim)' }}>
              {score.healthScore >= 20 ? '[NOMINAL]' : score.healthScore >= 12 ? '[DEGRADED]' : '[CRITICAL]'}
            </span>
          </span>
          <span
            style={{
              fontWeight: 600,
              color: score.healthScore >= 20 ? 'var(--sage)' : score.healthScore >= 12 ? 'var(--caution)' : 'var(--alarm)',
            }}
          >
            {score.healthScore.toString().padStart(2, ' ')} / 25 PTS
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--ink)' }}>
            RADIATION DOSE MARGIN{' '}
            <span style={{ fontSize: 'var(--fs-detail)', color: 'var(--ink-dim)' }}>
              {score.doseMarginScore >= 20 ? '[NOMINAL]' : score.doseMarginScore >= 12 ? '[ELEVATED]' : '[LETHAL]'}
            </span>
          </span>
          <span
            style={{
              fontWeight: 600,
              color: score.doseMarginScore >= 20 ? 'var(--sage)' : score.doseMarginScore >= 12 ? 'var(--caution)' : 'var(--alarm)',
            }}
          >
            {score.doseMarginScore.toString().padStart(2, ' ')} / 25 PTS
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--ink)' }}>
            CONSUMABLES RESERVES BUFFER{' '}
            <span style={{ fontSize: 'var(--fs-detail)', color: 'var(--ink-dim)' }}>
              {score.reservesScore >= 20 ? '[SURPLUS]' : score.reservesScore >= 12 ? '[TIGHT]' : '[DEPLETED]'}
            </span>
          </span>
          <span
            style={{
              fontWeight: 600,
              color: score.reservesScore >= 20 ? 'var(--sage)' : score.reservesScore >= 12 ? 'var(--caution)' : 'var(--alarm)',
            }}
          >
            {score.reservesScore.toString().padStart(2, ' ')} / 25 PTS
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--ink)' }}>
            MASS &amp; PAYLOAD EFFICIENCY{' '}
            <span style={{ fontSize: 'var(--fs-detail)', color: 'var(--ink-dim)' }}>
              {score.massEfficiencyScore >= 22 ? '[OPTIMAL]' : score.massEfficiencyScore >= 18 ? '[STANDARD]' : '[PENALIZED]'}
            </span>
          </span>
          <span
            style={{
              fontWeight: 600,
              color: score.massEfficiencyScore >= 20 ? 'var(--sage)' : 'var(--caution)',
            }}
          >
            {score.massEfficiencyScore.toString().padStart(2, ' ')} / 25 PTS
          </span>
        </div>

        {score.survivalBonus < 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--alarm)' }}>
              EMERGENCY RESUPPLY PENALTY{' '}
              <span style={{ fontSize: 'var(--fs-detail)', color: 'var(--alarm)' }}>
                [EXTERNAL ASSIST]
              </span>
            </span>
            <span style={{ fontWeight: 600, color: 'var(--alarm)' }}>
              {score.survivalBonus} PTS
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
