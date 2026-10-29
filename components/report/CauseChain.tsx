'use client';

import React, { useState, useEffect } from 'react';
import type { CauseChainNode } from '../../lib/sim/report';
import { getItem } from '../../lib/data';
import { Tag } from '../ui/Tag';
import { Icon, type IconName } from '../ui/Icon';
import { Button } from '../ui/Button';

interface CauseChainProps {
  nodes: CauseChainNode[];
  outcome: 'success' | 'failure';
}

export const CauseChain: React.FC<CauseChainProps> = ({ nodes, outcome }) => {
  const [revealedCount, setRevealedCount] = useState<number>(nodes.length + 1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Playback timer reveals nodes one-by-one
  useEffect(() => {
    if (!isPlaying) return;

    if (revealedCount >= nodes.length + 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setRevealedCount((c) => c + 1);
    }, 450);

    return () => clearTimeout(timer);
  }, [isPlaying, revealedCount, nodes.length]);

  const handleStartPlayback = () => {
    setRevealedCount(1);
    setIsPlaying(true);
  };

  const categoryIconMap: Record<string, IconName> = {
    power: 'battery',
    lifesupport: 'recycler',
    radiation: 'shield',
    morale: 'comfort',
    environmental: 'solar',
    decision: 'info',
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--basalt-2)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header with Title and Playback Control */}
      <div
        style={{
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
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
              color: 'var(--oxide)',
              fontWeight: 700,
            }}
          >
            ROOT CAUSE INVESTIGATION // CHRONOLOGICAL CAUSAL SEQUENCE
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
            Causal Sequence of Critical Events
          </h3>
        </div>

        {nodes.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStartPlayback}
            disabled={isPlaying}
            title="Step through mission failure timeline in sequential playback"
          >
            <Icon name="play" size={14} /> {isPlaying ? 'REPLAYING SEQUENCE...' : 'PLAY BACK SEQUENCE'}
          </Button>
        )}
      </div>

      {nodes.length === 0 ? (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)' }}>
          No critical anomalies detected during mission run.
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: 'var(--space-4)' }}>
          {/* Vertical connecting hairline rule */}
          <div
            style={{
              position: 'absolute',
              left: '11px',
              top: '12px',
              bottom: '12px',
              width: '2px',
              backgroundColor: 'var(--rule)',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {nodes.map((node, idx) => {
              const isTerminal = idx === nodes.length - 1;
              const relatedItem = node.relatedItemId ? getItem(node.relatedItemId) : undefined;
              const iconName = categoryIconMap[node.category] || 'cube';
              const isVisible = idx < revealedCount;

              return (
                <div
                  key={idx}
                  className={`cause-chain-node ${isVisible ? 'node-visible' : 'node-hidden'}`}
                  style={{
                    position: 'relative',
                    display: isVisible ? 'flex' : 'none',
                    gap: 'var(--space-3)',
                    transition: 'opacity 220ms ease, transform 220ms ease',
                  }}
                >
                  {/* Step Marker Dot */}
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--r-0)',
                      backgroundColor: isTerminal
                        ? outcome === 'success'
                          ? 'var(--sage)'
                          : 'var(--alarm)'
                        : 'var(--basalt)',
                      border: `2px solid ${
                        isTerminal
                          ? outcome === 'success'
                            ? 'var(--sage)'
                            : 'var(--alarm)'
                          : 'var(--ember)'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      zIndex: 2,
                    }}
                  >
                    <Icon
                      name={iconName}
                      size={14}
                      style={{
                        color: isTerminal ? 'var(--basalt)' : 'var(--ember)',
                      }}
                    />
                  </div>

                  {/* Content Box */}
                  <div
                    style={{
                      backgroundColor: 'var(--basalt)',
                      border: `1px solid ${
                        isTerminal
                          ? outcome === 'success'
                            ? 'var(--sage)'
                            : 'var(--alarm)'
                          : 'var(--rule)'
                      }`,
                      borderLeft: `4px solid ${
                        isTerminal
                          ? outcome === 'success'
                            ? 'var(--sage)'
                            : 'var(--alarm)'
                          : 'var(--rule)'
                      }`,
                      borderRadius: 'var(--r-1)',
                      padding: 'var(--space-3)',
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        flexWrap: 'wrap',
                        gap: 'var(--space-2)',
                        marginBottom: '4px',
                      }}
                    >
                      <span
                        className="tabular-nums"
                        style={{
                          fontFamily: 'var(--font-condensed)',
                          fontSize: 'var(--fs-body)',
                          color: isTerminal && outcome === 'failure' ? 'var(--alarm)' : 'var(--ember)',
                          fontWeight: 700,
                        }}
                      >
                        SOL {String(node.sol).padStart(3, '0')}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                        <Tag
                          label={node.category.toUpperCase()}
                          variant={node.category === 'radiation' || (isTerminal && outcome === 'failure') ? 'alarm' : 'neutral'}
                          size="sm"
                        />
                      </div>
                    </div>

                    <strong
                      style={{
                        fontFamily: 'var(--font-condensed)',
                        fontSize: 'var(--fs-lead)',
                        fontWeight: 600,
                        color: 'var(--ink)',
                        display: 'block',
                        lineHeight: 1.3,
                        marginBottom: '4px',
                      }}
                    >
                      {node.headline}
                    </strong>

                    <p
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 'var(--fs-label)',
                        color: 'var(--ink-dim)',
                        lineHeight: 1.4,
                        margin: 0,
                      }}
                    >
                      {node.detail}
                    </p>

                    {relatedItem && (
                      <div
                        style={{
                          marginTop: 'var(--space-2)',
                          paddingTop: 'var(--space-1)',
                          borderTop: '1px dotted var(--rule)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--fs-detail)',
                          color: 'var(--ember)',
                        }}
                      >
                        Hardware Involved: <strong>{relatedItem.name}</strong> ({relatedItem.tradeoff})
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Launch-decision node (Sol 000) visually anchored at the bottom */}
            {revealedCount > nodes.length && (
              <div
                className="cause-chain-node node-visible"
                style={{
                  position: 'relative',
                  display: 'flex',
                  gap: 'var(--space-3)',
                  transition: 'opacity 220ms ease, transform 220ms ease',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: 'var(--r-0)',
                    backgroundColor: 'var(--basalt)',
                    border: '2px solid var(--oxide)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 2,
                  }}
                >
                  <Icon name="cube" size={14} style={{ color: 'var(--oxide)' }} />
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--basalt)',
                    border: '1px solid var(--rule)',
                    borderLeft: '4px solid var(--oxide)',
                    borderRadius: 'var(--r-1)',
                    padding: 'var(--space-3)',
                    flex: 1,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span
                      className="tabular-nums"
                      style={{
                        fontFamily: 'var(--font-condensed)',
                        fontSize: 'var(--fs-body)',
                        color: 'var(--oxide)',
                        fontWeight: 700,
                      }}
                    >
                      SOL 000
                    </span>
                    <Tag label="DECISION" variant="active" size="sm" />
                  </div>
                  <strong
                    style={{
                      fontFamily: 'var(--font-condensed)',
                      fontSize: 'var(--fs-lead)',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      display: 'block',
                      lineHeight: 1.3,
                      marginBottom: '4px',
                    }}
                  >
                    Payload Manifest Committed at Earth Launch
                  </strong>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--fs-label)',
                      color: 'var(--ink-dim)',
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    The systemic boundary constraints, power redundancy, and consumable buffers decided in Section 01 predetermined the resilience profile of this mission.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .node-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .node-hidden {
          opacity: 0;
          transform: translateY(6px);
        }
        @media (prefers-reduced-motion: reduce) {
          .cause-chain-node {
            transition: none !important;
            transform: none !important;
            opacity: 1 !important;
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
