'use client';

import React from 'react';
import type { SimulationState } from '../../lib/sim/types';

interface HabitatCutawayProps {
  state: SimulationState;
}

export const HabitatCutaway: React.FC<HabitatCutawayProps> = ({ state }) => {
  const packedItems = new Set(state.loadout.itemIds);
  const brownoutLoads = new Set(state.brownoutLoadsShed);

  // Compute dust factor from active effects
  let dustFactor = 0;
  for (const eff of state.activeEffects) {
    if (eff.target === 'dustFactor' && eff.set !== undefined) {
      dustFactor = Math.max(dustFactor, eff.set);
    }
  }

  // Sky color: interpolate between clear sky and dust sky
  const skyColor = dustFactor > 0.5 ? 'var(--sky-dust)' : 'var(--sky-clear)';

  const hasSolarSmall = packedItems.has('solar_small');
  const hasSolarLarge = packedItems.has('solar_large');
  const hasFission = packedItems.has('fission_unit');
  const hasRegolith = packedItems.has('regolith_shield');
  const hasShelter = packedItems.has('storm_shelter');
  const hasGreenhouse = packedItems.has('greenhouse_small') || packedItems.has('greenhouse_large');
  const hasMoxie = packedItems.has('moxie_scaleup');
  const hasRecycler = packedItems.has('eclss_recycler');

  // Check lighting status for modules
  const isBaseBrownedOut = brownoutLoads.has('habitat_baseline');
  const isRecyclerBrowned = brownoutLoads.has('eclss_recycler');
  const isMoxieBrowned = brownoutLoads.has('moxie_scaleup');
  const isGreenhouseBrowned = brownoutLoads.has('greenhouse_small') || brownoutLoads.has('greenhouse_large');
  const isRecBrowned = brownoutLoads.has('rec_module');

  return (
    <div
      style={{
        backgroundColor: 'var(--basalt-2)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-2) var(--space-4)',
          borderBottom: '1px solid var(--rule)',
          backgroundColor: 'var(--basalt)',
          fontFamily: 'var(--font-condensed)',
          fontSize: 'var(--fs-label)',
          color: 'var(--ink-dim)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        <span>SCHEMATIC CROSS-SECTION // SURFACE HABITAT CUTAWAY</span>
        <span style={{ color: dustFactor > 0.4 ? 'var(--caution)' : 'var(--sage)' }}>
          {dustFactor > 0.8
            ? 'GLOBAL DUST STORM (TAU 2.8)'
            : dustFactor > 0.3
            ? 'REGIONAL DUST PLUME'
            : 'ATMOSPHERE NOMINAL (TAU 0.4)'}
        </span>
      </div>

      {/* Hand-built SVG Cutaway */}
      <div style={{ width: '100%', height: 'auto', position: 'relative' }}>
        <svg
          viewBox="0 0 800 420"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Side-section architectural cutaway of Mars outpost modules"
        >
          <defs>
            {/* Sky gradient */}
            <linearGradient id="marsSky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={skyColor} />
              <stop offset="100%" stopColor="var(--sky-dust)" />
            </linearGradient>

            {/* Regolith terrain gradient */}
            <linearGradient id="regolithGround" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--regolith-mid)" />
              <stop offset="100%" stopColor="var(--regolith-dark)" />
            </linearGradient>

            {/* Hab lighting glow */}
            <filter id="habGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Mars Sky Backdrop */}
          <rect x="0" y="0" width="800" height="240" fill="url(#marsSky)" />

          {/* Distant Martian Crater Rim */}
          <polygon
            points="0,210 120,185 240,200 380,180 520,195 680,175 800,205 800,240 0,240"
            fill="var(--crater)"
            opacity="0.6"
          />

          {/* 2. Mars Surface Ground / Regolith Subsurface */}
          <rect x="0" y="240" width="800" height="180" fill="url(#regolithGround)" />
          {/* Surface Ground Line */}
          <line x1="0" y1="240" x2="800" y2="240" stroke="var(--ground-line)" strokeWidth="2" />

          {/* 3. Surface Deployments: FISSION REACTOR BOOM (Far Left) */}
          {hasFission && (
            <g transform="translate(45, 120)">
              {/* Distance Warning Berm */}
              <line x1="0" y1="120" x2="80" y2="120" stroke="var(--rule)" strokeWidth="3" />
              {/* Reactor Tower */}
              <rect x="35" y="40" width="10" height="80" fill="var(--basalt-2)" stroke="var(--rule)" strokeWidth="1.5" />
              {/* Shadow Shield */}
              <polygon points="20,50 60,50 50,35 30,35" fill="var(--rule)" />
              {/* Stirling Radiator Fins */}
              <line x1="15" y1="20" x2="65" y2="20" stroke="var(--ink-dim)" strokeWidth="1.5" />
              <line x1="20" y1="10" x2="60" y2="10" stroke="var(--ink-dim)" strokeWidth="1.5" />
              <line x1="25" y1="0" x2="55" y2="0" stroke="var(--ink-dim)" strokeWidth="1.5" />
              {/* Reactor Core Glow */}
              <circle cx="40" cy="42" r="6" fill="var(--oxide)" />
              <text x="40" y="135" fill="var(--ink-dim)" fontSize="var(--fs-caption)" fontFamily="var(--font-mono)" textAnchor="middle">
                KILOPOWER (10kW)
              </text>
            </g>
          )}

          {/* 4. Surface Deployments: SOLAR ARRAYS (Top Left & Top Right) */}
          {hasSolarLarge && (
            <g transform="translate(140, 150)">
              <line x1="30" y1="90" x2="30" y2="30" stroke="var(--rule)" strokeWidth="2" />
              {/* Solar Panels tilted towards sun */}
              <polygon
                points="0,30 60,15 60,45 0,60"
                fill={dustFactor > 0.7 ? 'var(--rule)' : 'var(--water-dark)'}
                stroke="var(--ember)"
                strokeWidth="1.5"
              />
              <line x1="20" y1="25" x2="20" y2="55" stroke="var(--rule)" />
              <line x1="40" y1="20" x2="40" y2="50" stroke="var(--rule)" />
              <text x="30" y="105" fill="var(--ink-dim)" fontSize="var(--fs-caption)" fontFamily="var(--font-mono)" textAnchor="middle">
                SOLAR FARM (12kW)
              </text>
            </g>
          )}

          {hasSolarSmall && (
            <g transform="translate(230, 170)">
              <line x1="20" y1="70" x2="20" y2="25" stroke="var(--rule)" strokeWidth="2" />
              <polygon
                points="0,25 40,15 40,35 0,45"
                fill={dustFactor > 0.7 ? 'var(--rule)' : 'var(--water-dark)'}
                stroke="var(--ember)"
                strokeWidth="1.2"
              />
              <text x="20" y="85" fill="var(--ink-dim)" fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
                PV (5kW)
              </text>
            </g>
          )}

          {/* 5. Surface Deployments: GREENHOUSE BIOSPHERE (Surface Dome Right) */}
          {hasGreenhouse && (
            <g transform="translate(620, 160)">
              {/* Geodesic Dome */}
              <path
                d="M 10 80 A 60 60 0 0 1 130 80 Z"
                fill={isGreenhouseBrowned ? 'var(--greenhouse-dim)' : 'var(--greenhouse-bg)'}
                stroke={isGreenhouseBrowned ? 'var(--rule)' : 'var(--sage)'}
                strokeWidth="1.5"
                opacity="0.9"
              />
              {/* Internal Hydroponic Racks & Grow Lights */}
              {!isGreenhouseBrowned && (
                <>
                  <line x1="30" y1="40" x2="110" y2="40" stroke="var(--sage)" strokeWidth="1" strokeDasharray="3 2" />
                  <rect x="35" y="65" width="20" height="15" fill="var(--sage)" opacity="0.8" />
                  <rect x="65" y="62" width="20" height="18" fill="var(--sage)" opacity="0.9" />
                  <rect x="95" y="65" width="15" height="15" fill="var(--sage)" opacity="0.8" />
                </>
              )}
              <text x="70" y="100" fill="var(--ink-dim)" fontSize="var(--fs-caption)" fontFamily="var(--font-mono)" textAnchor="middle">
                HYDRO BIOSPHERE
              </text>
            </g>
          )}

          {/* 6. REGOLITH SHIELDING BERM (Layered over the habitat hull) */}
          {hasRegolith && (
            <path
              d="M 280 240 Q 450 170 620 240 Z"
              fill="var(--regolith-berm)"
              stroke="var(--regolith-stroke)"
              strokeWidth="2"
              opacity="0.95"
            />
          )}

          {/* 7. Central Habitation Complex (Semi-Buried Cylinder) */}
          <g transform="translate(300, 210)">
            {/* Outer Pressure Hull */}
            <rect
              x="0"
              y="0"
              width="300"
              height="150"
              rx="4"
              fill="var(--hab-outer)"
              stroke="var(--rule)"
              strokeWidth="2"
            />

            {/* Interior Sub-Compartments */}
            {/* Sector A: Living Quarters & Recreation Module */}
            <rect
              x="10"
              y="10"
              width="85"
              height="60"
              fill={isRecBrowned ? 'var(--hab-dim)' : 'var(--hab-inner)'}
              stroke="var(--rule)"
              strokeWidth="1"
            />
            <text x="52" y="32" fill="var(--ink-dim)" fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
              CREW HAB
            </text>
            {packedItems.has('rec_module') && (
              <text x="52" y="48" fill={isRecBrowned ? 'var(--alarm)' : 'var(--ember)'} fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
                {isRecBrowned ? '[REC SHED]' : '[GYM ACTIVE]'}
              </text>
            )}

            {/* Sector B: Command, Avionics, & Medical Bay */}
            <rect
              x="105"
              y="10"
              width="90"
              height="60"
              fill={isBaseBrownedOut ? 'var(--basalt)' : 'var(--hab-inner)'}
              stroke="var(--rule)"
              strokeWidth="1"
            />
            <text x="150" y="32" fill="var(--ink)" fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
              MISSION OPS
            </text>
            {packedItems.has('medical_kit') && (
              <text x="150" y="48" fill="var(--sage)" fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
                [MED BAY READY]
              </text>
            )}

            {/* Sector C: Water-Jacket Storm Shelter Room (Central Bunker) */}
            {hasShelter && (
              <g transform="translate(205, 10)">
                <rect
                  x="0"
                  y="0"
                  width="85"
                  height="60"
                  fill="var(--water-dark)"
                  stroke="var(--water-border)"
                  strokeWidth="2"
                />
                <text x="42" y="30" fill="var(--water-text)" fontSize="var(--fs-micro)" fontFamily="var(--font-condensed)" textAnchor="middle" fontWeight="bold">
                  STORM SHELTER
                </text>
                <text x="42" y="46" fill="var(--water-text)" fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
                  WATER WALLS
                </text>
              </g>
            )}

            {/* Sector D (Lower Deck): Life Support Loop (ECLSS + MOXIE) */}
            <rect
              x="10"
              y="80"
              width="185"
              height="60"
              fill={isRecyclerBrowned ? 'var(--basalt)' : 'var(--hab-inner)'}
              stroke="var(--rule)"
              strokeWidth="1"
            />
            <text x="100" y="98" fill="var(--ink-dim)" fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
              ECLSS LIFE SUPPORT SYSTEM
            </text>
            {hasRecycler && (
              <text x="55" y="118" fill={isRecyclerBrowned ? 'var(--alarm)' : 'var(--sage)'} fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
                {isRecyclerBrowned ? 'RECYCLER [SHED]' : 'RECYCLER [90%]'}
              </text>
            )}
            {hasMoxie && (
              <text x="145" y="118" fill={isMoxieBrowned ? 'var(--alarm)' : 'var(--ember)'} fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
                {isMoxieBrowned ? 'MOXIE [SHED]' : 'MOXIE [2.0kg/s]'}
              </text>
            )}

            {/* Sector E (Lower Deck Right): Battery Bank & Spare Logistics */}
            <rect
              x="205"
              y="80"
              width="85"
              height="60"
              fill="var(--basalt-2)"
              stroke="var(--rule)"
              strokeWidth="1"
            />
            <text x="247" y="98" fill="var(--ink-dim)" fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
              LOGISTICS BAY
            </text>
            {packedItems.has('battery_bank') && (
              <text x="247" y="115" fill="var(--ember)" fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
                BATTERIES [160kWh]
              </text>
            )}
            {packedItems.has('spare_parts_kit') && (
              <text x="247" y="128" fill="var(--ink)" fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
                3D FAB / SPARES
              </text>
            )}
          </g>

          {/* 8. Airlock Module & Astronaut EVA Staging (Right of Hab) */}
          <g transform="translate(605, 270)">
            <rect x="0" y="0" width="35" height="50" fill="var(--basalt-2)" stroke="var(--rule)" strokeWidth="1.5" />
            <line x1="17" y1="0" x2="17" y2="50" stroke="var(--rule)" strokeDasharray="2 2" />
            <text x="17" y="65" fill="var(--ink-dim)" fontSize="var(--fs-micro)" fontFamily="var(--font-mono)" textAnchor="middle">
              AIRLOCK
            </text>
          </g>
        </svg>

        {/* Dynamic Storm Dust Particles Layer */}
        {dustFactor > 0.2 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              backgroundColor: 'var(--sky-dust)',
              opacity: Math.min(0.65, dustFactor * 0.7),
              mixBlendMode: 'multiply',
            }}
          />
        )}
      </div>
    </div>
  );
};
