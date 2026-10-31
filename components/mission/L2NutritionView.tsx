'use client';

import React from 'react';
import { useGameStore } from '../../store/game';
import type { DailyStepResult } from '../../src/engine';

interface L2NutritionViewProps {
  currentStep: DailyStepResult;
}

export function L2NutritionView({ currentStep }: L2NutritionViewProps) {
  const { coupledConfig } = useGameStore();
  const crew = coupledConfig.crew;
  const missionDay = currentStep.day;
  const menuType = coupledConfig.menuType;

  // Approximate shelf-life storage time: predeployed lead time (26 months) + mission days
  const totalStorageMonths = coupledConfig.predeployedFoodLeadTimeMonths + missionDay / 30.4;

  // Nutrient retention kinetics (ambient storage degradation):
  // Thiamin (B1): loses ~2.5% per month
  // Vitamin C: loses ~3.0% per month
  const thiaminRetentionPct = Math.max(25, 100 * Math.pow(0.975, totalStorageMonths));
  const vitaminCRetentionPct = Math.max(20, 100 * Math.pow(0.970, totalStorageMonths));

  // Microgravity / Hypogravity bone deconditioning: ~0.8% loss per month on surface (1.2% in cruise)
  const isCruise = currentStep.phase !== 'surface';
  const monthlyBoneLossRate = isCruise ? 0.012 : 0.006;
  const boneDensityPct = Math.max(75, 100 * (1 - (missionDay / 30.4) * monthlyBoneLossRate));

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
            L2 Subsystem: Nutrition, Vitamin Shelf-Life & Deconditioning
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
            NASA JSC-67378 Rev 1 macronutrient requirements and degradation kinetics across {totalStorageMonths.toFixed(1)} months storage
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
          MENU PROFILE: <strong style={{ color: 'var(--ember)' }}>{menuType.toUpperCase()}</strong>
        </div>
      </div>

      {/* Vitamin Shelf-Life Tracker Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-3)',
        }}
      >
        {/* Thiamin Card */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: `1px solid ${thiaminRetentionPct < 60 ? 'var(--alarm-p2)' : 'var(--hmi-border)'}`,
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--hmi-text)' }}>
              THIAMIN (VITAMIN B1) RETENTION
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                color: thiaminRetentionPct < 60 ? 'var(--alarm-p2)' : 'var(--sage)',
                fontWeight: 700,
              }}
            >
              {thiaminRetentionPct.toFixed(1)}%
            </span>
          </div>

          <div
            style={{
              height: '8px',
              backgroundColor: 'var(--hmi-track)',
              marginTop: 'var(--space-1)',
              position: 'relative',
              borderRadius: 'var(--r-0)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${thiaminRetentionPct}%`,
                height: '100%',
                backgroundColor: thiaminRetentionPct < 60 ? 'var(--alarm-p2)' : 'var(--sage)',
              }}
            />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-1)' }}>
            RDA Target: 1.2 mg/d | Loss Rate: ~2.5%/month ambient storage
          </div>
        </div>

        {/* Vitamin C Card */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: `1px solid ${vitaminCRetentionPct < 50 ? 'var(--alarm-p1)' : 'var(--hmi-border)'}`,
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--hmi-text)' }}>
              VITAMIN C (ASCORBIC ACID)
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                color: vitaminCRetentionPct < 50 ? 'var(--alarm-p1)' : 'var(--sage)',
                fontWeight: 700,
              }}
            >
              {vitaminCRetentionPct.toFixed(1)}%
            </span>
          </div>

          <div
            style={{
              height: '8px',
              backgroundColor: 'var(--hmi-track)',
              marginTop: 'var(--space-1)',
              position: 'relative',
              borderRadius: 'var(--r-0)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${vitaminCRetentionPct}%`,
                height: '100%',
                backgroundColor: vitaminCRetentionPct < 50 ? 'var(--alarm-p1)' : 'var(--sage)',
              }}
            />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-1)' }}>
            RDA Target: 110–125 mg/d | Critical shelf-life floor: 50%
          </div>
        </div>

        {/* Bone Mineral Density Card */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: `1px solid ${boneDensityPct < 85 ? 'var(--caution)' : 'var(--hmi-border)'}`,
            padding: 'var(--space-3)',
            borderRadius: 'var(--r-1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', fontWeight: 700, color: 'var(--hmi-text)' }}>
              BONE MINERAL DENSITY (BMD)
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                color: boneDensityPct < 85 ? 'var(--caution)' : 'var(--sage)',
                fontWeight: 700,
              }}
            >
              {boneDensityPct.toFixed(1)}%
            </span>
          </div>

          <div
            style={{
              height: '8px',
              backgroundColor: 'var(--hmi-track)',
              marginTop: 'var(--space-1)',
              position: 'relative',
              borderRadius: 'var(--r-0)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${boneDensityPct}%`,
                height: '100%',
                backgroundColor: boneDensityPct < 85 ? 'var(--caution)' : 'var(--sage)',
              }}
            />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-1)' }}>
            Weight-bearing deconditioning: -0.6% to -1.2%/month
          </div>
        </div>
      </div>

      {/* Crew Health & Energy Table */}
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
              <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Astronaut</th>
              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Target EER (kcal/d)</th>
              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Daily Energy (MJ)</th>
              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>Body Mass (kg)</th>
              <th style={{ textAlign: 'right', padding: 'var(--space-2)' }}>BMD Retention</th>
              <th style={{ textAlign: 'left', padding: 'var(--space-2)' }}>Nutrient Status</th>
            </tr>
          </thead>
          <tbody>
            {crew.map((cm, i) => {
              const status = currentStep.crewStatus[i] || {
                eerKcal: 3000,
                metabolicMj: 12.5,
                bodyMassKg: cm.massKg,
                boneDensityIndex: boneDensityPct / 100,
              };
              return (
                <tr key={cm.id} style={{ borderBottom: '1px solid var(--hmi-border)' }}>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)', fontWeight: 600 }}>{cm.name}</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>{status.eerKcal.toFixed(0)}</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>{status.metabolicMj.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>{status.bodyMassKg.toFixed(1)}</td>
                  <td style={{ textAlign: 'right', padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>{(status.boneDensityIndex * 100).toFixed(1)}%</td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--sage)' }}>
                    {thiaminRetentionPct < 60 ? 'Thiamin Depleted' : 'Nominal Absorption'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

