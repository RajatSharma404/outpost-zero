'use client';

import React from 'react';
import type { CauseChainNode } from '../../lib/sim/report';
import { getItem } from '../../lib/data';
import { Tag } from '../ui/Tag';
import { Icon, type IconName } from '../ui/Icon';

interface CauseChainProps {
  nodes: CauseChainNode[];
  outcome: 'success' | 'failure';
}

export const CauseChain: React.FC<CauseChainProps> = ({ nodes, outcome }) => {
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
      <div
        style={{
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-2)',
          marginBottom: 'var(--space-4)',
        }}
      >
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
          ROOT CAUSE INVESTIGATION // BACKWARDS LEDGER TRACE
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
              width: '1px',
              backgroundColor: 'var(--rule)',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {nodes.map((node, idx) => {
              const isTerminal = idx === nodes.length - 1;
              const relatedItem = node.relatedItemId ? getItem(node.relatedItemId) : undefined;
              const iconName = categoryIconMap[node.category] || 'cube';

              return (
                <div key={idx} style={{ position: 'relative', display: 'flex', gap: 'var(--space-3)' }}>
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
                      border: `1.5px solid ${isTerminal ? (outcome === 'success' ? 'var(--sage)' : 'var(--alarm)') : 'var(--ember)'}`,
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
                      border: `1px solid ${isTerminal ? (outcome === 'success' ? 'var(--sage)' : 'var(--alarm)') : 'var(--rule)'}`,
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
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--fs-label)',
                          color: 'var(--ember)',
                          fontWeight: 700,
                        }}
                      >
                        SOL {String(node.sol).padStart(3, '0')}
                      </span>
                      <Tag
                        label={node.category.toUpperCase()}
                        variant={node.category === 'radiation' ? 'alarm' : 'neutral'}
                        size="sm"
                      />
                    </div>

                    <strong
                      style={{
                        fontFamily: 'var(--font-condensed)',
                        fontSize: 'var(--fs-body)',
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
          </div>
        </div>
      )}
    </div>
  );
};
