import { describe, it, expect } from 'vitest';
import { Mulberry32 } from '../lib/sim/rng';

describe('Mulberry32 PRNG', () => {
  it('is completely deterministic for identical seeds', () => {
    const rngA = new Mulberry32(12345);
    const rngB = new Mulberry32(12345);

    const valuesA = Array.from({ length: 500 }, () => rngA.next());
    const valuesB = Array.from({ length: 500 }, () => rngB.next());

    expect(valuesA).toEqual(valuesB);
  });

  it('produces different sequences for distinct seeds', () => {
    const rngA = new Mulberry32(1111);
    const rngB = new Mulberry32(2222);

    expect(rngA.next()).not.toEqual(rngB.next());
  });

  it('generates values strictly within [0, 1)', () => {
    const rng = new Mulberry32(999);
    for (let i = 0; i < 1000; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('generates integers within specified bounds', () => {
    const rng = new Mulberry32(54321);
    for (let i = 0; i < 500; i++) {
      const val = rng.int(10, 20);
      expect(val).toBeGreaterThanOrEqual(10);
      expect(val).toBeLessThanOrEqual(20);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('picks uniformly from an array', () => {
    const rng = new Mulberry32(777);
    const options = ['alpha', 'beta', 'gamma'];
    const chosen = rng.pick(options);
    expect(options).toContain(chosen);
  });
});
