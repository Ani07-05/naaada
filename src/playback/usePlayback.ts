// Bridges the player store to react-native-track-player.
// Real audio (song.uri set, native) -> track-player. Demo rows (uri=null) or web
// -> simulated tick, so the app is fully demoable before the user imports files.
import { useEffect, useRef } from 'react';
import { usePlayer } from '@/store/playerStore';
import { songById, useLibrary } from '@/store/libraryStore';
import { useSettings } from '@/store/settingsStore';
import * as repo from '@/data/repo';
import { setupPlayer } from './setup';
import TrackPlayer, { Event, State, isTPAvailable } from './tp';

// True when the current track should use the real native player.
function isReal(uri: string | null | undefined): boolean {
  return isTPAvailable && !!uri;
}

// Seek that keeps store + native in sync.
export async function seekTo(pos: number) {
  const st = usePlayer.getState();
  st.seek(pos);
  const song = songById(st.nowPlayingId());
  if (isReal(song?.uri)) {
    try {
      await TrackPlayer.seekTo(pos);
    } catch {}
  }
}

// Set the playback speed: persist it and push to the native player if a real
// track is loaded. Demo/sim tracks read the rate off settings each tick.
export async function setPlaybackRate(rate: number) {
  useSettings.getState().setSpeed(rate);
  const song = songById(usePlayer.getState().nowPlayingId());
  if (isReal(song?.uri)) {
    try {
      await TrackPlayer.setRate(useSettings.getState().speed);
    } catch {}
  }
}

export function usePlaybackEngine() {
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // one-time native setup + event wiring
  useEffect(() => {
    if (!isTPAvailable) return;
    let mounted = true;
    const subs: { remove: () => void }[] = [];
    (async () => {
      const ok = await setupPlayer();
      if (!mounted || !ok) return;
      subs.push(
        TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (e: any) => {
          const song = songById(usePlayer.getState().nowPlayingId());
          if (!song?.uri) return;
          usePlayer.getState().setPosition(Math.floor(e.position));
          const realDur = Math.round(e.duration || 0);
          if (realDur > 0 && song.dur !== realDur) {
            usePlayer.getState().setDuration(realDur);
            repo
              .updateSong(song.id, { dur: realDur })
              .then(() => useLibrary.getState().refresh())
              .catch(() => {});
          }
        })
      );
      subs.push(
        TrackPlayer.addEventListener(Event.PlaybackState, (e: any) => {
          const s = usePlayer.getState();
          const song = songById(s.nowPlayingId());
          if (!song?.uri) return;
          // Seeking passes through transient states (Buffering/Ready/Connecting)
          // that aren't real pauses — only Playing/Paused/Stopped/Ended are
          // definitive, so ignore the rest to avoid a spurious pause loop.
          if (e.state === State.Playing) {
            if (!s.playing) s.setPlaying(true);
          } else if (
            e.state === State.Paused ||
            e.state === State.Stopped ||
            e.state === State.Ended
          ) {
            if (s.playing) s.setPlaying(false);
          }
        })
      );
      subs.push(
        TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
          usePlayer.getState().next(true);
        })
      );
    })();
    return () => {
      mounted = false;
      subs.forEach((s) => s.remove());
    };
  }, []);

  const nowPlayingId = usePlayer((s) => (s.index >= 0 ? s.queue[s.index] : null));
  const playing = usePlayer((s) => s.playing);

  // Load the current track whenever it changes.
  useEffect(() => {
    const song = songById(nowPlayingId);
    stopSim(simRef);
    if (!song) return;

    if (isReal(song.uri)) {
      (async () => {
        try {
          await TrackPlayer.reset();
          await TrackPlayer.add({
            url: song.uri as string,
            title: song.title,
            artist: song.artist,
            duration: song.dur || undefined,
          });
          usePlayer.getState().setDuration(song.dur || 0);
          try {
            await TrackPlayer.setRate(useSettings.getState().speed);
          } catch {}
          if (usePlayer.getState().playing) await TrackPlayer.play();
        } catch (e) {
          console.warn('load track failed', e);
        }
      })();
    } else {
      if (isTPAvailable) {
        try {
          TrackPlayer.reset();
        } catch {}
      }
      usePlayer.getState().setDuration(song.dur || 0);
      if (usePlayer.getState().playing) startSim(simRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nowPlayingId]);

  // React to play/pause intent.
  useEffect(() => {
    const song = songById(nowPlayingId);
    if (!song) return;
    if (isReal(song.uri)) {
      if (playing) TrackPlayer.play().catch(() => {});
      else TrackPlayer.pause().catch(() => {});
    } else {
      if (playing) startSim(simRef);
      else stopSim(simRef);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, nowPlayingId]);

  useEffect(() => () => stopSim(simRef), []);
}

function startSim(ref: React.MutableRefObject<ReturnType<typeof setInterval> | null>) {
  if (ref.current) return;
  ref.current = setInterval(() => {
    const s = usePlayer.getState();
    const dur = s.duration || 0;
    const step = useSettings.getState().speed || 1;
    if (dur > 0 && s.position + step >= dur) s.next(true);
    else s.setPosition(s.position + step);
  }, 1000);
}

function stopSim(ref: React.MutableRefObject<ReturnType<typeof setInterval> | null>) {
  if (ref.current) {
    clearInterval(ref.current);
    ref.current = null;
  }
}
