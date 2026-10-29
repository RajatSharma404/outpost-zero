'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGameStore } from '../../store/game';
import { ITEMS } from '../../lib/data';
import { analyzeLoadout } from '../../lib/sim/loadout';
import { decodeChallenge } from '../../lib/share';
import { MassBar } from '../../components/pack/MassBar';
import { ItemCard } from '../../components/pack/ItemCard';
import { ConsumablesSliders } from '../../components/pack/ConsumablesSliders';
import { LoadoutSummary } from '../../components/pack/LoadoutSummary';
import { Button } from '../../components/ui/Button';

export default function PackPage() {
  const router = useRouter();
  const {
    loadout,
    toggleItem,
    setConsumables,
    setMode,
    setSeed,
    setLoadout,
    startMission,
  } = useGameStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Check URL hash for shared challenge fragment
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const decoded = decodeChallenge(window.location.hash);
      if (decoded) {
        setLoadout(decoded);
      }
    }
  }, [setLoadout]);

  const missionLengthSols = loadout.mode === 'tutorial' ? 60 : loadout.mode === 'standard' ? 180 : 500;

  const analysis = useMemo(() => {
    return analyzeLoadout(loadout, missionLengthSols, ITEMS);
  }, [loadout, missionLengthSols]);

  const packedItems = useMemo(() => {
    return ITEMS.filter((item) => loadout.itemIds.includes(item.id));
  }, [loadout.itemIds]);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return ITEMS;
    return ITEMS.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const handleLaunch = () => {
    if (analysis.mass.isOverBudget) return;
    startMission();
    router.push('/mission');
  };

  const hasRecycler = loadout.itemIds.includes('eclss_recycler');
  const hasMoxie = loadout.itemIds.includes('moxie_scaleup');
  const hasGreenhouse =
    loadout.itemIds.includes('greenhouse_small') || loadout.itemIds.includes('greenhouse_large');

  return (
    <div
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: 'var(--space-4)',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header / Flight Tape */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              color: 'var(--oxide)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            FLIGHT LOGISTICS // SECTION 01: PAYLOAD MANIFEST
          </span>
          <h1
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-display)',
              margin: '2px 0 0 0',
              fontWeight: 700,
              color: 'var(--ink)',
              lineHeight: 1,
            }}
          >
            PACK THE LANDER
          </h1>
        </div>

        <nav style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link
            href="/how-it-works"
            style={{
              color: 'var(--ink-dim)',
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              textTransform: 'uppercase',
              textDecoration: 'none',
              letterSpacing: '0.08em',
              padding: 'var(--space-1) var(--space-2)',
              border: '1px solid var(--rule)',
            }}
          >
            How it Works
          </Link>
          <Link
            href="/sources"
            style={{
              color: 'var(--ink-dim)',
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              textTransform: 'uppercase',
              textDecoration: 'none',
              letterSpacing: '0.08em',
              padding: 'var(--space-1) var(--space-2)',
              border: '1px solid var(--rule)',
            }}
          >
            Sources
          </Link>
        </nav>
      </header>

      {/* Mass Bar Display */}
      <MassBar mass={analysis.mass} packedItems={packedItems} />

      {/* Main 2-Column Responsive Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 360px',
          gap: 'var(--space-6)',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Consumables + Hardware Item Catalog */}
        <main>
          {/* Consumables Sliders */}
          <ConsumablesSliders
            consumables={loadout.consumables}
            days={analysis.consumablesDays}
            missionLengthSols={missionLengthSols}
            hasRecycler={hasRecycler}
            hasMoxie={hasMoxie}
            hasGreenhouse={hasGreenhouse}
            onChange={setConsumables}
          />

          {/* Hardware Catalog Section */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-2)',
                borderBottom: '1px solid var(--rule)',
                paddingBottom: 'var(--space-2)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: 'var(--fs-lead)',
                  margin: 0,
                  fontWeight: 600,
                  color: 'var(--ink)',
                  textTransform: 'uppercase',
                }}
              >
                Hardware Modules ({packedItems.length} Loaded)
              </h2>

              {/* Category Filter Tabs (Accessible Tablist with Arrow Navigation) */}
              <div
                role="tablist"
                aria-label="Hardware module categories"
                style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}
                onKeyDown={(e) => {
                  const categories = ['all', 'power', 'lifesupport', 'shielding', 'food', 'spares', 'comfort'];
                  const currentIndex = categories.indexOf(activeCategory);
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % categories.length;
                    setActiveCategory(categories[nextIndex]);
                    document.getElementById(`tab-cat-${categories[nextIndex]}`)?.focus();
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevIndex = (currentIndex - 1 + categories.length) % categories.length;
                    setActiveCategory(categories[prevIndex]);
                    document.getElementById(`tab-cat-${categories[prevIndex]}`)?.focus();
                  } else if (e.key === 'Home') {
                    e.preventDefault();
                    setActiveCategory(categories[0]);
                    document.getElementById(`tab-cat-${categories[0]}`)?.focus();
                  } else if (e.key === 'End') {
                    e.preventDefault();
                    setActiveCategory(categories[categories.length - 1]);
                    document.getElementById(`tab-cat-${categories[categories.length - 1]}`)?.focus();
                  }
                }}
              >
                {['all', 'power', 'lifesupport', 'shielding', 'food', 'spares', 'comfort'].map((cat) => (
                  <button
                    key={cat}
                    id={`tab-cat-${cat}`}
                    role="tab"
                    aria-selected={activeCategory === cat}
                    tabIndex={activeCategory === cat ? 0 : -1}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--fs-label)',
                      textTransform: 'uppercase',
                      padding: 'var(--space-1) var(--space-2)',
                      border: `1px solid ${activeCategory === cat ? 'var(--ember)' : 'var(--rule)'}`,
                      backgroundColor: activeCategory === cat ? 'var(--ember)' : 'transparent',
                      color: activeCategory === cat ? 'var(--basalt)' : 'var(--ink)',
                      fontWeight: activeCategory === cat ? 700 : 500,
                      cursor: 'pointer',
                      borderRadius: 'var(--r-0)',
                      transition: 'background-color 0.1s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid of Item Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-3)',
              }}
            >
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isPacked={loadout.itemIds.includes(item.id)}
                  onToggle={toggleItem}
                />
              ))}
            </div>
          </div>
        </main>

        {/* Right Column: Sticky Summary & Launch Authorization */}
        <LoadoutSummary
          analysis={analysis}
          mode={loadout.mode}
          seed={loadout.seed}
          missionLengthSols={missionLengthSols}
          onSetMode={setMode}
          onSetSeed={setSeed}
          onLaunch={handleLaunch}
        />
      </div>
    </div>
  );
}
