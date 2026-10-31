'use client';

import React from 'react';
import { useGameStore } from '../../store/game';
import {
  type Vehicle,
  VEHICLE_PRESETS,
  evaluateVehicleFeasibility,
} from '../../src/engine';

export function VehicleSelector() {
  const { coupledConfig, setVehicle } = useGameStore();
  const selectedVehicle = coupledConfig.vehicle;
  const crewCount = coupledConfig.crew.length;
  const totalMissionDays =
    coupledConfig.phaseDurations.outbound +
    coupledConfig.phaseDurations.surface +
    coupledConfig.phaseDurations.return;

  // Approximate current cargo mass & stowage volume for live feasibility checking
  const estimatedCargoKg = 25000;
  const estimatedStowageM3 = crewCount * totalMissionDays * 0.012;

  const feasibility = evaluateVehicleFeasibility(
    selectedVehicle,
    crewCount,
    totalMissionDays,
    estimatedCargoKg,
    estimatedStowageM3,
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        backgroundColor: 'var(--hmi-surface)',
        border: '1px solid var(--hmi-border)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-4)',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid var(--hmi-border)',
          paddingBottom: 'var(--space-3)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-lead)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--hmi-text)',
            fontWeight: 700,
          }}
        >
          Vehicle & Habitation Architecture
        </span>
        <span
          style={{
            display: 'block',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-label)',
            color: 'var(--hmi-text-dim)',
            marginTop: 'var(--space-quarter)',
          }}
        >
          Woolford & Bond habitability limits (11.3 emergency, 20.0 optimal, 25.0 SME consensus m³/person)
        </span>
      </div>

      {/* Preset Vehicle Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {Object.values(VEHICLE_PRESETS).map((v) => {
          const isSelected = selectedVehicle.id === v.id;
          return (
            <button
              type="button"
              key={v.id}
              onClick={() => setVehicle(v)}
              style={{
                textAlign: 'left',
                padding: 'var(--space-3)',
                backgroundColor: isSelected ? 'var(--hmi-surface-elevated)' : 'transparent',
                border: isSelected ? '2px solid var(--ember)' : '1px solid var(--hmi-border)',
                borderRadius: 'var(--r-1)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-condensed)',
                    fontSize: 'var(--fs-body)',
                    fontWeight: 700,
                    color: 'var(--hmi-text)',
                  }}
                >
                  {v.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--fs-caption)',
                    padding: 'var(--space-quarter) var(--space-1)',
                    backgroundColor:
                      v.sourceTier === 'REQ'
                        ? 'var(--tier-req)'
                        : v.sourceTier === 'OBS'
                        ? 'var(--tier-obs)'
                        : v.sourceTier === 'STUDY'
                        ? 'var(--tier-study)'
                        : 'var(--tier-student)',
                    color: 'var(--color-basalt)',
                    fontWeight: 700,
                    borderRadius: 'var(--r-0)',
                  }}
                >
                  {v.sourceTier}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 'var(--space-1)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-detail)',
                  color: 'var(--hmi-text-dim)',
                }}
              >
                <div>Pressurized: <strong style={{ color: 'var(--hmi-text)' }}>{v.pressurizedVolumeM3} m³</strong></div>
                <div>Habitable: <strong style={{ color: 'var(--hmi-text)' }}>{v.habitableVolumeM3} m³</strong></div>
                <div>Payload Cap: <strong style={{ color: 'var(--hmi-text)' }}>{(v.massCapacityKg / 1000).toFixed(1)} t</strong></div>
                <div>Max Crew: <strong style={{ color: 'var(--hmi-text)' }}>{v.maxCrew}</strong></div>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--fs-caption)',
                  color: 'var(--hmi-text-dim)',
                  borderTop: '1px solid var(--hmi-border)',
                  paddingTop: 'var(--space-1)',
                }}
              >
                {v.sourceCitation}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Vehicle Telemetry & Feasibility */}
      <div
        style={{
          borderTop: '1px solid var(--hmi-border)',
          paddingTop: 'var(--space-3)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-lead)',
                color: 'var(--hmi-text)',
                fontWeight: 700,
              }}
            >
              {selectedVehicle.name} Feasibility Assessment
            </span>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-label)',
                color: 'var(--hmi-text-dim)',
              }}
            >
              Mission Profile: {crewCount} Crew × {totalMissionDays} Days ({coupledConfig.phaseDurations.outbound}d transit + {coupledConfig.phaseDurations.surface}d surface + {coupledConfig.phaseDurations.return}d return)
            </span>
          </div>

          <div
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: feasibility.isFeasible ? 'var(--color-greenhouse-lit)' : 'var(--alarm-p1-bg)',
              border: `1px solid ${feasibility.isFeasible ? 'var(--sage)' : 'var(--alarm-p1)'}`,
              color: feasibility.isFeasible ? 'var(--sage)' : 'var(--alarm-p1)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              fontWeight: 700,
              borderRadius: 'var(--r-0)',
            }}
          >
            {feasibility.isFeasible ? '✓ FEASIBLE MISSION ENVELOPE' : `▲ VIOLATION: BINDING ON ${feasibility.bindingConstraint.toUpperCase()}`}
          </div>
        </div>

        {/* Violations List if any */}
        {feasibility.violations.length > 0 && (
          <div
            style={{
              padding: 'var(--space-2)',
              backgroundColor: 'var(--alarm-p1-bg)',
              border: '1px solid var(--alarm-p1)',
              borderRadius: 'var(--r-0)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              color: 'var(--alarm-p1)',
            }}
          >
            {feasibility.violations.map((v, i) => (
              <div key={i}>• {v}</div>
            ))}
          </div>
        )}

        {/* Analog Operating Band Gauge: NHV per Person */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--hmi-text)' }}>
              Net Habitable Volume (NHV): <strong>{feasibility.nhvPerPersonM3.toFixed(1)} m³/person</strong>
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-label)',
                color:
                  feasibility.nhvRating === 'optimal'
                    ? 'var(--sage)'
                    : feasibility.nhvRating === 'acceptable'
                    ? 'var(--caution)'
                    : 'var(--alarm-p1)',
                fontWeight: 700,
              }}
            >
              [{feasibility.nhvRating.toUpperCase()}]
            </span>
          </div>

          {/* Analog Bar with Operating Bands */}
          <div
            style={{
              height: '16px',
              backgroundColor: 'var(--hmi-track)',
              position: 'relative',
              borderRadius: 'var(--r-0)',
              overflow: 'hidden',
            }}
          >
            {/* Critical Emergency Threshold Marker (11.3 m3) */}
            <div
              style={{
                position: 'absolute',
                left: `${(11.3 / 35.0) * 100}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: 'var(--alarm-p1)',
                zIndex: 2,
              }}
              title="11.3 m3/person: Woolford & Bond Emergency Limit"
            />
            {/* Optimal Threshold Marker (20.0 m3) */}
            <div
              style={{
                position: 'absolute',
                left: `${(20.0 / 35.0) * 100}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: 'var(--caution)',
                zIndex: 2,
              }}
              title="20.0 m3/person: Woolford & Bond Optimal Threshold"
            />
            {/* SME Consensus Marker (25.0 m3) */}
            <div
              style={{
                position: 'absolute',
                left: `${(25.0 / 35.0) * 100}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: 'var(--sage)',
                zIndex: 2,
              }}
              title="25.0 m3/person: NASA SME Consensus (30 months)"
            />
            {/* Current Value Fill */}
            <div
              style={{
                width: `${Math.min(100, (feasibility.nhvPerPersonM3 / 35.0) * 100)}%`,
                height: '100%',
                backgroundColor:
                  feasibility.nhvRating === 'critical_infeasible'
                    ? 'var(--alarm-p1)'
                    : 'var(--hmi-fill)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              color: 'var(--hmi-text-dim)',
              marginTop: 'var(--space-1)',
            }}
          >
            <span>0 m³</span>
            <span>11.3 m³ (Emergency)</span>
            <span>20.0 m³ (Optimal)</span>
            <span>25.0 m³ (NASA SME)</span>
            <span>35 m³</span>
          </div>
        </div>
      </div>
    </div>
  );
}

