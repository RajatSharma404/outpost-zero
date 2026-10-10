import { describe, it, expect } from 'vitest';
import { CONSTANTS, ITEMS, EVENTS, SOURCES, ConstantSchema, ItemSchema } from '../lib/data';

describe('Data Layer Validation', () => {
  it('loads and validates all constants', () => {
    expect(CONSTANTS.length).toBeGreaterThanOrEqual(10);
    for (const c of CONSTANTS) {
      expect(() => ConstantSchema.parse(c)).not.toThrow();
      expect(c.id).toBeDefined();
      expect(typeof c.value).toBe('number');
    }
  });

  it('contains verified metabolic and physical values', () => {
    const o2 = CONSTANTS.find((c) => c.id === 'o2_per_crew_per_sol_kg');
    expect(o2).toBeDefined();
    expect(o2?.value).toBe(0.84);
    expect(o2?.verified).toBe(true);

    const rad = CONSTANTS.find((c) => c.id === 'mars_radiation_msv_per_sol');
    expect(rad).toBeDefined();
    expect(rad?.value).toBe(0.67);
    expect(rad?.verified).toBe(true);
  });

  it('loads and validates packable items', () => {
    expect(ITEMS.length).toBeGreaterThanOrEqual(12);
    for (const item of ITEMS) {
      expect(() => ItemSchema.parse(item)).not.toThrow();
      expect(item.massKg).toBeGreaterThan(0);
      expect(item.tradeoff.length).toBeGreaterThan(5);
    }
  });

  it('loads and validates event cards with at least one locked choice', () => {
    expect(EVENTS.length).toBeGreaterThanOrEqual(10);
    for (const event of EVENTS) {
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
      const hasLocked = event.choices.some((c) => c.requires !== undefined);
      // Ensure at least one choice per event highlights item requirements or tradeoffs
      expect(hasLocked).toBe(true);
    }
  });

  it('loads and validates sources bibliography', () => {
    expect(SOURCES.length).toBeGreaterThanOrEqual(5);
    for (const source of SOURCES) {
      expect(source.url).toMatch(/^https?:\/\//);
      expect(source.accessedOn).toBeDefined();
    }
  });

  it('rejects malformed items via Zod', () => {
    const badItem = {
      id: 'invalid',
      name: 'Bad Item',
      category: 'unknown_category',
      massKg: 'not_a_number',
    };
    expect(() => ItemSchema.parse(badItem)).toThrow();
  });
});
