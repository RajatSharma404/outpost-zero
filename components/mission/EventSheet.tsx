'use client';

import React, { useEffect, useRef } from 'react';
import type { SimulationEvent, SimulationState } from '../../lib/sim/types';
import { isChoiceUnlocked } from '../../lib/sim/events';
import { getItem } from '../../lib/data';
import { Button } from '../ui/Button';

interface EventSheetProps {
  event: SimulationEvent;
  state: SimulationState;
  onSelectChoice: (choiceId: string) => void;
}

export const EventSheet: React.FC<EventSheetProps> = ({ event, state, onSelectChoice }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Focus trap & trigger return restoration
  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    // Focus first actionable button or the dialog container
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [tabindex="0"]'
    );
    if (focusable && focusable.length > 0) {
      focusable[0].focus();
    } else {
      dialogRef.current?.focus();
    }

    // Circular Tab/Shift+Tab focus trap
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialogRef.current) return;
      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [tabindex="0"]'
        )
      );

      if (e.key === 'Tab') {
        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl || document.activeElement === dialogRef.current) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus to original triggering node
      if (previouslyFocusedRef.current && typeof previouslyFocusedRef.current.focus === 'function') {
        previouslyFocusedRef.current.focus();
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--basalt-overlay)',
        backdropFilter: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        zIndex: 200,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-dialog-title"
        aria-describedby="event-dialog-narrative"
        tabIndex={-1}
        className="event-sheet-modal"
        style={{
          backgroundColor: 'var(--basalt-2)',
          border: '2px solid var(--ember)',
          borderRadius: 'var(--r-1)',
          maxWidth: '680px',
          width: '100%',
          padding: 'var(--space-6)',
          boxSizing: 'border-box',
          outline: 'none',
          boxShadow: 'none',
        }}
      >
        {/* Paper-like Flight Log Header */}
        <div
          style={{
            borderBottom: '1px solid var(--rule)',
            paddingBottom: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div>
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-label)',
                letterSpacing: '0.15em',
                color: 'var(--oxide)',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              EMERGENCY LOG ENTRY // INCIDENT REPORT
            </span>
            <h2
              id="event-dialog-title"
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-lead)',
                margin: '4px 0 0 0',
                color: 'var(--ink)',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {event.title}
            </h2>
          </div>

          <div
            className="tabular-nums"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--ember)',
              fontWeight: 600,
            }}
          >
            SOL {String(state.sol).padStart(3, '0')} // 08:30 UTC
          </div>
        </div>

        {/* Serif Narrative Prose */}
        <p
          id="event-dialog-narrative"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--fs-body)',
            lineHeight: 1.6,
            color: 'var(--ink)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {event.narrative}
        </p>

        {/* Interactive Engineering Choices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              color: 'var(--ink-dim)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            SELECT DIRECTIVE PROTOCOL:
          </span>

          {event.choices.map((choice, idx) => {
            const unlocked = isChoiceUnlocked(choice, state);
            const reqItem = choice.requires ? getItem(choice.requires) : undefined;
            const reasonId = `disabled-reason-${choice.id}`;

            return (
              <div
                key={choice.id}
                style={{
                  border: `1px solid ${unlocked ? 'var(--rule)' : 'var(--event-border)'}`,
                  borderRadius: 'var(--r-1)',
                  backgroundColor: unlocked ? 'var(--basalt)' : 'var(--event-dark)',
                  padding: 'var(--space-3)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <Button
                    variant={unlocked ? 'secondary' : 'ghost'}
                    size="md"
                    disabled={!unlocked}
                    aria-describedby={!unlocked ? reasonId : undefined}
                    onClick={() => onSelectChoice(choice.id)}
                    style={{
                      textDecoration: unlocked ? 'none' : 'line-through',
                      textAlign: 'left',
                      justifyContent: 'flex-start',
                    }}
                  >
                    <span style={{ color: 'var(--ember)', marginRight: '6px' }}>[{idx + 1}]</span>
                    {choice.label}
                  </Button>

                  {!unlocked && reqItem && (
                    <span
                      id={reasonId}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--fs-detail)',
                        color: 'var(--alarm)',
                        border: '1px dashed var(--alarm)',
                        padding: '2px 6px',
                        textTransform: 'uppercase',
                        marginLeft: 'var(--space-2)',
                        flexShrink: 0,
                      }}
                    >
                      Requires: {reqItem.name} (Not Packed)
                    </span>
                  )}
                </div>

                {/* Lesson & Consequence Preview */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-detail)',
                    color: unlocked ? 'var(--ink-dim)' : 'var(--event-dim)',
                    lineHeight: 1.3,
                    paddingLeft: 'var(--space-2)',
                    borderLeft: `2px solid ${unlocked ? 'var(--rule)' : 'var(--event-border)'}`,
                  }}
                >
                  <strong style={{ color: unlocked ? 'var(--ember)' : 'var(--event-highlight)' }}>Engineering Insight: </strong>
                  {choice.lesson}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .event-sheet-modal {
          animation: modalEntrance 140ms ease-out forwards;
        }

        @keyframes modalEntrance {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .event-sheet-modal {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};
