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

  // Exact 2D stacked bar volume fractions (proportional to total hull volume)
  const nhvPct = (nhvTotalM3 / totalHullM3) * 100;
  const systemsPct = (systemsM3 / totalHullM3) * 100;
  const stowagePct = (stowageM3 / totalHullM3) * 100;
  const unallocatedPct = (unallocatedM3 / totalHullM3) * 100;

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
            L2 Subsystem: Vehicle Habitation & Volume Allocation
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
            NTRS 20200002973 Pressurized hull geometry ({totalHullM3} m³): NHV 147.19 m³ | Systems 104 m³ | Storage 52 m³
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
          NHV / CREW: <strong style={{ color: nhvPerPerson < 11.3 ? 'var(--alarm-p1)' : nhvPerPerson < 20 ? 'var(--caution)' : 'var(--hmi-text)' }}>{nhvPerPerson.toFixed(2)} m³/person</strong>
        </div>
      </div>

      {/* Proportional 2D Stacked Bar View */}
      <div
        style={{
          backgroundColor: 'var(--hmi-surface-elevated)',
          border: '1px solid var(--hmi-border)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--r-1)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
          <span>PROPORTIONAL 2D VOLUMETRIC ALLOCATION</span>
          <span>HULL VOLUME: {totalHullM3.toFixed(1)} m³ (100.0%)</span>
        </div>

        {/* 2D Stacked Bar Track */}
        <div
          style={{
            height: '40px',
            backgroundColor: 'var(--hmi-track)',
            border: '1px solid var(--hmi-border)',
            borderRadius: 'var(--r-0)',
            display: 'flex',
            overflow: 'hidden',
          }}
          aria-label="Proportional 2D Pressurized Volume Allocation Bar"
        >
          {/* Segment 1: Net Habitable Volume (NHV) 147.19 m³ */}
          <div
            style={{
              width: `${nhvPct}%`,
              backgroundColor: 'var(--hmi-fill)',
              borderRight: '2px solid var(--color-basalt)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: '0 var(--space-1)',
            }}
            title={`Net Habitable Volume: ${nhvTotalM3} m³ (${nhvPct.toFixed(1)}%)`}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                color: 'var(--color-basalt)',
                whiteSpace: 'nowrap',
              }}
            >
              NHV {nhvTotalM3} m³ ({nhvPct.toFixed(1)}%)
            </span>
          </div>

          {/* Segment 2: Systems & ECLSS 104 m³ */}
          <div
            style={{
              width: `${systemsPct}%`,
              backgroundColor: 'var(--hmi-surface-elevated)',
              borderRight: '2px solid var(--color-basalt)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: '0 var(--space-1)',
            }}
            title={`Systems & Avionics: ${systemsM3} m³ (${systemsPct.toFixed(1)}%)`}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                color: 'var(--hmi-text)',
                whiteSpace: 'nowrap',
              }}
            >
              SYSTEMS {systemsM3} m³ ({systemsPct.toFixed(1)}%)
            </span>
          </div>

          {/* Segment 3: Stowage 52 m³ */}
          <div
            style={{
              width: `${stowagePct}%`,
              backgroundColor: 'var(--hmi-track)',
              borderRight: unallocatedPct > 0 ? '2px solid var(--color-basalt)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              padding: '0 var(--space-1)',
            }}
            title={`Stowage: ${stowageM3} m³ (${stowagePct.toFixed(1)}%)`}
          >
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                color: 'var(--hmi-text-dim)',
                whiteSpace: 'nowrap',
              }}
            >
              STOWAGE {stowageM3} m³ ({stowagePct.toFixed(1)}%)
            </span>
          </div>

          {/* Segment 4: Unallocated Margin */}
          {unallocatedPct > 0 && (
            <div
              style={{
                width: `${unallocatedPct}%`,
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
              title={`Margin: ${unallocatedM3.toFixed(2)} m³ (${unallocatedPct.toFixed(1)}%)`}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--hmi-text-dim)' }}>
                {unallocatedM3.toFixed(1)} m³
              </span>
            </div>
          )}
        </div>

        {/* Breakdown Card Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-1)',
          }}
        >
          <div style={{ padding: 'var(--space-2)', border: '1px solid var(--hmi-border)', borderRadius: 'var(--r-0)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
              NET HABITABLE VOLUME (NHV)
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--hmi-text)' }}>
              {nhvTotalM3} m³ ({nhvPct.toFixed(1)}%)
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
              {nhvPerPerson.toFixed(2)} m³/person (DRA 5.0 / Woolford)
            </div>
          </div>

          <div style={{ padding: 'var(--space-2)', border: '1px solid var(--hmi-border)', borderRadius: 'var(--r-0)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
              SYSTEMS & AVIONICS
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--hmi-text)' }}>
              {systemsM3} m³ ({systemsPct.toFixed(1)}%)
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
              ECLSS Racks, OGA, Sabatier, WRS, Ducts
            </div>
          </div>

          <div style={{ padding: 'var(--space-2)', border: '1px solid var(--hmi-border)', borderRadius: 'var(--r-0)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
              CONSUMABLES STOWAGE
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--hmi-text)' }}>
              {stowageM3} m³ ({stowagePct.toFixed(1)}%)
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
              CTBE lockers, water tanks, dry food rations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

