// Playlists, Queue, Search, Settings, Create-Playlist flow

function PlaylistsList({ state, dispatch, embedded }) {
  return (
    <>
      {!embedded && <Path parts={['library', 'playlists']} />}
      <SectionHead label={`${LIB.playlists.length} playlists`} right={
        <button className="search-chip" onClick={() => dispatch({ type: 'openCreatePlaylist' })}>
          [+] new
        </button>
      }/>
      {LIB.playlists.map(p => (
        <button key={p.id} className="playlist-card" onClick={() => dispatch({ type: 'go', tab: 'playlist', playlistId: p.id })}>
          <div className="playlist-card-cover">
            <Cover seed={p.seed} size={5} style={state.coverStyle} label={p.name[0]} tint="var(--accent)" />
          </div>
          <div className="playlist-card-body">
            <div className="playlist-card-name">▸ {p.name}</div>
            {p.desc && <div className="playlist-card-desc">"{p.desc}"</div>}
            <div className="playlist-card-meta">{p.count} songs · {fmtLong(p.dur)}</div>
          </div>
        </button>
      ))}
    </>
  );
}

function PlaylistDetail({ playlistId, state, dispatch }) {
  const p = LIB.playlists.find(pl => pl.id === playlistId);
  if (!p) return null;
  // derive songs deterministically from seed
  const rng = seedRng(p.seed);
  const songs = Array.from({length: Math.min(p.count, 12)}, () =>
    LIB.songs[Math.floor(rng() * LIB.songs.length)]
  );

  return (
    <>
      <Path parts={['library', 'playlists', p.name]} />
      <div className="album-header">
        <Cover seed={p.seed} size={8} style={state.coverStyle} label={p.name[0]} tint="var(--accent)" />
        <div className="album-header-meta">
          <div className="album-header-title">{p.name}</div>
          <div className="album-header-artist">playlist</div>
          <div className="album-header-meta-line">
            {p.count} songs · {fmtLong(p.dur)}
            {p.desc && <div style={{fontStyle:'italic', color:'var(--ink-soft)', marginTop: 2}}>"{p.desc}"</div>}
          </div>
          <div className="album-header-actions">
            <button className="btn primary" onClick={() => dispatch({ type: 'play', songId: songs[0].id })}>▶ play</button>
            <button className="btn">⇋ shuffle</button>
            <button className="btn" onClick={() => dispatch({ type: 'openEditPlaylist', playlistId: p.id })}>✎ edit</button>
          </div>
        </div>
      </div>
      <SectionHead label="tracks" right={
        <button className="search-chip">+ add song</button>
      }/>
      {songs.map((s, i) => (
        <ListRow key={i}
          idx={i + 1}
          left={s.title}
          sub={s.artist}
          right={fmt(s.dur)}
          active={s.id === state.nowPlayingId}
          onClick={() => dispatch({ type: 'play', songId: s.id })}
        />
      ))}
    </>
  );
}

function Queue({ state, dispatch }) {
  const songs = state.queue.map(id => songById(id)).filter(Boolean);
  const curIdx = songs.findIndex(s => s.id === state.nowPlayingId);
  const upcoming = songs.slice(curIdx + 1);
  const history = songs.slice(0, curIdx);
  const total = upcoming.reduce((t, s) => t + s.dur, 0);

  return (
    <>
      <Path parts={['queue']} />

      <SectionHead label="now playing" accent />
      {curIdx >= 0 && (
        <ListRow
          glyph="▶"
          left={songs[curIdx].title}
          sub={songs[curIdx].artist}
          right={fmt(songs[curIdx].dur)}
          active
        />
      )}

      <SectionHead label={`up next · ${upcoming.length} songs · ${fmtLong(total)}`} right={
        <button className="search-chip" onClick={() => dispatch({ type: 'clearQueue' })}>[×] clear</button>
      }/>
      {upcoming.length === 0 ? (
        <div className="empty-state">
          <pre>{`┌────────────────┐
│   queue end    │
└────────────────┘`}</pre>
          <div className="soft">nothing up next</div>
        </div>
      ) : upcoming.map((s, i) => (
        <ListRow key={s.id + i}
          idx={i + 1}
          left={s.title}
          sub={s.artist}
          right={<span className="soft">≡</span>}
          onClick={() => dispatch({ type: 'play', songId: s.id })}
        />
      ))}

      {history.length > 0 && <>
        <SectionHead label="history" />
        {history.map((s, i) => (
          <ListRow key={s.id + 'h' + i}
            idx={i + 1}
            left={<span style={{opacity: 0.6}}>{s.title}</span>}
            sub={s.artist}
            right={<span className="faint">↺</span>}
            onClick={() => dispatch({ type: 'play', songId: s.id })}
          />
        ))}
      </>}
    </>
  );
}

