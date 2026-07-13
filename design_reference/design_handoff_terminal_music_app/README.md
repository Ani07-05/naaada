# Handoff: Terminal — TUI Music App for Android

> **Prompt for Claude Code.** Build a native Android music player app called **Terminal** with a TUI (text-user-interface) inspired ASCII aesthetic. This bundle contains high-fidelity HTML design references. Recreate them natively — do not ship the HTML.

---

## Overview

**Terminal** is a minimalist, distraction-free Android music player styled like a classic text-based UI — think calm 1980s software manual, NOT hacker terminal. Monospace typography, warm paper tones, box-drawing characters (`┌ ─ ┐ │ █ ░ ▸ ⋮`), ASCII progress bars, and character-block album art. Full music app functionality: library browsing, playback, queue, playlists, synced lyrics with a built-in editor, track metadata CRUD, and 9 switchable color themes.

**Full Devanagari/Unicode support throughout** — track titles, artist names, lyrics, and search must handle Hindi (हिन्दी) and arbitrary Unicode.

## About the Design Files

The files in this bundle are **design references created in HTML/React** — interactive prototypes showing intended look and behavior, not production code. Your task is to **recreate these designs as a native Android app**. Recommended stack: **Kotlin + Jetpack Compose**, Media3/ExoPlayer for playback, Room for the library database, DataStore for preferences. If the user has an existing codebase, follow its patterns instead.

## Fidelity

**High-fidelity.** Colors, spacing, typography, copy, and interactions in the HTML are final design intent. Match them closely (adapted to dp/sp and Android conventions).

## Design Language — Core Rules

1. **Everything is monospace.** Default font: JetBrains Mono. Selectable alternates: IBM Plex Mono, VT323, Space Mono, Geist Mono. For Devanagari fallback use Noto Sans Devanagari.
2. **No conventional Material chrome inside the app.** No FABs, no elevation shadows on cards, no filled buttons with rounded pills. Structure comes from **hairline borders (solid + dashed), box-drawing characters, and background-tint changes**.
3. **ASCII decorations are functional, not noisy**: section headers are `── label ──────` rules; progress bars are `████████░░░░░░`; selection markers are `▶` / `▸`; brackets denote active state: `[library]` vs ` search `.
4. **All text lowercase** in chrome/labels (`library`, `now playing`, `config`). Track titles keep their natural casing.
5. **Keyboard hints shown as decoration** on Android (e.g. `[space] play/pause` in the nav hint line) — they reinforce the TUI aesthetic. Hardware keyboard support optional but nice.
6. **Subtle paper-grain texture** on the background (2 layered radial-gradient dot grids at 3px/7px, multiply, ~6% opacity).
7. Minimum touch target 44dp even when visuals are compact.

## Design Tokens

### Themes (9) — CSS variable → semantic name

