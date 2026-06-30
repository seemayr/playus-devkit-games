function hashString(value: string): number {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(index)) | 0;
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSeededRandom(seed?: string): () => number {
  if (seed === undefined || seed === '') return () => Math.random();
  return mulberry32(hashString(seed));
}

export function seededBetween(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

export function seededFloatBetween(random: () => number, min: number, max: number): number {
  return min + random() * (max - min);
}

export function seededShuffle<T>(random: () => number, values: T[]): T[] {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    const current = values[index];
    values[index] = values[target];
    values[target] = current;
  }
  return values;
}
