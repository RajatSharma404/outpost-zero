'use client';

import React, { memo } from 'react';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

interface SolClockProps {
  currentSol: number;
  maxSols: number;
  speed: 0 | 1 | 4 | 16;
  isPausedForEvent: boolean;
  onSetSpeed: (speed: 0 | 1 | 4 | 16) => void;
  onSkipToEvent: () => void;
}

const SolClockComponent: React.FC<SolClockProps> = ({
  currentSol,
  maxSols,
  speed,
  isPausedForEvent,
  onSetSpeed,
  onSkipToEvent,
}) => {
  const percentage = Math.min(100, Math.max(0, (currentSol / maxSols) * 100));

  return (
    <div
      style={{
        backgroundColor: 'var(--basalt-2)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
      }}
    >
      {/* Sol Counter & Mission Progress Rule */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: '1 1 300px' }}>
        <div>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              color: 'var(--ink-dim)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              display: 'block',
            }}
          >
            MISSION ELAPSED TIME
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
            <span
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-numeral)',
                fontWeight: 700,
                color: 'var(--ember)',
                lineHeight: 1,
              }}
            >
              SOL {String(currentSol).padStart(3, '0')}
            </span>
            <span
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-body)',
                color: 'var(--ink-dim)',
              }}
            >
              / {maxSols}
            </span>
          </div>
        </div>

        {/* Thin Mission Progress Bar */}
        <div style={{ flex: 1, minWidth: '100px' }}>
          <div
            style={{
              height: '6px',
              backgroundColor: 'var(--basalt)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--r-0)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: 'var(--ember)',
                transition: 'width 0.1s linear',
              }}
            />
          </div>
          <span
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              color: 'var(--ink-dim)',
              display: 'block',
              marginTop: '2px',
              textAlign: 'right',
            }}
          >
            {Math.round(percentage)}% COMPLETE
          </span>
        </div>
      </div>

      {/* Speed Controls (Radio Group Semantics + Keyboard Hint) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
        <div
          role="radiogroup"
          aria-label="Simulation warp speed"
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
        >
          <button
            type="button"
            role="radio"
            aria-checked={speed === 0}
            onClick={() => onSetSpeed(0)}
            title="Pause simulation [Space]"
            aria-label="Pause simulation (0x speed)"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              padding: 'var(--space-1) var(--space-2)',
              border: `1px solid ${speed === 0 ? 'var(--ember)' : 'var(--rule)'}`,
              backgroundColor: speed === 0 ? 'var(--ember)' : 'transparent',
              color: speed === 0 ? 'var(--basalt)' : 'var(--ink)',
              fontWeight: speed === 0 ? 700 : 500,
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Icon name="pause" size={14} /> 0x
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={speed === 1}
            onClick={() => onSetSpeed(1)}
            title="Standard speed (1 Sol / sec) [1]"
            aria-label="1x standard speed"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              padding: 'var(--space-1) var(--space-2)',
              border: `1px solid ${speed === 1 ? 'var(--ember)' : 'var(--rule)'}`,
              backgroundColor: speed === 1 ? 'var(--ember)' : 'transparent',
              color: speed === 1 ? 'var(--basalt)' : 'var(--ink)',
              fontWeight: speed === 1 ? 700 : 500,
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            1x
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={speed === 4}
            onClick={() => onSetSpeed(4)}
            title="Fast forward (4 Sols / sec) [2]"
            aria-label="4x fast speed"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              padding: 'var(--space-1) var(--space-2)',
              border: `1px solid ${speed === 4 ? 'var(--ember)' : 'var(--rule)'}`,
              backgroundColor: speed === 4 ? 'var(--ember)' : 'transparent',
              color: speed === 4 ? 'var(--basalt)' : 'var(--ink)',
              fontWeight: speed === 4 ? 700 : 500,
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            4x
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={speed === 16}
            onClick={() => onSetSpeed(16)}
            title="Ultra speed (16 Sols / sec) [3]"
            aria-label="16x warp speed"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              padding: 'var(--space-1) var(--space-2)',
              border: `1px solid ${speed === 16 ? 'var(--ember)' : 'var(--rule)'}`,
              backgroundColor: speed === 16 ? 'var(--ember)' : 'transparent',
              color: speed === 16 ? 'var(--basalt)' : 'var(--ink)',
              fontWeight: speed === 16 ? 700 : 500,
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            16x
          </button>

          <Button
            variant="secondary"
            size="sm"
            disabled={isPausedForEvent}
            onClick={onSkipToEvent}
            title="Skip to next event or incident [E]"
            aria-label="Skip to next event"
          >
            <Icon name="fast_forward" size={14} /> Next Event
          </Button>
        </div>

        {/* Keyboard shortcut hint banner */}
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
            color: 'var(--ink-dim)',
            letterSpacing: '0.04em',
          }}
        >
          KEYS: [SPACE] PAUSE | [1] 1X | [2] 4X | [3] 16X | [E] EVENT
        </div>
      </div>
    </div>
  );
};

export const SolClock = memo(SolClockComponent);
