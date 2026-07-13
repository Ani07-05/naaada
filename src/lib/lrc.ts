// LRC-style lyrics parsing/serialization.
// [mm:ss] or [mm:ss.xx] prefix => timed line; untimed non-empty => prev + 4s.
import { LyricLine } from '@/data/types';

const LINE_RE = /^\s*\[(\d+):(\d+)(?:[.:](\d+))?\]\s?(.*)$/;

export function parseLrc(text: string): LyricLine[] {
  const out: LyricLine[] = [];
  let last = 0;
  for (const raw of text.split('\n')) {
    const m = raw.match(LINE_RE);
    if (m) {
      const mm = parseInt(m[1], 10);
      const ss = parseInt(m[2], 10);
      const frac = m[3] ? parseInt(m[3].padEnd(2, '0').slice(0, 2), 10) / 100 : 0;
      const t = mm * 60 + ss + frac;
      last = t;
      out.push({ t, line: m[4] ?? '' });
    } else if (raw.trim() === '') {
      out.push({ t: last, line: '' });
    } else {
      last = last + 4;
      out.push({ t: last, line: raw });
    }
  }
  return out;
}

function stamp(t: number): string {
  const s = Math.max(0, Math.floor(t));
  return `[${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}]`;
}

export function serializeLrc(lines: LyricLine[]): string {
  return lines.map((l) => `${stamp(l.t)} ${l.line}`.trimEnd()).join('\n');
}

export { stamp as stampTime };
