// Lyrics store + Devanagari/custom titles + LIB mutation helpers.
// LIB is already defined in data.jsx; we mount a live store on top of it.

// Add a few Devanagari tracks + custom ascii banners to showcase.
(function extendLib() {
  // add devanagari + custom ascii track examples
  LIB.albums.push(
    { id: 'a10', title: 'रात का पहर',       artist: 'कविता शर्मा',    year: 2024, tracks: 6, seed: 'RP24', palette: 'amber' },
  );
  LIB.artists.push({ id: 'ar9', name: 'कविता शर्मा', albums: 1, songs: 6 });

  LIB.songs.push(
    { id: 's90', title: 'चाँदनी रात',       album: 'a10', artist: 'कविता शर्मा', dur: 248, track: 1 },
    { id: 's91', title: 'धुँध',             album: 'a10', artist: 'कविता शर्मा', dur: 192, track: 2 },
    { id: 's92', title: 'सुबह की पहली किरण', album: 'a10', artist: 'कविता शर्मा', dur: 274, track: 3 },
  );

  // decorate a few tracks with custom ascii banner + lyrics
  for (const s of LIB.songs) {
    s.banner = s.banner || null;  // custom ASCII banner text, optional
    s.lyrics = s.lyrics || null;  // array of { t: seconds, line: string } or null
  }
})();

// Seed synced lyrics for a handful of tracks (mix of English + Devanagari)
const LYRICS = {
  s01: [ // Ferrybridge
    { t: 0,   line: '[instrumental intro]' },
    { t: 12,  line: 'down by the old ferrybridge' },
    { t: 20,  line: 'i waited for the light to change' },
    { t: 28,  line: 'the river kept its own time' },
    { t: 36,  line: 'and never once asked my name' },
    { t: 48,  line: '' },
    { t: 52,  line: 'the radio had nothing to say' },
    { t: 60,  line: 'just static and a broken song' },
    { t: 68,  line: 'i counted every passing car' },
    { t: 76,  line: 'until the evening came along' },
    { t: 88,  line: '' },
    { t: 92,  line: '— chorus —' },
    { t: 96,  line: 'ferrybridge, ferrybridge' },
    { t: 104, line: 'carry me slowly to the other side' },
    { t: 112, line: 'ferrybridge, ferrybridge' },
    { t: 120, line: 'i’ve got all night, i’ve got all night' },
    { t: 132, line: '' },
    { t: 140, line: '[bridge / organ solo]' },
    { t: 168, line: 'the keeper tipped his cap to me' },
    { t: 176, line: 'and pointed at the rising tide' },
    { t: 184, line: 'said son, the world is mostly waiting' },
    { t: 192, line: 'the rest is just the ride' },
    { t: 204, line: '[outro]' },
  ],
  s02: [ // Paper Window
    { t: 0,   line: 'paper window, paper door' },
    { t: 10,  line: 'everything i see i’ve seen before' },
    { t: 22,  line: 'the kettle clicks, the cat walks by' },
    { t: 34,  line: 'outside, a slow autumn sky' },
    { t: 48,  line: '' },
    { t: 60,  line: '— chorus —' },
    { t: 64,  line: 'hold still, hold still' },
    { t: 72,  line: 'the afternoon is on my side' },
    { t: 84,  line: 'hold still, hold still' },
    { t: 92,  line: 'there’s nowhere left i have to be' },
  ],
  s90: [ // चाँदनी रात
    { t: 0,   line: '[साज़]' },
    { t: 8,   line: 'चाँदनी रात में' },
    { t: 16,  line: 'खिड़की खुली रह गई' },
    { t: 24,  line: 'हवा धीमे-धीमे' },
    { t: 32,  line: 'कुछ कहती सी लगी' },
    { t: 44,  line: '' },
    { t: 52,  line: 'तारे गिनते-गिनते' },
    { t: 60,  line: 'नींद कहीं खो गई' },
    { t: 68,  line: 'सुबह के आने तक' },
    { t: 76,  line: 'यादें ही बचीं' },
    { t: 88,  line: '' },
    { t: 92,  line: '— मुखड़ा —' },
    { t: 96,  line: 'चाँदनी रात, चाँदनी रात' },
    { t: 104, line: 'तुझसे लम्बी नहीं कोई बात' },
    { t: 116, line: 'चाँदनी रात, चाँदनी रात' },
    { t: 124, line: 'रह जा थोड़ी देर मेरे साथ' },
  ],
  s10: [ // Drift
    { t: 0,   line: '[ambient wash]' },
    { t: 16,  line: 'there’s a grey line on the water' },
    { t: 28,  line: 'where the sky begins to dream' },
    { t: 40,  line: 'i am neither here nor there' },
    { t: 52,  line: 'just the drift between' },
  ],
};

// Add a custom ascii banner to a few songs as a demo
LIB.songs.find(s => s.id === 's80').banner =
`   ╔═══════════╗
   ║  SIDE A   ║
   ╚═══════════╝`;

LIB.songs.find(s => s.id === 's90').banner =
`      ✶  ✶  ✶
     — रात —
      ✶  ✶  ✶`;

// ─────────────────────────────────────────────────────────────
// Mutable data store with subscribe()
// ─────────────────────────────────────────────────────────────
const store = (() => {
  let listeners = new Set();
  const notify = () => listeners.forEach(l => l());
  return {
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    // song crud
    updateSong(id, patch) {
      const s = LIB.songs.find(x => x.id === id);
      if (!s) return;
      Object.assign(s, patch);
      notify();
    },
    setBanner(id, banner) {
      const s = LIB.songs.find(x => x.id === id);
      if (s) { s.banner = banner; notify(); }
    },
    setLyrics(id, lyrics) {
      LYRICS[id] = lyrics;
      notify();
    },
    addSong(song) {
      const id = 'usr' + Math.random().toString(36).slice(2, 7);
      LIB.songs.push({ id, track: LIB.songs.length + 1, dur: 0, ...song });
      notify();
      return id;
    },
    removeSong(id) {
      const i = LIB.songs.findIndex(s => s.id === id);
      if (i >= 0) { LIB.songs.splice(i, 1); notify(); }
    },
  };
})();

function getLyrics(songId) { return LYRICS[songId] || null; }
function currentLyricIdx(lyrics, t) {
  if (!lyrics) return -1;
  let i = -1;
  for (let k = 0; k < lyrics.length; k++) {
    if (lyrics[k].t <= t) i = k; else break;
  }
  return i;
}

Object.assign(window, { LYRICS, getLyrics, currentLyricIdx, store });
