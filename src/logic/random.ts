/** Deterministischer Zufallszahlengenerator (mulberry32). Liefert Werte in [0, 1). */
export type Rng = () => number;

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Einfacher, stabiler String-Hash (FNV-1a, 32 Bit). */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Ganzzahl in [min, max] (beide inklusive). */
export function randomInt(rng: Rng, min: number, max: number): number {
  if (max < min) throw new Error('max < min');
  return min + Math.floor(rng() * (max - min + 1));
}

/** Fisher-Yates-Mischen; gibt eine neue Liste zurück. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

/** Erzeugt eine zufällige ID (nicht kryptografisch, reicht für lokale Datensätze). */
export function createId(rng: Rng = Math.random): string {
  const time = Date.now().toString(36);
  let rand = '';
  for (let i = 0; i < 10; i++) rand += Math.floor(rng() * 36).toString(36);
  return `${time}-${rand}`;
}
