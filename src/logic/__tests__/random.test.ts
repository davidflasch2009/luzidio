import { createId, createRng, hashString, randomInt, shuffle } from '../random';

describe('random', () => {
  it('ist mit gleichem Seed reproduzierbar', () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 5 }, a);
    expect(Array.from({ length: 5 }, b)).toEqual(seqA);
    for (const v of seqA) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
    expect(createRng(43)()).not.toBe(seqA[0]);
  });

  it('hasht stabil', () => {
    expect(hashString('2026-03-29')).toBe(hashString('2026-03-29'));
    expect(hashString('a')).not.toBe(hashString('b'));
    expect(hashString('')).toBe(0x811c9dc5);
  });

  it('liefert Ganzzahlen im Bereich', () => {
    const rng = createRng(1);
    for (let i = 0; i < 200; i++) {
      const v = randomInt(rng, 3, 6);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(6);
    }
    expect(() => randomInt(rng, 5, 4)).toThrow();
  });

  it('mischt ohne Elemente zu verlieren', () => {
    const items = [1, 2, 3, 4, 5, 6, 7];
    const out = shuffle(items, createRng(9));
    expect(out).toHaveLength(items.length);
    expect([...out].sort()).toEqual(items);
    expect(items).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('erzeugt unterschiedliche IDs', () => {
    const ids = new Set(Array.from({ length: 50 }, () => createId()));
    expect(ids.size).toBe(50);
  });
});
