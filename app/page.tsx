'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { Icon } from '../components/ui/Icon';

interface SpaceWeatherData {
  level: 'quiet' | 'active' | 'storm';
  kIndex: number;
  fetchedAt: string;
  marsEphemeris?: {
    deltaAU: number;
    distMillionKm: number;
    lightTimeMin: number;
    signalDelayFormatted: string;
    source: string;
  };
  spaceWeatherEvents?: {
    hasActiveCME: boolean;
    recentEventCount: number;
    latestCMEId: string | null;
    source: string;
  };
  offline: boolean;
}

export default function LandingPage() {
  const [sliderTonnage, setSliderTonnage] = useState(24);
  const [spaceWeather, setSpaceWeather] = useState<SpaceWeatherData | null>(null);

  useEffect(() => {
    fetch('/api/space-weather')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.offline) {
          setSpaceWeather(data);
        }
      })
      .catch(() => {});
  }, []);

  const maxTonnes = 40;
  const currentMassKg = sliderTonnage * 1000;
  const isOver = sliderTonnage > maxTonnes;
  const barPercent = Math.min(100, (sliderTonnage / maxTonnes) * 100);

  // Crew sustainable estimate (approx 6 tonnes per crew-year in closed loop vs 18 open loop)
  const estimatedCrewSupported = Math.max(1, Math.min(6, Math.floor(sliderTonnage / 6)));

  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'var(--space-6) var(--space-4)',
        boxSizing: 'border-box',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top Header Bar */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-3)',
          marginBottom: 'var(--space-8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-lead)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--oxide)',
              fontWeight: 700,
            }}
          >
            OUTPOST ZERO
          </span>
          <span style={{ color: 'var(--rule)' }}>//</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--ink-dim)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            NASA Space Apps Challenge
          </span>
        </div>

        {/* Live NASA & NOAA Telemetry Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {spaceWeather && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  backgroundColor: 'var(--basalt-2)',
                  border: '1px solid var(--rule)',
                  padding: 'var(--space-1) var(--space-3)',
                  borderRadius: 'var(--r-0)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-label)',
                    color: 'var(--ink-dim)',
                    textTransform: 'uppercase',
                  }}
                >
                  Space Weather (NOAA SWPC):
                </span>
                <Tag
                  label={`Kp ${spaceWeather.kIndex} // ${spaceWeather.level.toUpperCase()}`}
                  variant={spaceWeather.level === 'storm' ? 'alarm' : spaceWeather.level === 'active' ? 'caution' : 'nominal'}
                  size="sm"
                />
              </div>

              {spaceWeather.marsEphemeris && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    backgroundColor: 'var(--basalt-2)',
                    border: '1px solid var(--rule)',
                    padding: 'var(--space-1) var(--space-3)',
                    borderRadius: 'var(--r-0)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--fs-label)',
                      color: 'var(--ink-dim)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Mars Comms Lag (JPL Horizons):
                  </span>
                  <Tag
                    label={`${spaceWeather.marsEphemeris.signalDelayFormatted} (${spaceWeather.marsEphemeris.distMillionKm}M km)`}
                    variant="nominal"
                    size="sm"
                  />
                </div>
              )}
            </>
          )}

          <nav style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Link
              href="/how-it-works"
              style={{
                color: 'var(--ink-dim)',
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-label)',
                textTransform: 'uppercase',
                textDecoration: 'none',
                letterSpacing: '0.08em',
              }}
            >
              How It Works
            </Link>
            <Link
              href="/sources"
              style={{
                color: 'var(--ink-dim)',
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-label)',
                textTransform: 'uppercase',
                textDecoration: 'none',
                letterSpacing: '0.08em',
              }}
            >
              Sources
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Hero Section: Headline + Interactive Mass Bar Demo */}
      <main style={{ marginBottom: 'var(--space-10)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 'var(--space-8)',
            alignItems: 'center',
            marginBottom: 'var(--space-10)',
          }}
        >
          {/* Left: Oversized Serif & Condensed Headline */}
          <div>
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-label)',
                color: 'var(--ember)',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                fontWeight: 700,
                display: 'block',
                marginBottom: 'var(--space-2)',
              }}
            >
              MARS SURFACE SYSTEMS ENGINEERING SIMULATOR
            </span>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--fs-display)',
                lineHeight: 1.05,
                fontWeight: 600,
                color: 'var(--ink)',
                margin: '0 0 var(--space-4) 0',
              }}
            >
              How many people can you keep alive on 40 tonnes?
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-body)',
                lineHeight: 1.6,
                color: 'var(--ink-dim)',
                margin: '0 0 var(--space-6) 0',
                maxWidth: '540px',
              }}
            >
              Every kilogram you launch to Mars creates an engineering trade-off. Pack nuclear fission or solar arrays?
              Haul tons of bottled water, or rely on a power-hungry closed-loop recycler? Experience firsthand the decisions
              that determine whether an outpost suffocates, freezes, or survives.
            </p>

            <Link href="/pack" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg">
                BEGIN MISSION MANIFEST &rarr;
              </Button>
            </Link>
          </div>

          {/* Right: Interactive Live Demo of Cargo Mass Budget Tape */}
          <div
            style={{
              backgroundColor: 'var(--basalt-2)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--r-1)',
              padding: 'var(--space-6)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 'var(--space-3)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 'var(--fs-label)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-dim)',
                }}
              >
                LIVE BUDGET EXPERIMENT // DRAG TO TEST
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-label)',
                  color: isOver ? 'var(--alarm)' : 'var(--sage)',
                  fontWeight: 600,
                }}
              >
                {isOver ? 'OVER 40-TONNE LIMIT' : `SUSTAINS ~${estimatedCrewSupported} CREW (180 SOLS)`}
              </span>
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-condensed)',
                    fontSize: 'var(--fs-numeral)',
                    fontWeight: 700,
                    lineHeight: 1,
                    color: isOver ? 'var(--alarm)' : 'var(--ink)',
                  }}
                >
                  {sliderTonnage.toFixed(1)} T
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-body)',
                    color: 'var(--ink-dim)',
                  }}
                >
                  / 40.0 TONNES ({currentMassKg.toLocaleString()} KG)
                </span>
              </div>
            </div>

            {/* Mass Bar */}
            <div
              style={{
                height: '16px',
                width: '100%',
                backgroundColor: 'var(--basalt)',
                border: `1px solid ${isOver ? 'var(--alarm)' : 'var(--rule)'}`,
                marginBottom: 'var(--space-4)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${barPercent}%`,
                  height: '100%',
                  backgroundColor: isOver ? 'var(--alarm)' : 'var(--ember)',
                  transition: 'width 0.1s ease',
                }}
              />
            </div>

            {/* Slider */}
            <input
              type="range"
              min={5}
              max={55}
              step={1}
              value={sliderTonnage}
              onChange={(e) => setSliderTonnage(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--ember)',
                cursor: 'pointer',
                marginBottom: 'var(--space-3)',
              }}
            />

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-label)',
                color: 'var(--ink-dim)',
                lineHeight: 1.4,
                display: 'block',
              }}
            >
              {isOver
                ? 'Your rocket payload has exceeded the 40-tonne delivery envelope. Launch is automatically locked by orbital flight dynamics.'
                : `At ${sliderTonnage} tonnes, your lander has ${(40 - sliderTonnage).toFixed(1)} tonnes remaining for radiation shielding berms, storm shelters, and spare parts.`}
            </span>
          </div>
        </div>

        {/* Three-Step Strip Drawn as Numbered Log Entries (Not generic icon cards) */}
        <section>
          <div
            style={{
              borderTop: '1px solid var(--rule)',
              paddingTop: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
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
              MISSION ARCHITECTURE // THREE-PHASE LEARNING CYCLE
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {/* Entry 01 */}
            <div
              style={{
                backgroundColor: 'var(--basalt)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r-1)',
                padding: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ember)', fontWeight: 700 }}>
                  LOG ENTRY 01
                </span>
                <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', textTransform: 'uppercase' }}>
                  PAYLOAD MANIFEST
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-lead)', color: 'var(--ink)', margin: '0 0 var(--space-2) 0' }}>
                Pack the 40-Tonne Lander
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
                Choose between solar panels and Kilopower fission. Allocate scarce cargo mass between closed-loop ECLSS recyclers,
                MOXIE oxygen generators, regolith radiation berms, and shelf-stable rations.
              </p>
            </div>

            {/* Entry 02 */}
            <div
              style={{
                backgroundColor: 'var(--basalt)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r-1)',
                padding: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ember)', fontWeight: 700 }}>
                  LOG ENTRY 02
                </span>
                <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', textTransform: 'uppercase' }}>
                  SURFACE OPERATIONS
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-lead)', color: 'var(--ink)', margin: '0 0 var(--space-2) 0' }}>
                Survive Sol by Sol
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
                The lander touches down on Mars. Random seeded event cards pause the mission—dust storms choke solar output,
                solar particle events bombard the hull, and coolant lines leak. Your packed hardware unlocks vital countermeasures.
              </p>
            </div>

            {/* Entry 03 */}
            <div
              style={{
                backgroundColor: 'var(--basalt)',
                border: '1px solid var(--rule)',
                borderRadius: 'var(--r-1)',
                padding: 'var(--space-4)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ember)', fontWeight: 700 }}>
                  LOG ENTRY 03
                </span>
                <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', textTransform: 'uppercase' }}>
                  FAILURE POSTMORTEM
                </span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-lead)', color: 'var(--ink)', margin: '0 0 var(--space-2) 0' }}>
                Learn From the Cause Chain
              </h3>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
                Every mission ends with an exact backward cause-chain trace from the telemetry ledger. Trace how a dust storm drained
                batteries, which shed the water recycler, which caused dehydration 8 sols later. Iterate and launch again.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--rule)',
          paddingTop: 'var(--space-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--fs-label)',
          color: 'var(--ink-dim)',
        }}
      >
        <div>
          OUTPOST ZERO // NASA SPACE APPS CHALLENGE 2026 // OPEN SOURCE STEM SIMULATOR
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <Link href="/how-it-works" style={{ color: 'var(--ink-dim)', textDecoration: 'none' }}>
            Model Specs
          </Link>
          <Link href="/sources" style={{ color: 'var(--ink-dim)', textDecoration: 'none' }}>
            NASA Data Sources
          </Link>
          <Link href="/pack" style={{ color: 'var(--ember)', textDecoration: 'none', fontWeight: 600 }}>
            Launch Manifest &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}
