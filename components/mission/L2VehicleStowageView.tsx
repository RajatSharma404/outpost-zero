'use client';

import React from 'react';
import { useGameStore } from '../../store/game';
import type { DailyStepResult } from '../../src/engine';

interface L2VehicleStowageViewProps {
  currentStep: DailyStepResult;
}

export function L2VehicleStowageView({ currentStep }: L2VehicleStowageViewProps) {
  const { coupledConfig } = useGameStore();
  const vehicle = coupledConfig.vehicle;
  const crewCount = coupledConfig.crew.length;

  const totalHullM3 = vehicle.pressurizedVolumeM3;
  const systemsM3 = vehicle.systemsVolumeM3;
  const stowageM3 = vehicle.storageVolumeM3;
  const nhvTotalM3 = vehicle.habitableVolumeM3;
  const unallocatedM3 = Math.max(0, totalHullM3 - (systemsM3 + stowageM3 + nhvTotalM3));
  const nhvPerPerson = crewCount > 0 ? nhvTotalM3 / crewCount : 0;

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
              fontSize: 'var(--fs-lead)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--hmi-text)',
              fontWeight: 700,
            }}
          >
            L2 Subsystem: Vehicle Habitation & Volume Stowage Cube
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
            Pressurized hull geometry ({totalHullM3} m³): Systems, Stowage, and Net Habitable Volume (NHV)
          </span>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-1) var(--space-3)',
            borderRadius: 'var(--r-0)',
          }}
        >
          NHV / CREW: <strong style={{ color: nhvPerPerson >= 20 ? 'var(--sage)' : 'var(--caution)' }}>{nhvPerPerson.toFixed(1)} m³/person</strong>
        </div>
      </div>

      {/* 3D Isometric SVG Hull Cube Diagram */}
      <div
        style={{
          backgroundColor: 'var(--hmi-surface-elevated)',
          border: '1px solid var(--hmi-border)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--r-1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <svg
          viewBox="0 0 540 260"
          style={{ width: '100%', maxWidth: '540px', height: 'auto' }}
          aria-label="Vehicle Pressurized Hull 3D Isometric View"
        >
          {/* Top Face - Net Habitable Volume (Habitation Deck) */}
          <polygon
            points="270,20 450,90 270,160 90,90"
            fill="var(--hmi-track)"
            stroke="var(--hmi-border)"
            strokeWidth="1.5"
          />
          <text x="270" y="85" textAnchor="middle" fill="var(--hmi-text)" fontSize="13" fontWeight="bold" fontFamily="monospace">
            HABITATION DECK (NHV): {nhvTotalM3} m³
          </text>
          <text x="270" y="105" textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="11" fontFamily="monospace">
            {nhvPerPerson.toFixed(1)} m³ / crewmember
          </text>

          {/* Left Face - Logistics & Consumables Stowage */}
          <polygon
            points="90,90 270,160 270,240 90,170"
            fill="var(--tier-study)"
            stroke="var(--hmi-border)"
            strokeWidth="1.5"
          />
          <text x="170" y="165" fill="var(--color-basalt)" fontSize="11" fontWeight="bold" fontFamily="monospace">
            STOWAGE: {stowageM3} m³
          </text>
          <text x="170" y="180" fill="var(--color-basalt)" fontSize="9" fontFamily="monospace">
            Water / Food / Spares
          </text>

          {/* Right Face - ECLSS Equipment & Thermal Systems */}
          <polygon
            points="270,160 450,90 450,170 270,240"
            fill="var(--hmi-fill)"
            stroke="var(--hmi-border)"
            strokeWidth="1.5"
          />
          <text x="360" y="165" fill="var(--ink)" fontSize="11" fontWeight="bold" fontFamily="monospace">
            SYSTEMS: {systemsM3} m³
          </text>
          <text x="360" y="180" fill="var(--ink-dim)" fontSize="9" fontFamily="monospace">
            ECLSS Racks / Avionics
          </text>
        </svg>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-2)' }}>
          * Exterior cargo and unpressurized science bays are mounted outside the pressurized habitat pressure hull.
        </div>
      </div>

      {/* Volume Allocation Telemetry */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ backgroundColor: 'var(--hmi-surface-elevated)', padding: 'var(--space-2)', border: '1px solid var(--hmi-border)', borderRadius: 'var(--r-1)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>TOTAL PRESSURIZED</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-lead)', fontWeight: 700, color: 'var(--hmi-text)' }}>{totalHullM3} m³</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--tier-req)' }}>NASA DRA 5.0 Spec</div>
        </div>

        <div style={{ backgroundColor: 'var(--hmi-surface-elevated)', padding: 'var(--space-2)', border: '1px solid var(--hmi-border)', borderRadius: 'var(--r-1)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>NET HABITABLE VOLUME</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-lead)', fontWeight: 700, color: 'var(--sage)' }}>{nhvTotalM3} m³</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>{nhvPerPerson.toFixed(1)} m³/person</div>
        </div>

        <div style={{ backgroundColor: 'var(--hmi-surface-elevated)', padding: 'var(--space-2)', border: '1px solid var(--hmi-border)', borderRadius: 'var(--r-1)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>STOWAGE VOLUME</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-lead)', fontWeight: 700, color: 'var(--tier-study)' }}>{stowageM3} m³</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>CTBE Standard Containers</div>
        </div>

        <div style={{ backgroundColor: 'var(--hmi-surface-elevated)', padding: 'var(--space-2)', border: '1px solid var(--hmi-border)', borderRadius: 'var(--r-1)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>SYSTEMS & AVIONICS</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-lead)', fontWeight: 700, color: 'var(--hmi-text)' }}>{systemsM3} m³</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>Internal Equipment Racks</div>
        </div>
      </div>
    </div>
  );
}

