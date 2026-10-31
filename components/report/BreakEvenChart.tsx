'use client';

import React, { useMemo } from 'react';
import type { CrewMember } from '../../src/engine';
import { calculateBreakEvenCurves } from '../../src/engine';

interface BreakEvenChartProps {
  crew: CrewMember[];
}

export function BreakEvenChart({ crew }: BreakEvenChartProps) {
  const analysis = useMemo(() => {
    return calculateBreakEvenCurves(crew);
  }, [crew]);

  const data = analysis.dataPoints;
  const maxDays = 1000;
  const filteredData = data.filter((d) => d.days <= maxDays);
  const maxMass = Math.max(...filteredData.map((d) => d.allStoredMassKg));

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 35;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const getX = (days: number) => padLeft + (days / maxDays) * plotW;
  const getY = (massKg: number) => padTop + plotH - (massKg / maxMass) * plotH;

  const storedPath = filteredData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.days)},${getY(d.allStoredMassKg)}`)
    .join(' ');

  const recyclingPath = filteredData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.days)},${getY(d.recyclingOnlyMassKg)}`)
    .join(' ');

  const mixedPath = filteredData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.days)},${getY(d.mixedArchitectureMassKg)}`)
    .join(' ');

  const breakEvenX = getX(analysis.breakEvenDayStoredVsRecycling);

  return (
    <div
      style={{
        backgroundColor: 'var(--hmi-surface)',
        border: '1px solid var(--hmi-border)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
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
            Break-Even Trade-Off Analysis: Consumables vs. Recycling
          </span>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              color: 'var(--hmi-text-dim)',
            }}
          >
            Jones / NASA Advanced Exploration Systems (AES) payload mass scaling trade-off
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
          BREAK-EVEN POINT: <strong style={{ color: 'var(--sage)' }}>~{analysis.breakEvenDayStoredVsRecycling} DAYS</strong>
        </div>
      </div>

      {/* SVG Curve Plot */}
      <div
        style={{
          backgroundColor: 'var(--hmi-surface-elevated)',
          border: '1px solid var(--hmi-border)',
          borderRadius: 'var(--r-1)',
          padding: 'var(--space-3)',
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', maxWidth: `${svgWidth}px`, height: 'auto', margin: '0 auto' }}
          aria-label="Break-Even Trade-Off Curves Chart"
        >
          {/* Grid lines */}
          <line x1={padLeft} y1={padTop} x2={svgWidth - padRight} y2={padTop} stroke="var(--hmi-track)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={padLeft} y1={padTop + plotH * 0.5} x2={svgWidth - padRight} y2={padTop + plotH * 0.5} stroke="var(--hmi-track)" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={padLeft} y1={padTop + plotH} x2={svgWidth - padRight} y2={padTop + plotH} stroke="var(--hmi-border)" strokeWidth="1" />
          <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="var(--hmi-border)" strokeWidth="1" />

          {/* Break-even vertical dashed marker line */}
          {analysis.breakEvenDayStoredVsRecycling > 0 && (
            <g>
              <line
                x1={breakEvenX}
                y1={padTop}
                x2={breakEvenX}
                y2={padTop + plotH}
                stroke="var(--sage)"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text x={breakEvenX} y={padTop - 5} textAnchor="middle" fill="var(--sage)" fontSize="9" fontWeight="bold" fontFamily="monospace">
                Break-Even (~{analysis.breakEvenDayStoredVsRecycling}d)
              </text>
            </g>
          )}

          {/* Curves */}
          {/* 1. All-Stored (Steep red line) */}
          <path d={storedPath} fill="none" stroke="var(--alarm-p1)" strokeWidth="2.5" />

          {/* 2. Recycling Only (Flatter green line) */}
          <path d={recyclingPath} fill="none" stroke="var(--sage)" strokeWidth="2.5" />

          {/* 3. Mixed Architecture (Intermediate amber line) */}
          <path d={mixedPath} fill="none" stroke="var(--caution)" strokeWidth="2" strokeDasharray="4 2" />

          {/* Y Axis Labels */}
          <text x={padLeft - 10} y={padTop + 5} textAnchor="end" fill="var(--hmi-text-dim)" fontSize="10" fontFamily="monospace">
            {(maxMass / 1000).toFixed(0)} t
          </text>
          <text x={padLeft - 10} y={padTop + plotH * 0.5 + 4} textAnchor="end" fill="var(--hmi-text-dim)" fontSize="10" fontFamily="monospace">
            {(maxMass / 2000).toFixed(0)} t
          </text>
          <text x={padLeft - 10} y={padTop + plotH} textAnchor="end" fill="var(--hmi-text-dim)" fontSize="10" fontFamily="monospace">
            0 t
          </text>

          {/* X Axis Labels */}
          <text x={padLeft} y={svgHeight - 10} textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="10" fontFamily="monospace">
            0 d
          </text>
          <text x={getX(200)} y={svgHeight - 10} textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="10" fontFamily="monospace">
            200 d
          </text>
          <text x={getX(500)} y={svgHeight - 10} textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="10" fontFamily="monospace">
            500 d
          </text>
          <text x={getX(1000)} y={svgHeight - 10} textAnchor="middle" fill="var(--hmi-text-dim)" fontSize="10" fontFamily="monospace">
            1,000 d
          </text>
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 'var(--space-2)', fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: 'var(--alarm-p1)' }} />
            <span style={{ color: 'var(--hmi-text)' }}>All-Stored Consumables (Steep mass penalty)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: 'var(--sage)' }} />
            <span style={{ color: 'var(--hmi-text)' }}>Physicochemical Recycling (WRS + Sabatier)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            <span style={{ width: '12px', height: '3px', backgroundColor: 'var(--caution)' }} />
            <span style={{ color: 'var(--hmi-text)' }}>Mixed + 30-Day Open-Loop Contingency</span>
          </div>
        </div>
      </div>
    </div>
  );
}
