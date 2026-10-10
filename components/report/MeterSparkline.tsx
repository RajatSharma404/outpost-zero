'use client';

import React from 'react';

interface SparklinePoint {
  sol: number;
  value: number;
}

interface MeterSparklineProps {
  label: string;
  data: SparklinePoint[];
  unit: string;
  color?: string;
  maxBaseline?: number;
}

export const MeterSparkline: React.FC<MeterSparklineProps> = ({
  label,
  data,
  unit,
  color = 'var(--ember)',
  maxBaseline,
}) => {
  if (!data || data.length === 0) return null;

  const width = 280;
  const height = 70;
  const paddingX = 10;
  const paddingY = 8;

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, maxBaseline || 1);
  const range = maxVal - minVal || 1;

  const lastValue = values[values.length - 1];

  // Map points to SVG coordinates
  const points = data.map((d, idx) => {
    const x = paddingX + (idx / Math.max(1, data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.value - minVal) / range) * (height - paddingY * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;

  return (
    <div
      style={{
        backgroundColor: 'var(--basalt)',
        border: '1px solid var(--rule)',
        borderRadius: 'var(--r-1)',
        padding: 'var(--space-3)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
        <span
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-label)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--ink-dim)',
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-body)',
            fontWeight: 700,
            color: 'var(--ink)',
          }}
        >
          {Math.round(lastValue).toLocaleString()} {unit}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        role="img"
        aria-label={`${label} telemetry trend line`}
      >
        {/* Zero / Baseline reference line */}
        <line
          x1={paddingX}
          y1={height - paddingY}
          x2={width - paddingX}
          y2={height - paddingY}
          stroke="var(--rule)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Hand-written SVG Sparkline Path */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Current Endpoint Dot */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].split(',')[0]}
            cy={points[points.length - 1].split(',')[1]}
            r={3}
            fill={color}
          />
        )}
      </svg>
    </div>
  );
};
