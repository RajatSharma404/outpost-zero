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
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)' }}>
          {endSol} / {maxSols} SOLS
        </span>
      </div>

      {/* Grade & Total Points */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'var(--basalt)',
            border: `2px solid ${gradeColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
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
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span
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

      {/* 4 Pillars Breakdown */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--space-2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
        }}
      >
        <div style={{ backgroundColor: 'var(--basalt)', padding: 'var(--space-2)', border: '1px solid var(--rule)' }}>
          <span style={{ color: 'var(--ink-dim)', display: 'block' }}>CREW HEALTH</span>
          <strong style={{ color: 'var(--ink)' }}>{score.healthScore} / 25 pts</strong>
        </div>

        <div style={{ backgroundColor: 'var(--basalt)', padding: 'var(--space-2)', border: '1px solid var(--rule)' }}>
          <span style={{ color: 'var(--ink-dim)', display: 'block' }}>RADIATION MARGIN</span>
          <strong style={{ color: 'var(--ink)' }}>{score.doseMarginScore} / 25 pts</strong>
        </div>

        <div style={{ backgroundColor: 'var(--basalt)', padding: 'var(--space-2)', border: '1px solid var(--rule)' }}>
          <span style={{ color: 'var(--ink-dim)', display: 'block' }}>RESERVES SURPLUS</span>
          <strong style={{ color: 'var(--ink)' }}>{score.reservesScore} / 25 pts</strong>
        </div>

        <div style={{ backgroundColor: 'var(--basalt)', padding: 'var(--space-2)', border: '1px solid var(--rule)' }}>
          <span style={{ color: 'var(--ink-dim)', display: 'block' }}>MASS EFFICIENCY</span>
          <strong style={{ color: 'var(--ink)' }}>{score.massEfficiencyScore} / 25 pts</strong>
        </div>
      </div>
    </div>
  );
};
