import type {
  SimulationState,
  SimulationEvent,
  EventChoice,
  ActiveModifier,
  LedgerEntry,
} from './types';
import { EVENTS, getItem } from '../data';
import type { Mulberry32 } from './rng';

export function getEligibleEvents(state: SimulationState, allEvents: SimulationEvent[] = EVENTS): SimulationEvent[] {
  const currentSol = state.sol;
  const packedItemIds = new Set(state.loadout.itemIds);
  const packedCategories = new Set(
    state.loadout.itemIds.map((id) => getItem(id)?.category).filter(Boolean),
  );

  // Recent events within 12 sols shouldn't re-trigger
  const recentEventIds = new Set(
    state.eventHistory
      .filter((h) => currentSol - h.sol < 12)
      .map((h) => h.eventId),
  );

  return allEvents.filter((ev) => {
    if (ev.earliestSol > currentSol) return false;
    if (recentEventIds.has(ev.id)) return false;

    // Check preconditions
    for (const pre of ev.preconditions) {
      if (pre.type === 'has_item' && pre.itemId && !packedItemIds.has(pre.itemId)) {
        return false;
      }
      if (pre.type === 'has_category' && pre.category && !packedCategories.has(pre.category)) {
        return false;
      }
      if (pre.type === 'min_sol' && pre.sol && currentSol < pre.sol) {
        return false;
      }
    }
    return true;
  });
}

export function rollForEvent(
  state: SimulationState,
  rng: Mulberry32,
  allEvents: SimulationEvent[] = EVENTS,
): SimulationEvent | null {
  // Event frequency depends on mode
  // Tutorial: ~12% chance per sol (~1 event every 8-10 sols)
  // Standard: ~16% chance per sol (~1 event every 6-7 sols)
  // Long: ~10% chance per sol
  let baseChance = 0.15;
  if (state.mode === 'tutorial') baseChance = 0.10;
  if (state.mode === 'long') baseChance = 0.08;

  // Don't trigger events in the first 5 sols of landing
  if (state.sol <= 5) return null;

  // Don't trigger if already paused
  if (state.pendingEvent) return state.pendingEvent;

  // Check if an event was triggered very recently (minimum 3 sols between events)
  const lastEvent = state.eventHistory[state.eventHistory.length - 1];
  if (lastEvent && state.sol - lastEvent.sol < 4) {
    return null;
  }

  if (rng.next() > baseChance) {
    return null;
  }

  const eligible = getEligibleEvents(state, allEvents);
  if (eligible.length === 0) return null;

  return rng.weightedPick(eligible, (e) => e.weight);
}

export function isChoiceUnlocked(choice: EventChoice, state: SimulationState): boolean {
  if (!choice.requires) return true;
  return state.loadout.itemIds.includes(choice.requires);
}

export function applyChoice(
  state: SimulationState,
  choiceId: string,
): { state: SimulationState; ledgerDeltas: LedgerEntry[] } {
  if (!state.pendingEvent) {
    return { state, ledgerDeltas: [] };
  }

  const ev = state.pendingEvent;
  const choice = ev.choices.find((c) => c.id === choiceId) ?? ev.choices[0];
  const newState: SimulationState = {
    ...state,
    pendingEvent: undefined,
    status: 'running',
    meters: { ...state.meters },
    crew: { ...state.crew },
    activeEffects: [...state.activeEffects],
    eventHistory: [...state.eventHistory, { sol: state.sol, eventId: ev.id, choiceId: choice.id }],
  };

  const ledgerDeltas: LedgerEntry[] = [];

  for (const eff of choice.effects) {
    if (eff.forSols && eff.forSols > 0) {
      // Add timed active effect
      const modifier: ActiveModifier = {
        id: `${ev.id}_${choice.id}_${eff.target}_${state.sol}`,
        target: eff.target,
        add: eff.add,
        mult: eff.mult,
        set: eff.set,
        remainingSols: eff.forSols,
        source: ev.id,
      };
      newState.activeEffects.push(modifier);
    } else {
      // Immediate impact on meter
      if (eff.target === 'waterKg' && eff.add) {
        newState.meters.waterKg = Math.max(0, newState.meters.waterKg + eff.add);
        ledgerDeltas.push({
          sol: state.sol,
          meter: 'waterKg',
          delta: eff.add,
          causes: [{ source: ev.id, amount: eff.add }],
        });
      } else if (eff.target === 'o2Kg' && eff.add) {
        newState.meters.o2Kg = Math.max(0, newState.meters.o2Kg + eff.add);
        ledgerDeltas.push({
          sol: state.sol,
          meter: 'o2Kg',
          delta: eff.add,
          causes: [{ source: ev.id, amount: eff.add }],
        });
      } else if (eff.target === 'foodKg' && eff.add) {
        newState.meters.foodKg = Math.max(0, newState.meters.foodKg + eff.add);
        ledgerDeltas.push({
          sol: state.sol,
          meter: 'foodKg',
          delta: eff.add,
          causes: [{ source: ev.id, amount: eff.add }],
        });
      } else if (eff.target === 'powerStoredKwh' && eff.add) {
        newState.meters.powerStoredKwh = Math.max(0, newState.meters.powerStoredKwh + eff.add);
        ledgerDeltas.push({
          sol: state.sol,
          meter: 'powerStoredKwh',
          delta: eff.add,
          causes: [{ source: ev.id, amount: eff.add }],
        });
      } else if (eff.target === 'morale' && eff.add) {
        const oldM = newState.meters.morale;
        newState.meters.morale = Math.min(100, Math.max(0, oldM + eff.add));
        const delta = newState.meters.morale - oldM;
        ledgerDeltas.push({
          sol: state.sol,
          meter: 'morale',
          delta,
          causes: [{ source: ev.id, amount: delta }],
        });
      } else if (eff.target === 'health' && eff.add) {
        const oldH = newState.crew.health;
        newState.crew.health = Math.min(100, Math.max(0, oldH + eff.add));
        const delta = newState.crew.health - oldH;
        ledgerDeltas.push({
          sol: state.sol,
          meter: 'crewHealth',
          delta,
          causes: [{ source: ev.id, amount: delta }],
        });
      } else if (eff.target === 'doseSpe' && eff.add) {
        // Solar particle event dose added directly to cumulative dose
        const delta = eff.add;
        newState.meters.doseMsvPerCrew += delta;
        ledgerDeltas.push({
          sol: state.sol,
          meter: 'doseMsvPerCrew',
          delta,
          causes: [{ source: 'solar_particle_event', amount: delta }],
        });
      } else if (eff.target === 'resupplyAccepted') {
        newState.resupplyAccepted = true;
      }
    }
  }

  return { state: newState, ledgerDeltas };
}
