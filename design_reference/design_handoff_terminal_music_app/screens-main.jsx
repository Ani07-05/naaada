// Now Playing hero screen + Library/Albums/Artists

function NowPlaying({ state, dispatch }) {
  const song = songById(state.nowPlayingId);
  const album = albumById(song.album);
  const pos = state.nowPlayingPos;
  const dur = song.dur;
  const [view, setView] = React.useState('art'); // 'art' | 'lyrics'
  const hasLyrics = !!getLyrics(song.id);

  const cycleTheme = () => {
    const cur = document.documentElement.style.getPropertyValue('--bg');
    // find active theme by matching bg color
    const activeId = THEME_IDS.find(id => THEMES[id]['--bg'] === cur) || THEME_IDS[0];
    const next = THEME_IDS[(THEME_IDS.indexOf(activeId) + 1) % THEME_IDS.length];
    window.parent.postMessage({type: '__edit_mode_set_keys', edits: {theme: next}}, '*');
    // also apply locally so it takes effect immediately
    window.dispatchEvent(new CustomEvent('cycleTheme', { detail: next }));
  };

  // waveform: 40 deterministic bars from song.id
  const rng = seedRng(song.id + 'wave');
  const bars = Array.from({length: 40}, () => 0.3 + rng() * 0.7);
  const curBar = Math.round((pos / dur) * bars.length);

  return (
    <div className="np-wrap">
      <Path parts={['library', album.artist, album.title, 'now playing']} />

      <div className="np-view-toggle">
        <button className={`np-tab ${view==='art'?'active':''}`}    onClick={() => setView('art')}>{view==='art'?'[art]':'art'}</button>
        <button className={`np-tab ${view==='lyrics'?'active':''}`} onClick={() => setView('lyrics')}>{view==='lyrics'?'[lyrics]':'lyrics'}{hasLyrics ? '' : ' +'}</button>
        <span style={{flex:1}}/>
        <button className="search-chip" title="cycle theme" onClick={cycleTheme}>◐ theme</button>
        <button className="search-chip" onClick={() => dispatch({ type: 'openEditTrack', songId: song.id })}>✎ edit</button>
      </div>

      {view === 'art' ? (
        <div className="np-cover-wrap">
          {song.banner ? (
            <pre className="np-banner">{song.banner}</pre>
          ) : (
            <Cover seed={album.seed} size={10} style={state.coverStyle} label={album.title[0]} tint="var(--accent)" />
          )}
        </div>
      ) : (
        <LyricsView song={song} pos={pos} onEdit={() => dispatch({ type: 'openEditLyrics', songId: song.id })} />
      )}

      <div className="np-title">{song.title}</div>
      <div className="np-artist">{song.artist}</div>
      <div className="np-album">— from {album.title} ({album.year}) —</div>

      <div className="np-wave">
        {bars.map((h, i) => (
          <span key={i}
            className={`np-wave-bar ${i === curBar ? 'cur' : (i < curBar ? 'played' : '')}`}
            style={{ height: `${h * 28}px` }}
          />
        ))}
      </div>

      <div className="np-progress-row">
        <span className="mono-num">{fmt(pos)}</span>
        <AsciiProgress value={pos} max={dur} width={22} accent />
        <span className="mono-num">{fmt(dur)}</span>
      </div>

      <div className="np-controls">
        <button className="np-ctrl" onClick={() => dispatch({ type: 'shuffle' })} title="[s] shuffle">⇋</button>
        <button className="np-ctrl" onClick={() => dispatch({ type: 'prev' })} title="[←] prev">⏮</button>
        <button className="np-ctrl primary" onClick={() => dispatch({ type: 'toggle' })} title="[space]">
          {state.playing ? '⏸' : '▶'}
        </button>
        <button className="np-ctrl" onClick={() => dispatch({ type: 'next' })} title="[→] next">⏭</button>
        <button className="np-ctrl" onClick={() => dispatch({ type: 'repeat' })} title="[r] repeat">↻</button>
      </div>

      <div className="np-extras">
        <button className={`np-chip ${state.liked ? 'active' : ''}`} onClick={() => dispatch({ type: 'like' })}>
          {state.liked ? '♥ liked' : '♡ like'}
        </button>
        <button className="np-chip" onClick={() => dispatch({ type: 'go', tab: 'queue' })}>
          [≡] queue ({state.queue.length})
        </button>
        <button className="np-chip" onClick={() => dispatch({ type: 'openAddToPlaylist', songId: song.id })}>
          [+] add to...
        </button>
      </div>

      <SectionHead label="track info" />
      <div className="kv-table">
        <div className="kv-row"><span className="k">track</span><span className="v">{String(song.track).padStart(2,'0')} / {album.tracks}</span></div>
        <div className="kv-row"><span className="k">length</span><span className="v">{fmt(dur)}</span></div>
        <div className="kv-row"><span className="k">album</span><span className="v">{album.title}</span></div>
        <div className="kv-row"><span className="k">year</span><span className="v">{album.year}</span></div>
        <div className="kv-row"><span className="k">bitrate</span><span className="v">320 kbps · flac</span></div>
      </div>
    </div>
  );
}

