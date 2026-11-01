'use client';

import React, { useEffect } from 'react';
import { useGameStore } from '../../store/game';
import { playPriorityAlarm } from '../../lib/sound';
import type { DailyStepResult } from '../../src/engine';

interface L1MissionOverviewProps {
  currentStep: DailyStepResult;
  totalDays: number;
}

export function L1MissionOverview({ currentStep, totalDays }: L1MissionOverviewProps) {
  const { coupledConfig, audioMuted } = useGameStore();
  const crewCount = coupledConfig.crew.length;

  // Read net depletion rates and operating margins from engine step
  const netWaterRate = currentStep.netWaterDepletionRateKgPerDay ?? 0;
  const netO2Rate = currentStep.netO2DepletionRateKgPerDay ?? 0;
  const waterMarginDays = currentStep.waterMarginDays ?? 999;
  const waterMarginPct = currentStep.waterMarginPct ?? 100;
  const o2MarginDays = currentStep.o2MarginDays ?? 999;
  const o2MarginPct = currentStep.o2MarginPct ?? 100;
  const waterDaysUntilLimit = currentStep.waterDaysUntilLimit ?? 9999;
  const o2DaysUntilLimit = currentStep.o2DaysUntilLimit ?? 9999;

  // Food margin calculation vs remaining mission + 30d open-loop backup
  const remainingMissionDays = Math.max(0, totalDays - currentStep.day);
  const requiredDaysWithBackup = remainingMissionDays + (coupledConfig.openLoopBackupDays || 30);
  const dailyFoodBurnKg = Math.abs(currentStep.foodSurplusOrDeficitKg) || (crewCount * 1.83);
  const foodDaysUntilLimit = Math.floor(currentStep.foodRemainingKg / dailyFoodBurnKg);
  const foodMarginDays = foodDaysUntilLimit - requiredDaysWithBackup;
  const foodMarginPct = Math.round((foodMarginDays / requiredDaysWithBackup) * 100);

  // Active alarms classification
  const criticalAlarms = currentStep.activeAlarms.filter((a) =>
    a.includes('CRITICAL') || a.includes('EXCEEDS') || a.includes('DEFICIT') || a.includes('FAIL')
  );
  const warningAlarms = currentStep.activeAlarms.filter((a) => !criticalAlarms.includes(a));

  // Audio alarm triggers on state change
  useEffect(() => {
    if (!audioMuted) {
      if (criticalAlarms.length > 0) {
        playPriorityAlarm(1);
      } else if (warningAlarms.length > 0) {
        playPriorityAlarm(2);
      }
    }
  }, [criticalAlarms.length, warningAlarms.length, audioMuted]);

  // Phase progress
  const phase = currentStep.phase;
  const day = currentStep.day;
  const sol = currentStep.sol;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        backgroundColor: 'var(--hmi-surface)',
        border: '1px solid var(--hmi-border)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-3)',
      }}
    >
      {/* Flight Timeline Tape */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--hmi-border)',
          paddingBottom: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-numeral)',
              lineHeight: 1,
              fontWeight: 700,
              color: 'var(--hmi-text)',
            }}
          >
            SOL {String(sol).padStart(3, '0')}
          </span>
          <div>
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-lead)',
                fontWeight: 700,
                color: 'var(--hmi-text)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              MISSION DAY {day} / {totalDays}
            </span>
            <span
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                color: 'var(--hmi-text-dim)',
              }}
            >
              PHASE: <strong>{phase.toUpperCase()}</strong> ({phase === 'surface' ? '1 sol = 1.0275 d' : 'Deep Space Transit'})
            </span>
          </div>
        </div>

        {/* Mass Balance Audit Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: 'var(--space-1) var(--space-3)',
            backgroundColor: currentStep.massBalanceAudit.withinTolerance ? 'var(--hmi-surface-elevated)' : 'var(--alarm-p1-bg)',
            border: `1px solid ${currentStep.massBalanceAudit.withinTolerance ? 'var(--hmi-border)' : 'var(--alarm-p1)'}`,
            borderRadius: 'var(--r-0)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
          }}
        >
          <span style={{ color: 'var(--hmi-text-dim)' }}>MASS-BALANCE CONSERVATION:</span>
          <strong style={{ color: currentStep.massBalanceAudit.withinTolerance ? 'var(--sage)' : 'var(--alarm-p1)' }}>
            Δ {currentStep.massBalanceAudit.deltaKg.toFixed(2)} kg ({currentStep.massBalanceAudit.errorPct.toFixed(2)}%)
          </strong>
        </div>
      </div>

      {/* Alarm Banner if any metric abnormal */}
      {currentStep.activeAlarms.length > 0 && (
        <div
          style={{
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: criticalAlarms.length > 0 ? 'var(--alarm-p1-bg)' : 'var(--alarm-p2-bg)',
            border: `1px solid ${criticalAlarms.length > 0 ? 'var(--alarm-p1)' : 'var(--alarm-p2)'}`,
            borderRadius: 'var(--r-0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                padding: 'var(--space-quarter) var(--space-1)',
                backgroundColor: criticalAlarms.length > 0 ? 'var(--alarm-p1)' : 'var(--alarm-p2)',
                color: 'var(--color-basalt)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                borderRadius: 'var(--r-0)',
              }}
            >
              {criticalAlarms.length > 0 ? '▲ PRIORITY 1 ALARM' : '▲ PRIORITY 2 WARNING'}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                fontWeight: 600,
                color: criticalAlarms.length > 0 ? 'var(--alarm-p1)' : 'var(--alarm-p2)',
              }}
            >
              {currentStep.activeAlarms.join(' | ')}
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
            ISA-101 ABNORMAL TELEMETRY
          </span>
        </div>
      )}

      {/* 4-Band Analog Operating Reserve Gauges with Net Depletion & Mission Margin */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-2)',
        }}
      >
        {/* Potable Water Gauge */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: `1px solid ${waterMarginDays < 30 ? 'var(--alarm-p2)' : 'var(--hmi-border)'}`,
            padding: 'var(--space-2)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-detail)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--hmi-text-dim)' }}>WATER MARGIN</span>
            <strong style={{ color: waterMarginDays < 30 ? 'var(--alarm-p2)' : 'var(--hmi-text)' }}>
              {waterMarginDays >= 999 ? '>999 d' : `${waterMarginDays} d`} ({waterMarginPct}%)
            </strong>
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
                width: `${Math.min(100, Math.max(0, waterMarginDays >= 999 ? 100 : (waterMarginDays / 120) * 100))}%`,
                height: '100%',
                backgroundColor: waterMarginDays < 0 ? 'var(--alarm-p1)' : waterMarginDays < 30 ? 'var(--alarm-p2)' : 'var(--hmi-fill)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-mono)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-quarter)' }}>
            <span>Net: {netWaterRate.toFixed(2)} kg/d</span>
            <span>Limit: {waterDaysUntilLimit >= 9999 ? 'Sustainable' : `${waterDaysUntilLimit} d`}</span>
          </div>
        </div>

        {/* Oxygen Gauge */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: `1px solid ${o2MarginDays < 30 ? 'var(--alarm-p2)' : 'var(--hmi-border)'}`,
            padding: 'var(--space-2)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-detail)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--hmi-text-dim)' }}>O2 MARGIN</span>
            <strong style={{ color: o2MarginDays < 30 ? 'var(--alarm-p2)' : 'var(--hmi-text)' }}>
              {o2MarginDays >= 999 ? '>999 d' : `${o2MarginDays} d`} ({o2MarginPct}%)
            </strong>
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
                width: `${Math.min(100, Math.max(0, o2MarginDays >= 999 ? 100 : (o2MarginDays / 120) * 100))}%`,
                height: '100%',
                backgroundColor: o2MarginDays < 0 ? 'var(--alarm-p1)' : o2MarginDays < 30 ? 'var(--alarm-p2)' : 'var(--hmi-fill)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-mono)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-quarter)' }}>
            <span>Net: {netO2Rate.toFixed(2)} kg/d</span>
            <span>Limit: {o2DaysUntilLimit >= 9999 ? 'Sustainable' : `${o2DaysUntilLimit} d`}</span>
          </div>
        </div>

        {/* Food Gauge */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: `1px solid ${foodMarginDays < 30 ? 'var(--alarm-p2)' : 'var(--hmi-border)'}`,
            padding: 'var(--space-2)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-detail)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--hmi-text-dim)' }}>FOOD MARGIN</span>
            <strong style={{ color: foodMarginDays < 30 ? 'var(--alarm-p2)' : 'var(--hmi-text)' }}>
              {foodMarginDays} d ({foodMarginPct}%)
            </strong>
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
                width: `${Math.min(100, Math.max(0, (foodMarginDays / 120) * 100))}%`,
                height: '100%',
                backgroundColor: foodMarginDays < 0 ? 'var(--alarm-p1)' : foodMarginDays < 30 ? 'var(--alarm-p2)' : 'var(--hmi-fill)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-mono)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-quarter)' }}>
            <span>{currentStep.foodRemainingKg.toFixed(0)} kg</span>
            <span>Limit: {foodDaysUntilLimit} d</span>
          </div>
        </div>

        {/* Cabin ppCO2 Gauge with Hours-to-Limit */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: `1px solid ${currentStep.ppCo2MmHg > 3.0 ? 'var(--alarm-p1)' : 'var(--hmi-border)'}`,
            padding: 'var(--space-2)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-detail)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--hmi-text-dim)' }}>ppCO2 ATMOSPHERE</span>
            <strong style={{ color: currentStep.ppCo2MmHg > 3.0 ? 'var(--alarm-p1)' : currentStep.ppCo2MmHg > 2.5 ? 'var(--caution)' : 'var(--hmi-text)' }}>
              {currentStep.ppCo2MmHg.toFixed(2)} mmHg
            </strong>
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
            {/* 3.0 mmHg limit line */}
            <div
              style={{
                position: 'absolute',
                left: `${(3.0 / 6.0) * 100}%`,
                top: 0,
                bottom: 0,
                width: '2px',
                backgroundColor: 'var(--alarm-p1)',
                zIndex: 2,
              }}
            />
            <div
              style={{
                width: `${Math.min(100, (currentStep.ppCo2MmHg / 6.0) * 100)}%`,
                height: '100%',
                backgroundColor: currentStep.ppCo2MmHg > 3.0 ? 'var(--alarm-p1)' : currentStep.ppCo2MmHg > 2.5 ? 'var(--caution)' : 'var(--hmi-fill)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-mono)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-quarter)' }}>
            <span>Limit: 3.0 mmHg</span>
            <span>TT Limit: {currentStep.hoursToCo2Limit.toFixed(1)} h</span>
          </div>
        </div>

        {/* Cumulative Radiation Dose */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-2)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-detail)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--hmi-text-dim)' }}>RADIATION DOSE</span>
            <strong style={{ color: currentStep.cumulativeRadiationMsv > 600 ? 'var(--alarm-p1)' : 'var(--hmi-text)' }}>
              {currentStep.cumulativeRadiationMsv.toFixed(1)} mSv
            </strong>
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
                width: `${Math.min(100, (currentStep.cumulativeRadiationMsv / 600) * 100)}%`,
                height: '100%',
                backgroundColor: currentStep.cumulativeRadiationMsv > 600 ? 'var(--alarm-p1)' : 'var(--oxide)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-mono)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-quarter)' }}>
            <span>Career Cap: 600 mSv</span>
            <span>{((currentStep.cumulativeRadiationMsv / 600) * 100).toFixed(0)}% Cap</span>
          </div>
        </div>
      </div>
    </div>
  );
}

