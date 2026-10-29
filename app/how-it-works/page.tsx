'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CONSTANTS, SOURCES } from '../../lib/data';
import { Tag } from '../../components/ui/Tag';

export default function HowItWorksPage() {
  const sourceMap = new Map(SOURCES.map((s) => [s.id, s]));
  const [activeSection, setActiveSection] = useState<string>('intro');
  const [copiedId, setCopiedId] = useState<string>('');

  const sections = [
    { id: 'intro', label: 'Overview' },
    { id: 'loops', label: '1. Resource Loops' },
    { id: 'scoring', label: '2. Scoring Math' },
    { id: 'constants', label: '3. Constants Table' },
    { id: 'honesty', label: '4. Scientific Scaling' },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 2000);
    });
  };

  const getSourceTypeVariant = (type?: string) => {
    switch (type) {
      case 'MEASURED':
        return 'nominal';
      case 'NASA STANDARD':
        return 'active';
      case 'DESIGN ASSUMPTION':
        return 'caution';
      default:
        return 'neutral';
    }
  };

  return (
    <div
      style={{
        maxWidth: '1440px',
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
            TECHNICAL ARCHITECTURE // SYSTEMS MODEL MANUAL
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
            HOW THE SIMULATION WORKS
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
            href="/sources"
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
            Bibliography &amp; Sources
          </Link>
        </nav>
      </header>

      {/* Main Layout: Sticky In-Page TOC + Content Column */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 'var(--space-6)',
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 'var(--space-6)' }}>
          {/* Mobile TOC Details/Summary (< 1024px) */}
          <details
            className="mobile-toc"
            style={{
              gridColumn: 'span 12',
              backgroundColor: 'var(--basalt-2)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--r-1)',
              padding: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <summary
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-body)',
                fontWeight: 700,
                color: 'var(--ember)',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Table of Contents
            </summary>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              {sections.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-label)',
                    color: activeSection === id ? 'var(--ember)' : 'var(--ink-dim)',
                    textDecoration: 'none',
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>
          </details>

          {/* Desktop Sticky Table of Contents (>= 1024px) */}
          <aside
            className="desktop-toc"
            style={{
              gridColumn: 'span 3',
              position: 'sticky',
              top: 'var(--space-4)',
              backgroundColor: 'var(--basalt-2)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--r-1)',
              padding: 'var(--space-4)',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-label)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ink-dim)',
                display: 'block',
                marginBottom: 'var(--space-3)',
                fontWeight: 700,
              }}
            >
              Manual Index
            </span>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {sections.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-label)',
                    color: activeSection === id ? 'var(--ember)' : 'var(--ink-dim)',
                    borderLeft: `2px solid ${activeSection === id ? 'var(--ember)' : 'transparent'}`,
                    paddingLeft: 'var(--space-2)',
                    textDecoration: 'none',
                    fontWeight: activeSection === id ? 700 : 400,
                    transition: 'color 0.15s ease, border-color 0.15s ease',
                  }}
                >
                  {label}
                </a>
              ))}
            </nav>
          </aside>

          {/* Main Manual Content Area */}
          <main className="manual-content" style={{ gridColumn: 'span 9' }}>
            {/* Overview Intro */}
            <section id="intro" style={{ marginBottom: 'var(--space-6)' }}>
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'var(--fs-lead)',
                  lineHeight: 1.6,
                  color: 'var(--ink)',
                  margin: '0 0 var(--space-4) 0',
                }}
              >
                Outpost Zero models a human surface expedition on Mars as a deterministic, pure mathematical systems loop.
                Every decision carries an unavoidable physical trade-off: mass shipped from Earth competes directly against
                power consumption, life support closure, and crew survival margins.
              </p>
            </section>

            {/* 5 Core Resource Loops */}
            <section id="loops" style={{ marginBottom: 'var(--space-8)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 'var(--fs-lead)',
                  textTransform: 'uppercase',
                  color: 'var(--ember)',
                  borderBottom: '1px solid var(--rule)',
                  paddingBottom: 'var(--space-1)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                1. The Five Interconnected Resource Loops
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                {/* Loop A: Power */}
                <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-4)' }}>
                  <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', color: 'var(--ember)', margin: '0 0 var(--space-2) 0' }}>
                    ELECTRICAL POWER &amp; STORAGE
                  </h3>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
                    The habitat requires <strong>6.0 kW continuous baseload</strong> for thermal heaters, avionics, lighting, and air scrubbers.
                    Solar generation produces power according to surface insolation (590 W/m²) but drops sharply during dust storms (tau opacity).
                    Fission surface power (Kilopower) provides constant 10 kW day and night, but weighs 6 metric tonnes.
                    When batteries deplete, non-critical modules are shed in strict priority to prevent life-support collapse.
                  </p>
                </div>

                {/* Loop B: Oxygen */}
                <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-4)' }}>
                  <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', color: 'var(--sage)', margin: '0 0 var(--space-2) 0' }}>
                    ATMOSPHERIC OXYGEN (O2)
                  </h3>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
                    Each crew member consumes <strong>0.84 kg O2/sol</strong> (BVAD standard).
                    Without recycling, a 4-person crew exhausts 3.36 kg/sol.
                    The ECLSS Recycler reclaims 50% through Sabatier reaction, while MOXIE extracts up to 2.0 kg/sol from Martian CO2.
                    If oxygen hits 0, crew health degrades by 25 HP/sol.
                  </p>
                </div>

                {/* Loop C: Water */}
                <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-4)' }}>
                  <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', color: 'var(--water-text)', margin: '0 0 var(--space-2) 0' }}>
                    POTABLE WATER (H2O)
                  </h3>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
                    Crew baseline consumption is <strong>3.5 kg/crew/sol</strong> (drinking, hygiene, hydration).
                    An ECLSS closed-loop water recovery system captures urine and condensate with 90% efficiency,
                    slashing open-loop burn to 0.35 kg/sol per person.
                    Water stores can also be loaded into storm shelter bulkheads to block cosmic radiation.
                  </p>
                </div>

                {/* Loop D: Food */}
                <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-4)' }}>
                  <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', color: 'var(--caution)', margin: '0 0 var(--space-2) 0' }}>
                    CALORIC INTAKE &amp; HYDROPONICS
                  </h3>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
                    Each crew member needs <strong>2,500 kcal/sol</strong> (0.62 kg dry rations).
                    Hydroponic biospheres supplement fresh calories (up to 7,500 kcal/sol) and provide psychological morale boosts,
                    but demand continuous 3–7 kW electrical draw for photoperiod LED arrays.
                  </p>
                </div>

                {/* Loop E: Radiation */}
                <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-4)' }}>
                  <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', color: 'var(--oxide)', margin: '0 0 var(--space-2) 0' }}>
                    COSMIC &amp; SOLAR RADIATION
                  </h3>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
                    Curiosity RAD measured an unshielded surface dose of ~0.67 mSv/sol.
                    NASA-STD-3001 caps design mission exposure at <strong>250 mSv</strong>.
                    Regolith berms reduce background cosmic rays by 40%.
                    Water storm shelters shield 70% during acute Solar Particle Events (SPE).
                  </p>
                </div>
              </div>
            </section>

            {/* Scoring System Model */}
            <section id="scoring" style={{ marginBottom: 'var(--space-8)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 'var(--fs-lead)',
                  textTransform: 'uppercase',
                  color: 'var(--ember)',
                  borderBottom: '1px solid var(--rule)',
                  paddingBottom: 'var(--space-1)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                2. Evaluation Math (100-Point Formula)
              </h2>

              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5 }}>
                At mission conclusion or termination, Outpost Zero computes a flight certification grade across four 25-point engineering pillars:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-3)' }}>
                <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-3)' }}>
                  <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>Crew Survival (25 Pts)</strong>
                  <span style={{ color: 'var(--ink-dim)', fontSize: 'var(--fs-detail)' }}>
                    (Health / 100) * 15 + (Morale / 100) * 10
                  </span>
                </div>
                <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-3)' }}>
                  <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>Subsystems (25 Pts)</strong>
                  <span style={{ color: 'var(--ink-dim)', fontSize: 'var(--fs-detail)' }}>
                    25 - (Brownouts * 4) - (Failures * 5)
                  </span>
                </div>
                <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-3)' }}>
                  <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>Closure Margin (25 Pts)</strong>
                  <span style={{ color: 'var(--ink-dim)', fontSize: 'var(--fs-detail)' }}>
                    End consumable stock ratio + recycling loops
                  </span>
                </div>
                <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-3)' }}>
                  <strong style={{ color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>Radiation ALARA (25 Pts)</strong>
                  <span style={{ color: 'var(--ink-dim)', fontSize: 'var(--fs-detail)' }}>
                    25 * (1 - Cumulative Dose / 250 mSv)
                  </span>
                </div>
              </div>
            </section>

            {/* Constants Table with Sticky First Column & Copy Buttons */}
            <section id="constants" style={{ marginBottom: 'var(--space-8)' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 'var(--fs-lead)',
                  textTransform: 'uppercase',
                  color: 'var(--ember)',
                  borderBottom: '1px solid var(--rule)',
                  paddingBottom: 'var(--space-1)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                3. Physical Constants &amp; Real-World Calibration Table
              </h2>

              <div style={{ overflowX: 'auto', backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-label)',
                    textAlign: 'left',
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: 'var(--basalt)', borderBottom: '1px solid var(--rule)' }}>
                      <th style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)', position: 'sticky', left: 0, backgroundColor: 'var(--basalt)', zIndex: 2 }}>
                        Parameter ID
                      </th>
                      <th style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>Source Type</th>
                      <th style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>Value</th>
                      <th style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>Unit</th>
                      <th style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>NASA Source</th>
                      <th style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>Scaling / Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONSTANTS.map((c) => {
                      const src = sourceMap.get(c.sourceId);
                      const typeVariant = getSourceTypeVariant(c.sourceType);

                      return (
                        <tr key={c.id} id={`param-${c.id}`} style={{ borderBottom: '1px solid var(--rule)' }}>
                          {/* Sticky Monospace Parameter ID with Copy Button */}
                          <td
                            style={{
                              padding: 'var(--space-2) var(--space-3)',
                              position: 'sticky',
                              left: 0,
                              backgroundColor: 'var(--basalt-2)',
                              zIndex: 1,
                              whiteSpace: 'nowrap',
                              borderRight: '1px solid var(--rule)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                              <span style={{ color: 'var(--ember)', fontWeight: 600 }}>{c.id}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyId(c.id)}
                                title="Copy Parameter ID"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--ink-dim)',
                                  cursor: 'pointer',
                                  fontSize: 'var(--fs-detail)',
                                  padding: '1px 4px',
                                }}
                              >
                                {copiedId === c.id ? '✓' : '⧉'}
                              </button>
                            </div>
                          </td>

                          {/* Source Type Badge */}
                          <td style={{ padding: 'var(--space-2) var(--space-3)', whiteSpace: 'nowrap' }}>
                            <Tag label={c.sourceType || 'NASA STANDARD'} variant={typeVariant} size="sm" />
                          </td>

                          <td className="tabular-nums" style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>
                            {c.value}
                          </td>
                          <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink-dim)' }}>
                            {c.unit}
                          </td>
                          <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                            <span style={{ color: 'var(--sage)', display: 'block' }}>{src?.publisher || c.sourceId}</span>
                            <span style={{ color: 'var(--ink-dim)', fontSize: 'var(--fs-detail)' }}>{src?.title}</span>
                          </td>
                          <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink-dim)' }}>
                            {c.note}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Scaling Honesty Notice */}
            <section
              id="honesty"
              style={{
                backgroundColor: 'var(--basalt)',
                borderLeft: '4px solid var(--oxide)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-6)',
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 'var(--fs-body)',
                  color: 'var(--oxide)',
                  margin: '0 0 var(--space-2) 0',
                  textTransform: 'uppercase',
                }}
              >
                Scientific Honesty: Why Radiation is Scaled 2.2x
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-label)',
                  color: 'var(--ink-dim)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                In reality, Curiosity RAD recorded an average galactic cosmic ray surface dose rate of 0.67 mSv/sol. Over a 180-sol mission,
                that equals ~120 mSv—only half of the 250 mSv career design limit. If unscaled, students could completely ignore radiation shielding
                and suffer zero consequences during a short educational playthrough. We deliberately amplified the baseline surface dose rate by <strong>2.2x</strong>
                (to ~1.47 mSv/sol), ensuring that an unshielded habitat breaches the 250 mSv safety ceiling by sol 170. This makes the engineering compromise tangible
                while preserving the exact relative shielding physics of regolith berms and water storm shelters.
              </p>
            </section>
          </main>
        </div>
      </div>

      <style jsx>{`
        .desktop-toc {
          display: block;
        }
        .mobile-toc {
          display: none;
        }
        @media (max-width: 1023px) {
          .desktop-toc {
            display: none !important;
          }
          .mobile-toc {
            display: block !important;
          }
          .manual-content {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
}
