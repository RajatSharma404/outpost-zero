'use client';

import React from 'react';
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

export const SolClock: React.FC<SolClockProps> = ({
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
              height: '4px',
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
                transition: 'width 0.2s ease',
              }}
            />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
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

      {/* Speed Controls (Pause, 1x, 4x, 16x, Skip) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
        <Button
          variant={speed === 0 ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onSetSpeed(0)}
          title="Pause simulation (Spacebar)"
          aria-label="Pause simulation"
        >
          <Icon name="pause" size={14} /> 0x
        </Button>
        <Button
          variant={speed === 1 ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onSetSpeed(1)}
          title="Standard speed (1 Sol / sec)"
          aria-label="1x speed"
        >
          1x
        </Button>
        <Button
          variant={speed === 4 ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onSetSpeed(4)}
          title="Fast forward (4 Sols / sec)"
          aria-label="4x speed"
        >
          4x
        </Button>
        <Button
          variant={speed === 16 ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onSetSpeed(16)}
          title="Ultra speed (16 Sols / sec)"
          aria-label="16x speed"
        >
          16x
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={isPausedForEvent}
          onClick={onSkipToEvent}
          title="Fast forward until next event incident or mission completion"
          aria-label="Skip to next event"
        >
          <Icon name="fast_forward" size={14} /> Next Event
        </Button>
      </div>
    </div>
  );
};
