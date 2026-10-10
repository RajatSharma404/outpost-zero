import React from 'react';
import Link from 'next/link';
import { CONSTANTS, SOURCES } from '../../lib/data';
import { Tag } from '../../components/ui/Tag';

export default function HowItWorksPage() {
  const sourceMap = new Map(SOURCES.map((s) => [s.id, s]));

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-4)',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--rule)',
          paddingBottom: 'var(--space-3)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
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
            TECHNICAL ARCHITECTURE // SYSTEMS MODEL MANUAL
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
            HOW THE SIMULATION WORKS
          </h1>
        </div>

        <nav style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link
            href="/pack"
            style={{
              color: 'var(--ink-dim)',
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: 'var(--space-1) var(--space-2)',
              border: '1px solid var(--rule)',
            }}
          >
            Pack Screen
          </Link>
          <Link
            href="/sources"
            style={{
              color: 'var(--ink-dim)',
              fontFamily: 'var(--font-condensed)',
              fontSize: 'var(--fs-label)',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: 'var(--space-1) var(--space-2)',
              border: '1px solid var(--rule)',
            }}
          >
            Bibliography & Sources
          </Link>
        </nav>
      </header>

      {/* Overview Intro */}
      <section style={{ marginBottom: 'var(--space-6)' }}>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'var(--fs-lead)',
            lineHeight: 1.6,
            color: 'var(--ink)',
            margin: '0 0 var(--space-4) 0',
          }}
        >
          Outpost Zero models a human surface expedition on Mars as a deterministic, pure mathematical systems loop.
          Every decision carries an unavoidable physical trade-off: mass shipped from Earth competes directly against
          power consumption, life support closure, and crew survival margins.
        </p>
      </section>

      {/* 5 Core Resource Loops */}
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-lead)',
            textTransform: 'uppercase',
            color: 'var(--ember)',
            borderBottom: '1px solid var(--rule)',
            paddingBottom: 'var(--space-1)',
            marginBottom: 'var(--space-4)',
          }}
        >
          1. The Five Interconnected Resource Loops
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {/* Loop A: Power */}
          <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-4)' }}>
            <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', color: 'var(--ember)', margin: '0 0 var(--space-2) 0' }}>
              ELECTRICAL POWER & STORAGE
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
              The habitat requires <strong>6.0 kW continuous baseload</strong> for thermal heaters, avionics, lighting, and air scrubbers.
              Solar generation produces power according to surface insolation (590 W/m²) but drops sharply during dust storms (tau opacity).
              Fission surface power (Kilopower) provides constant 10 kW day and night, but weighs 6 metric tonnes.
              When batteries deplete, non-critical modules are shed in strict priority to prevent life-support collapse.
            </p>
          </div>

          {/* Loop B: Oxygen */}
          <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-4)' }}>
            <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', color: 'var(--sage)', margin: '0 0 var(--space-2) 0' }}>
              ATMOSPHERIC OXYGEN (O2)
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
              Each crew member consumes <strong>0.84 kg of O2 per sol</strong> (NASA BVAD metabolic baseline).
              A 4-person crew burns 3.36 kg/sol.
              The ECLSS Recycler reclaims 50% of exhaled O2 (recovering 1.68 kg/sol), while the MOXIE Industrial unit extracts 2.0 kg/sol
              directly from atmospheric CO2 via solid oxide electrolysis, turning the loop oxygen-positive.
            </p>
          </div>

          {/* Loop C: Water */}
          <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-4)' }}>
            <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', color: 'var(--water-accent)', margin: '0 0 var(--space-2) 0' }}>
              WATER & HYDRATION LOOP
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
              Each crew member requires <strong>3.5 kg of water per sol</strong> for drinking, food rehydration, and hygiene (14.0 kg/sol total).
              Without recycling, an open-loop 180-sol mission requires 2,520 kg of bottled water.
              The Closed-Loop ECLSS Recycler reclaims <strong>90% of graywater and urine</strong>, slashing net daily water consumption from 14.0 kg down to just 1.4 kg/sol.
            </p>
          </div>

          {/* Loop D: Nutrition */}
          <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-4)' }}>
            <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', color: 'var(--caution)', margin: '0 0 var(--space-2) 0' }}>
              NUTRITION & HYDROPONIC CROPS
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
              Crew members require 2,500 kcal per sol (0.62 kg dry packaged rations).
              Hydroponic salad domes produce fresh produce (3,000 to 7,500 kcal/sol), reducing ration consumption and boosting crew morale,
              but require continuous lighting power (3 to 6 kW) and daily transpiration water.
            </p>
          </div>

          {/* Loop E: Radiation */}
          <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-4)' }}>
            <h3 style={{ fontFamily: 'var(--font-condensed)', fontSize: 'var(--fs-body)', color: 'var(--alarm)', margin: '0 0 var(--space-2) 0' }}>
              COSMIC RADIATION & SOLAR FLARES
            </h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--fs-label)', color: 'var(--ink-dim)', lineHeight: 1.5, margin: 0 }}>
              Curiosity RAD measured an average surface cosmic ray dose rate of 0.67 mSv/sol.
              NASA-STD-3001 sets a mission career reference limit of 250 mSv.
              Burying the habitat under regolith shields 40% of baseline cosmic rays.
              Water-jacket storm shelters attenuate acute solar particle bursts by 70%.
            </p>
          </div>
        </div>
      </section>

      {/* 10-Step Sol Tick Order */}
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-lead)',
            textTransform: 'uppercase',
            color: 'var(--ember)',
            borderBottom: '1px solid var(--rule)',
            paddingBottom: 'var(--space-1)',
            marginBottom: 'var(--space-4)',
          }}
        >
          2. The 10-Step Sol Simulation Sequence
        </h2>

        <div style={{ backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)', padding: 'var(--space-4)' }}>
          <ol
            style={{
              margin: 0,
              paddingLeft: 'var(--space-6)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              color: 'var(--ink)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              lineHeight: 1.5,
            }}
          >
            <li><strong>Expire Finished Effects & Roll Events:</strong> Decrements active environmental modifiers and rolls seeded RNG for new Martian incidents.</li>
            <li><strong>Compute Power Generation:</strong> Evaluates Solar (kW × [1 - dustFactor] × seasonal tilt) + Fission (constant 10 kW).</li>
            <li><strong>Compute Power Demand:</strong> Sums baseline habitat draw (6 kW) + active hardware modules + environmental heating.</li>
            <li><strong>Power Balance & Brownout Shedding:</strong> Surplus charges batteries; deficits drain storage. If batteries reach 0, loads shed in priority order: Rec Module &rarr; Greenhouse &rarr; MOXIE &rarr; ECLSS &rarr; Baseline Habitat.</li>
            <li><strong>Oxygen Loop:</strong> Subtracts metabolic consumption (4 crew &times; 0.84 kg = 3.36 kg/sol); adds powered recycler scrub + MOXIE extraction.</li>
            <li><strong>Water Loop:</strong> Subtracts crew water need (4 crew &times; 3.5 kg = 14 kg/sol) and crop demand; adds recycler water recovery (90% if powered).</li>
            <li><strong>Food & Nutrition:</strong> Calculates calorie intake from rations and greenhouse; shortfalls drain health.</li>
            <li><strong>Radiation Dose:</strong> Daily dose = Baseline &times; (1 - Shield Attenuation) &times; GameScale + SPE burst dose.</li>
            <li><strong>Morale & Vitality Drift:</strong> Calculates mental health from fresh crops, recreation, brownout distress, and emergency incident triage.</li>
            <li><strong>Integrity Checks & Ledger Recording:</strong> Checks for end conditions (2 sols 0 O2, 3 sols 0 water, 6 sols 0 food, &gt;250 mSv dose) and commits delta causes to the backwards ledger.</li>
          </ol>
        </div>
      </section>

      {/* Transparent Physical Constants Table */}
      <section style={{ marginBottom: 'var(--space-8)' }}>
        <h2
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-lead)',
            textTransform: 'uppercase',
            color: 'var(--ember)',
            borderBottom: '1px solid var(--rule)',
            paddingBottom: 'var(--space-1)',
            marginBottom: 'var(--space-4)',
          }}
        >
          3. Physical Constants & Real-World Calibration Table
        </h2>

        <div style={{ overflowX: 'auto', backgroundColor: 'var(--basalt-2)', border: '1px solid var(--rule)' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: 'var(--basalt)', borderBottom: '1px solid var(--rule)' }}>
                <th style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>Parameter ID</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>Value</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>Unit</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>NASA Source</th>
                <th style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>Scaling / Notes</th>
              </tr>
            </thead>
            <tbody>
              {CONSTANTS.map((c) => {
                const src = sourceMap.get(c.sourceId);
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--rule)' }}>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ember)', fontWeight: 600 }}>
                      {c.id}
                    </td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink)' }}>
                      {c.value}
                    </td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink-dim)' }}>
                      {c.unit}
                    </td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)' }}>
                      <span style={{ color: 'var(--sage)', display: 'block' }}>{src?.publisher || c.sourceId}</span>
                      <span style={{ color: 'var(--ink-dim)', fontSize: 'var(--fs-caption)' }}>{src?.title}</span>
                    </td>
                    <td style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--ink-dim)' }}>
                      {c.note}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Scaling Honesty Notice */}
      <section
        style={{
          backgroundColor: 'var(--basalt)',
          borderLeft: '4px solid var(--oxide)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: 'var(--fs-body)',
            color: 'var(--oxide)',
            margin: '0 0 var(--space-2) 0',
            textTransform: 'uppercase',
          }}
        >
          Scientific Honesty: Why Radiation is Scaled 2.2x
        </h3>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--fs-label)',
            color: 'var(--ink-dim)',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          In reality, Curiosity RAD recorded an average galactic cosmic ray surface dose rate of 0.67 mSv/sol. Over a 180-sol mission,
          that equals ~120 mSv—only half of the 250 mSv career design limit. If unscaled, students could completely ignore radiation shielding
          and suffer zero consequences during a short educational playthrough. We deliberately amplified the baseline surface dose rate by <strong>2.2x</strong>
          (to ~1.47 mSv/sol), ensuring that an unshielded habitat breaches the 250 mSv safety ceiling by sol 170. This makes the engineering compromise tangible
          while preserving the exact relative shielding physics of regolith berms and water storm shelters.
        </p>
      </section>
    </div>
  );
}
