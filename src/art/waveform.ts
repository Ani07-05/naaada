// Deterministic waveform bar heights (40 bars) from a track id.
// Same id => same waveform (README: heights 30–100%).
import { seedRng } from './cover';

export const WAVEFORM_BARS = 40;

export function waveformHeights(trackId: string, bars = WAVEFORM_BARS): number[] {
  const rng = seedRng('wave:' + trackId);
  const out: number[] = [];
  for (let i = 0; i < bars; i++) {
    out.push(0.3 + rng() * 0.7); // 0.3..1.0
  }
  return out;
}
