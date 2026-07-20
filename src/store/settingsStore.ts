// Persisted user preferences (theme, font, size, accent, cover style, welcome flag).
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ThemeId, FontId, AccentId, FONT_SIZE_DEFAULT, FONT_SIZE_MIN, FONT_SIZE_MAX,
} from '@/theme/tokens';

export type CoverStyle = 'blocks' | 'ascii' | 'letter';
export type Eq = 'flat' | 'warm' | 'bass' | 'vocal';
export type StreamQuality = 'auto' | 'wifi' | 'hq';

type SettingsState = {
  theme: ThemeId;
  font: FontId;
  fontSize: number;
  accent: AccentId | null;
  coverStyle: CoverStyle;
  welcomeSeen: boolean;
  hydrated: boolean;

  // playback / audio prefs
  speed: number; // playback rate, 0.5 .. 2
  crossfade: boolean;
  gapless: boolean;
  eq: Eq;
  streamQuality: StreamQuality;
  downloadedOnly: boolean;

  setTheme: (t: ThemeId) => void;
  setFont: (f: FontId) => void;
  setFontSize: (n: number) => void;
  setAccent: (a: AccentId | null) => void;
  setCoverStyle: (c: CoverStyle) => void;
  setWelcomeSeen: (v: boolean) => void;
  setSpeed: (n: number) => void;
  setCrossfade: (v: boolean) => void;
  setGapless: (v: boolean) => void;
  setEq: (v: Eq) => void;
  setStreamQuality: (v: StreamQuality) => void;
  setDownloadedOnly: (v: boolean) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'paper',
      font: 'jetbrains',
      fontSize: FONT_SIZE_DEFAULT,
      accent: null,
      coverStyle: 'blocks',
      welcomeSeen: false,
      hydrated: false,

      speed: 1,
      crossfade: false,
      gapless: true,
      eq: 'flat',
      streamQuality: 'auto',
      downloadedOnly: false,

      setTheme: (theme) => set({ theme }),
      setFont: (font) => set({ font }),
      setFontSize: (fontSize) =>
        set({ fontSize: Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, fontSize)) }),
      setAccent: (accent) => set({ accent }),
      setCoverStyle: (coverStyle) => set({ coverStyle }),
      setWelcomeSeen: (welcomeSeen) => set({ welcomeSeen }),
      setSpeed: (speed) => set({ speed: Math.max(0.25, Math.min(4, speed)) }),
      setCrossfade: (crossfade) => set({ crossfade }),
      setGapless: (gapless) => set({ gapless }),
      setEq: (eq) => set({ eq }),
      setStreamQuality: (streamQuality) => set({ streamQuality }),
      setDownloadedOnly: (downloadedOnly) => set({ downloadedOnly }),
    }),
    {
      name: 'terminal-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        theme: s.theme,
        font: s.font,
        fontSize: s.fontSize,
        accent: s.accent,
        coverStyle: s.coverStyle,
        welcomeSeen: s.welcomeSeen,
        speed: s.speed,
        crossfade: s.crossfade,
        gapless: s.gapless,
        eq: s.eq,
        streamQuality: s.streamQuality,
        downloadedOnly: s.downloadedOnly,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
