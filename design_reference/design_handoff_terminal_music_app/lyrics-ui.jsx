// Lyrics view + Track-edit dialog + Banner editor

function LyricsView({ song, pos, onEdit }) {
  const lyrics = getLyrics(song.id);
  const idx = currentLyricIdx(lyrics, pos);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!ref.current || idx < 0) return;
    const el = ref.current.querySelector(`[data-idx="${idx}"]`);
    if (el) {
      const parent = ref.current;
      const top = el.offsetTop - parent.offsetTop - parent.clientHeight / 2 + el.clientHeight / 2;
      parent.scrollTo({ top, behavior: 'smooth' });
    }
  }, [idx]);

  if (!lyrics) {
    return (
      <div className="empty-state">
        <pre>{`┌──────────────────┐
│  no lyrics yet   │
└──────────────────┘`}</pre>
        <div className="soft" style={{marginBottom: 12}}>no synced lyrics for this track</div>
        <button className="btn accent" onClick={onEdit}>+ add lyrics</button>
      </div>
    );
  }

  return (
    <div className="lyrics-wrap" ref={ref}>
      {lyrics.map((l, i) => (
        <div
          key={i}
          data-idx={i}
          className={`lyric-line ${i === idx ? 'cur' : ''} ${i < idx ? 'past' : ''}`}
        >
          {l.line || '\u00A0'}
        </div>
      ))}
      <div style={{textAlign:'center', marginTop: 18}}>
        <button className="btn" onClick={onEdit}>✎ edit lyrics</button>
      </div>
    </div>
  );
}

// Dialog: edit track metadata (title, artist, album)
function EditTrackDialog({ songId, onClose }) {
  const song = songById(songId);
  const [title, setTitle]   = React.useState(song.title);
  const [artist, setArtist] = React.useState(song.artist);
  const [album, setAlbumId] = React.useState(song.album);
  const [banner, setBanner] = React.useState(song.banner || '');
  const hasLyrics = !!getLyrics(songId);

  const save = () => {
    store.updateSong(songId, { title, artist, album, banner: banner.trim() || null });
    onClose();
  };
  const del = () => {
    if (confirm('delete this track?')) { store.removeSong(songId); onClose(); }
  };
  const openLyrics = () => {
    // close this dialog and open lyrics editor
    onClose();
    // defer so the dispatcher sees the closed state first
    setTimeout(() => window.dispatchEvent(new CustomEvent('openEditLyrics', { detail: songId })), 0);
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()} style={{maxWidth: 360}}>
        <div className="dialog-title">
          <span>┌── edit track ──</span>
          <span style={{cursor:'pointer'}} onClick={onClose}>[×]</span>
        </div>
        <div className="dialog-body">
          <label>title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} dir="auto"/>
          <label>artist</label>
          <input value={artist} onChange={e => setArtist(e.target.value)} dir="auto"/>
          <label>album</label>
          <select value={album} onChange={e => setAlbumId(e.target.value)}
            style={{width:'100%',background:'var(--bg-elev)',border:'1px solid var(--hairline)',color:'var(--ink)',fontFamily:'var(--mono)',fontSize:'var(--fs)',padding:'6px 8px',borderRadius:2}}>
            {LIB.albums.map(a => <option key={a.id} value={a.id}>{a.title} — {a.artist}</option>)}
          </select>
          <label>custom ascii banner (optional)</label>
          <textarea rows={4} placeholder={`   ╔═════════╗\n   ║  side A ║\n   ╚═════════╝`}
            value={banner} onChange={e => setBanner(e.target.value)}
            style={{fontFamily:'var(--mono)',whiteSpace:'pre',resize:'vertical'}}/>
          <div className="soft" style={{fontSize: 10, marginTop: 4}}>
            supports devanagari (हिन्दी), ascii art, box-drawing chars
          </div>
          <label style={{marginTop: 12}}>lyrics</label>
          <button className="btn" onClick={openLyrics} style={{alignSelf:'flex-start'}}>
            ♪ {hasLyrics ? 'edit synced lyrics →' : '+ add synced lyrics →'}
          </button>
        </div>
        <div className="dialog-actions">
          <button className="btn" onClick={del} style={{borderColor:'#8a3a10',color:'#8a3a10'}}>[del] remove</button>
          <div style={{flex:1}}/>
          <button className="btn" onClick={onClose}>cancel</button>
          <button className="btn primary" onClick={save} disabled={!title.trim()}>[↵] save</button>
        </div>
      </div>
    </div>
  );
}

