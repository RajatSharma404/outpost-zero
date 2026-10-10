import { describe, it, expect } from 'vitest';
import { analyzeLoadout, calculateMass } from '../lib/sim/loadout';
import type { Loadout } from '../lib/sim/types';

describe('Pack Screen Logic & Advisories', () => {
  it('correctly detects over-budget state and blocks launch payload', () => {
    const overloadedLoadout: Loadout = {
      itemIds: [
        'solar_large',
        'fission_unit',
        'regolith_shield',
        'storm_shelter',
        'greenhouse_large',
      ], // 4200 + 6000 + 5000 + 3000 + 5000 = 23,200 kg
      consumables: {
        waterKg: 12000,
        o2Kg: 3000,
        foodKg: 6000,
      }, // 21,000 kg -> Total = 44,200 kg (Over by 4,200 kg)
      mode: 'standard',
      seed: 10,
    };

    const mass = calculateMass(overloadedLoadout);
    expect(mass.isOverBudget).toBe(true);
    expect(mass.overByKg).toBe(4200);

    const analysis = analyzeLoadout(overloadedLoadout, 180);
    expect(analysis.warnings.some((w) => w.includes('overloaded by 4,200 kg'))).toBe(true);
  });

  it('Hand-checked Loadout 1: warns on solar-only setup with missing battery storage', () => {
    const loadout: Loadout = {
      itemIds: ['solar_large'],
      consumables: { waterKg: 2000, o2Kg: 500, foodKg: 1000 },
      mode: 'standard',
      seed: 1,
    };

    const analysis = analyzeLoadout(loadout, 180);
    expect(analysis.warnings.some((w) => w.includes('No battery bank packed'))).toBe(true);
    expect(analysis.warnings.some((w) => w.includes('Relying entirely on solar power'))).toBe(true);
  });

  it('Hand-checked Loadout 2: warns on electrical generation below baseline hab load', () => {
    const loadout: Loadout = {
      itemIds: ['solar_small', 'battery_bank'], // 5 kW gen vs 6 kW base demand
      consumables: { waterKg: 2000, o2Kg: 500, foodKg: 1000 },
      mode: 'standard',
      seed: 2,
    };

    const analysis = analyzeLoadout(loadout, 180);
    expect(
      analysis.warnings.some((w) =>
        w.includes('Power generation (5 kW) is below baseline habitat demand (6 kW)'),
      ),
    ).toBe(true);
  });

  it('Hand-checked Loadout 3: accurately projects oxygen tank depletion sol', () => {
    const loadout: Loadout = {
      itemIds: ['fission_unit', 'battery_bank'],
      consumables: { waterKg: 2000, o2Kg: 100, foodKg: 1000 }, // 100 kg / (4 * 0.84) = 29 sols
      mode: 'standard',
      seed: 3,
    };

    const analysis = analyzeLoadout(loadout, 180);
    expect(analysis.warnings.some((w) => w.includes('tanks deplete on sol 29'))).toBe(true);
  });

  it('Hand-checked Loadout 4: accurately projects water depletion without recycler', () => {
    const loadout: Loadout = {
      itemIds: ['fission_unit', 'battery_bank'],
      consumables: { waterKg: 700, o2Kg: 600, foodKg: 1000 }, // 700 kg / (4 * 3.5) = 50 sols
      mode: 'standard',
      seed: 4,
    };

    const analysis = analyzeLoadout(loadout, 180);
    expect(analysis.warnings.some((w) => w.includes('water will run dry on sol 50'))).toBe(true);
  });

  it('Hand-checked Loadout 5: warns on zero radiation shielding and missing storm shelter', () => {
    const loadout: Loadout = {
      itemIds: ['fission_unit', 'solar_small', 'battery_bank', 'eclss_recycler', 'moxie_scaleup'],
      consumables: { waterKg: 3000, o2Kg: 600, foodKg: 2000 },
      mode: 'standard',
      seed: 5,
    };

    const analysis = analyzeLoadout(loadout, 180);
    expect(analysis.warnings.some((w) => w.includes('Zero radiation shielding packed'))).toBe(true);
    expect(analysis.shieldingRating).toBe('none');
  });
});