function Library({ state, dispatch }) {
  const [sub, setSub] = React.useState('songs');
  const subs = ['songs', 'albums', 'artists', 'playlists'];

  return (
    <>
      <Path parts={['library', sub]} />
      <div className="search-chip-row">
        {subs.map(s => (
          <button key={s}
            className={`search-chip ${sub === s ? 'active' : ''}`}
            onClick={() => setSub(s)}>
            {sub === s ? `[${s}]` : s}
          </button>
        ))}
      </div>
      {sub === 'songs'     && <SongsList state={state} dispatch={dispatch} />}
      {sub === 'albums'    && <AlbumsGrid state={state} dispatch={dispatch} />}
      {sub === 'artists'   && <ArtistsList state={state} dispatch={dispatch} />}
      {sub === 'playlists' && <PlaylistsList state={state} dispatch={dispatch} embedded />}
    </>
  );
}

function SongsList({ state, dispatch }) {
  const [sort, setSort] = React.useState('title');
  const songs = [...LIB.songs].sort((a, b) => {
    if (sort === 'title')  return a.title.localeCompare(b.title);
    if (sort === 'artist') return a.artist.localeCompare(b.artist);
    if (sort === 'dur')    return b.dur - a.dur;
    return 0;
  });
  return (
    <>
      <SectionHead label={`${LIB.songs.length} songs`} right={
        <span>sort:{' '}
          <button className="search-chip" onClick={() => setSort(sort === 'title' ? 'artist' : sort === 'artist' ? 'dur' : 'title')}>
            {sort} ↕
          </button>
        </span>
      }/>
      {songs.map((s, i) => (
        <ListRow key={s.id}
          idx={i + 1}
          left={s.title}
          sub={`${s.artist} · ${albumById(s.album).title}`}
          right={<span>{fmt(s.dur)} <span className="row-edit" onClick={(e)=>{e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); const host = e.currentTarget.closest('.tui-app').getBoundingClientRect(); dispatch({type:'openRowMenu', songId: s.id, pos: {top: r.bottom - host.top + 4, left: Math.max(8, r.right - host.left - 200)}});}}>⋮</span></span>}
          active={s.id === state.nowPlayingId}
          onClick={() => dispatch({ type: 'play', songId: s.id })}
        />
      ))}
      <div style={{textAlign:'center', marginTop: 12}}>
        <button className="btn" onClick={() => dispatch({ type: 'openAddSong' })}>[+] add track</button>
      </div>
    </>
  );
}

function AlbumsGrid({ state, dispatch }) {
  return (
    <>
      <SectionHead label={`${LIB.albums.length} albums`} />
      <div className="albums-grid">
        {LIB.albums.map(a => (
          <button key={a.id} className="album-card" onClick={() => dispatch({ type: 'go', tab: 'album', albumId: a.id })}>
            <div className="album-card-cover">
              <Cover seed={a.seed} size={7} style={state.coverStyle} label={a.title[0]} tint="var(--accent)" />
            </div>
            <div className="album-card-title">{a.title}</div>
            <div className="album-card-artist">{a.artist} · {a.year}</div>
          </button>
        ))}
      </div>
    </>
  );
}

