import { z } from 'zod';
import rawConstants from '../data/constants.json';
import rawItems from '../data/items.json';
import rawEvents from '../data/events.json';
import rawSources from '../data/sources.json';
import type { PackableItem, SimulationEvent, ConstantEntry, SourceEntry } from './sim/types';

export const ConstantSchema = z.object({
  id: z.string(),
  value: z.number(),
  unit: z.string(),
  label: z.string(),
  sourceId: z.string(),
  verified: z.boolean(),
  gameScale: z.number(),
  note: z.string(),
  sourceType: z.enum(['MEASURED', 'NASA STANDARD', 'DESIGN ASSUMPTION']).optional(),
});

export const ItemEffectSchema = z.object({
  type: z.string(),
}).passthrough();

export const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['power', 'lifesupport', 'shielding', 'food', 'spares', 'comfort']),
  massKg: z.number(),
  powerKw: z.number(),
  effects: z.array(ItemEffectSchema),
  blurb: z.string(),
  tradeoff: z.string(),
  sourceId: z.string(),
  verified: z.boolean(),
});

export const EventPreconditionSchema = z.object({
  type: z.enum(['has_item', 'has_category', 'min_sol']),
  itemId: z.string().optional(),
  category: z.enum(['power', 'lifesupport', 'shielding', 'food', 'spares', 'comfort']).optional(),
  sol: z.number().optional(),
});

export const EffectModifierSchema = z.object({
  target: z.string(),
  add: z.number().optional(),
  mult: z.number().optional(),
  set: z.number().optional(),
  forSols: z.number().optional(),
});

export const EventChoiceSchema = z.object({
  id: z.string(),
  label: z.string(),
  requires: z.string().optional(),
  effects: z.array(EffectModifierSchema),
  lesson: z.string(),
});

export const EventSchema = z.object({
  id: z.string(),
  title: z.string(),
  narrative: z.string(),
  weight: z.number(),
  earliestSol: z.number(),
  preconditions: z.array(EventPreconditionSchema),
  choices: z.array(EventChoiceSchema),
});

export const SourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  publisher: z.string(),
  url: z.string(),
  accessedOn: z.string(),
  usedFor: z.string(),
  sourceType: z.enum(['MEASURED', 'NASA STANDARD', 'DESIGN ASSUMPTION']).optional(),
});

export const ConstantsListSchema = z.array(ConstantSchema);
export const ItemsListSchema = z.array(ItemSchema);
export const EventsListSchema = z.array(EventSchema);
export const SourcesListSchema = z.array(SourceSchema);

// Parse and validate immediately at module load time
export const CONSTANTS: ConstantEntry[] = ConstantsListSchema.parse(rawConstants);
export const ITEMS: PackableItem[] = ItemsListSchema.parse(rawItems);
export const EVENTS: SimulationEvent[] = EventsListSchema.parse(rawEvents);
export const SOURCES: SourceEntry[] = SourcesListSchema.parse(rawSources);

export function getConstantValue(id: string, fallback: number = 0): number {
  const found = CONSTANTS.find((c) => c.id === id);
  return found ? found.value : fallback;
}

export function getConstant(id: string): ConstantEntry | undefined {
  return CONSTANTS.find((c) => c.id === id);
}

export function getItem(id: string): PackableItem | undefined {
  return ITEMS.find((i) => i.id === id);
}

export function getEvent(id: string): SimulationEvent | undefined {
  return EVENTS.find((e) => e.id === id);
}
