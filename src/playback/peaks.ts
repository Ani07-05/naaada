// Real per-song waveform amplitudes, decoded from the audio file via the native
// analyzer (Nitro). Native only — the web build uses peaks.web.ts instead.
import { computeAmplitude, load } from 'react-native-audio-analyzer';

export const canExtractPeaks = true;

// The native decoder wants a real filesystem path. file:// → strip scheme;
// content:// / http(s):// / ph:// → copy to a local file first via load().
async function toLocalPath(uri: string): Promise<string | null> {
  if (!uri) return null;
  if (uri.startsWith('file://')) return decodeURIComponent(uri.slice('file://'.length));
  if (uri.startsWith('/')) return uri;
  try {
    return await load(uri);
  } catch {
    return null;
  }
}

// Returns `bars` amplitude values in 0..1 (with a small visual floor), or null
// if the file can't be decoded — callers fall back to the stylized waveform.
export async function extractPeaks(uri: string, bars: number): Promise<number[] | null> {
  try {
    const path = await toLocalPath(uri);
    if (!path) return null;
    const amps = computeAmplitude(path, bars);
    if (!Array.isArray(amps) || amps.length === 0) return null;
    return amps.map((v) => 0.15 + Math.max(0, Math.min(1, v)) * 0.85);
  } catch {
    return null;
  }
}
