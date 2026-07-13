// Main app — state, mini player, tweaks panel, welcome, assembly

const { useState, useEffect, useReducer, useCallback } = React;

function MiniPlayer({ state, dispatch }) {
  const song = songById(state.nowPlayingId);
  if (!song) return null;
  const album = albumById(song.album);
  const pct = (state.nowPlayingPos / song.dur) * 100;

  return (
    <div className="mini-player" onClick={() => dispatch({ type: 'go', tab: 'now' })}>
      <Cover seed={album.seed} size={3} style={state.coverStyle} label={album.title[0]} tint="var(--accent)"/>
      <div className="mini-meta">
        <div className="mini-title">{song.title}</div>
        <div className="mini-artist">{song.artist}</div>
        <div className="mini-progress"><div className="mini-progress-fill" style={{width: `${pct}%`}}/></div>
      </div>
      <button className="mini-btn" onClick={e => { e.stopPropagation(); dispatch({ type: 'prev' }); }}>⏮</button>
      <button className="mini-btn" onClick={e => { e.stopPropagation(); dispatch({ type: 'toggle' }); }}>
        {state.playing ? '⏸' : '▶'}
      </button>
      <button className="mini-btn" onClick={e => { e.stopPropagation(); dispatch({ type: 'next' }); }}>⏭</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────────────────
const initialState = {
  tab: 'now',                // library | search | now | queue | settings | album | artist | playlist
  albumId: null,
  artistName: null,
  playlistId: null,
  nowPlayingId: LIB.nowPlayingId,
  nowPlayingPos: LIB.nowPlayingPos,
  playing: true,
  liked: false,
  queue: LIB.queue,
  // visuals (also managed by Tweaks)
  theme: 'paper',
  coverStyle: 'blocks',
  dialog: null,
  rowMenu: null,
  // booted flag
  booted: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'boot': return { ...state, booted: true };
    case 'go': {
      const next = { ...state, tab: action.tab };
      if (action.albumId) next.albumId = action.albumId;
      if (action.artistName) next.artistName = action.artistName;
      if (action.playlistId) next.playlistId = action.playlistId;
      return next;
    }
    case 'play': {
      if (!action.songId) return state;
      const inQueue = state.queue.includes(action.songId);
      return {
        ...state,
        nowPlayingId: action.songId,
        nowPlayingPos: 0,
        playing: true,
        queue: inQueue ? state.queue : [...state.queue, action.songId],
      };
    }
    case 'toggle': return { ...state, playing: !state.playing };
    case 'prev': {
      const i = state.queue.indexOf(state.nowPlayingId);
      const pi = Math.max(0, i - 1);
      return { ...state, nowPlayingId: state.queue[pi] || state.nowPlayingId, nowPlayingPos: 0, playing: true };
    }
    case 'next': {
      const i = state.queue.indexOf(state.nowPlayingId);
      const ni = Math.min(state.queue.length - 1, i + 1);
      return { ...state, nowPlayingId: state.queue[ni] || state.nowPlayingId, nowPlayingPos: 0, playing: true };
    }
    case 'tick': return state.playing
      ? { ...state, nowPlayingPos: Math.min(songById(state.nowPlayingId).dur, state.nowPlayingPos + 1) }
      : state;
    case 'like': return { ...state, liked: !state.liked };
    case 'shuffleAlbum': {
      const songs = songsInAlbum(action.albumId).map(s => s.id);
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      return { ...state, queue: shuffled, nowPlayingId: shuffled[0], nowPlayingPos: 0, playing: true };
    }
    case 'clearQueue': {
      return { ...state, queue: [state.nowPlayingId] };
    }
    case 'setTheme': return { ...state, theme: action.theme };
    case 'setCover': return { ...state, coverStyle: action.coverStyle };
    case 'openCreatePlaylist': return { ...state, dialog: { kind: 'create' } };
    case 'openEditPlaylist':   return { ...state, dialog: { kind: 'edit', playlistId: action.playlistId } };
    case 'openAddToPlaylist':  return { ...state, dialog: { kind: 'add', songId: action.songId } };
    case 'openEditTrack':      return { ...state, dialog: { kind: 'editTrack', songId: action.songId } };
    case 'openEditLyrics':     return { ...state, dialog: { kind: 'editLyrics', songId: action.songId } };
    case 'openAddSong':        return { ...state, dialog: { kind: 'addSong' } };
    case 'openRowMenu':        return { ...state, rowMenu: { songId: action.songId, pos: action.pos } };
    case 'closeRowMenu':       return { ...state, rowMenu: null };
    case 'closeDialog':        return { ...state, dialog: null };
    default: return state;
  }
}

// ─────────────────────────────────────────────────────────────
// Welcome overlay (first frame)
// ─────────────────────────────────────────────────────────────
function Welcome({ onStart }) {
  return (
    <div className="welcome">
      <pre>{`  ╔══════════════════════════╗
  ║  ░▒▓█  ♫  █▓▒░           ║
  ║                          ║
  ║   t  e  r  m  i  n  a  l ║
  ║                          ║
  ║         ♫ ♫ ♫            ║
  ╚══════════════════════════╝`}</pre>
      <h1>TERMINAL</h1>
      <div className="sub">a quiet music app · v1.4</div>
      <div className="btn-row">
        <button className="btn primary" onClick={onStart}>[↵] continue →</button>
      </div>
      <div className="faint" style={{marginTop: 30, fontSize: 11, lineHeight: 1.6, textAlign: 'left'}}>
        <div>keyboard hints shown throughout</div>
        <div>[tap] any row to play</div>
        <div>[L] [S] [N] [Q] jump between tabs</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tweaks panel — external, edit-mode toggle
// ─────────────────────────────────────────────────────────────
function TweaksPanel({ tweaks, setTweaks }) {
  const seg = (field, opts) => (
    <div className="tweaks-seg">
      {opts.map(o => (
        <button key={o}
          className={tweaks[field] === o ? 'on' : ''}
          onClick={() => setTweaks({ ...tweaks, [field]: o })}>
          {o}
        </button>
      ))}
    </div>
  );
  return (
    <div className="tweaks-panel">
      <div className="tweaks-head">
        <span>┌── Tweaks</span>
        <span style={{opacity: 0.6}}>●●●</span>
      </div>
      <div className="tweaks-body">
        <label>color scheme</label>
        <div className="tweaks-seg tweaks-seg-wrap">
          {THEME_IDS.map(id => (
            <button key={id}
              className={tweaks.theme === id ? 'on' : ''}
              onClick={() => setTweaks({ ...tweaks, theme: id })}>
              {THEMES[id].label}
            </button>
          ))}
        </div>

        <label>font</label>
        {seg('font', ['jetbrains','plex','vt','geist','space'])}

        <label>font size · {tweaks.fontSize}px</label>
        <input className="tweaks-slider" type="range" min="11" max="16" step="1"
          value={tweaks.fontSize}
          onChange={e => setTweaks({ ...tweaks, fontSize: +e.target.value })}/>

        <label>box-drawing density</label>
        {seg('density', ['light','medium','heavy'])}

        <label>accent</label>
        <div className="tweaks-seg">
          {['amber','rust','sage','plum','ink'].map(a => (
            <button key={a}
              className={tweaks.accent === a ? 'on' : ''}
              onClick={() => setTweaks({ ...tweaks, accent: a })}>{a}</button>
          ))}
        </div>

        <label>cover art</label>
        {seg('cover', ['blocks','ascii','letter'])}
      </div>
    </div>
  );
}

const ACCENTS = {
  amber: '#a04a1c',
  rust:  '#8a3a10',
  sage:  '#5a7148',
  plum:  '#6b3a5a',
  ink:   '#2a241c',
};

// ─────────────────────────────────────────────────────────────
// App root
// ─────────────────────────────────────────────────────────────
function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [, forceTick] = useState(0);
  // rerender on mutable store changes (track edits, new songs, lyrics)
  useEffect(() => store.subscribe(() => forceTick(n => n + 1)), []);

  // Tweaks state (subset mirrors reducer for theme/cover)
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "theme": "paper",
    "font": "jetbrains",
    "fontSize": 13,
    "density": "medium",
    "accent": "amber",
    "cover": "blocks"
  }/*EDITMODE-END*/;
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [tweaksOpen, setTweaksOpen] = useState(false);

  // Apply theme on tweaks change (also sync to reducer for screens that read state)
  useEffect(() => {
    applyTheme(tweaks.theme, tweaks.font, tweaks.fontSize, tweaks.density, tweaks.cover);
    // exotic themes (matrix/amber/phosphor/contrast) own their accent — don't override
    const exotic = ['matrix','amber','phosphor','contrast'];
    if (!exotic.includes(tweaks.theme)) {
      document.documentElement.style.setProperty('--accent', ACCENTS[tweaks.accent]);
    }
    dispatch({ type: 'setTheme', theme: tweaks.theme });
    dispatch({ type: 'setCover', coverStyle: tweaks.cover });
  }, [tweaks]);

  // Edit mode protocol
  useEffect(() => {
    const h = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', h);
    window.parent.postMessage({type: '__edit_mode_available'}, '*');
    return () => window.removeEventListener('message', h);
  }, []);

  // local theme-cycle event (fired from NowPlaying chip)
  useEffect(() => {
    const h = (e) => setTweaks(t => ({ ...t, theme: e.detail }));
    window.addEventListener('cycleTheme', h);
    return () => window.removeEventListener('cycleTheme', h);
  }, []);

  // cross-dialog: openEditLyrics as CustomEvent (EditTrackDialog → EditLyricsDialog)
  useEffect(() => {
    const h = (e) => dispatch({ type: 'openEditLyrics', songId: e.detail });
    window.addEventListener('openEditLyrics', h);
    return () => window.removeEventListener('openEditLyrics', h);
  }, []);

  // persist changes
  const updateTweaks = (next) => {
    setTweaks(next);
    try {
      window.parent.postMessage({type: '__edit_mode_set_keys', edits: next}, '*');
    } catch {}
  };

  // Playback tick
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'tick' }), 1000);
    return () => clearInterval(id);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === ' ') { e.preventDefault(); dispatch({ type: 'toggle' }); }
      else if (e.key === 'ArrowLeft')  dispatch({ type: 'prev' });
      else if (e.key === 'ArrowRight') dispatch({ type: 'next' });
      else if (e.key.toLowerCase() === 'l') dispatch({ type: 'go', tab: 'library' });
      else if (e.key.toLowerCase() === 's') dispatch({ type: 'go', tab: 'search' });
      else if (e.key.toLowerCase() === 'n') dispatch({ type: 'go', tab: 'now' });
      else if (e.key.toLowerCase() === 'q') dispatch({ type: 'go', tab: 'queue' });
      else if (e.key === 'Escape') dispatch({ type: 'closeDialog' });
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  // Current time formatted
  const now = new Date();
  const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;

  // Persist booted to localStorage
  useEffect(() => {
    if (localStorage.getItem('tui-booted') === '1') dispatch({ type: 'boot' });
  }, []);
  const boot = () => { localStorage.setItem('tui-booted', '1'); dispatch({ type: 'boot' }); };

  // which screen to render in content slot
  let content;
  if (!state.booted) content = <Welcome onStart={boot}/>;
  else if (state.tab === 'library')  content = <Library state={state} dispatch={dispatch}/>;
  else if (state.tab === 'search')   content = <Search state={state} dispatch={dispatch}/>;
  else if (state.tab === 'now')      content = <NowPlaying state={state} dispatch={dispatch}/>;
  else if (state.tab === 'queue')    content = <Queue state={state} dispatch={dispatch}/>;
  else if (state.tab === 'settings') content = <Settings state={state} dispatch={dispatch}/>;
  else if (state.tab === 'themes')   content = <ThemesScreen state={state} dispatch={dispatch} tweaks={tweaks} setTweaks={updateTweaks}/>;
  else if (state.tab === 'lyricsmgr') content = <LyricsManager state={state} dispatch={dispatch}/>;
  else if (state.tab === 'album')    content = <AlbumDetail albumId={state.albumId} state={state} dispatch={dispatch}/>;
  else if (state.tab === 'artist')   content = <ArtistDetail artistName={state.artistName} state={state} dispatch={dispatch}/>;
  else if (state.tab === 'playlist') content = <PlaylistDetail playlistId={state.playlistId} state={state} dispatch={dispatch}/>;

  const showMini = state.booted && state.tab !== 'now';

  // screen label for comments
  const screenLabel = state.booted ? state.tab : 'welcome';

  return (
    <div className="phone-container">
      <AndroidDevice width={412} height={892}>
        <div className="tui-app paper-bg" data-screen-label={`music / ${screenLabel}`}>
          <div style={{flex:1, minHeight:0, display:'flex', flexDirection:'column', position:'relative'}}>
            <TuiScreen>{content}</TuiScreen>
          </div>
          {showMini && <MiniPlayer state={state} dispatch={dispatch}/>}
          {state.booted && <TuiNav tab={({album:'library',artist:'library',playlist:'library',themes:'settings',lyricsmgr:'settings'})[state.tab] || state.tab} setTab={(t) => dispatch({ type: 'go', tab: t })}/>}
          {state.dialog?.kind === 'create'     && <CreatePlaylistDialog onClose={() => dispatch({ type: 'closeDialog' })} onCreate={() => {}}/>}
          {state.dialog?.kind === 'add'        && <AddToPlaylistDialog songId={state.dialog.songId} onClose={() => dispatch({ type: 'closeDialog' })}/>}
          {state.dialog?.kind === 'editTrack'  && <EditTrackDialog songId={state.dialog.songId} onClose={() => dispatch({ type: 'closeDialog' })}/>}
          {state.dialog?.kind === 'editLyrics' && <EditLyricsDialogV2 songId={state.dialog.songId} state={state} dispatch={dispatch} onClose={() => dispatch({ type: 'closeDialog' })}/>}
          {state.dialog?.kind === 'addSong'    && <AddSongDialog onClose={() => dispatch({ type: 'closeDialog' })}/>}
          {state.rowMenu && <RowMenu songId={state.rowMenu.songId} pos={state.rowMenu.pos} dispatch={dispatch} onClose={() => dispatch({ type: 'closeRowMenu' })}/>}
        </div>
      </AndroidDevice>
      <div className="phone-caption">
        <strong>terminal</strong><br/>
        a minimalist music app with a<br/>
        text-based interface. tap any row<br/>
        or song to play. keyboard hints<br/>
        shown throughout.<br/><br/>
        try: <strong>L</strong> library · <strong>S</strong> search ·<br/>
        <strong>N</strong> now playing · <strong>Q</strong> queue<br/>
        <strong>space</strong> play/pause · <strong>← →</strong> skip<br/><br/>
        toggle <strong>Tweaks</strong> (toolbar) to<br/>
        change theme, font, and more.
      </div>
      {tweaksOpen && <TweaksPanel tweaks={tweaks} setTweaks={updateTweaks}/>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
