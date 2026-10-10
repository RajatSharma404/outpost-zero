import React from 'react';
import Link from 'next/link';
import { SOURCES } from '../../lib/data';
import { Tag } from '../../components/ui/Tag';

export default function SourcesPage() {
  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-4)',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
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
              color: 'var(--oxide)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            RESEARCH BIBLIOGRAPHY // SCIENTIFIC VERIFICATION
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
            SOURCES & CITATIONS
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
              padding: 'var(--space-1) var(--space-2)',
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
              padding: 'var(--space-1) var(--space-2)',
              border: '1px solid var(--rule)',
            }}
          >
            Model Specs
          </Link>
        </nav>
      </header>

      {/* Intro */}
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'var(--fs-lead)',
          lineHeight: 1.6,
          color: 'var(--ink)',
          marginBottom: 'var(--space-6)',
        }}
      >
        Outpost Zero was engineered for the NASA Space Apps Challenge to avoid invented facts.
        Every physical constant, human metabolic requirement, radiation threshold, and hardware trade-off
        is grounded directly in official NASA publications, mission telemetry, and technical standards.
      </p>

      {/* Bibliography Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {SOURCES.map((source) => (
          <div
            key={source.id}
            style={{
              backgroundColor: 'var(--basalt-2)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--r-1)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 'var(--space-2)',
                }}
              >
                <Tag label={source.publisher} variant="nominal" size="sm" />
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-detail)',
                    color: 'var(--ink-dim)',
                  }}
                >
                  Verified {source.accessedOn}
                </span>
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 'var(--fs-lead)',
                  fontWeight: 600,
                  color: 'var(--ink)',
                  margin: '0 0 var(--space-2) 0',
                  lineHeight: 1.3,
                }}
              >
                {source.title}
              </h2>

              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-label)',
                  color: 'var(--ink-dim)',
                  lineHeight: 1.4,
                  margin: '0 0 var(--space-3) 0',
                }}
              >
                <strong style={{ color: 'var(--ember)' }}>Used in Simulation: </strong>
                {source.usedFor}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--rule)', paddingTop: 'var(--space-2)' }}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-label)',
                  color: 'var(--oxide)',
                  textDecoration: 'none',
                  wordBreak: 'break-all',
                }}
              >
                {source.url} &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
