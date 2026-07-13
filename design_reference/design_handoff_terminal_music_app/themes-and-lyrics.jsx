// Themes gallery screen, quick theme cycle, row action menu,
// enhanced lyrics editor, lyrics-manager screen.

// ─────────────────────────────────────────────────────────────
// Theme preview swatch — renders a miniature app frame
// ─────────────────────────────────────────────────────────────
function ThemeSwatch({ themeId, active, onClick }) {
  const t = THEMES[themeId];
  if (!t) return null;
  const style = {
    '--bg':        t['--bg'],
    '--bg-elev':   t['--bg-elev'],
    '--ink':       t['--ink'],
    '--ink-soft':  t['--ink-soft'],
    '--ink-faint': t['--ink-faint'],
    '--accent':    t['--accent'],
    '--selection': t['--selection'],
    '--hairline':  t['--hairline'],
    background:    t['--bg'],
    color:         t['--ink'],
    borderColor:   active ? t['--accent'] : t['--hairline'],
    borderWidth:   active ? 2 : 1,
  };
  return (
    <button className={`theme-swatch ${active ? 'active' : ''}`} style={style} onClick={onClick}>
      <div className="theme-swatch-chrome">
        <span className="swatch-dot" style={{background: t['--accent']}}/>
        <span className="swatch-dot" style={{background: t['--ink-soft']}}/>
        <span className="swatch-dot" style={{background: t['--ink-faint']}}/>
      </div>
      <div className="theme-swatch-preview">
        <div className="sp-bar" style={{color: t['--ink-faint'], borderColor: t['--hairline']}}>
          /library
        </div>
        <div className="sp-row" style={{color: t['--ink'], background: t['--selection']}}>
          <span style={{color: t['--accent']}}>▶</span> Ferrybridge
        </div>
        <div className="sp-row" style={{color: t['--ink-soft']}}>
          02 Paper Window
        </div>
        <div className="sp-row" style={{color: t['--ink-soft']}}>
          03 Drift
        </div>
        <div className="sp-progress">
          <span style={{color: t['--accent']}}>{'█'.repeat(9)}</span>
          <span style={{color: t['--ink-faint']}}>{'░'.repeat(11)}</span>
        </div>
      </div>
      <div className="theme-swatch-label">
        <div className="swatch-name" style={{color: t['--ink']}}>
          {active && <span style={{color: t['--accent']}}>▸ </span>}{t.label}
        </div>
        <div className="swatch-desc" style={{color: t['--ink-faint']}}>{t.desc}</div>
      </div>
    </button>
  );
}

