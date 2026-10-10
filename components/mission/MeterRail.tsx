'use client';

import React from 'react';
import type { SimulationState, MeterType } from '../../lib/sim/types';
import { MeterGauge } from './MeterGauge';
import { getConstantValue } from '../../lib/data';

interface MeterRailProps {
  state: SimulationState;
}

export const MeterRail: React.FC<MeterRailProps> = ({ state }) => {
  const { meters, batteryCapacityKwh, ledger, sol } = state;
  const doseLimit = getConstantValue('dose_limit_mission_msv', 250);

  // Retrieve last ledger entry for each meter on previous sol
  const getLastLedger = (meter: MeterType) => {
    const prevSol = sol - 1;
    const entries = ledger.filter((e) => e.meter === meter && (e.sol === prevSol || e.sol === sol));
    return entries[entries.length - 1];
  };

  // Status heuristics
  const powerStatus =
    meters.powerStoredKwh <= 10 ? 'alarm' : meters.powerStoredKwh < 40 ? 'caution' : 'nominal';
  const o2Status = meters.o2Kg < 50 ? 'alarm' : meters.o2Kg < 150 ? 'caution' : 'nominal';
  const waterStatus = meters.waterKg < 100 ? 'alarm' : meters.waterKg < 350 ? 'caution' : 'nominal';
  const foodStatus = meters.foodKg < 100 ? 'alarm' : meters.foodKg < 300 ? 'caution' : 'nominal';
  const doseStatus =
    meters.doseMsvPerCrew >= doseLimit * 0.85
      ? 'alarm'
      : meters.doseMsvPerCrew >= doseLimit * 0.6
      ? 'caution'
      : 'nominal';
  const moraleStatus =
    meters.morale <= 20 ? 'alarm' : meters.morale < 50 ? 'caution' : 'nominal';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 'var(--space-3)',
      }}
    >
      <MeterGauge
        label="Power Storage"
        value={meters.powerStoredKwh}
        max={batteryCapacityKwh}
        unit="kWh"
        status={powerStatus}
        statusLabel={powerStatus === 'nominal' ? 'NOMINAL' : powerStatus === 'caution' ? 'WATCH' : 'BROWNOUT'}
        trend={getLastLedger('powerStoredKwh')?.delta ?? 0 > 0 ? 'up' : 'down'}
        lastLedgerEntry={getLastLedger('powerStoredKwh')}
      />

      <MeterGauge
        label="Breathable Oxygen"
        value={meters.o2Kg}
        max={Math.max(1000, meters.o2Kg)}
        unit="kg"
        status={o2Status}
        statusLabel={o2Status === 'nominal' ? 'NOMINAL' : o2Status === 'caution' ? 'WATCH' : 'HYPOXIA'}
        trend={getLastLedger('o2Kg')?.delta ?? 0 > 0 ? 'up' : 'down'}
        lastLedgerEntry={getLastLedger('o2Kg')}
      />

      <MeterGauge
        label="Potable Water"
        value={meters.waterKg}
        max={Math.max(4000, meters.waterKg)}
        unit="kg"
        status={waterStatus}
        statusLabel={waterStatus === 'nominal' ? 'NOMINAL' : waterStatus === 'caution' ? 'WATCH' : 'DROUGHT'}
        trend={getLastLedger('waterKg')?.delta ?? 0 > 0 ? 'up' : 'down'}
        lastLedgerEntry={getLastLedger('waterKg')}
      />

      <MeterGauge
        label="Food Rations"
        value={meters.foodKg}
        max={Math.max(3000, meters.foodKg)}
        unit="kg"
        status={foodStatus}
        statusLabel={foodStatus === 'nominal' ? 'NOMINAL' : foodStatus === 'caution' ? 'WATCH' : 'STARVATION'}
        trend={getLastLedger('foodKg')?.delta ?? 0 > 0 ? 'up' : 'down'}
        lastLedgerEntry={getLastLedger('foodKg')}
      />

      <MeterGauge
        label="Cumulative Radiation"
        value={meters.doseMsvPerCrew}
        max={doseLimit}
        unit={`/ ${doseLimit} mSv`}
        status={doseStatus}
        statusLabel={doseStatus === 'nominal' ? 'SAFE' : doseStatus === 'caution' ? 'ELEVATED' : 'CRITICAL'}
        trend="up"
        lastLedgerEntry={getLastLedger('doseMsvPerCrew')}
      />

      <MeterGauge
        label="Crew Morale"
        value={meters.morale}
        max={100}
        unit="%"
        status={moraleStatus}
        statusLabel={moraleStatus === 'nominal' ? 'STABLE' : moraleStatus === 'caution' ? 'STRAINED' : 'MUTINY'}
        trend={getLastLedger('morale')?.delta ?? 0 > 0 ? 'up' : 'down'}
        lastLedgerEntry={getLastLedger('morale')}
      />
    </div>
  );
};