// Dialog: edit synced lyrics as LRC-like text
function EditLyricsDialog({ songId, onClose }) {
  const existing = getLyrics(songId) || [];
  const asText = existing.map(l => `[${String(Math.floor(l.t/60)).padStart(2,'0')}:${String(l.t%60).padStart(2,'0')}] ${l.line}`).join('\n');
  const [text, setText] = React.useState(asText);

  const parse = (raw) => {
    const out = [];
    raw.split('\n').forEach(line => {
      const m = line.match(/^\s*\[(\d{1,2}):(\d{2})(?:\.(\d{1,2}))?\]\s?(.*)$/);
      if (m) {
        const mm = +m[1], ss = +m[2];
        out.push({ t: mm*60 + ss, line: m[4] });
      } else if (line.trim()) {
        // no timestamp — assign t of last + 4
        const t = (out[out.length-1]?.t ?? -4) + 4;
        out.push({ t, line: line.trim() });
      }
    });
    return out;
  };
  const save = () => {
    const parsed = parse(text);
    store.setLyrics(songId, parsed.length ? parsed : null);
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()} style={{maxWidth: 380}}>
        <div className="dialog-title">
          <span>┌── edit lyrics ──</span>
          <span style={{cursor:'pointer'}} onClick={onClose}>[×]</span>
        </div>
        <div className="dialog-body">
          <label>lyrics · [mm:ss] prefix for sync</label>
          <textarea rows={12} value={text} onChange={e => setText(e.target.value)} dir="auto"
            placeholder={`[00:00] [instrumental]\n[00:12] first line here\n[00:20] चाँदनी रात में`}
            style={{fontFamily:'var(--mono)',whiteSpace:'pre',fontSize:12,lineHeight:1.5}}/>
          <div className="soft" style={{fontSize: 10, marginTop: 4, lineHeight: 1.5}}>
            lines without timestamps auto-space by 4s.<br/>
            devanagari and unicode welcome.
          </div>
        </div>
        <div className="dialog-actions">
          <button className="btn" onClick={onClose}>cancel</button>
          <button className="btn primary" onClick={save}>[↵] save</button>
        </div>
      </div>
    </div>
  );
}

// Dialog: add new song
function AddSongDialog({ onClose, onAdded }) {
  const [title, setTitle]   = React.useState('');
  const [artist, setArtist] = React.useState('');
  const [album, setAlbumId] = React.useState(LIB.albums[0]?.id);
  const [mins, setMins]     = React.useState(3);
  const [secs, setSecs]     = React.useState(0);

  const save = () => {
    const id = store.addSong({ title: title.trim(), artist: artist.trim(), album, dur: (+mins)*60 + (+secs) });
    onAdded?.(id);
    onClose();
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">
          <span>┌── add track ──</span>
          <span style={{cursor:'pointer'}} onClick={onClose}>[×]</span>
        </div>
        <div className="dialog-body">
          <label>title</label>
          <input autoFocus value={title} onChange={e => setTitle(e.target.value)} dir="auto" placeholder="e.g. धुँध / Blueprint / …"/>
          <label>artist</label>
          <input value={artist} onChange={e => setArtist(e.target.value)} dir="auto"/>
          <label>album</label>
          <select value={album} onChange={e => setAlbumId(e.target.value)}
            style={{width:'100%',background:'var(--bg-elev)',border:'1px solid var(--hairline)',color:'var(--ink)',fontFamily:'var(--mono)',fontSize:'var(--fs)',padding:'6px 8px',borderRadius:2}}>
            {LIB.albums.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
          <label>duration · mm:ss</label>
          <div style={{display:'flex',gap:6}}>
            <input type="number" min="0" max="59" value={mins} onChange={e => setMins(e.target.value)} style={{width:72}}/>
            <span style={{alignSelf:'center'}}>:</span>
            <input type="number" min="0" max="59" value={secs} onChange={e => setSecs(e.target.value)} style={{width:72}}/>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="btn" onClick={onClose}>cancel</button>
          <button className="btn primary" onClick={save} disabled={!title.trim() || !artist.trim()}>[↵] add</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LyricsView, EditTrackDialog, EditLyricsDialog, AddSongDialog });
