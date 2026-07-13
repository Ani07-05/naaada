// Seed fixtures ported from data.jsx + lyrics-data.jsx.
// Demo rows have uri=null (browsable metadata); imported files become real playable rows.
import { Album, Artist, Playlist, PlaylistEntry, Song, LyricLine } from './types';

export const SEED_ALBUMS: Album[] = [
  { id: 'a1', title: 'Parallel Hours', artist: 'Juno Vale', year: 2024, tracks: 10, seed: 'PH24', palette: 'amber' },
  { id: 'a2', title: 'Low Tide Dispatch', artist: 'The Quiet Coast', year: 2023, tracks: 8, seed: 'LT23', palette: 'teal' },
  { id: 'a3', title: 'Analog Weather', artist: 'Mira Osei', year: 2022, tracks: 12, seed: 'AW22', palette: 'plum' },
  { id: 'a4', title: 'Paper Architecture', artist: 'Kestrel', year: 2024, tracks: 9, seed: 'PA24', palette: 'sage' },
  { id: 'a5', title: 'Field Notes, Vol. II', artist: 'Ansel Grey', year: 2021, tracks: 14, seed: 'FN21', palette: 'sepia' },
  { id: 'a6', title: 'Slow Machine', artist: 'Juno Vale', year: 2021, tracks: 11, seed: 'SM21', palette: 'rust' },
  { id: 'a7', title: 'Harbor Lights', artist: 'The Quiet Coast', year: 2020, tracks: 9, seed: 'HL20', palette: 'navy' },
  { id: 'a8', title: 'Threadbare', artist: 'Odette March', year: 2023, tracks: 10, seed: 'TB23', palette: 'moss' },
  { id: 'a9', title: 'Cassette 04', artist: 'Null Orchestra', year: 2019, tracks: 6, seed: 'C419', palette: 'clay' },
  { id: 'a10', title: 'रात का पहर', artist: 'कविता शर्मा', year: 2024, tracks: 6, seed: 'RP24', palette: 'amber' },
];

export const SEED_ARTISTS: Artist[] = [
  { id: 'ar1', name: 'Juno Vale', albums: 3, songs: 31 },
  { id: 'ar2', name: 'The Quiet Coast', albums: 2, songs: 17 },
  { id: 'ar3', name: 'Mira Osei', albums: 1, songs: 12 },
  { id: 'ar4', name: 'Kestrel', albums: 2, songs: 18 },
  { id: 'ar5', name: 'Ansel Grey', albums: 4, songs: 42 },
  { id: 'ar6', name: 'Odette March', albums: 1, songs: 10 },
  { id: 'ar7', name: 'Null Orchestra', albums: 3, songs: 22 },
  { id: 'ar8', name: 'Halvard Moon', albums: 2, songs: 19 },
  { id: 'ar9', name: 'कविता शर्मा', albums: 1, songs: 6 },
];

type RawSong = { id: string; title: string; album: string; artist: string; dur: number; track: number; banner?: string };
const RAW_SONGS: RawSong[] = [
  { id: 's01', title: 'Ferrybridge', album: 'a1', artist: 'Juno Vale', dur: 214, track: 1 },
  { id: 's02', title: 'Paper Window', album: 'a1', artist: 'Juno Vale', dur: 183, track: 2 },
  { id: 's03', title: 'North by the Wires', album: 'a1', artist: 'Juno Vale', dur: 247, track: 3 },
  { id: 's04', title: 'Parallel Hours', album: 'a1', artist: 'Juno Vale', dur: 305, track: 4 },
  { id: 's05', title: 'Rooms We Rented', album: 'a1', artist: 'Juno Vale', dur: 198, track: 5 },
  { id: 's10', title: 'Drift', album: 'a2', artist: 'The Quiet Coast', dur: 226, track: 1 },
  { id: 's11', title: 'Low Tide', album: 'a2', artist: 'The Quiet Coast', dur: 259, track: 2 },
  { id: 's12', title: 'Sodium Lamp', album: 'a2', artist: 'The Quiet Coast', dur: 178, track: 3 },
  { id: 's20', title: 'Barometer', album: 'a3', artist: 'Mira Osei', dur: 204, track: 1 },
  { id: 's21', title: 'Slow Reader', album: 'a3', artist: 'Mira Osei', dur: 241, track: 2 },
  { id: 's22', title: 'Analog Weather', album: 'a3', artist: 'Mira Osei', dur: 312, track: 3 },
  { id: 's30', title: 'Blueprint', album: 'a4', artist: 'Kestrel', dur: 189, track: 1 },
  { id: 's31', title: 'Graph Paper', album: 'a4', artist: 'Kestrel', dur: 232, track: 2 },
  { id: 's40', title: 'Cartography', album: 'a5', artist: 'Ansel Grey', dur: 267, track: 1 },
  { id: 's41', title: 'Margin Notes', album: 'a5', artist: 'Ansel Grey', dur: 195, track: 2 },
  { id: 's50', title: 'Machine Hymn', album: 'a6', artist: 'Juno Vale', dur: 288, track: 1 },
  { id: 's51', title: 'Night Shift', album: 'a6', artist: 'Juno Vale', dur: 219, track: 2 },
  { id: 's60', title: 'Harbor Lights', album: 'a7', artist: 'The Quiet Coast', dur: 256, track: 1 },
  { id: 's70', title: 'Threadbare', album: 'a8', artist: 'Odette March', dur: 198, track: 1 },
  { id: 's71', title: 'Pale Morning', album: 'a8', artist: 'Odette March', dur: 223, track: 2 },
  { id: 's80', title: 'Cassette 04 / Side A', album: 'a9', artist: 'Null Orchestra', dur: 341, track: 1,
    banner: '   ╔═══════════╗\n   ║  SIDE A   ║\n   ╚═══════════╝' },
  { id: 's90', title: 'चाँदनी रात', album: 'a10', artist: 'कविता शर्मा', dur: 248, track: 1,
    banner: '      ✶  ✶  ✶\n     — रात —\n      ✶  ✶  ✶' },
  { id: 's91', title: 'धुँध', album: 'a10', artist: 'कविता शर्मा', dur: 192, track: 2 },
  { id: 's92', title: 'सुबह की पहली किरण', album: 'a10', artist: 'कविता शर्मा', dur: 274, track: 3 },
];

