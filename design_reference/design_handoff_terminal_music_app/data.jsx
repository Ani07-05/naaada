// Music library fixtures. All durations in seconds.
const LIB = {
  albums: [
    { id: 'a1', title: 'Parallel Hours',      artist: 'Juno Vale',      year: 2024, tracks: 10, seed: 'PH24', palette: 'amber' },
    { id: 'a2', title: 'Low Tide Dispatch',   artist: 'The Quiet Coast',year: 2023, tracks: 8,  seed: 'LT23', palette: 'teal'  },
    { id: 'a3', title: 'Analog Weather',      artist: 'Mira Osei',      year: 2022, tracks: 12, seed: 'AW22', palette: 'plum'  },
    { id: 'a4', title: 'Paper Architecture',  artist: 'Kestrel',        year: 2024, tracks: 9,  seed: 'PA24', palette: 'sage'  },
    { id: 'a5', title: 'Field Notes, Vol. II',artist: 'Ansel Grey',     year: 2021, tracks: 14, seed: 'FN21', palette: 'sepia' },
    { id: 'a6', title: 'Slow Machine',        artist: 'Juno Vale',      year: 2021, tracks: 11, seed: 'SM21', palette: 'rust'  },
    { id: 'a7', title: 'Harbor Lights',       artist: 'The Quiet Coast',year: 2020, tracks: 9,  seed: 'HL20', palette: 'navy'  },
    { id: 'a8', title: 'Threadbare',          artist: 'Odette March',   year: 2023, tracks: 10, seed: 'TB23', palette: 'moss'  },
    { id: 'a9', title: 'Cassette 04',         artist: 'Null Orchestra', year: 2019, tracks: 6,  seed: 'C419', palette: 'clay'  },
  ],

  artists: [
    { id: 'ar1', name: 'Juno Vale',        albums: 3, songs: 31 },
    { id: 'ar2', name: 'The Quiet Coast',  albums: 2, songs: 17 },
    { id: 'ar3', name: 'Mira Osei',        albums: 1, songs: 12 },
    { id: 'ar4', name: 'Kestrel',          albums: 2, songs: 18 },
    { id: 'ar5', name: 'Ansel Grey',       albums: 4, songs: 42 },
    { id: 'ar6', name: 'Odette March',     albums: 1, songs: 10 },
    { id: 'ar7', name: 'Null Orchestra',   albums: 3, songs: 22 },
    { id: 'ar8', name: 'Halvard Moon',     albums: 2, songs: 19 },
  ],

  songs: [
    { id: 's01', title: 'Ferrybridge',            album: 'a1', artist: 'Juno Vale',      dur: 214, track: 1 },
    { id: 's02', title: 'Paper Window',           album: 'a1', artist: 'Juno Vale',      dur: 183, track: 2 },
    { id: 's03', title: 'North by the Wires',     album: 'a1', artist: 'Juno Vale',      dur: 247, track: 3 },
    { id: 's04', title: 'Parallel Hours',         album: 'a1', artist: 'Juno Vale',      dur: 305, track: 4 },
    { id: 's05', title: 'Rooms We Rented',        album: 'a1', artist: 'Juno Vale',      dur: 198, track: 5 },
    { id: 's10', title: 'Drift',                  album: 'a2', artist: 'The Quiet Coast',dur: 226, track: 1 },
    { id: 's11', title: 'Low Tide',               album: 'a2', artist: 'The Quiet Coast',dur: 259, track: 2 },
    { id: 's12', title: 'Sodium Lamp',            album: 'a2', artist: 'The Quiet Coast',dur: 178, track: 3 },
    { id: 's20', title: 'Barometer',              album: 'a3', artist: 'Mira Osei',      dur: 204, track: 1 },
    { id: 's21', title: 'Slow Reader',            album: 'a3', artist: 'Mira Osei',      dur: 241, track: 2 },
    { id: 's22', title: 'Analog Weather',         album: 'a3', artist: 'Mira Osei',      dur: 312, track: 3 },
    { id: 's30', title: 'Blueprint',              album: 'a4', artist: 'Kestrel',        dur: 189, track: 1 },
    { id: 's31', title: 'Graph Paper',            album: 'a4', artist: 'Kestrel',        dur: 232, track: 2 },
    { id: 's40', title: 'Cartography',            album: 'a5', artist: 'Ansel Grey',     dur: 267, track: 1 },
    { id: 's41', title: 'Margin Notes',           album: 'a5', artist: 'Ansel Grey',     dur: 195, track: 2 },
    { id: 's50', title: 'Machine Hymn',           album: 'a6', artist: 'Juno Vale',      dur: 288, track: 1 },
    { id: 's51', title: 'Night Shift',            album: 'a6', artist: 'Juno Vale',      dur: 219, track: 2 },
    { id: 's60', title: 'Harbor Lights',          album: 'a7', artist: 'The Quiet Coast',dur: 256, track: 1 },
    { id: 's70', title: 'Threadbare',             album: 'a8', artist: 'Odette March',   dur: 198, track: 1 },
    { id: 's71', title: 'Pale Morning',           album: 'a8', artist: 'Odette March',   dur: 223, track: 2 },
    { id: 's80', title: 'Cassette 04 / Side A',   album: 'a9', artist: 'Null Orchestra', dur: 341, track: 1 },
  ],

  playlists: [
    { id: 'p1', name: 'Late Desk Work',      count: 24, dur: 5420, seed: 'LDW', desc: 'long instrumentals, low ceiling' },
    { id: 'p2', name: 'Sunday Kitchen',      count: 18, dur: 3914, seed: 'SK0', desc: 'warm, slow, never urgent'       },
    { id: 'p3', name: 'Commute / Morning',   count: 32, dur: 7210, seed: 'CMR', desc: 'steady tempo, 45 min loop'      },
    { id: 'p4', name: 'Overnight Reading',   count: 14, dur: 4120, seed: 'OVR', desc: 'ambient, 70 min'                },
    { id: 'p5', name: 'For Rain',            count: 21, dur: 5102, seed: 'RAI', desc: ''                               },
    { id: 'p6', name: 'Second Coffee',       count: 12, dur: 2842, seed: 'SCF', desc: ''                               },
  ],

  queue: ['s01', 's02', 's10', 's30', 's22', 's41', 's50', 's60'],
  nowPlayingId: 's01',
  nowPlayingPos: 87,
};

// format seconds as m:ss or h:mm
function fmt(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${m}:${String(s).padStart(2,'0')}`;
}
function fmtLong(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

function albumById(id) { return LIB.albums.find(a => a.id === id); }
function songById(id)  { return LIB.songs.find(s => s.id === id); }
function songsInAlbum(id) { return LIB.songs.filter(s => s.album === id); }
function songsByArtist(name) { return LIB.songs.filter(s => s.artist === name); }
function albumsByArtist(name) { return LIB.albums.filter(a => a.artist === name); }

Object.assign(window, { LIB, fmt, fmtLong, albumById, songById, songsInAlbum, songsByArtist, albumsByArtist });
