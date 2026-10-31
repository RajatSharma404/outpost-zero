/**
 * Outpost Zero: ECLSS Mechanical Reliability, Sparing & Failure Hazards
 * Implements MTBF failure hazard curves, flight reality factors (2.0x), repair dynamics,
 * and open-loop backup store drawdown upon failure exhaustion.
 */

import type { ECLSSUnit } from './types';
import { getConstant } from './constants';
import { Mulberry32 } from '../../lib/sim/rng';

export interface UnitFailureEvent {
  unitId: string;
  unitName: string;
  sol: number;
  repaired: boolean;
  sparesRemaining: number;
  message: string;
}

/**
 * Checks for stochastic hardware failures on a given sol.
 */
export function evaluateUnitFailures(
  units: ECLSSUnit[],
  sol: number,
  rng: Mulberry32,
  realityFactor = 2.0,
): { updatedUnits: ECLSSUnit[]; events: UnitFailureEvent[] } {
  const events: UnitFailureEvent[] = [];
  const updatedUnits = units.map((unit) => {
    // If unit is already permanently offline, continue
    if (unit.status === 'offline') {
      return { ...unit, offlineHours: unit.offlineHours + 24 };
    }

    // If unit is currently under repair, decrement repair time
    if (unit.status === 'failed') {
      if (unit.offlineHours >= unit.repairCrewHours) {
        // Repair complete!
        events.push({
          unitId: unit.id,
          unitName: unit.name,
          sol,
          repaired: true,
          sparesRemaining: unit.sparesCarried,
          message: `${unit.name} repaired and restored to nominal operation after ${unit.repairCrewHours}h crew maintenance.`,
        });
        return {
          ...unit,
          status: 'nominal' as const,
          offlineHours: 0,
        };
      } else {
        return { ...unit, offlineHours: unit.offlineHours + 24 };
      }
    }

    // Nominal unit: roll for failure
    // Daily failure probability: lambda = realityFactor / (MTBF in days)
    const mtbfDays = unit.mtbfHours / 24;
    const dailyHazardRate = (realityFactor / mtbfDays);
    const roll = rng.next();

    if (roll < dailyHazardRate) {
      // Unit has experienced a mechanical failure!
      if (unit.sparesCarried > 0) {
        const newSpares = unit.sparesCarried - 1;
        events.push({
          unitId: unit.id,
          unitName: unit.name,
          sol,
          repaired: false,
          sparesRemaining: newSpares,
          message: `FAILURE: ${unit.name} malfunctioned on Sol ${sol}. Spare ORU deployed. Repair crew assigned (${unit.repairCrewHours}h required).`,
        });
        return {
          ...unit,
          status: 'failed' as const,
          sparesCarried: newSpares,
          offlineHours: 0,
        };
      } else {
        // No spares left! Permanent failure!
        events.push({
          unitId: unit.id,
          unitName: unit.name,
          sol,
          repaired: false,
          sparesRemaining: 0,
          message: `CRITICAL ALARM: ${unit.name} failed permanently on Sol ${sol}. ZERO spares available. Drawing from open-loop emergency stores.`,
        });
        return {
          ...unit,
          status: 'offline' as const,
          offlineHours: 24,
        };
      }
    }

    return unit;
  });

  return { updatedUnits, events };
}
