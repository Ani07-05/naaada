// Real per-song waveform amplitudes.
//
// NOTE: the native decoder (react-native-audio-analyzer) is built on Nitro,
// which REQUIRES the React Native New Architecture. react-native-track-player
// 4.1.1 is incompatible with the New Architecture (its Kotlin @ReactMethods
// return kotlinx.coroutines.Job, which the TurboModule interop can't parse and
// crashes at startup). Until track-player ships New-Arch support (or we patch
// it), we run on the old architecture and fall back to the stylized waveform.
//
// This stub keeps the app buildable on the old arch; callers treat a null
// result as "use the deterministic stylized shape".
export const canExtractPeaks = false;
// Signature matches the real analyzer so callers are unchanged; args are ignored.
export async function extractPeaks(_uri?: string, _bars?: number): Promise<number[] | null> {
  return null;
}
