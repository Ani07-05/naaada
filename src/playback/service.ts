// TrackPlayer playback service — routes remote (notification / lock-screen)
// controls to the player store. Registered in app/_layout via registerPlaybackService.
import TrackPlayer, { Event } from './tp';
import { usePlayer } from '@/store/playerStore';

module.exports = async function () {
  const p = () => usePlayer.getState();

  TrackPlayer.addEventListener(Event.RemotePlay, () => p().setPlaying(true));
  TrackPlayer.addEventListener(Event.RemotePause, () => p().setPlaying(false));
  TrackPlayer.addEventListener(Event.RemoteNext, () => p().next());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => p().prev());
  TrackPlayer.addEventListener(Event.RemoteSeek, (e: { position: number }) => p().seek(e.position));
  TrackPlayer.addEventListener(Event.RemoteStop, () => p().setPlaying(false));
};
