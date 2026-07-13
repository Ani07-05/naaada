// Shell — theming, status bar, bottom nav, app container

const THEMES = {
  paper: {
    label: 'paper',
    desc: 'warm cream, sepia ink',
    '--bg':        '#efe7d7',
    '--bg-elev':   '#e7dcc7',
    '--ink':       '#2a241c',
    '--ink-soft':  '#6b5d47',
    '--ink-faint': '#a89776',
    '--accent':    '#a04a1c',
    '--selection': '#d9c9a3',
    '--hairline':  '#c9b896',
  },
  mono: {
    label: 'mono',
    desc: 'off-white, pure ink',
    '--bg':        '#f5f3ee',
    '--bg-elev':   '#ece9e0',
    '--ink':       '#1a1a1a',
    '--ink-soft':  '#555',
    '--ink-faint': '#9a968c',
    '--accent':    '#1a1a1a',
    '--selection': '#dedbd2',
    '--hairline':  '#bfbbaf',
  },
  sepia: {
    label: 'sepia',
    desc: 'aged vellum, red ink',
    '--bg':        '#ebd9b4',
    '--bg-elev':   '#e0ca9e',
    '--ink':       '#3a2610',
    '--ink-soft':  '#7a5a30',
    '--ink-faint': '#a88850',
    '--accent':    '#8a3a10',
    '--selection': '#d4be8c',
    '--hairline':  '#b89868',
  },
  dark: {
    label: 'dark',
    desc: 'midnight, warm amber',
    '--bg':        '#15140f',
    '--bg-elev':   '#1d1b14',
    '--ink':       '#e8dfc8',
    '--ink-soft':  '#a59a7e',
    '--ink-faint': '#6a6047',
    '--accent':    '#d9a45c',
    '--selection': '#2d2a1e',
    '--hairline':  '#3a3528',
  },
  // new
  contrast: {
    label: 'contrast',
    desc: 'maximum legibility',
    '--bg':        '#ffffff',
    '--bg-elev':   '#f0f0f0',
    '--ink':       '#000000',
    '--ink-soft':  '#333333',
    '--ink-faint': '#888888',
    '--accent':    '#0000aa',
    '--selection': '#ffe86b',
    '--hairline':  '#000000',
  },
  eink: {
    label: 'e-ink',
    desc: 'paperwhite reader',
    '--bg':        '#e3e1da',
    '--bg-elev':   '#d8d5cc',
    '--ink':       '#222220',
    '--ink-soft':  '#56544c',
    '--ink-faint': '#8a877a',
    '--accent':    '#222220',
    '--selection': '#c8c5b8',
    '--hairline':  '#a8a59a',
  },
  amber: {
    label: 'amber crt',
    desc: 'vintage terminal glow',
    '--bg':        '#1a0e00',
    '--bg-elev':   '#2a1800',
    '--ink':       '#ffb86c',
    '--ink-soft':  '#d48849',
    '--ink-faint': '#7a4820',
    '--accent':    '#ffd98c',
    '--selection': '#3a2400',
    '--hairline':  '#5a3810',
  },
  phosphor: {
    label: 'phosphor',
    desc: 'green tube',
    '--bg':        '#001008',
    '--bg-elev':   '#00180c',
    '--ink':       '#6aff8c',
    '--ink-soft':  '#3ac868',
    '--ink-faint': '#1a7a3c',
    '--accent':    '#a0ffb8',
    '--selection': '#003020',
    '--hairline':  '#1a4a28',
  },
  matrix: {
    label: 'matrix',
    desc: 'cascading code',
    '--bg':        '#000000',
    '--bg-elev':   '#080808',
    '--ink':       '#00ff41',
    '--ink-soft':  '#00aa2a',
    '--ink-faint': '#005510',
    '--accent':    '#80ff80',
    '--selection': '#002a0a',
    '--hairline':  '#003310',
  },
};

// Theme ids in display order
const THEME_IDS = ['paper','mono','sepia','dark','eink','contrast','amber','phosphor','matrix'];

