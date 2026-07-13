// react-native-track-player setup. Native only (no-op via stub on web).
import TrackPlayer, { Capability, AppKilledPlaybackBehavior, isTPAvailable } from './tp';

let setupPromise: Promise<boolean> | null = null;

// Idempotent player setup. Resolves true when the native player is ready.
export function setupPlayer(): Promise<boolean> {
  if (!isTPAvailable) return Promise.resolve(false);
  if (setupPromise) return setupPromise;
  setupPromise = (async () => {
    try {
      await TrackPlayer.setupPlayer({ autoHandleInterruptions: true });
    } catch (e: any) {
      // "player already initialized" — safe to ignore.
      if (!String(e?.message || e).includes('already')) throw e;
    }
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
      progressUpdateEventInterval: 1,
    });
    return true;
  })();
  return setupPromise;
}
