import type { Loadout, MissionMode } from './sim/types';

interface EncodedPayload {
  items: string[];
  water: number;
  o2: number;
  food: number;
  mode: MissionMode;
  seed: number;
}

export function encodeChallenge(loadout: Loadout): string {
  const payload: EncodedPayload = {
    items: loadout.itemIds,
    water: Math.round(loadout.consumables.waterKg),
    o2: Math.round(loadout.consumables.o2Kg),
    food: Math.round(loadout.consumables.foodKg),
    mode: loadout.mode,
    seed: loadout.seed,
  };
  const json = JSON.stringify(payload);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(json, 'utf-8').toString('base64url');
  }
  return btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeChallenge(hash: string): Loadout | null {
  try {
    const cleanHash = hash.replace(/^#/, '').trim();
    if (!cleanHash) return null;

    let json = '';
    if (typeof Buffer !== 'undefined') {
      json = Buffer.from(cleanHash, 'base64url').toString('utf-8');
    } else {
      const base64 = cleanHash.replace(/-/g, '+').replace(/_/g, '/');
      json = decodeURIComponent(escape(atob(base64)));
    }

    const parsed = JSON.parse(json) as EncodedPayload;
    if (!Array.isArray(parsed.items) || typeof parsed.seed !== 'number') {
      return null;
    }

    return {
      itemIds: parsed.items,
      consumables: {
        waterKg: Number(parsed.water) || 0,
        o2Kg: Number(parsed.o2) || 0,
        foodKg: Number(parsed.food) || 0,
      },
      mode: (['tutorial', 'standard', 'long'].includes(parsed.mode) ? parsed.mode : 'standard') as MissionMode,
      seed: parsed.seed,
    };
  } catch {
    return null;
  }
}
