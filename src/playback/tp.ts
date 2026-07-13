// Native track-player facade. Metro resolves tp.web.ts on web, this file elsewhere.
import TrackPlayer, {
  Event,
  State,
  Capability,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';

export const isTPAvailable = true;
export { Event, State, Capability, AppKilledPlaybackBehavior };
export default TrackPlayer;
