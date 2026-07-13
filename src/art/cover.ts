// Deterministic character-block cover art — ported from art.jsx.
// Returns a preformatted string to render inside a monospace <Text>.

export type CoverStyle = 'blocks' | 'ascii' | 'letter';

// FNV-1a hash seed -> xorshift PRNG.
export function seedRng(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

// Keep art calm — favor denser blocks + space.
const ART_CHARS = ['█', '█', '▓', '▓', '▒', '▒', '░', ' ', ' ', '▚', '▞'];

// Generate a square block of chars, size×size.
export function coverBlock(seed: string, size = 8): string[] {
  const rng = seedRng(seed);
  const rows: string[] = [];
  const kind = Math.floor(rng() * 4); // stripes, diag, dither, grid
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      let idx: number;
      if (kind === 0) {
        idx = Math.floor(rng() * 3) + ((x + y) % 2 ? 0 : 3);
      } else if (kind === 1) {
        idx = (x - y + size) % size < size / 2 ? Math.floor(rng() * 3) : Math.floor(rng() * 3) + 4;
      } else if (kind === 2) {
        idx = Math.floor(rng() * ART_CHARS.length);
      } else {
        idx = x % 2 === 0 && y % 2 === 0 ? 0 : Math.floor(rng() * 4) + 2;
      }
      row += ART_CHARS[Math.min(idx, ART_CHARS.length - 1)];
    }
    rows.push(row);
  }
  return rows;
}

// Build the full framed cover string for a style/size.
export function buildCover(opts: {
  seed: string;
  size?: number;
  label?: string;
  style?: CoverStyle;
}): string {
  const { seed, size = 8, label = '', style = 'blocks' } = opts;
  const top = `┌${'─'.repeat(size * 2)}┐`;
  const bot = `└${'─'.repeat(size * 2)}┘`;

  if (style === 'letter') {
    const letter =
      (label || seed || '?').replace(/[^a-zA-Z]/g, '').slice(0, 1).toUpperCase() || '·';
    const mid = Math.floor(size / 2) - 1;
    const rows = Array.from({ length: size }, (_, i) => {
      if (i === mid) return `│${' '.repeat(size - 1)}${letter}${' '.repeat(size)}│`;
      return `│${' '.repeat(size * 2)}│`;
    });
    return [top, ...rows, bot].join('\n');
  }

  if (style === 'ascii') {
    const rng = seedRng(seed);
    const chars = [' ', ' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'];
    const rows: string[] = [];
    for (let y = 0; y < size; y++) {
      let r = '';
      for (let x = 0; x < size * 2; x++) r += chars[Math.floor(rng() * chars.length)];
      rows.push(`│${r}│`);
    }
    return [top, ...rows, bot].join('\n');
  }

  // blocks: each cell doubled horizontally so it reads square.
  const rows = coverBlock(seed, size).map(
    (r) => `│${r.split('').map((c) => c + c).join('')}│`
  );
  return [top, ...rows, bot].join('\n');
}

// ASCII progress bar string: ████████░░░░░░
export function asciiProgress(value: number, max: number, width = 22): { fill: string; rest: string } {
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const n = Math.round(pct * width);
  return { fill: '█'.repeat(n), rest: '░'.repeat(width - n) };
}
