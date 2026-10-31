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

  // Derive days of supply remaining based on current daily consumption
  const waterDaysRemaining = currentStep.potableWaterRemainingKg > 0 ? Math.floor(currentStep.potableWaterRemainingKg / (crewCount * 2.5)) : 0;
  const o2DaysRemaining = currentStep.o2RemainingKg > 0 ? Math.floor(currentStep.o2RemainingKg / (crewCount * 0.84)) : 0;
  const foodDaysRemaining = currentStep.foodRemainingKg > 0 ? Math.floor(currentStep.foodRemainingKg / (crewCount * 1.23)) : 0;

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
                color: 'var(--oxide)',
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

      {/* 4-Band Analog Operating Reserve Gauges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 'var(--space-2)',
        }}
      >
        {/* Potable Water Gauge */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-2)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-detail)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--hmi-text-dim)' }}>WATER SUPPLY</span>
            <strong style={{ color: waterDaysRemaining < 10 ? 'var(--alarm-p1)' : 'var(--hmi-text)' }}>
              {waterDaysRemaining} DAYS
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
                width: `${Math.min(100, (waterDaysRemaining / 60) * 100)}%`,
                height: '100%',
                backgroundColor: waterDaysRemaining < 10 ? 'var(--alarm-p1)' : waterDaysRemaining < 30 ? 'var(--caution)' : 'var(--hmi-fill)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-mono)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-quarter)' }}>
            <span>{currentStep.potableWaterRemainingKg.toFixed(0)} kg</span>
            <span>Target: &gt;30 d</span>
          </div>
        </div>

        {/* Oxygen Gauge */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-2)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-detail)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--hmi-text-dim)' }}>O2 INVENTORY</span>
            <strong style={{ color: o2DaysRemaining < 10 ? 'var(--alarm-p1)' : 'var(--hmi-text)' }}>
              {o2DaysRemaining} DAYS
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
                width: `${Math.min(100, (o2DaysRemaining / 60) * 100)}%`,
                height: '100%',
                backgroundColor: o2DaysRemaining < 10 ? 'var(--alarm-p1)' : o2DaysRemaining < 30 ? 'var(--caution)' : 'var(--hmi-fill)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-mono)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-quarter)' }}>
            <span>{currentStep.o2RemainingKg.toFixed(0)} kg</span>
            <span>Target: &gt;30 d</span>
          </div>
        </div>

        {/* Food Gauge */}
        <div
          style={{
            backgroundColor: 'var(--hmi-surface-elevated)',
            border: '1px solid var(--hmi-border)',
            padding: 'var(--space-2)',
            borderRadius: 'var(--r-1)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-detail)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--hmi-text-dim)' }}>FOOD RATIONS</span>
            <strong style={{ color: foodDaysRemaining < 10 ? 'var(--alarm-p1)' : 'var(--hmi-text)' }}>
              {foodDaysRemaining} DAYS
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
                width: `${Math.min(100, (foodDaysRemaining / 60) * 100)}%`,
                height: '100%',
                backgroundColor: foodDaysRemaining < 10 ? 'var(--alarm-p1)' : foodDaysRemaining < 30 ? 'var(--caution)' : 'var(--hmi-fill)',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-caption)', fontFamily: 'var(--font-mono)', color: 'var(--hmi-text-dim)', marginTop: 'var(--space-quarter)' }}>
            <span>{currentStep.foodRemainingKg.toFixed(0)} kg</span>
            <span>Target: &gt;30 d</span>
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
