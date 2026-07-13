# Terminal — a quiet TUI-styled music player

Cross-platform (React Native / Expo, web-ready) music player with a text-user-interface
aesthetic — monospace type, box-drawing chars, ASCII progress bars, character-block cover
art, 9 switchable themes, and full Devanagari/Unicode support. The "terminal" look is purely
visual; it plays the user's **own local audio files**.

Built from the `design_reference/` handoff (see `design_reference/.../README.md` for the
original spec — the ground truth for colors, spacing, and copy).

## Stack

- **Expo SDK 52** + TypeScript, **expo-router** (file-based navigation)
- **react-native-track-player** — real background playback + media notification (native)
- **expo-sqlite** — the library (single source of truth), seeded on first run
- **zustand** — player / library / ui / settings state
- **expo-document-picker** + **expo-media-library** — import local audio
- **@expo-google-fonts** — JetBrains Mono, Space Mono, VT323 + Noto Sans Devanagari fallback

## Running

Requires a **custom dev build** (track-player is a native module — Expo Go won't work).

```bash
npm install

# Native (Android — needs Android SDK + JDK installed):
npx expo run:android        # builds + installs the dev client, then Metro

# Web (instant, no native toolchain — playback uses the simulated tick for now):
npm run web
```

On first launch the DB seeds a demo library (incl. the Devanagari album कविता शर्मा —
"रात का पहर" and pre-seeded synced lyrics). Demo rows have no audio file, so they animate via
a simulated position tick — enough to demo every screen. **Import real files** via
`library → [+] add track`; those play for real through track-player with a background
notification.

## Project layout

```
app/                      expo-router routes
  _layout.tsx             providers, font loading, playback host, service registration
  (tabs)/                 library · search · now · queue · config  (+ custom TuiNav)
src/
  theme/      tokens.ts (9 palettes, accents, fonts) · ThemeProvider · useTheme
  components/ Tui* primitives, BlockCover, Waveform, MiniPlayer, RowActionMenu, Welcome …
  data/       types · db (schema + seed) · repo (typed SQLite access) · seed fixtures
  store/      playerStore (transport/queue) · libraryStore · uiStore · settingsStore
  playback/   tp(.web) facade · setup · service · usePlayback engine · PlaybackHost
  art/        cover.ts (deterministic mosaic) · waveform.ts
  import/     importAudio (file picker + media-library scan)
  lib/        format helpers
```

## Status

**Phases 0–4 complete** — the full app is built:

- **Core (0–3):** design system, 9 themes, library (songs/albums/artists/playlists), Now Playing
  (art/banner, tap-to-seek waveform, transport, synced lyrics), mini player, nav, local import,
  row menu, welcome.
- **Phase 4:** Search (Unicode/Devanagari), Queue (reorder/clear/history), Album/Artist/Playlist
  detail screens, full Config (playback/audio/interface/content/storage/about), Themes gallery
  (live swatches + accent + font), Lyrics manager, and all dialogs — edit/add track, create/edit
  playlist, add-to-playlist, and the **LRC lyrics editor** with `⊙ stamp now` live sync.

Verified: `tsc --noEmit` clean, full web bundle exports, web dev server serves + bundles clean
(1134 modules). Remaining verification: run on an Android device/emulator to confirm real-file
audio + background notification end-to-end.

### Deferred

- **Phase 5:** real web audio engine (HTMLAudio/shaka behind the `usePlayback` interface) to
  replace the simulated tick on web; optional Spotify/YT *metadata-only* import (no audio).
- Polish: drag-to-reorder queue (currently ▲▼ controls), row-menu anchoring to the tapped ⋮.
```
