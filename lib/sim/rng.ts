/**
 * Seeded pseudo-random number generator using Mulberry32.
 * Deterministic across all platforms and runs.
 */
export class Mulberry32 {
  private state: number;

  constructor(seed: number) {
    // Force seed to unsigned 32-bit integer
    this.state = seed >>> 0;
  }

  /**
   * Returns a pseudo-random floating point number in [0, 1)
   */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Uniform integer in [min, max] inclusive
   */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Uniform float in [min, max)
   */
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Pick one item uniformly from an array
   */
  pick<T>(array: readonly T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }

  /**
   * Weighted pick from an array with weight selector
   */
  weightedPick<T>(items: readonly T[], getWeight: (item: T) => number): T {
    const totalWeight = items.reduce((sum, item) => sum + getWeight(item), 0);
    if (totalWeight <= 0) {
      return items[0];
    }
    let threshold = this.range(0, totalWeight);
    for (const item of items) {
      const weight = getWeight(item);
      if (threshold < weight) {
        return item;
      }
      threshold -= weight;
    }
    return items[items.length - 1];
  }

  /**
   * Seed state snapshot
   */
  getState(): number {
    return this.state;
  }
}

export function createRNG(seed: number): Mulberry32 {
  return new Mulberry32(seed);
}