function ArtistsList({ state, dispatch }) {
  return (
    <>
      <SectionHead label={`${LIB.artists.length} artists`} />
      {LIB.artists.map((ar, i) => (
        <ListRow key={ar.id}
          idx={i + 1}
          glyph="◆"
          left={ar.name}
          sub={`${ar.albums} album${ar.albums > 1 ? 's' : ''} · ${ar.songs} songs`}
          right="→"
          onClick={() => dispatch({ type: 'go', tab: 'artist', artistName: ar.name })}
        />
      ))}
    </>
  );
}

function AlbumDetail({ albumId, state, dispatch }) {
  const a = albumById(albumId);
  const songs = songsInAlbum(albumId);
  const total = songs.reduce((t, s) => t + s.dur, 0);
  return (
    <>
      <Path parts={['library', 'albums', a.title]} />
      <div className="album-header">
        <Cover seed={a.seed} size={8} style={state.coverStyle} label={a.title[0]} tint="var(--accent)" />
        <div className="album-header-meta">
          <div className="album-header-title">{a.title}</div>
          <div className="album-header-artist">{a.artist}</div>
          <div className="album-header-meta-line">{a.year} · {songs.length} tracks · {fmtLong(total)}</div>
          <div className="album-header-actions">
            <button className="btn primary" onClick={() => dispatch({ type: 'play', songId: songs[0].id })}>▶ play</button>
            <button className="btn" onClick={() => dispatch({ type: 'shuffleAlbum', albumId })}>⇋ shuffle</button>
            <button className="btn">+ queue</button>
          </div>
        </div>
      </div>
      <SectionHead label="tracks" />
      {songs.map((s, i) => (
        <ListRow key={s.id}
          idx={s.track}
          left={s.title}
          right={<span>{fmt(s.dur)} <span className="row-edit" onClick={(e)=>{e.stopPropagation(); const r = e.currentTarget.getBoundingClientRect(); const host = e.currentTarget.closest('.tui-app').getBoundingClientRect(); dispatch({type:'openRowMenu', songId: s.id, pos: {top: r.bottom - host.top + 4, left: Math.max(8, r.right - host.left - 200)}});}}>⋮</span></span>}
          active={s.id === state.nowPlayingId}
          onClick={() => dispatch({ type: 'play', songId: s.id })}
        />
      ))}
    </>
  );
}

function ArtistDetail({ artistName, state, dispatch }) {
  const albums = albumsByArtist(artistName);
  const songs = songsByArtist(artistName);
  return (
    <>
      <Path parts={['library', 'artists', artistName]} />
      <div style={{ padding: '4px 0 12px', borderBottom: '1px dashed var(--hairline)', marginBottom: 10 }}>
        <div style={{ fontSize: 'calc(var(--fs) + 4px)', fontWeight: 600, color: 'var(--ink)' }}>{artistName}</div>
        <div className="soft" style={{ fontSize: 'calc(var(--fs) - 1px)', marginTop: 2 }}>
          {albums.length} album{albums.length > 1 ? 's' : ''} · {songs.length} songs
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          <button className="btn primary" onClick={() => dispatch({ type: 'play', songId: songs[0]?.id })}>▶ play all</button>
          <button className="btn">⇋ shuffle</button>
        </div>
      </div>
      <SectionHead label="albums" />
      <div className="albums-grid">
        {albums.map(a => (
          <button key={a.id} className="album-card" onClick={() => dispatch({ type: 'go', tab: 'album', albumId: a.id })}>
            <div className="album-card-cover">
              <Cover seed={a.seed} size={7} style={state.coverStyle} label={a.title[0]} tint="var(--accent)" />
            </div>
            <div className="album-card-title">{a.title}</div>
            <div className="album-card-artist">{a.year}</div>
          </button>
        ))}
      </div>
      <SectionHead label="top tracks" />
      {songs.slice(0, 6).map((s, i) => (
        <ListRow key={s.id}
          idx={i + 1}
          left={s.title}
          sub={albumById(s.album).title}
          right={fmt(s.dur)}
          active={s.id === state.nowPlayingId}
          onClick={() => dispatch({ type: 'play', songId: s.id })}
        />
      ))}
    </>
  );
}

Object.assign(window, { NowPlaying, Library, AlbumDetail, ArtistDetail });