const FONTS = {
  jetbrains: `'JetBrains Mono', ui-monospace, monospace`,
  plex:      `'IBM Plex Mono', ui-monospace, monospace`,
  vt:        `'VT323', ui-monospace, monospace`,
  geist:     `'Geist Mono', ui-monospace, monospace`,
  space:     `'Space Mono', ui-monospace, monospace`,
};

// Apply CSS vars for theme + font
function applyTheme(theme, font, fontSize, density, cover) {
  const root = document.documentElement;
  const t = THEMES[theme] || THEMES.paper;
  Object.entries(t).forEach(([k, v]) => {
    if (k.startsWith('--')) root.style.setProperty(k, v);
  });
  root.style.setProperty('--mono', FONTS[font] || FONTS.jetbrains);
  root.style.setProperty('--fs', `${fontSize}px`);
  root.dataset.theme = theme;
  root.dataset.density = density;
  root.dataset.cover = cover;
}

// TUI status bar — replaces Android default
function TuiStatusBar({ time = '9:30' }) {
  return (
    <div className="tui-status">
      <span>│ {time}</span>
      <span className="tui-status-mid">● ● ●</span>
      <span>▮▮▮▮▯ 82% │</span>
    </div>
  );
}

// Bottom nav — ASCII tab strip
function TuiNav({ tab, setTab, unread = 0 }) {
  const tabs = [
    { id: 'library', label: 'library', key: 'L' },
    { id: 'search',  label: 'search',  key: 'S' },
    { id: 'now',     label: 'now',     key: 'N' },
    { id: 'queue',   label: 'queue',   key: 'Q' },
    { id: 'settings',label: 'config',  key: '·' },
  ];
  return (
    <div className="tui-nav">
      <div className="tui-nav-top">
        {tabs.map((t, i) => (
          <React.Fragment key={t.id}>
            <button
              className={`tui-nav-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="nav-bracket">{tab === t.id ? '[' : ' '}</span>
              <span className="nav-label">{t.label}</span>
              <span className="nav-bracket">{tab === t.id ? ']' : ' '}</span>
            </button>
            {i < tabs.length - 1 && <span className="nav-sep">│</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="tui-nav-hint">
        [tap] select · [L][S][N][Q] jump · [space] play/pause
      </div>
    </div>
  );
}

// Paper-textured screen wrapper
function TuiScreen({ children, scroll = true, pad = true }) {
  return (
    <div className={`tui-screen ${scroll ? 'scroll' : ''} ${pad ? 'pad' : ''}`}>
      {children}
    </div>
  );
}

// Section header — `── Title ─────────────────`
function SectionHead({ label, right, accent }) {
  return (
    <div className="section-head">
      <span className="section-bar">──</span>
      <span className={`section-label ${accent ? 'accent' : ''}`}>{label}</span>
      <span className="section-rule" />
      {right && <span className="section-right">{right}</span>}
    </div>
  );
}

// ASCII progress bar component
function AsciiProgress({ value, max, width = 30, accent }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const n = Math.round(pct * width);
  return (
    <span className="ascii-progress">
      <span className={accent ? 'accent' : ''}>{'█'.repeat(n)}</span>
      <span className="dim">{'░'.repeat(width - n)}</span>
    </span>
  );
}

// Generic list row with keyboard-hint leader
function ListRow({ idx, left, right, active, onClick, sub, glyph }) {
  return (
    <button
      className={`list-row ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="row-idx">{glyph || (active ? '▶' : String(idx).padStart(2, '0'))}</span>
      <span className="row-main">
        <span className="row-left">{left}</span>
        {sub && <span className="row-sub">{sub}</span>}
      </span>
      {right && <span className="row-right">{right}</span>}
    </button>
  );
}

// Breadcrumb path
function Path({ parts }) {
  return (
    <div className="tui-path">
      {parts.map((p, i) => (
        <span key={i}>
          <span className="path-slash">/</span>
          <span className={i === parts.length - 1 ? 'path-current' : 'path-part'}>{p}</span>
        </span>
      ))}
    </div>
  );
}

Object.assign(window, {
  THEMES, THEME_IDS, FONTS, applyTheme,
  TuiStatusBar, TuiNav, TuiScreen, SectionHead, AsciiProgress, ListRow, Path,
});
