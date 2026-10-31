'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CONSTANTS_REGISTRY,
  type ParameterTier,
  type ConstantCategory,
} from '../../src/engine';

export default function SourcesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<ParameterTier | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<ConstantCategory | 'ALL'>('ALL');

  const allConstants = useMemo(() => Object.values(CONSTANTS_REGISTRY), []);

  const filteredConstants = useMemo(() => {
    return allConstants.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.definition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = selectedTier === 'ALL' || c.tier === selectedTier;
      const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
      return matchesSearch && matchesTier && matchesCategory;
    });
  }, [allConstants, searchTerm, selectedTier, selectedCategory]);

  const categories: ConstantCategory[] = [
    'metabolism',
    'nutrition',
    'water',
    'atmosphere',
    'radiation',
    'vehicles',
    'eclss',
    'mission',
    'contingency',
  ];

  const tiers: ParameterTier[] = ['REQ', 'OBS', 'STUDY', 'STUDENT'];

  const getTierColor = (tier: ParameterTier) => {
    switch (tier) {
      case 'REQ':
        return 'var(--tier-req)';
      case 'OBS':
        return 'var(--tier-obs)';
      case 'STUDY':
        return 'var(--tier-study)';
      case 'STUDENT':
        return 'var(--tier-student)';
    }
  };

  return (
    <div
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--space-4)',
        boxSizing: 'border-box',
        minHeight: '100vh',
        backgroundColor: 'var(--hmi-bg)',
        color: 'var(--hmi-text)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--hmi-border)',
          paddingBottom: 'var(--space-3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Link
              href="/mission"
              style={{
                color: 'var(--hmi-text-dim)',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
              }}
            >
              ← MISSION TELEMETRY
            </Link>
            <span style={{ color: 'var(--hmi-border)' }}>|</span>
            <span
              style={{
                fontFamily: 'var(--font-condensed)',
                fontSize: 'var(--fs-lead)',
                color: 'var(--oxide)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              CONSTANTS REGISTRY // SCIENTIFIC BIBLIOGRAPHY
            </span>
          </div>
          <span
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--hmi-text-dim)',
              marginTop: 'var(--space-quarter)',
            }}
          >
            Tiered engineering parameters: NASA-STD-3001, BVAD Rev 2, DRA 5.0 & empirical spaceflight data
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link
            href="/pack"
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              borderRadius: 'var(--r-0)',
            }}
          >
            PLANNER WIZARD
          </Link>
          <Link
            href="/how-it-works"
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              textDecoration: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              borderRadius: 'var(--r-0)',
            }}
          >
            MODEL SPECIFICATION (MODEL.md)
          </Link>
        </div>
      </header>

      {/* Filter and Search Bar */}
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
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search constants by name, citation, or parameter key..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '280px',
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              borderRadius: 'var(--r-0)',
            }}
          />

          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
            Showing {filteredConstants.length} of {allConstants.length} constants
          </span>
        </div>

        {/* Tier Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
            FILTER TIER:
          </span>
          <button
            type="button"
            onClick={() => setSelectedTier('ALL')}
            style={{
              padding: 'var(--space-quarter) var(--space-2)',
              backgroundColor: selectedTier === 'ALL' ? 'var(--hmi-nominal)' : 'transparent',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            ALL TIERS
          </button>
          {tiers.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setSelectedTier(t)}
              style={{
                padding: 'var(--space-quarter) var(--space-2)',
                backgroundColor: selectedTier === t ? getTierColor(t) : 'transparent',
                border: `1px solid ${getTierColor(t)}`,
                color: selectedTier === t ? 'var(--color-basalt)' : getTierColor(t),
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                cursor: 'pointer',
                borderRadius: 'var(--r-0)',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Category Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-caption)', color: 'var(--hmi-text-dim)' }}>
            CATEGORY:
          </span>
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            style={{
              padding: 'var(--space-quarter) var(--space-1)',
              backgroundColor: selectedCategory === 'ALL' ? 'var(--hmi-surface-elevated)' : 'transparent',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-caption)',
              cursor: 'pointer',
              borderRadius: 'var(--r-0)',
            }}
          >
            ALL
          </button>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: 'var(--space-quarter) var(--space-2)',
                backgroundColor: selectedCategory === cat ? 'var(--hmi-surface-elevated)' : 'transparent',
                border: '1px solid var(--hmi-border)',
                color: selectedCategory === cat ? 'var(--ember)' : 'var(--hmi-text-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                cursor: 'pointer',
                borderRadius: 'var(--r-0)',
                textTransform: 'uppercase',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Constants Table */}
      <div
        style={{
          backgroundColor: 'var(--hmi-surface)',
          border: '1px solid var(--hmi-border)',
          borderRadius: 'var(--r-1)',
          overflowX: 'auto',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-detail)',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--hmi-border)',
                backgroundColor: 'var(--hmi-surface-elevated)',
                color: 'var(--hmi-text-dim)',
              }}
            >
              <th style={{ padding: 'var(--space-2)' }}>Key / Parameter Name</th>
              <th style={{ padding: 'var(--space-2)' }}>Value & Unit</th>
              <th style={{ padding: 'var(--space-2)' }}>Tier</th>
              <th style={{ padding: 'var(--space-2)' }}>Confidence</th>
              <th style={{ padding: 'var(--space-2)' }}>Official Source</th>
              <th style={{ padding: 'var(--space-2)' }}>Engineering Definition</th>
            </tr>
          </thead>
          <tbody>
            {filteredConstants.map((c, idx) => (
              <tr
                key={c.id}
                style={{
                  borderBottom: '1px solid var(--hmi-border)',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--hmi-surface-elevated)',
                }}
              >
                <td style={{ padding: 'var(--space-2)' }}>
                  <div style={{ color: 'var(--hmi-text)', fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: 'var(--hmi-text-dim)', fontSize: 'var(--fs-caption)' }}><code>{c.id}</code></div>
                </td>
                <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {typeof c.value === 'number' ? c.value.toLocaleString() : String(c.value)} {c.unit}
                </td>
                <td style={{ padding: 'var(--space-2)' }}>
                  <span
                    style={{
                      padding: 'var(--space-quarter) var(--space-1)',
                      backgroundColor: getTierColor(c.tier),
                      color: 'var(--color-basalt)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--fs-caption)',
                      fontWeight: 700,
                      borderRadius: 'var(--r-0)',
                    }}
                  >
                    {c.tier}
                  </span>
                </td>
                <td style={{ padding: 'var(--space-2)' }}>
                  <span
                    style={{
                      color: c.confidence === 'HIGH' ? 'var(--sage)' : c.confidence === 'MEDIUM' ? 'var(--caution)' : 'var(--alarm-p1)',
                      fontWeight: 700,
                    }}
                  >
                    {c.confidence}
                  </span>
                </td>
                <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>
                  {c.source}
                </td>
                <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text-dim)', fontSize: 'var(--fs-caption)', maxWidth: '380px' }}>
                  {c.definition}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
