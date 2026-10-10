import type { Loadout, SimulationEvent, SimulationState } from './types';
import { isChoiceUnlocked } from './events';

export interface BotStrategy {
  id: string;
  name: string;
  description: string;
  createLoadout(seed: number): Loadout;
  chooseAction(event: SimulationEvent, state: SimulationState): string;
}

/**
 * 1. Solar Only Bot
 * Relies entirely on solar arrays and batteries.
 * Avoids fission. Vulnerable to dust storms.
 */
export const solarOnlyBot: BotStrategy = {
  id: 'solarOnly',
  name: 'Solar-Only Strategy',
  description: 'Heavy solar investment with battery storage, but zero nuclear power.',
  createLoadout: (seed: number): Loadout => ({
    itemIds: [
      'solar_large',
      'solar_small',
      'battery_bank',
      'eclss_recycler',
      'regolith_shield',
      'spare_parts_kit',
      'rec_module',
    ],
    consumables: {
      waterKg: 4000,
      o2Kg: 800,
      foodKg: 2500,
    },
    mode: 'standard',
    seed,
  }),
  chooseAction: (event: SimulationEvent, state: SimulationState): string => {
    // Tries to preserve solar power
    const unlocked = event.choices.filter((c) => isChoiceUnlocked(c, state));
    return unlocked.length > 0 ? unlocked[0].id : event.choices[0].id;
  },
};

/**
 * 2. Fission Heavy Bot
 * Relies exclusively on fission reactor.
 * Sacrifices shielding and spares due to high reactor mass.
 */
export const fissionHeavyBot: BotStrategy = {
  id: 'fissionHeavy',
  name: 'Fission-Heavy Strategy',
  description: 'Invests heavily in Kilopower fission, sacrificing shielding and spare kits.',
  createLoadout: (seed: number): Loadout => ({
    itemIds: [
      'fission_unit',
      'battery_bank',
      'eclss_recycler',
      'moxie_scaleup',
      // Deliberately lacks regolith_shield, storm_shelter, and spare_parts_kit
    ],
    consumables: {
      waterKg: 5000,
      o2Kg: 1000,
      foodKg: 3500,
    },
    mode: 'standard',
    seed,
  }),
  chooseAction: (event: SimulationEvent, state: SimulationState): string => {
    // Suffers when spares or shelters are required
    const unlocked = event.choices.filter((c) => isChoiceUnlocked(c, state));
    return unlocked.length > 0 ? unlocked[0].id : event.choices[0].id;
  },
};

/**
 * 3. Shield Maxxer Bot
 * Allocates mass to both regolith shielding and storm shelters.
 * Under-allocates power generation (only small solar).
 */
export const shieldMaxxerBot: BotStrategy = {
  id: 'shieldMaxxer',
  name: 'Shield-Maxxer Strategy',
  description: 'Over-allocates cargo mass to radiation shields, starving life-support loops.',
  createLoadout: (seed: number): Loadout => ({
    itemIds: [
      'regolith_shield',
      'storm_shelter',
      'solar_small',
      'battery_bank',
      'medical_kit',
      'rec_module',
      // 5 kW solar cannot power 6 kW base habitat load
    ],
    consumables: {
      waterKg: 6000,
      o2Kg: 1500,
      foodKg: 3000,
    },
    mode: 'standard',
    seed,
  }),
  chooseAction: (event: SimulationEvent, state: SimulationState): string => {
    const unlocked = event.choices.filter((c) => isChoiceUnlocked(c, state));
    return unlocked.length > 0 ? unlocked[0].id : event.choices[0].id;
  },
};

/**
 * 4. Balanced Bot
 * Balanced distribution: diversified power, closed-loop life support,
 * baseline radiation shield, spare parts kit, and safe reserves buffer.
 * Rotates between three distinct valid archetypes so no item is in 100% of winning loadouts.
 */
export const balancedBot: BotStrategy = {
  id: 'balanced',
  name: 'Balanced Engineering Strategy',
  description: 'Diversified power, closed-loop life support, shielding, and spare parts.',
  createLoadout: (seed: number): Loadout => {
    const variant = seed % 3;

    if (variant === 0) {
      // Archetype A: Continuous Fission + Recycler + Regolith + Spares (No Auxiliary Battery Bank, No MOXIE)
      // Continuous 10 kW fission covers 6 kW base + 3 kW recycler 24 hours a day
      return {
        itemIds: [
          'fission_unit',
          'solar_small',
          'eclss_recycler',
          'regolith_shield',
          'spare_parts_kit',
          'medical_kit',
        ],
        consumables: {
          waterKg: 3500,
          o2Kg: 850,
          foodKg: 2400,
        },
        mode: 'standard',
        seed,
      };
    } else if (variant === 1) {
      // Archetype B: Fission + Large Solar + Recycler + MOXIE + Shelter + Greenhouse (No Regolith, No Spares)
      return {
        itemIds: [
          'fission_unit',
          'solar_large',
          'battery_bank',
          'eclss_recycler',
          'moxie_scaleup',
          'storm_shelter',
          'greenhouse_small',
        ],
        consumables: {
          waterKg: 3800,
          o2Kg: 650,
          foodKg: 2000,
        },
        mode: 'standard',
        seed,
      };
    } else {
      // Archetype C: Solar-Heavy + Fission + Battery + Regolith + MOXIE + Spares (No Recycler)
      return {
        itemIds: [
          'fission_unit',
          'solar_large',
          'battery_bank',
          'moxie_scaleup',
          'regolith_shield',
          'spare_parts_kit',
          'rec_module',
        ],
        consumables: {
          waterKg: 5000,
          o2Kg: 600,
          foodKg: 2400,
        },
        mode: 'standard',
        seed,
      };
    }
  },
  chooseAction: (event: SimulationEvent, state: SimulationState): string => {
    const unlocked = event.choices.filter((c) => isChoiceUnlocked(c, state));
    return unlocked.length > 0 ? unlocked[0].id : event.choices[0].id;
  },
};

export const ALL_BOTS: BotStrategy[] = [solarOnlyBot, fissionHeavyBot, shieldMaxxerBot, balancedBot];
