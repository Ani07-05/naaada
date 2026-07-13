// Headless component that runs the playback engine. Mounted once in the root layout.
import { usePlaybackEngine } from './usePlayback';

export function PlaybackHost() {
  usePlaybackEngine();
  return null;
}
