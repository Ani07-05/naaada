// Character-block cover art + ASCII helpers

// deterministic PRNG from string seed
function seedRng(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

const BLOCK_CHARS = ['█','▓','▒','░',' ','▚','▞','▌','▐','▘','▝','▖','▗'];
// Keep art calm — favor denser blocks + space
const ART_CHARS = ['█','█','▓','▓','▒','▒','░',' ',' ','▚','▞'];

// Generate a square block of chars, size×size.
function coverBlock(seed, size = 8) {
  const rng = seedRng(seed);
  const rows = [];
  // pattern type: stripes, diagonals, dither, grid
  const kind = Math.floor(rng() * 4);
  for (let y = 0; y < size; y++) {
    let row = '';
    for (let x = 0; x < size; x++) {
      let idx;
      if (kind === 0) { // stripes
        idx = Math.floor(rng() * 3) + ((x + y) % 2 ? 0 : 3);
      } else if (kind === 1) { // diag
        idx = ((x - y + size) % size < size / 2) ? Math.floor(rng() * 3) : Math.floor(rng() * 3) + 4;
      } else if (kind === 2) { // dither
        idx = Math.floor(rng() * ART_CHARS.length);
      } else { // grid
        idx = (x % 2 === 0 && y % 2 === 0) ? 0 : Math.floor(rng() * 4) + 2;
      }
      row += ART_CHARS[Math.min(idx, ART_CHARS.length - 1)];
    }
    rows.push(row);
  }
  return rows;
}

// Render as a <pre> element. style: 'blocks' | 'letter' | 'ascii'
function Cover({ seed, size = 8, label = '', style = 'blocks', tint }) {
  const theme = tint || 'var(--ink)';
  if (style === 'letter') {
    const letter = (label || seed || '?').replace(/[^a-z]/gi,'').slice(0,1).toUpperCase() || '·';
    return (
      <pre className="cover cover-letter" style={{ color: theme }}>
{`┌${'─'.repeat(size*2)}┐
${Array.from({length: size}).map((_,i) => {
  const mid = Math.floor(size/2) - 1;
  if (i === mid) return `│${' '.repeat(size-1)}${letter}${' '.repeat(size)}│`;
  return `│${' '.repeat(size*2)}│`;
}).join('\n')}
└${'─'.repeat(size*2)}┘`}
      </pre>
    );
  }
  if (style === 'ascii') {
    // dithered ascii using .:-=+*#%@
    const rng = seedRng(seed);
    const chars = [' ',' ','.',':','-','=','+','*','#','%','@'];
    const rows = [];
    for (let y = 0; y < size; y++) {
      let r = '';
      for (let x = 0; x < size*2; x++) {
        const v = Math.floor(rng() * chars.length);
        r += chars[v];
      }
      rows.push(r);
    }
    return (
      <pre className="cover cover-ascii" style={{ color: theme }}>
{`┌${'─'.repeat(size*2)}┐\n${rows.map(r=>`│${r}│`).join('\n')}\n└${'─'.repeat(size*2)}┘`}
      </pre>
    );
  }
  // default: blocks
  const rows = coverBlock(seed, size);
  return (
    <pre className="cover cover-blocks" style={{ color: theme }}>
{`┌${'─'.repeat(size*2)}┐\n${rows.map(r => `│${r.split('').map(c=>c+c).join('')}│`).join('\n')}\n└${'─'.repeat(size*2)}┘`}
    </pre>
  );
}

// ASCII progress bar: [████████░░░░░░░░░░]
function ProgressBar({ value, max, width = 30, filled = '█', empty = '░' }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const n = Math.round(pct * width);
  return `${filled.repeat(n)}${empty.repeat(width - n)}`;
}

// Horizontal rule of given width
const hr = (w, ch = '─') => ch.repeat(w);

// Box drawing helpers — return an array of lines
function box(lines, { width, title, density = 'medium' } = {}) {
  const w = width || Math.max(...lines.map(l => l.length));
  const pad = s => s + ' '.repeat(Math.max(0, w - s.length));
  const tl = density === 'heavy' ? '╔' : '┌';
  const tr = density === 'heavy' ? '╗' : '┐';
  const bl = density === 'heavy' ? '╚' : '└';
  const br = density === 'heavy' ? '╝' : '┘';
  const h  = density === 'heavy' ? '═' : '─';
  const v  = density === 'heavy' ? '║' : '│';
  const top = title
    ? `${tl}${h.repeat(2)} ${title} ${h.repeat(Math.max(0, w - title.length - 4))}${tr}`
    : `${tl}${h.repeat(w)}${tr}`;
  const mid = lines.map(l => `${v}${pad(l)}${v}`);
  const bot = `${bl}${h.repeat(w)}${br}`;
  return [top, ...mid, bot];
}

Object.assign(window, { Cover, coverBlock, ProgressBar, hr, box, seedRng });
