'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface MentorNoteProps {
  templatedText: string;
  recommendation: string;
  aiExplanation?: string;
  isLoadingAi?: boolean;
  onRequestAi?: () => void;
}

export const MentorNote: React.FC<MentorNoteProps> = ({
  templatedText,
  recommendation,
  aiExplanation,
  isLoadingAi = false,
  onRequestAi,
}) => {
  const [showAi, setShowAi] = useState(false);

  const activeText = showAi && aiExplanation ? aiExplanation : templatedText;

  return (
    <div
      style={{
        backgroundColor: 'var(--basalt-2)',
        border: '1px solid var(--ember)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-2)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ember)',
              fontWeight: 700,
            }}
          >
            MISSION CONTROL // DEBRIEFING & SYSTEMS LESSON
          </span>
          <h3
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-lead)',
              margin: '2px 0 0 0',
              fontWeight: 700,
              color: 'var(--ink)',
            }}
          >
            Flight Director Analysis
          </h3>
        </div>

        {/* View Toggle (Template vs Gemini) */}
        {aiExplanation ? (
          <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
            <Button
              variant={!showAi ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowAi(false)}
            >
              Flight Director Log
            </Button>
            <Button
              variant={showAi ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setShowAi(true)}
            >
              AI Mentor (Gemini)
            </Button>
          </div>
        ) : onRequestAi ? (
          <Button
            variant="secondary"
            size="sm"
            disabled={isLoadingAi}
            onClick={onRequestAi}
          >
            {isLoadingAi ? 'Consulting Mission Control...' : 'Ask AI Mentor'}
          </Button>
        ) : null}
      </div>

      {/* Debrief Text (Serif for narrative readability) */}
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'var(--fs-body)',
          lineHeight: 1.6,
          color: 'var(--ink)',
          margin: 0,
        }}
      >
        {activeText}
      </p>

      {/* Concrete Next Attempt Recommendation */}
      <div
        style={{
          backgroundColor: 'var(--basalt)',
          borderLeft: '3px solid var(--ember)',
          padding: 'var(--space-3)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
          lineHeight: 1.4,
          color: 'var(--ink-dim)',
        }}
      >
        <strong style={{ color: 'var(--ember)', display: 'block', marginBottom: '2px' }}>
          RECOMMENDATION FOR NEXT FLIGHT ATTEMPT:
        </strong>
        {recommendation}
      </div>
    </div>
  );
};