export const SEED_SONGS: Song[] = RAW_SONGS.map((s) => ({
  id: s.id,
  title: s.title,
  albumId: s.album,
  artist: s.artist,
  dur: s.dur,
  track: s.track,
  uri: null,
  sourceType: 'seed',
  banner: s.banner ?? null,
  liked: false,
}));

export const SEED_PLAYLISTS: Playlist[] = [
  { id: 'p1', name: 'Late Desk Work', seed: 'LDW', desc: 'long instrumentals, low ceiling' },
  { id: 'p2', name: 'Sunday Kitchen', seed: 'SK0', desc: 'warm, slow, never urgent' },
  { id: 'p3', name: 'Commute / Morning', seed: 'CMR', desc: 'steady tempo, 45 min loop' },
  { id: 'p4', name: 'Overnight Reading', seed: 'OVR', desc: 'ambient, 70 min' },
  { id: 'p5', name: 'For Rain', seed: 'RAI', desc: '' },
  { id: 'p6', name: 'Second Coffee', seed: 'SCF', desc: '' },
];

// Demo membership so playlist detail has tracks.
const PL_MAP: Record<string, string[]> = {
  p1: ['s01', 's10', 's20', 's40', 's50'],
  p2: ['s02', 's11', 's21', 's70'],
  p3: ['s03', 's30', 's60', 's05'],
  p4: ['s22', 's41', 's80', 's90'],
  p5: ['s10', 's12', 's71'],
  p6: ['s04', 's31', 's51'],
};
export const SEED_PLAYLIST_ENTRIES: PlaylistEntry[] = Object.entries(PL_MAP).flatMap(
  ([playlistId, songs]) => songs.map((songId, position) => ({ playlistId, songId, position }))
);

export const SEED_LYRICS: Record<string, LyricLine[]> = {
  s01: [
    { t: 0, line: '[instrumental intro]' },
    { t: 12, line: 'down by the old ferrybridge' },
    { t: 20, line: 'i waited for the light to change' },
    { t: 28, line: 'the river kept its own time' },
    { t: 36, line: 'and never once asked my name' },
    { t: 48, line: '' },
    { t: 52, line: 'the radio had nothing to say' },
    { t: 60, line: 'just static and a broken song' },
    { t: 68, line: 'i counted every passing car' },
    { t: 76, line: 'until the evening came along' },
    { t: 88, line: '' },
    { t: 92, line: '— chorus —' },
    { t: 96, line: 'ferrybridge, ferrybridge' },
    { t: 104, line: 'carry me slowly to the other side' },
    { t: 112, line: 'ferrybridge, ferrybridge' },
    { t: 120, line: 'i’ve got all night, i’ve got all night' },
  ],
  s02: [
    { t: 0, line: 'paper window, paper door' },
    { t: 10, line: 'everything i see i’ve seen before' },
    { t: 22, line: 'the kettle clicks, the cat walks by' },
    { t: 34, line: 'outside, a slow autumn sky' },
    { t: 48, line: '' },
    { t: 60, line: '— chorus —' },
    { t: 64, line: 'hold still, hold still' },
    { t: 72, line: 'the afternoon is on my side' },
  ],
  s90: [
    { t: 0, line: '[साज़]' },
    { t: 8, line: 'चाँदनी रात में' },
    { t: 16, line: 'खिड़की खुली रह गई' },
    { t: 24, line: 'हवा धीमे-धीमे' },
    { t: 32, line: 'कुछ कहती सी लगी' },
    { t: 44, line: '' },
    { t: 52, line: 'तारे गिनते-गिनते' },
    { t: 60, line: 'नींद कहीं खो गई' },
    { t: 88, line: '' },
    { t: 92, line: '— मुखड़ा —' },
    { t: 96, line: 'चाँदनी रात, चाँदनी रात' },
    { t: 104, line: 'तुझसे लम्बी नहीं कोई बात' },
  ],
  s10: [
    { t: 0, line: '[ambient wash]' },
    { t: 16, line: 'there’s a grey line on the water' },
    { t: 28, line: 'where the sky begins to dream' },
    { t: 40, line: 'i am neither here nor there' },
    { t: 52, line: 'just the drift between' },
  ],
};