function ThemesScreen({ state, dispatch, tweaks, setTweaks }) {
  return (
    <>
      <Path parts={['config', 'themes']} />
      <SectionHead label={`${THEME_IDS.length} themes`} right={<span className="faint">tap to apply</span>}/>
      <div className="theme-gallery">
        {THEME_IDS.map(id => (
          <ThemeSwatch
            key={id}
            themeId={id}
            active={tweaks.theme === id}
            onClick={() => setTweaks({ ...tweaks, theme: id })}
          />
        ))}
      </div>

      <SectionHead label="accent color" />
      <div className="accent-row">
        {[
          {id: 'amber', hex: '#a04a1c'},
          {id: 'rust',  hex: '#8a3a10'},
          {id: 'sage',  hex: '#5a7148'},
          {id: 'plum',  hex: '#6b3a5a'},
          {id: 'ink',   hex: '#2a241c'},
        ].map(a => (
          <button key={a.id}
            className={`accent-swatch ${tweaks.accent === a.id ? 'active' : ''}`}
            onClick={() => setTweaks({ ...tweaks, accent: a.id })}>
            <span className="accent-chip" style={{background: a.hex}}/>
            <span className="accent-name">{a.id}</span>
            {tweaks.accent === a.id && <span className="accent-check">✓</span>}
          </button>
        ))}
      </div>
      <div className="soft" style={{fontSize: 11, marginTop: 4, lineHeight: 1.5}}>
        note: some themes override accent (amber crt, phosphor, matrix).
      </div>

      <SectionHead label="font" />
      <div className="font-row">
        {['jetbrains','plex','vt','geist','space'].map(f => (
          <button key={f}
            className={`font-chip ${tweaks.font === f ? 'active' : ''}`}
            onClick={() => setTweaks({ ...tweaks, font: f })}
            style={{fontFamily: ({jetbrains:"'JetBrains Mono'",plex:"'IBM Plex Mono'",vt:"'VT323'",geist:"'Geist Mono'",space:"'Space Mono'"})[f]}}>
            {tweaks.font === f ? `[${f}]` : f}
            <div className="font-sample">Aa Bb 01</div>
          </button>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Row action menu — tap ⋮ on any song row
// ─────────────────────────────────────────────────────────────
function RowMenu({ songId, pos, onClose, dispatch }) {
  const song = songById(songId);
  const ref = React.useRef(null);
  // clamp so the menu stays within the phone frame
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const host = el.closest('.tui-app');
    if (!host) return;
    const hostW = host.clientWidth;
    const hostH = host.clientHeight;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let left = pos.left, top = pos.top;
    if (left + w > hostW - 8) left = hostW - w - 12;
    if (left < 8) left = 12;
    if (top + h > hostH - 70) top = Math.max(12, pos.top - h - 24);
    el.style.left = left + 'px';
    el.style.top  = top  + 'px';
  }, []);

  const items = [
    { label: '▶ play now',        action: () => dispatch({ type: 'play', songId }) },
    { label: '+ add to queue',    action: () => {} },
    { label: '+ add to playlist', action: () => dispatch({ type: 'openAddToPlaylist', songId }) },
    { label: '✎ edit track',      action: () => dispatch({ type: 'openEditTrack', songId }) },
    { label: '♪ edit lyrics',     action: () => dispatch({ type: 'openEditLyrics', songId }) },
    { label: '⌂ go to album',     action: () => dispatch({ type: 'go', tab: 'album', albumId: song.album }) },
    { label: '⤫ delete',          action: () => { if(confirm('delete this track?')) store.removeSong(songId); } },
  ];

  return (
    <div className="row-menu-backdrop" onClick={onClose}>
      <div className="row-menu" ref={ref} style={{ top: pos?.top, left: pos?.left }} onClick={e => e.stopPropagation()}>
        <div className="row-menu-title">
          <span>┌ {song?.title} ┐</span>
        </div>
        {items.map((it, i) => (
          <button key={i} className="row-menu-item" onClick={() => { it.action(); onClose(); }}>
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Lyrics Manager — list all tracks, sync status, jump to add
// ─────────────────────────────────────────────────────────────
function LyricsManager({ state, dispatch }) {
  const [filter, setFilter] = React.useState('all'); // all | with | without
  const rows = LIB.songs.filter(s => {
    const has = !!getLyrics(s.id);
    if (filter === 'with')    return has;
    if (filter === 'without') return !has;
    return true;
  });
  const have   = LIB.songs.filter(s => !!getLyrics(s.id)).length;
  const total  = LIB.songs.length;
  const pct    = Math.round((have / total) * 100);

  return (
    <>
      <Path parts={['config', 'lyrics manager']} />

      <div className="lm-summary">
        <div className="lm-summary-head">
          <span>lyrics coverage</span>
          <span className="mono-num">{have}/{total} · {pct}%</span>
        </div>
        <div style={{ padding: '4px 0' }}>
          <AsciiProgress value={have} max={total} width={32} accent/>
        </div>
        <div className="soft" style={{fontSize: 11, marginTop: 4}}>
          {total - have} track{(total-have)!==1?'s':''} still need lyrics.
        </div>
      </div>

      <div className="search-chip-row" style={{marginTop: 10}}>
        {[
          {id:'all',     label: `all (${total})`},
          {id:'with',    label: `with lyrics (${have})`},
          {id:'without', label: `needs lyrics (${total - have})`},
        ].map(f => (
          <button key={f.id}
            className={`search-chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}>
            {filter === f.id ? `[${f.label}]` : f.label}
          </button>
        ))}
      </div>

      <SectionHead label="tracks" />
      {rows.map((s, i) => {
        const has = !!getLyrics(s.id);
        return (
          <div key={s.id} className="lm-row">
            <span className="row-idx" style={{color: has ? 'var(--accent)' : 'var(--ink-faint)'}}>
              {has ? '✓' : '○'}
            </span>
            <div className="row-main">
              <div className="row-left">{s.title}</div>
              <div className="row-sub">{s.artist} · {albumById(s.album)?.title}</div>
            </div>
            <button className="btn" onClick={() => dispatch({ type: 'openEditLyrics', songId: s.id })}>
              {has ? 'edit' : '+ add'}
            </button>
          </div>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Enhanced lyrics editor — live preview + sync-now stamp
// Overrides the earlier EditLyricsDialog.
// ─────────────────────────────────────────────────────────────
function EditLyricsDialogV2({ songId, state, dispatch, onClose }) {
  const song = songById(songId);
  const existing = getLyrics(songId) || [];
  const asText = existing.map(l =>
    `[${String(Math.floor(l.t/60)).padStart(2,'0')}:${String(l.t%60).padStart(2,'0')}] ${l.line}`
  ).join('\n');
  const [text, setText] = React.useState(asText);
  const [mode, setMode] = React.useState('edit'); // edit | preview | help
  const taRef = React.useRef(null);

  const parse = (raw) => {
    const out = [];
    raw.split('\n').forEach(line => {
      const m = line.match(/^\s*\[(\d{1,2}):(\d{2})(?:\.(\d{1,2}))?\]\s?(.*)$/);
      if (m) {
        const mm = +m[1], ss = +m[2];
        out.push({ t: mm*60 + ss, line: m[4] });
      } else if (line.trim()) {
        const t = (out[out.length-1]?.t ?? -4) + 4;
        out.push({ t, line: line.trim() });
      }
    });
    return out;
  };

  const parsed = parse(text);

  // insert `[mm:ss] ` at cursor using the current playback position
  const stampNow = () => {
    const ta = taRef.current; if (!ta) return;
    const t = Math.floor(state.nowPlayingPos);
    const stamp = `[${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}] `;
    const start = ta.selectionStart ?? text.length;
    // go to start of the current line
    const before = text.slice(0, start);
    const lineStart = before.lastIndexOf('\n') + 1;
    const next = text.slice(0, lineStart) + stamp + text.slice(lineStart);
    setText(next);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = lineStart + stamp.length;
    });
  };

  const pasteFromClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      setText(t => t + (t && !t.endsWith('\n') ? '\n' : '') + clip);
    } catch {}
  };

  const save = () => {
    store.setLyrics(songId, parsed.length ? parsed : null);
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog dialog-wide" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">
          <span>┌── lyrics · {song?.title} ──</span>
          <span style={{cursor:'pointer'}} onClick={onClose}>[×]</span>
        </div>

        <div className="le-toolbar">
          <div className="search-chip-row" style={{margin: 0}}>
            {['edit','preview','help'].map(m => (
              <button key={m}
                className={`search-chip ${mode === m ? 'active' : ''}`}
                onClick={() => setMode(m)}>
                {mode === m ? `[${m}]` : m}
              </button>
            ))}
          </div>
          <div style={{flex: 1}}/>
          <span className="soft mono-num">pos: {fmt(state.nowPlayingPos)} / {fmt(song?.dur || 0)}</span>
        </div>

        {mode === 'edit' && (
          <div className="le-edit-area">
            <div className="le-actions">
              <button className="btn accent" onClick={stampNow} title="insert [mm:ss] from current playback position">
                ⊙ stamp now [{fmt(state.nowPlayingPos)}]
              </button>
              <button className="btn" onClick={pasteFromClipboard}>⎙ paste</button>
              <button className="btn" onClick={() => setText('')}>clear</button>
              <div style={{flex: 1}}/>
              <span className="faint mono-num" style={{fontSize: 11}}>{parsed.length} lines</span>
            </div>
            <textarea
              ref={taRef}
              rows={10}
              value={text}
              onChange={e => setText(e.target.value)}
              dir="auto"
              className="le-textarea"
              placeholder={`[00:00] [instrumental]\n[00:12] first line here\n[00:20] चाँदनी रात में`}
            />
          </div>
        )}

        {mode === 'preview' && (
          <div className="le-preview">
            {parsed.length === 0 ? (
              <div className="empty-state"><div className="soft">no lines yet</div></div>
            ) : parsed.map((l, i) => {
              const isCur = currentLyricIdx(parsed, state.nowPlayingPos) === i;
              return (
                <div key={i} className={`le-preview-line ${isCur ? 'cur' : ''}`}>
                  <span className="le-preview-time mono-num">{fmt(l.t)}</span>
                  <span className="le-preview-text">{l.line || '—'}</span>
                </div>
              );
            })}
          </div>
        )}

        {mode === 'help' && (
          <div className="le-help">
            <div className="kv-row"><span className="k">format</span><span className="v">[mm:ss] line text</span></div>
            <div className="kv-row"><span className="k">no timestamp</span><span className="v">auto +4s from previous</span></div>
            <div className="kv-row"><span className="k">blank lines</span><span className="v">preserved as spacers</span></div>
            <div className="kv-row"><span className="k">unicode</span><span className="v">devanagari, emoji, etc.</span></div>
            <div className="kv-row"><span className="k">stamp now</span><span className="v">prepends playback time to current line</span></div>
            <pre style={{marginTop: 12, color: 'var(--ink-soft)', fontSize: 11, lineHeight: 1.5, whiteSpace: 'pre-wrap'}}>
{`┌── example ──────────────────────┐
│ [00:00] [instrumental]          │
│ [00:12] down by the ferrybridge │
│ [00:20] i waited for the light  │
│ [00:28] चाँदनी रात                │
└─────────────────────────────────┘`}
            </pre>
          </div>
        )}

        <div className="dialog-actions">
          <button className="btn" onClick={onClose}>cancel</button>
          <div style={{flex:1}}/>
          <button className="btn primary" onClick={save}>[↵] save · {parsed.length} lines</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ThemesScreen, ThemeSwatch, RowMenu, LyricsManager, EditLyricsDialogV2,
});
