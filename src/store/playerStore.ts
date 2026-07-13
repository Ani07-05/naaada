// Playback state — ports the app.jsx reducer. Pure state; Phase 2 hook syncs
// this with react-native-track-player (commands out, position/playing events in).
import { create } from 'zustand';
import { songById } from './libraryStore';

export type Repeat = 'off' | 'all' | 'one';

type PlayerState = {
  queue: string[]; // ordered song ids
  index: number; // position in queue of the current track (-1 if none)
  playing: boolean;
  position: number; // seconds
  duration: number; // seconds
  shuffle: boolean;
  repeat: Repeat;
  history: string[];

  nowPlayingId: () => string | null;

  playSong: (songId: string) => void;
  playContext: (ids: string[], startId?: string) => void;
  toggle: () => void;
  setPlaying: (v: boolean) => void;
  next: (auto?: boolean) => void;
  prev: () => void;
  seek: (pos: number) => void;
  setPosition: (pos: number) => void;
  setDuration: (d: number) => void;
  enqueue: (songId: string) => void;
  clearQueue: () => void;
  removeFromQueue: (songId: string) => void;
  reorderQueue: (from: number, to: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
};

function durationOf(songId: string | null): number {
  const s = songById(songId ?? null);
  return s ? s.dur : 0;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [],
  index: -1,
  playing: false,
  position: 0,
  duration: 0,
  shuffle: false,
  repeat: 'off',
  history: [],

  nowPlayingId: () => {
    const { queue, index } = get();
    return index >= 0 && index < queue.length ? queue[index] : null;
  },

  playSong: (songId) => {
    const { queue } = get();
    const existing = queue.indexOf(songId);
    if (existing >= 0) {
      set({ index: existing, position: 0, playing: true, duration: durationOf(songId) });
    } else {
      const nq = [...queue, songId];
      set({ queue: nq, index: nq.length - 1, position: 0, playing: true, duration: durationOf(songId) });
    }
  },

  playContext: (ids, startId) => {
    if (!ids.length) return;
    const start = startId ? Math.max(0, ids.indexOf(startId)) : 0;
    set({ queue: ids, index: start, position: 0, playing: true, duration: durationOf(ids[start]) });
  },

  toggle: () => set((s) => ({ playing: !s.playing })),
  setPlaying: (v) => set({ playing: v }),

  next: (auto = false) => {
    const { queue, index, repeat, shuffle } = get();
    if (!queue.length) return;
    if (repeat === 'one' && auto) {
      set({ position: 0 });
      return;
    }
    let nextIndex: number;
    if (shuffle) {
      if (queue.length === 1) nextIndex = index;
      else {
        do {
          nextIndex = Math.floor(Math.random() * queue.length);
        } while (nextIndex === index);
      }
    } else {
      nextIndex = index + 1;
      if (nextIndex >= queue.length) {
        if (repeat === 'all') nextIndex = 0;
        else {
          set({ playing: false, position: 0 });
          return;
        }
      }
    }
    const cur = queue[index];
    set((s) => ({
      index: nextIndex,
      position: 0,
      playing: true,
      duration: durationOf(queue[nextIndex]),
      history: cur ? [cur, ...s.history].slice(0, 50) : s.history,
    }));
  },

  prev: () => {
    const { queue, index, position } = get();
    if (!queue.length) return;
    if (position > 3) {
      set({ position: 0 });
      return;
    }
    const prevIndex = index - 1 < 0 ? 0 : index - 1;
    set({ index: prevIndex, position: 0, playing: true, duration: durationOf(queue[prevIndex]) });
  },

  seek: (pos) => set({ position: Math.max(0, pos) }),
  setPosition: (pos) => set({ position: pos }),
  setDuration: (d) => set({ duration: d }),

  enqueue: (songId) =>
    set((s) => (s.queue.includes(songId) ? s : { queue: [...s.queue, songId] })),

  clearQueue: () => {
    const cur = get().nowPlayingId();
    set({ queue: cur ? [cur] : [], index: cur ? 0 : -1 });
  },

  removeFromQueue: (songId) => {
    const { queue, index } = get();
    const at = queue.indexOf(songId);
    if (at < 0) return;
    const nq = queue.filter((id) => id !== songId);
    let ni = index;
    if (at < index) ni = index - 1;
    else if (at === index) ni = Math.min(index, nq.length - 1);
    set({ queue: nq, index: nq.length ? ni : -1 });
  },

  reorderQueue: (from, to) => {
    const { queue, index } = get();
    if (from === to) return;
    const nq = [...queue];
    const [moved] = nq.splice(from, 1);
    nq.splice(to, 0, moved);
    // keep current track highlighted
    const curId = queue[index];
    set({ queue: nq, index: nq.indexOf(curId) });
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  cycleRepeat: () =>
    set((s) => ({ repeat: s.repeat === 'off' ? 'all' : s.repeat === 'all' ? 'one' : 'off' })),
}));
