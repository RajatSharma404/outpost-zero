'use client';

import React from 'react';
import { useGameStore } from '../../store/game';
import {
  calculateCrewMemberMetabolism,
  calculateMenuDailySpecs,
  type MenuType,
} from '../../src/engine';

export function ManifestStowageView() {
  const { coupledConfig, setMenuType } = useGameStore();
  const crew = coupledConfig.crew;
  const vehicle = coupledConfig.vehicle;
  const menuType = coupledConfig.menuType;

  const totalMissionDays =
    coupledConfig.phaseDurations.outbound +
    coupledConfig.phaseDurations.surface +
    coupledConfig.phaseDurations.return;

  const crewMemberDays = crew.length * totalMissionDays;

  // Calculate food requirements using calculateMenuDailySpecs
  const dailyFoodSpecs = crew.map((cm) => calculateMenuDailySpecs(cm, menuType));
  const dailyShippedFoodKg = dailyFoodSpecs.reduce((sum, f) => sum + f.asShippedFoodKg, 0);
  const dailyStowageVolumeM3 = dailyFoodSpecs.reduce((sum, f) => sum + f.lockerVolumeM3 + f.freezerVolumeM3, 0);
  const totalFoodShippedKg = dailyShippedFoodKg * totalMissionDays * coupledConfig.intakeFraction;
  const totalFoodStowageVolumeM3 = dailyStowageVolumeM3 * totalMissionDays * coupledConfig.intakeFraction;

  // Calculate consumables
  const waterPerDay = crew.reduce((sum, cm) => sum + calculateCrewMemberMetabolism(cm).fluidTargetL, 0);
  const o2PerDay = crew.reduce((sum, cm) => sum + calculateCrewMemberMetabolism(cm).o2ConsumptionKg, 0);

  // Buffer days (30 days contingency open loop reserve)
  const bufferDays = coupledConfig.openLoopBackupDays;
  const waterKg = waterPerDay * bufferDays + 500; // 500 kg minimum vehicle loop charge
  const waterVolumeM3 = waterKg / 1000;

  const o2Kg = o2PerDay * bufferDays + 150; // loop charge
  const o2VolumeM3 = (o2Kg / 1141) * 2.5; // cryo tankage factor

  const n2Kg = 80;
  const n2VolumeM3 = 0.2;

  // Non-food consumables (BVAD / DLR: 0.5 kg hygiene + 0.5 kg clothing per CM-d)
  const hygieneKg = crewMemberDays * 0.5;
  const hygieneVolumeM3 = hygieneKg * 0.002;

  const clothingKg = crewMemberDays * 0.5;
  const clothingVolumeM3 = clothingKg * 0.003;

  // ECLSS hardware mass, volume, and spares
  const hardwareMassKg = coupledConfig.eclssUnits.reduce((sum, u) => sum + u.massKg, 0);
  const hardwareVolumeM3 = coupledConfig.eclssUnits.reduce((sum, u) => sum + u.volumeM3, 0);
  const sparesCount = coupledConfig.eclssUnits.reduce((sum, u) => sum + u.sparesCarried, 0);
  const sparesMassKg = sparesCount * 80; // ~80 kg per spare ORU
  const sparesVolumeM3 = sparesCount * 0.15;

  const totalCargoMassKg =
    waterKg +
    o2Kg +
    n2Kg +
    totalFoodShippedKg +
    hygieneKg +
    clothingKg +
    hardwareMassKg +
    sparesMassKg +
    coupledConfig.shieldingMassKg;

  const totalStowageVolumeM3 =
    waterVolumeM3 +
    o2VolumeM3 +
    n2VolumeM3 +
    totalFoodStowageVolumeM3 +
    hygieneVolumeM3 +
    clothingVolumeM3 +
    sparesVolumeM3;

  const totalSystemsVolumeM3 = vehicle.systemsVolumeM3 + hardwareVolumeM3;

  // Mass & Volume margins
  const massCapacityKg = vehicle.massCapacityKg;
  const massMarginKg = massCapacityKg - totalCargoMassKg;
  const isMassOver = massMarginKg < 0;

  const volumeCapacityM3 = vehicle.pressurizedVolumeM3;
  const netHabitableVolumeM3 = Math.max(0, volumeCapacityM3 - (totalStowageVolumeM3 + totalSystemsVolumeM3));
  const nhvPerPersonM3 = crew.length > 0 ? netHabitableVolumeM3 / crew.length : 0;
  const isVolumeOver = totalStowageVolumeM3 + totalSystemsVolumeM3 > volumeCapacityM3;

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
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--hmi-border)',
          paddingBottom: 'var(--space-3)',
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
            Payload Manifest & Stowage Cube
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
            Coupled mass (t) and pressurized volume (m³) tracking across {crewMemberDays.toLocaleString()} crew-member-days
          </span>
        </div>

        {/* Menu Tier Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <label style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-detail)', color: 'var(--hmi-text-dim)' }}>
            BVAD Menu Tier:
          </label>
          <select
            value={menuType}
            onChange={(e) => setMenuType(e.target.value as MenuType)}
            style={{
              padding: 'var(--space-1) var(--space-2)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              borderRadius: 'var(--r-0)',
            }}
          >
            <option value="standard">Standard (42% moisture, 1.23 kg/CM-d)</option>
            <option value="low_moisture">Low-Moisture (28% moisture, 0.99 kg/CM-d)</option>
            <option value="frozen">Frozen Hybrid (52% moisture + freezer locker)</option>
          </select>
        </div>
      </div>

      {/* Dual Mass & Volume Budget Bars */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Mass Bar */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: `1px solid ${isMassOver ? 'var(--alarm-p1)' : 'var(--hmi-border)'}`,
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--hmi-text)' }}>
              PAYLOAD MASS: <strong>{(totalCargoMassKg / 1000).toFixed(2)} t</strong> / {(massCapacityKg / 1000).toFixed(1)} t
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-label)',
                color: isMassOver ? 'var(--alarm-p1)' : 'var(--sage)',
                fontWeight: 700,
              }}
            >
              {isMassOver
                ? `▲ OVERLOAD: +${(Math.abs(massMarginKg) / 1000).toFixed(2)} t`
                : `✓ MARGIN: ${(massMarginKg / 1000).toFixed(2)} t`}
            </span>
          </div>

          <div
            style={{
              height: '14px',
              backgroundColor: 'var(--hmi-track)',
              position: 'relative',
              borderRadius: 'var(--r-0)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (totalCargoMassKg / massCapacityKg) * 100)}%`,
                height: '100%',
                backgroundColor: isMassOver ? 'var(--alarm-p1)' : 'var(--hmi-fill)',
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
            <span>0 t</span>
            <span>Vehicle Rating: {(massCapacityKg / 1000).toFixed(1)} t</span>
          </div>
        </div>

        {/* Volume Bar */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: `1px solid ${isVolumeOver ? 'var(--alarm-p1)' : 'var(--hmi-border)'}`,
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--hmi-text)' }}>
              PRESSURIZED VOLUME: <strong>{(totalStowageVolumeM3 + totalSystemsVolumeM3).toFixed(1)} m³</strong> / {volumeCapacityM3} m³
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-label)',
                color: isVolumeOver ? 'var(--alarm-p1)' : 'var(--sage)',
                fontWeight: 700,
              }}
            >
              {isVolumeOver
                ? `▲ OVERFLOW: -${(volumeCapacityM3 - (totalStowageVolumeM3 + totalSystemsVolumeM3)).toFixed(1)} m³`
                : `✓ NHV: ${nhvPerPersonM3.toFixed(1)} m³/crew`}
            </span>
          </div>

          <div
            style={{
              height: '14px',
              backgroundColor: 'var(--hmi-track)',
              position: 'relative',
              borderRadius: 'var(--r-0)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${Math.min(100, ((totalStowageVolumeM3 + totalSystemsVolumeM3) / volumeCapacityM3) * 100)}%`,
                height: '100%',
                backgroundColor: isVolumeOver ? 'var(--alarm-p1)' : 'var(--hmi-fill)',
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
            <span>Hull Capacity: {volumeCapacityM3} m³</span>
          </div>
        </div>
      </div>

      {/* Isometric 3D SVG Stowage Cube + Inventory Breakdown Table */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-4)',
          alignItems: 'center',
        }}
      >
        {/* SVG Isometric Stowage Cube */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              color: 'var(--hmi-text)',
              fontWeight: 700,
              marginBottom: 'var(--space-2)',
            }}
          >
            ISOMETRIC STOWAGE CUBE ALLOCATION
          </span>
          <svg
            viewBox="0 0 240 200"
            style={{ width: '100%', maxWidth: '240px', height: 'auto' }}
            aria-label="Isometric Stowage Cube Diagram"
          >
            {/* Base Wireframe Cube */}
            {/* Top Face */}
            <polygon
              points="120,20 200,60 120,100 40,60"
              fill="var(--hmi-track)"
              stroke="var(--hmi-border)"
              strokeWidth="1.5"
            />
            {/* Left Face - Divided into Food, Water, Hygiene */}
            <polygon
              points="40,60 120,100 120,140 40,100"
              fill="var(--tier-study)"
              stroke="var(--hmi-border)"
              strokeWidth="1.5"
            />
            <polygon
              points="40,100 120,140 120,165 40,125"
              fill="var(--tier-req)"
              stroke="var(--hmi-border)"
              strokeWidth="1.5"
            />
            <polygon
              points="40,125 120,165 120,185 40,145"
              fill="var(--tier-obs)"
              stroke="var(--hmi-border)"
              strokeWidth="1.5"
            />

            {/* Right Face - Systems, Spares, Shielding */}
            <polygon
              points="120,100 200,60 200,110 120,150"
              fill="var(--hmi-fill)"
              stroke="var(--hmi-border)"
              strokeWidth="1.5"
            />
            <polygon
              points="120,150 200,110 200,135 120,175"
              fill="var(--tier-student)"
              stroke="var(--hmi-border)"
              strokeWidth="1.5"
            />
            <polygon
              points="120,175 200,135 200,145 120,185"
              fill="var(--oxide)"
              stroke="var(--hmi-border)"
              strokeWidth="1.5"
            />

            {/* Labels */}
            <text x="120" y="55" textAnchor="middle" fill="var(--hmi-text)" fontSize="10" fontFamily="monospace">
              HABITABLE (NHV)
            </text>
            <text x="65" y="110" fill="var(--color-basalt)" fontSize="9" fontWeight="bold" fontFamily="monospace">
              FOOD/H2O
            </text>
            <text x="145" y="125" fill="var(--ink)" fontSize="9" fontWeight="bold" fontFamily="monospace">
              SYSTEMS/SPARES
            </text>
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              color: 'var(--hmi-text-dim)',
              marginTop: 'var(--space-1)',
            }}
          >
            Total Stowage Volume: {totalStowageVolumeM3.toFixed(1)} m³ | Systems: {totalSystemsVolumeM3.toFixed(1)} m³
          </span>
        </div>

        {/* Stowage Table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid var(--hmi-border)', color: 'var(--hmi-text-dim)' }}>
                <th style={{ textAlign: 'left', padding: 'var(--space-1)' }}>Inventory Stream</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-1)' }}>Mass (kg)</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-1)' }}>Vol (m³)</th>
                <th style={{ textAlign: 'right', padding: 'var(--space-1)' }}>Tier</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--hmi-border)' }}>
                <td style={{ padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>Potable Water Buffer</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>{waterKg.toFixed(0)}</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>{waterVolumeM3.toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--tier-req)' }}>REQ</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--hmi-border)' }}>
                <td style={{ padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>Oxygen (O2) + Nitrogen (N2)</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>{(o2Kg + n2Kg).toFixed(0)}</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>{(o2VolumeM3 + n2VolumeM3).toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--tier-req)' }}>REQ</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--hmi-border)' }}>
                <td style={{ padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>Food ({menuType.toUpperCase()})</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>{totalFoodShippedKg.toFixed(0)}</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>{totalFoodStowageVolumeM3.toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--tier-obs)' }}>OBS</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--hmi-border)' }}>
                <td style={{ padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>Hygiene & Clothing</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>{(hygieneKg + clothingKg).toFixed(0)}</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>{(hygieneVolumeM3 + clothingVolumeM3).toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--tier-study)' }}>STUDY</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--hmi-border)' }}>
                <td style={{ padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>ECLSS Spares ({sparesCount} ORUs)</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>{sparesMassKg.toFixed(0)}</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>{sparesVolumeM3.toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--tier-student)' }}>STUDENT</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--hmi-border)' }}>
                <td style={{ padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>Radiation Shielding</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>{coupledConfig.shieldingMassKg.toFixed(0)}</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--hmi-text)' }}>{(coupledConfig.shieldingMassKg / 950).toFixed(2)}</td>
                <td style={{ textAlign: 'right', padding: 'var(--space-1)', color: 'var(--tier-study)' }}>STUDY</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