function Search({ state, dispatch }) {
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const inputRef = React.useRef(null);
  React.useEffect(() => { inputRef.current?.focus(); }, []);

  const query = q.trim().toLowerCase();
  const match = (s) => s.toLowerCase().includes(query);

  const songs = query ? LIB.songs.filter(s => match(s.title) || match(s.artist)) : [];
  const albums = query ? LIB.albums.filter(a => match(a.title) || match(a.artist)) : [];
  const artists = query ? LIB.artists.filter(a => match(a.name)) : [];
  const playlists = query ? LIB.playlists.filter(p => match(p.name)) : [];

  const showSongs = filter === 'all' || filter === 'songs';
  const showAlbums = filter === 'all' || filter === 'albums';
  const showArtists = filter === 'all' || filter === 'artists';
  const showPlaylists = filter === 'all' || filter === 'playlists';

  const hasResults = songs.length + albums.length + artists.length + playlists.length > 0;

  return (
    <>
      <Path parts={['search']} />
      <div className="search-input-wrap">
        <span className="search-prompt">$</span>
        <input
          ref={inputRef}
          className="search-input"
          placeholder="type to search…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        {!q && <span className="search-caret" />}
      </div>

      <div className="search-chip-row">
        {['all','songs','albums','artists','playlists'].map(f => (
          <button key={f}
            className={`search-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {filter === f ? `[${f}]` : f}
          </button>
        ))}
      </div>

      {!query && (
        <div className="search-empty">
          <pre>{`  ┌──────────────────────┐
  │  >_ search library   │
  │                      │
  │  · song titles       │
  │  · artist names      │
  │  · album names       │
  │  · playlists         │
  └──────────────────────┘`}</pre>
          <div style={{ marginTop: 14 }} className="soft">try: "juno", "harbor", "ambient"</div>
        </div>
      )}

      {query && !hasResults && (
        <div className="search-empty">
          <div>no results for <span className="accent">"{q}"</span></div>
        </div>
      )}

      {query && showSongs && songs.length > 0 && <>
        <SectionHead label={`songs (${songs.length})`} />
        {songs.slice(0, 8).map((s, i) => (
          <ListRow key={s.id} idx={i+1} left={s.title} sub={s.artist} right={fmt(s.dur)}
            active={s.id === state.nowPlayingId}
            onClick={() => dispatch({ type: 'play', songId: s.id })}/>
        ))}
      </>}
      {query && showAlbums && albums.length > 0 && <>
        <SectionHead label={`albums (${albums.length})`} />
        {albums.map((a, i) => (
          <ListRow key={a.id} glyph="■" left={a.title} sub={`${a.artist} · ${a.year}`} right="→"
            onClick={() => dispatch({ type: 'go', tab: 'album', albumId: a.id })}/>
        ))}
      </>}
      {query && showArtists && artists.length > 0 && <>
        <SectionHead label={`artists (${artists.length})`} />
        {artists.map((a) => (
          <ListRow key={a.id} glyph="◆" left={a.name} sub={`${a.albums} albums · ${a.songs} songs`} right="→"
            onClick={() => dispatch({ type: 'go', tab: 'artist', artistName: a.name })}/>
        ))}
      </>}
      {query && showPlaylists && playlists.length > 0 && <>
        <SectionHead label={`playlists (${playlists.length})`} />
        {playlists.map((p) => (
          <ListRow key={p.id} glyph="▸" left={p.name} sub={`${p.count} songs`} right="→"
            onClick={() => dispatch({ type: 'go', tab: 'playlist', playlistId: p.id })}/>
        ))}
      </>}
    </>
  );
}

function Settings({ state, dispatch }) {
  const [crossfade, setCrossfade] = React.useState(true);
  const [gapless, setGapless] = React.useState(true);
  const [hq, setHq] = React.useState('wifi');
  const [eq, setEq] = React.useState('flat');

  const Item = ({ label, sub, children }) => (
    <div className="settings-item">
      <div style={{flex:1}}>
        <div className="settings-label">{label}</div>
        {sub && <div className="settings-sub">{sub}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
  const Toggle = ({ on, onClick }) => (
    <button className={`settings-toggle ${on ? 'on' : ''}`} onClick={onClick}>
      {on ? '[×] on' : '[ ] off'}
    </button>
  );
  const Seg = ({ opts, value, onChange }) => (
    <div className="seg">
      {opts.map(o => (
        <button key={o} className={value === o ? 'on' : ''} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );

  return (
    <>
      <Path parts={['config']} />

      <SectionHead label="playback" />
      <Item label="crossfade" sub="fade between tracks, 4s">
        <Toggle on={crossfade} onClick={() => setCrossfade(!crossfade)} />
      </Item>
      <Item label="gapless playback" sub="seamless album transitions">
        <Toggle on={gapless} onClick={() => setGapless(!gapless)} />
      </Item>
      <Item label="equalizer">
        <Seg opts={['flat','warm','bass','vocal']} value={eq} onChange={setEq} />
      </Item>

      <SectionHead label="audio" />
      <Item label="stream quality">
        <Seg opts={['auto','wifi','hq']} value={hq} onChange={setHq} />
      </Item>
      <Item label="downloaded only" sub="skip online tracks">
        <Toggle on={false} />
      </Item>

      <SectionHead label="interface" />
      <Item label="themes" sub={`${THEME_IDS.length} available · currently ${THEMES[state.theme]?.label || state.theme}`}>
        <button className="btn" onClick={() => dispatch({ type: 'go', tab: 'themes' })}>
          open →
        </button>
      </Item>
      <Item label="color scheme" sub="quick switch">
        <Seg opts={['paper','mono','sepia','dark']} value={state.theme}
          onChange={v => dispatch({ type: 'setTheme', theme: v })} />
      </Item>
      <Item label="cover art">
        <Seg opts={['blocks','ascii','letter']} value={state.coverStyle}
          onChange={v => dispatch({ type: 'setCover', coverStyle: v })} />
      </Item>

      <SectionHead label="content" />
      <Item label="lyrics manager" sub="view, add, edit lyrics for every track">
        <button className="btn" onClick={() => dispatch({ type: 'go', tab: 'lyricsmgr' })}>
          open →
        </button>
      </Item>
      <Item label="add new track">
        <button className="btn" onClick={() => dispatch({ type: 'openAddSong' })}>
          [+] new
        </button>
      </Item>

      <SectionHead label="storage" />
      <div className="kv-table">
        <div className="kv-row"><span className="k">downloaded</span><span className="v">1.2 GB</span></div>
        <div className="kv-row"><span className="k">cache</span><span className="v">48 MB</span></div>
        <div className="kv-row"><span className="k">free</span><span className="v">12.4 GB</span></div>
      </div>
      <div style={{marginTop: 10, display: 'flex', gap: 6}}>
        <button className="btn">clear cache</button>
        <button className="btn">manage downloads</button>
      </div>

      <SectionHead label="about" />
      <div className="kv-table">
        <div className="kv-row"><span className="k">version</span><span className="v">1.4.0 — "paper"</span></div>
        <div className="kv-row"><span className="k">build</span><span className="v">a3f9c21</span></div>
      </div>
      <pre style={{color:'var(--ink-faint)',fontSize:10,lineHeight:1.1,marginTop:16,textAlign:'center'}}>{`        ♫ ═══════════ ♫
     —— made for terminal ears ——`}</pre>
    </>
  );
}

// Create playlist dialog
function CreatePlaylistDialog({ onClose, onCreate }) {
  const [name, setName] = React.useState('');
  const [desc, setDesc] = React.useState('');
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">
          <span>┌── new playlist ──</span>
          <span style={{cursor:'pointer'}} onClick={onClose}>[×]</span>
        </div>
        <div className="dialog-body">
          <label>name</label>
          <input autoFocus placeholder="untitled playlist" value={name} onChange={e => setName(e.target.value)}/>
          <label>description (optional)</label>
          <textarea rows={2} placeholder="a short note about this mix…" value={desc} onChange={e => setDesc(e.target.value)}/>
          <label>cover art seed</label>
          <div style={{display:'flex',gap:10,alignItems:'center',marginTop:4}}>
            <Cover seed={name || 'new'} size={6} style="blocks" tint="var(--accent)"/>
            <div className="soft" style={{fontSize:11}}>auto-generated from name</div>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="btn" onClick={onClose}>[esc] cancel</button>
          <button className="btn primary" disabled={!name} onClick={() => { onCreate({name, desc}); onClose(); }}>
            [↵] create
          </button>
        </div>
      </div>
    </div>
  );
}

// Add-to-playlist dialog
function AddToPlaylistDialog({ onClose, songId }) {
  const song = songById(songId);
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">
          <span>┌── add to playlist ──</span>
          <span style={{cursor:'pointer'}} onClick={onClose}>[×]</span>
        </div>
        <div className="dialog-body" style={{padding: 0}}>
          <div style={{padding: '10px 14px', borderBottom: '1px dashed var(--hairline)', fontSize: 12}}>
            <span className="soft">adding: </span><span>{song?.title}</span>
          </div>
          <div style={{maxHeight: 240, overflowY: 'auto', padding: '4px 8px'}}>
            {LIB.playlists.map(p => (
              <ListRow key={p.id} glyph="▸" left={p.name}
                sub={`${p.count} songs`} right={<span className="accent">[+]</span>}
                onClick={() => onClose()} />
            ))}
          </div>
        </div>
        <div className="dialog-actions">
          <button className="btn" onClick={onClose}>done</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  PlaylistsList, PlaylistDetail, Queue, Search, Settings,
  CreatePlaylistDialog, AddToPlaylistDialog,
});
