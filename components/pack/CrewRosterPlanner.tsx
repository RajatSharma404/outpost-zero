'use client';

import React, { useState } from 'react';
import { useGameStore } from '../../store/game';
import {
  type CrewMember,
  calculateCrewMemberMetabolism,
  getConstant,
} from '../../src/engine';

export function CrewRosterPlanner() {
  const { coupledConfig, setCrewRoster, addCrewMember, removeCrewMember, updateCrewMember, loadPreset } = useGameStore();
  const crew = coupledConfig.crew;

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberSex, setNewMemberSex] = useState<'male' | 'female'>('female');
  const [newMemberAge, setNewMemberAge] = useState(35);
  const [newMemberMass, setNewMemberMass] = useState(68);
  const [newMemberHeight, setNewMemberHeight] = useState(1.72);
  const [newMemberAF, setNewMemberAF] = useState<1.11 | 1.25>(1.25);
  const [newMemberEva, setNewMemberEva] = useState(4);

  // Live aggregate metabolic demands
  const metabolicSummaries = crew.map((cm) => calculateCrewMemberMetabolism(cm));
  const totalEerKcal = metabolicSummaries.reduce((sum, m) => sum + m.eerKcal, 0);
  const totalO2Kg = metabolicSummaries.reduce((sum, m) => sum + m.o2ConsumptionKg, 0);
  const totalCo2Kg = metabolicSummaries.reduce((sum, m) => sum + m.co2ProductionKg, 0);
  const totalFluidL = metabolicSummaries.reduce((sum, m) => sum + m.fluidTargetL, 0);
  const totalDryFoodKg = metabolicSummaries.reduce((sum, m) => sum + m.dryFoodNeedKg, 0);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `cm_${Date.now()}`;
    const member: CrewMember = {
      id,
      name: newMemberName.trim() || `Astronaut ${crew.length + 1}`,
      sex: newMemberSex,
      age: newMemberAge,
      massKg: newMemberMass,
      heightM: newMemberHeight,
      activityFactor: newMemberAF,
      evaHoursPerWeek: newMemberEva,
    };
    addCrewMember(member);
    setNewMemberName('');
  };

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
      {/* Header and Presets */}
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
            Crew Roster & Metabolic Sizing
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
            NASA-STD-3001 Vol 2 / BVAD individual EER, O2, CO2, and hydration coupling
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => loadPreset('bvad4')}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              cursor: 'pointer',
              borderRadius: 'var(--r-1)',
            }}
          >
            [BVAD 4-Crew Baseline]
          </button>
          <button
            type="button"
            onClick={() => loadPreset('mixed6')}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              cursor: 'pointer',
              borderRadius: 'var(--r-1)',
            }}
          >
            [6-Crew Mixed Mission]
          </button>
          <button
            type="button"
            onClick={() => loadPreset('low5th')}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              cursor: 'pointer',
              borderRadius: 'var(--r-1)',
            }}
          >
            [5th-Percentile Low]
          </button>
          <button
            type="button"
            onClick={() => loadPreset('high95th')}
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--hmi-surface-elevated)',
              border: '1px solid var(--hmi-border)',
              color: 'var(--hmi-text)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-label)',
              cursor: 'pointer',
              borderRadius: 'var(--r-1)',
            }}
          >
            [95th-Percentile High]
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div style={{ overflowX: 'auto' }}>
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
              <th style={{ padding: 'var(--space-2)' }}>ID / Name</th>
              <th style={{ padding: 'var(--space-2)' }}>Sex</th>
              <th style={{ padding: 'var(--space-2)' }}>Age (y)</th>
              <th style={{ padding: 'var(--space-2)' }}>Mass (kg)</th>
              <th style={{ padding: 'var(--space-2)' }}>Height (m)</th>
              <th style={{ padding: 'var(--space-2)' }}>Activity Factor</th>
              <th style={{ padding: 'var(--space-2)' }}>EVA (h/wk)</th>
              <th style={{ padding: 'var(--space-2)' }}>EER (kcal/d)</th>
              <th style={{ padding: 'var(--space-2)' }}>O2 (kg/d)</th>
              <th style={{ padding: 'var(--space-2)' }}>CO2 (kg/d)</th>
              <th style={{ padding: 'var(--space-2)' }}>Fluid (L/d)</th>
              <th style={{ padding: 'var(--space-2)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {crew.map((cm, idx) => {
              const meta = metabolicSummaries[idx];
              return (
                <tr
                  key={cm.id}
                  style={{
                    borderBottom: '1px solid var(--hmi-border)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--hmi-surface-elevated)',
                  }}
                >
                  <td style={{ padding: 'var(--space-2)', fontWeight: 600, color: 'var(--hmi-text)' }}>
                    {cm.name}
                  </td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>
                    {cm.sex === 'male' ? 'Male (662)' : 'Female (354)'}
                  </td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>
                    {cm.age}
                  </td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>
                    {cm.massKg.toFixed(1)}
                  </td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>
                    {cm.heightM.toFixed(2)}
                  </td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>
                    {cm.activityFactor === 1.25 ? '1.25 (Active)' : '1.11 (Low)'}
                  </td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>
                    {cm.evaHoursPerWeek}
                  </td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)', fontWeight: 600 }}>
                    {meta.eerKcal.toFixed(0)}
                  </td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>
                    {meta.o2ConsumptionKg.toFixed(3)}
                  </td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>
                    {meta.co2ProductionKg.toFixed(3)}
                  </td>
                  <td style={{ padding: 'var(--space-2)', color: 'var(--hmi-text)' }}>
                    {meta.fluidTargetL.toFixed(2)}
                  </td>
                  <td style={{ padding: 'var(--space-2)' }}>
                    {crew.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCrewMember(cm.id)}
                        aria-label={`Remove crew member ${cm.name}`}
                        style={{
                          padding: 'var(--space-quarter) var(--space-2)',
                          backgroundColor: 'var(--hmi-alarm-p1-bg)',
                          border: '1px solid var(--alarm-p1)',
                          color: 'var(--alarm-p1)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 'var(--fs-caption)',
                          cursor: 'pointer',
                          borderRadius: 'var(--r-0)',
                        }}
                      >
                        [REMOVE]
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr
              style={{
                borderTop: '2px solid var(--hmi-border)',
                backgroundColor: 'var(--hmi-surface-elevated)',
                fontWeight: 700,
                color: 'var(--hmi-text)',
              }}
            >
              <td style={{ padding: 'var(--space-2)' }}>TOTALS ({crew.length} Crew)</td>
              <td colSpan={6} style={{ padding: 'var(--space-2)', color: 'var(--hmi-text-dim)' }}>
                Coupled daily aggregate requirement
              </td>
              <td style={{ padding: 'var(--space-2)' }}>{totalEerKcal.toFixed(0)} kcal/d</td>
              <td style={{ padding: 'var(--space-2)' }}>{totalO2Kg.toFixed(2)} kg/d</td>
              <td style={{ padding: 'var(--space-2)' }}>{totalCo2Kg.toFixed(2)} kg/d</td>
              <td style={{ padding: 'var(--space-2)' }}>{totalFluidL.toFixed(2)} L/d</td>
              <td style={{ padding: 'var(--space-2)' }}>{totalDryFoodKg.toFixed(2)} kg dry</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add Astronaut Form */}
      {crew.length < 12 && (
        <form
          onSubmit={handleAddMember}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            alignItems: 'flex-end',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--hmi-border)',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                color: 'var(--hmi-text-dim)',
                marginBottom: 'var(--space-quarter)',
              }}
            >
              Name / Role
            </label>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder={`Astronaut ${crew.length + 1}`}
              style={{
                padding: 'var(--space-1) var(--space-2)',
                backgroundColor: 'var(--hmi-surface-elevated)',
                border: '1px solid var(--hmi-border)',
                color: 'var(--hmi-text)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                borderRadius: 'var(--r-0)',
                width: '140px',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                color: 'var(--hmi-text-dim)',
                marginBottom: 'var(--space-quarter)',
              }}
            >
              Sex
            </label>
            <select
              value={newMemberSex}
              onChange={(e) => setNewMemberSex(e.target.value as 'male' | 'female')}
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
              <option value="female">Female (354 const)</option>
              <option value="male">Male (662 const)</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                color: 'var(--hmi-text-dim)',
                marginBottom: 'var(--space-quarter)',
              }}
            >
              Age (y)
            </label>
            <input
              type="number"
              min={22}
              max={65}
              value={newMemberAge}
              onChange={(e) => setNewMemberAge(Number(e.target.value))}
              style={{
                padding: 'var(--space-1) var(--space-2)',
                backgroundColor: 'var(--hmi-surface-elevated)',
                border: '1px solid var(--hmi-border)',
                color: 'var(--hmi-text)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                borderRadius: 'var(--r-0)',
                width: '60px',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                color: 'var(--hmi-text-dim)',
                marginBottom: 'var(--space-quarter)',
              }}
            >
              Mass (kg)
            </label>
            <input
              type="number"
              min={45}
              max={110}
              value={newMemberMass}
              onChange={(e) => setNewMemberMass(Number(e.target.value))}
              style={{
                padding: 'var(--space-1) var(--space-2)',
                backgroundColor: 'var(--hmi-surface-elevated)',
                border: '1px solid var(--hmi-border)',
                color: 'var(--hmi-text)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                borderRadius: 'var(--r-0)',
                width: '70px',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                color: 'var(--hmi-text-dim)',
                marginBottom: 'var(--space-quarter)',
              }}
            >
              Height (m)
            </label>
            <input
              type="number"
              step="0.01"
              min={1.45}
              max={2.05}
              value={newMemberHeight}
              onChange={(e) => setNewMemberHeight(Number(e.target.value))}
              style={{
                padding: 'var(--space-1) var(--space-2)',
                backgroundColor: 'var(--hmi-surface-elevated)',
                border: '1px solid var(--hmi-border)',
                color: 'var(--hmi-text)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                borderRadius: 'var(--r-0)',
                width: '70px',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                color: 'var(--hmi-text-dim)',
                marginBottom: 'var(--space-quarter)',
              }}
            >
              Activity Factor
            </label>
            <select
              value={newMemberAF}
              onChange={(e) => setNewMemberAF(Number(e.target.value) as 1.11 | 1.25)}
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
              <option value={1.25}>1.25 (Active, ISS-level)</option>
              <option value={1.11}>1.11 (Low Active)</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-caption)',
                color: 'var(--hmi-text-dim)',
                marginBottom: 'var(--space-quarter)',
              }}
            >
              EVA (h/wk)
            </label>
            <input
              type="number"
              min={0}
              max={20}
              value={newMemberEva}
              onChange={(e) => setNewMemberEva(Number(e.target.value))}
              style={{
                padding: 'var(--space-1) var(--space-2)',
                backgroundColor: 'var(--hmi-surface-elevated)',
                border: '1px solid var(--hmi-border)',
                color: 'var(--hmi-text)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--fs-detail)',
                borderRadius: 'var(--r-0)',
                width: '60px',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: 'var(--space-1) var(--space-3)',
              backgroundColor: 'var(--sage)',
              color: 'var(--color-basalt)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-detail)',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              borderRadius: 'var(--r-1)',
              height: '32px',
            }}
          >
            + ADD CREW
          </button>
        </form>
      )}
    </div>
  );
}