| token | role |
|---|---|
| `--bg` | screen background |
| `--bg-elev` | elevated surfaces (nav bar, mini player, dialogs' title bar, cards) |
| `--ink` | primary text |
| `--ink-soft` | secondary text |
| `--ink-faint` | tertiary/disabled text, inactive glyphs |
| `--accent` | highlights: active tab brackets, play markers, progress fill, current lyric |
| `--selection` | selected/hover row background |
| `--hairline` | borders, dividers, rules |

| theme | bg | bg-elev | ink | ink-soft | ink-faint | accent | selection | hairline |
|---|---|---|---|---|---|---|---|---|
| paper (default) | #efe7d7 | #e7dcc7 | #2a241c | #6b5d47 | #a89776 | #a04a1c | #d9c9a3 | #c9b896 |
| mono | #f5f3ee | #ece9e0 | #1a1a1a | #555555 | #9a968c | #1a1a1a | #dedbd2 | #bfbbaf |
| sepia | #ebd9b4 | #e0ca9e | #3a2610 | #7a5a30 | #a88850 | #8a3a10 | #d4be8c | #b89868 |
| dark | #15140f | #1d1b14 | #e8dfc8 | #a59a7e | #6a6047 | #d9a45c | #2d2a1e | #3a3528 |
| e-ink | #e3e1da | #d8d5cc | #222220 | #56544c | #8a877a | #222220 | #c8c5b8 | #a8a59a |
| contrast | #ffffff | #f0f0f0 | #000000 | #333333 | #888888 | #0000aa | #ffe86b | #000000 |
| amber crt | #1a0e00 | #2a1800 | #ffb86c | #d48849 | #7a4820 | #ffd98c | #3a2400 | #5a3810 |
| phosphor | #001008 | #00180c | #6aff8c | #3ac868 | #1a7a3c | #a0ffb8 | #003020 | #1a4a28 |
| matrix | #000000 | #080808 | #00ff41 | #00aa2a | #005510 | #80ff80 | #002a0a | #003310 |

Theme metadata: each has a `label` and one-line `desc` (paper: "warm cream, sepia ink"; mono: "off-white, pure ink"; sepia: "aged vellum, red ink"; dark: "midnight, warm amber"; e-ink: "paperwhite reader"; contrast: "maximum legibility"; amber crt: "vintage terminal glow"; phosphor: "green tube"; matrix: "cascading code").

**Accent override rule:** the user can pick an accent (amber #a04a1c, rust #8a3a10, sage #5a7148, plum #6b3a5a, ink #2a241c) — but ONLY for the paper-family themes (paper, mono, sepia, dark, e-ink). The exotic themes (contrast, amber crt, phosphor, matrix) always keep their own accent.

### Typography

- Base size 13sp (user-adjustable 11–16sp), line-height 1.45.
- Scale is relative to base: section labels −1sp, sub/meta −2sp, hints −3sp; Now Playing title +4sp semibold; album/playlist header title +3sp semibold.
- Numeric values (durations, counts) use tabular figures.
- Ligatures/contextual alternates OFF (keep box chars aligned).

### Spacing & shape

- Screen padding: 12–14dp. Row padding: 6dp vertical, 8dp horizontal. Row gap via flex `gap: 10`.
- Border radius: 2dp on buttons/chips (nearly square), 3dp on theme swatches. Never larger.
- Borders: 1dp. Dashed hairlines for soft separation (section rules, settings rows, playlist cards); solid for emphasis (search box uses `--ink` border, dialogs use `--ink` border with a hard 4dp offset shadow `4px 4px 0 rgba(0,0,0,0.3)` — like a printed card).

## App Structure & Navigation

Bottom nav — a single row of text tabs separated by `│`:
`[library] │ search │ now │ queue │ config`
Active tab is wrapped in accent-colored brackets and set in medium weight. Below it a one-line hint in faint ink: `[tap] select · [L][S][N][Q] jump · [space] play/pause`. Nav bar background `--bg-elev`, top hairline border.

Detail screens (album, artist, playlist, themes, lyrics manager) highlight their parent tab (library or config). Every screen starts with a **breadcrumb path** in faint ink: `/library/artists/Juno Vale` — the last segment in `--ink` medium weight, earlier segments tappable.

**Mini player** (all screens except Now Playing): fixed above nav bar, `--bg-elev`, top hairline. Contents: tiny 3×3 block-art cover in accent, title (medium) + artist (soft, −2sp) + a 2dp progress line (accent fill on hairline track), then three bordered buttons `⏮` `▶/⏸` `⏭`. Tapping anywhere else opens Now Playing.

**First launch** shows a welcome overlay: a double-line box (`╔═╗`) logo with `♫` and block chars, app name `TERMINAL` letter-spaced, sub-line "a quiet music app", a `[↵] continue →` primary button and three hint lines. Shown once (persist a flag).

## Screens

### 1. Now Playing (hero)

Top to bottom:
1. Breadcrumb: `/library/<artist>/<album>/now playing`
2. **View toggle row** (bottom-dashed): tabs `[art]` / `lyrics` (append ` +` to the lyrics tab label when the track has no lyrics yet); right side: `◐ theme` chip (cycles all 9 themes in order) and `✎ edit` chip (opens Edit Track dialog).
3. **Art view**: centered character-block cover, 10×10 cells, rendered in accent color (see Cover Art below). If the track has a custom ASCII banner, render the banner INSTEAD of the cover: preformatted, centered, accent color, ~13sp, line-height 1.25.
   **Lyrics view**: see Synced Lyrics below.
4. Title (+4sp, medium, centered), artist (soft, centered), album line in faint italic: `— from <album> (<year>) —`.
5. **Waveform**: 40 vertical bars, 3dp wide, 1dp gap, heights 30–100% of 28dp, deterministic pseudo-random from track id (same track ⇒ same waveform). Bars before playhead = accent, current bar = ink, rest = faint. Tap/drag to seek.
6. **Progress row**: `1:27  ██████████░░░░░░░░░░░░  3:34` — elapsed, ASCII bar (~22 `█`/`░` chars, filled part accent, empty faint), total. Draggable seek.
7. **Transport controls**, evenly spaced: `⇋` shuffle · `⏮` prev · `▶/⏸` play-pause (the primary: 1dp ink border, larger; pressed state inverts to ink bg / bg text) · `⏭` next · `↻` repeat. Plain glyphs, no circles; pressed shows `--selection` bg.
8. **Extras row** (top-dashed): `♡ like`/`♥ liked` (accent when liked) · `[≡] queue (8)` · `[+] add to...` — bordered chips, −2sp.
9. **`── track info ──…` section**: key-value table (soft keys left, ink values right): track `04 / 10`, length, album, year, bitrate `320 kbps · flac`.

### 2. Library

Breadcrumb `/library/<subtab>` + a chip row of subtabs: `[songs] albums artists playlists` (active in brackets + accent border).

- **Songs**: `── 24 songs ──` header with a right-aligned `sort: title ↕` chip cycling title → artist → duration. Rows: 2-digit index (or accent `▶` for the playing track), title (ink, ellipsized), sub-line `artist · album` (soft, −2sp), duration right-aligned, and a `⋮` glyph that opens the **row action menu**. Playing row gets `--selection` bg + a 2dp accent bar on the left edge. Below the list: a full-width-centered `[+] add track` bordered button.
- **Albums**: 2-column grid. Each card: 7×7 block cover (accent), title (−1sp, medium, ellipsized), `artist · year` (−2sp, soft). → Album detail.
- **Artists**: rows with `◆` glyph, name, `N albums · M songs` sub, `→` right. → Artist detail.
- **Playlists**: see below.

### 3. Album detail

Breadcrumb; header (bottom-dashed): 8×8 block cover left; right: title (+3sp semibold), artist (accent), `year · N tracks · 38m` (soft), action row: `▶ play` (primary: ink bg, bg text), `⇋ shuffle`, `+ queue` (bordered). Then `── tracks ──` list: track-number rows with duration + `⋮` menu.

### 4. Artist detail

Breadcrumb; name (+4sp semibold), `N albums · M songs`, `▶ play all` + `⇋ shuffle`; `── albums ──` 2-col grid; `── top tracks ──` up to 6 rows.

### 5. Search

- **Input**: solid ink 1dp border on `--bg-elev`, accent `$` prompt prefix, placeholder "type to search…", accent caret; when empty show a blinking 8×1em accent block cursor (1.1s steps).
- Filter chips: `[all] songs albums artists playlists`.
- Empty state: box-drawn panel listing what's searchable + `try: "juno", "harbor", "ambient"`.
- Results grouped in sections `── songs (3) ──`, albums `■`, artists `◆`, playlists `▸`, each row navigating/playing. No results: `no results for "<q>"` with the query in accent. Search must match Unicode/Devanagari.

### 6. Queue

`── now playing ──` (accent label) with the current row; `── up next · 5 songs · 18m ──` with right chip `[×] clear`; draggable-reorder rows (`≡` handle); `── history ──` rows at 60% opacity with `↺`. Empty up-next shows a box-drawn "queue end" panel.

### 7. Playlists (list + detail + create)

- List: dashed-border cards (solid + `--selection` bg on press): 5×5 block cover, `▸ name` (medium), optional italic quoted desc, `N songs · 1h 30m` meta. Header chip `[+] new`.
- Detail: same header pattern as album (cover, name, "playlist", meta, `▶ play` `⇋ shuffle` `✎ edit`), `── tracks ──` with `+ add song` chip.
- **Create dialog**: name input, optional description, live-preview auto-generated cover from the name seed. `[esc] cancel` / `[↵] create`.
- **Add-to-playlist dialog**: "adding: <title>" header + playlist rows with accent `[+]`.

### 8. Config (settings)

Sections of dashed-separated rows (label + sub-label left, control right):
- **playback**: crossfade toggle (`[×] on` / `[ ] off` — accent border+text when on), gapless toggle, equalizer segmented `flat|warm|bass|vocal` (active segment: ink bg, bg text).
- **audio**: stream quality `auto|wifi|hq`, downloaded-only toggle.
- **interface**: `themes` row with `open →` button → **Themes gallery**; quick color-scheme segmented (paper|mono|sepia|dark); cover art segmented (blocks|ascii|letter).
- **content**: `lyrics manager` row with `open →`; `add new track` row with `[+] new`.
- **storage**: kv table (downloaded 1.2 GB / cache 48 MB / free 12.4 GB) + `clear cache`, `manage downloads` buttons.
- **about**: version kv (`1.4.0 — "paper"`), centered ASCII flourish `♫ ═══ ♫`.

### 9. Themes gallery (config → themes)

- `── 9 themes ──` header, right hint "tap to apply". **2-column grid of live preview swatches**, each painted in its OWN palette: 3 chrome dots (accent/soft/faint) over a dashed rule; a mini fake screen (`/library` path bar, a selected row `▶ Ferrybridge` on that theme's selection bg, two plain rows, a mini `█░` progress bar); a label block (name, bold; desc, faint). Active swatch: 2dp accent border + `▸` prefix.
- `── accent color ──`: 5 chips with 12dp color squares + name + `✓` when active (note under: exotic themes override accent).
- `── font ──`: 2-col grid of chips, each rendered IN its font with an `Aa Bb 01` sample line.

### 10. Lyrics manager (config → lyrics manager)

- Summary card (dashed border, `--bg-elev`): "lyrics coverage" + `4/24 · 17%`, an ASCII progress bar (32 chars, accent), "20 tracks still need lyrics."
- Filter chips: `[all (24)] with lyrics (4) needs lyrics (20)`.
- Track rows: accent `✓` (has lyrics) or faint `○`, title + `artist · album` sub, right bordered button `edit` / `+ add` → lyrics editor.

### 11. Dialogs — shared chrome

Centered card, max ~340–380dp wide, `--bg` background, 1dp `--ink` border, **hard offset shadow 4dp/4dp black 30%**, title bar on `--bg-elev` with dashed bottom border, title text like `┌── edit track ──`, `[×]` close at right. Body: soft −1sp labels above inputs; inputs on `--bg-elev` with hairline border, accent border on focus. Action row top-dashed, right-aligned.

- **Edit track**: title / artist inputs (`dir="auto"` for RTL/Devanagari), album dropdown, **custom ascii banner** textarea (monospace, `white-space: pre`, placeholder shows a `╔═╗` box example) with helper "supports devanagari (हिन्दी), ascii art, box-drawing chars", `♪ + add synced lyrics →` button (closes this, opens lyrics editor), destructive `[del] remove` at left (rust border/text) with confirm, `cancel` / `[↵] save`.
- **Add track**: title (placeholder `e.g. धुँध / Blueprint / …`), artist, album dropdown, duration mm:ss inputs.
- **Lyrics editor** — see below.

### 12. Row action menu (⋮)

Popover anchored to the pressed `⋮`, clamped inside the screen: min-width 180dp, `--bg-elev`, 1dp `--ink-soft` border, faint truncated title header `┌ <title> ┐`, then items: `▶ play now`, `+ add to queue`, `+ add to playlist`, `✎ edit track`, `♪ edit lyrics`, `⌂ go to album`, `⤫ delete` (confirm). Item hover/press: selection bg + accent text. Scrim ~15% black.

## Synced Lyrics

**Data model**: per track, an ordered list of `{ t: seconds, line: string }`. Empty lines are spacers. Section markers like `[instrumental]`, `— chorus —` are just lines.

**Display (Now Playing → lyrics)**: vertically scrolling column, centered, +1sp, line-height 1.7, max height ~280dp, vertical fade mask top/bottom 20%. Current line (largest `t ≤ position`): accent, semibold. Past lines: soft. Future: faint. Auto-center the current line (smooth scroll); user can scroll freely. No lyrics → box-drawn "no lyrics yet" empty state + `+ add lyrics` accent button. Edit button at the bottom.

**Editor (LRC-style)**, three modes via chips `[edit] preview help` with right-aligned live `pos: 1:27 / 3:34`:
- **edit**: action row — `⊙ stamp now [1:27]` (accent; inserts `[mm:ss] ` at the START of the cursor's current line using live playback position — this is the killer feature: play the song and tap to sync line by line), `⎙ paste` (clipboard append), `clear`, right-aligned live `N lines`. Below: monospace textarea, ~10 rows, `dir="auto"`.
- **preview**: parsed list, each `mm:ss` faint + text; the line matching current playback highlighted (accent text, 2dp accent left border, selection bg) — live while playing.
- **help**: kv table of format rules + a box-drawn example.
- **Parsing**: `[mm:ss]` or `[mm:ss.xx]` prefix → timed line; a non-empty line without timestamp → previous line's t + 4s; empty parse → remove lyrics. Save button shows `[↵] save · N lines`.

## Cover Art — deterministic generation

No image files. Covers are **character mosaics generated from a seed string** (album/playlist id), so they're stable across launches. Three user-selectable styles:
1. **blocks** (default): square grid (3×3 mini → 10×10 hero) of `█▓▒░ ▚▞` chars inside a `┌─┐│└─┘` frame, each cell doubled horizontally to appear square. Seeded PRNG picks one of 4 pattern kinds (stripes / diagonal split / dither / grid) then fills cells. Rendered in accent color.
2. **ascii**: same frame, dithered `.:-=+*#%@` characters.
3. **letter**: empty frame with the item's first letter centered.

Implement with a seeded hash (e.g. FNV-1a + xorshift). On Android render as text in a monospace `Text` composable (or draw glyphs on Canvas for perf in grids).

## Interactions & Behavior

- Tap any song row → plays it (appends to queue if absent). Playing row highlights everywhere.
- Playback position ticks every second; waveform, both progress bars, mini player, and lyrics highlight all track it.
- prev/next move through the queue; shuffle-album replaces the queue.
- Like toggles `♡`/`♥`.
- Theme/font/size/cover-style/accent changes apply instantly, app-wide, and persist (DataStore).
- All library edits (rename, delete, add, banner, lyrics) update every screen immediately (single source of truth — Room + Flow).
- Transitions: minimal. Instant screen switches or ≤150ms fades. Lyrics auto-scroll is smooth. The ONLY looping animation is the search cursor blink. No springs, no slides — the TUI should feel instant.

## Seed Data (for demo/testing)

9 albums / 8 artists / ~24 songs of calm indie fixtures (Juno Vale — "Parallel Hours" 2024; The Quiet Coast — "Low Tide Dispatch" 2023; Mira Osei — "Analog Weather" 2022; Kestrel — "Paper Architecture" 2024; Ansel Grey — "Field Notes, Vol. II" 2021; Odette March — "Threadbare" 2023; Null Orchestra — "Cassette 04" 2019; plus "Slow Machine", "Harbor Lights") **plus one Devanagari album**: कविता शर्मा — "रात का पहर" (2024) with tracks चाँदनी रात / धुँध / सुबह की पहली किरण. 6 playlists ("Late Desk Work", "Sunday Kitchen", "Commute / Morning", "Overnight Reading", "For Rain", "Second Coffee") with short lowercase descriptions. Synced lyrics pre-seeded for ~4 tracks including चाँदनी रात (Devanagari lyrics). Custom ASCII banners pre-set on "Cassette 04 / Side A" (a `╔═╗ SIDE A` box) and चाँदनी रात (`✶ — रात — ✶`). Exact fixtures are in `data.jsx` / `lyrics-data.jsx`.

## Architecture Suggestions (adapt to taste)

- **UI**: Jetpack Compose, single-activity. A `TuiTheme` CompositionLocal carrying the 8 color tokens; theme switching swaps the palette object.
- **Playback**: Media3 ExoPlayer + MediaSession (background playback, notification). The design's "tick" is just position polling.
- **Data**: Room entities Song / Album / Artist / Playlist / PlaylistEntry / LyricLine; expose Flows; seed DB on first run.
- **Prefs**: DataStore (theme, font, fontSize, accent, coverStyle, welcome-seen).
- Reusable composables: `TuiSectionHead`, `TuiListRow`, `TuiChip`, `TuiButton` (bordered/primary/accent variants), `TuiDialog`, `AsciiProgressBar`, `BlockCover`, `Breadcrumb`, `TuiBottomNav`, `MiniPlayer`.

## Files in this bundle

| file | contents |
|---|---|
| `Terminal.html` | entry point (open in a browser to run the prototype) |
| `styles.css` | ALL visual styling — the ground truth for colors/spacing/type |
| `shell.jsx` | theme palettes, fonts, nav, section head, list row, breadcrumb, ASCII progress |
| `data.jsx` | seed library fixtures + formatting helpers |
| `lyrics-data.jsx` | Devanagari fixtures, synced-lyrics store, LRC data, mutation store |
| `art.jsx` | deterministic cover-art generation (blocks/ascii/letter) |
| `screens-main.jsx` | Now Playing, Library, Albums, Artists, Album/Artist detail |
| `screens-extra.jsx` | Playlists, Queue, Search, Settings, create/add dialogs |
| `lyrics-ui.jsx` | lyrics view, edit-track dialog, add-song dialog |
| `themes-and-lyrics.jsx` | themes gallery, row menu, lyrics manager, lyrics editor v2 |
| `android-frame.jsx` | device mockup frame — IGNORE, presentation only |
| `app.jsx` | state reducer, mini player, welcome, app assembly |

Read `styles.css` first for exact values; read the JSX for behavior. The Tweaks panel in `app.jsx` is a design-review tool — in the real app its options live in config → themes.
