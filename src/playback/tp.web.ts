// Web stub for track-player so the web bundle never pulls in the native player
// (or its shaka-player web dependency). Web playback is handled by the sim/HTMLAudio
// path today; a real HTMLAudio engine lands in Phase 5.
export const isTPAvailable = false;
export const Event: any = {};
export const State: any = {};
export const Capability: any = {};
export const AppKilledPlaybackBehavior: any = {};

const noop = () => Promise.resolve();
const stub: any = new Proxy(
  {},
  {
    get: () => noop,
  }
);
export default stub;
