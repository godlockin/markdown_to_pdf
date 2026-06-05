export const css = `
:root {
  /* ── Dark Mode (OLED) — Developer Tool palette ── */
  --bg-base:        #0F172A;   /* slate-900 — sidebar */
  --bg-elevated:    #1B2336;   /* editor surface */
  --bg-card:        #1E293B;   /* preview surface */
  --bg-header:      #0B1220;   /* app header */
  --bg-input:       #0B1220;
  --bg-hover:       rgba(255,255,255,0.04);
  --bg-active:      rgba(34,197,94,0.10);

  --fg:             #F8FAFC;   /* foreground */
  --fg-muted:       #94A3B8;   /* slate-400 */
  --fg-subtle:      #64748B;   /* slate-500 */
  --fg-on-accent:   #0F172A;

  --border:         rgba(255,255,255,0.08);
  --border-strong:  rgba(255,255,255,0.14);

  --accent:         #22C55E;   /* run-green */
  --accent-hover:   #16A34A;
  --accent-glow:    rgba(34,197,94,0.18);
  --accent-fg:      #0F172A;

  --primary:        #6366F1;   /* indigo for actions */
  --primary-hover:  #4F46E5;
  --destructive:    #EF4444;

  --shadow-sm:      0 1px 2px rgba(0,0,0,0.3);
  --shadow:         0 2px 8px rgba(0,0,0,0.4);
  --shadow-lg:      0 8px 24px rgba(0,0,0,0.5);

  --font-mono:      'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-sans:      'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
  --font-serif:     'IBM Plex Serif', 'Georgia', 'Merriweather', serif;

  --radius-sm:      4px;
  --radius:         6px;
  --radius-lg:      10px;

  --easing:         cubic-bezier(0.16, 1, 0.3, 1);
  --t-fast:         120ms;
  --t:              180ms;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

html, body { height: 100%; }

body {
  background: var(--bg-base);
  color: var(--fg);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection { background: var(--accent-glow); color: var(--fg); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }

/* ── Header ── */
#header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  padding: 0 16px;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border);
  z-index: 20;
  flex-shrink: 0;
}
#logo {
  font-weight: 600;
  font-size: 13px;
  color: var(--fg);
  letter-spacing: -0.2px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-sans);
}
#logo .logo-mark {
  width: 22px; height: 22px;
  background: var(--accent);
  border-radius: 5px;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--accent-fg);
  font-weight: 800; font-size: 13px;
  box-shadow: 0 0 0 4px var(--accent-glow);
}
.header-actions { display: flex; gap: 6px; align-items: center; }
.header-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg-muted);
  padding: 6px 12px;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all var(--t) var(--easing);
  font-family: var(--font-sans);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  line-height: 1;
}
.header-btn:hover {
  background: var(--bg-hover);
  color: var(--fg);
  border-color: var(--border-strong);
}
.header-btn:active { transform: translateY(0.5px); }
.header-btn.primary {
  background: var(--accent);
  color: var(--accent-fg);
  border-color: var(--accent);
  font-weight: 600;
}
.header-btn.primary:hover {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  box-shadow: 0 0 0 3px var(--accent-glow);
}

/* ── App shell — 3-column equal width ── */
#app {
  flex: 1;
  display: grid;
  grid-template-columns: 240px 1fr 1fr;
  overflow: hidden;
  min-height: 0;
}

/* ── Sidebar ── */
#sidebar {
  background: var(--bg-base);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.sidebar-header {
  padding: 14px 12px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sidebar-title {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--fg-subtle);
  font-weight: 600;
  text-transform: uppercase;
  font-family: var(--font-sans);
}
.sidebar-new {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--fg-muted);
  width: 22px; height: 22px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px; line-height: 1;
  transition: all var(--t) var(--easing);
  display: flex; align-items: center; justify-content: center;
  padding: 0;
}
.sidebar-new:hover {
  background: var(--accent-glow);
  color: var(--accent);
  border-color: var(--accent);
}
#doc-list { flex: 1; overflow-y: auto; padding: 4px 8px 12px; }
.doc-item {
  padding: 7px 10px;
  border-radius: var(--radius);
  cursor: pointer;
  font-size: 13px;
  color: var(--fg-muted);
  transition: all var(--t-fast) var(--easing);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 1px;
  font-family: var(--font-sans);
}
.doc-item:hover {
  background: var(--bg-hover);
  color: var(--fg);
}
.doc-item.active {
  background: var(--bg-active);
  color: var(--accent);
  font-weight: 500;
}
.doc-meta {
  font-size: 10px;
  color: var(--fg-subtle);
  margin-top: 2px;
  font-weight: 400;
  font-family: var(--font-mono);
}

/* ── Editor column ── */
#editor-col {
  background: var(--bg-elevated);
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  position: relative;
  border-right: 1px solid var(--border);
}
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  height: 36px;
}
.editor-toolbar button {
  background: transparent;
  border: none;
  color: var(--fg-muted);
  width: 28px; height: 24px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all var(--t-fast) var(--easing);
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--font-sans);
  font-weight: 500;
  padding: 0;
}
.editor-toolbar button:hover {
  background: var(--bg-hover);
  color: var(--fg);
}
.editor-toolbar .tb-divider {
  width: 1px;
  height: 16px;
  background: var(--border);
  margin: 0 6px;
}
.editor-toolbar .tb-mode {
  margin-left: auto;
  font-size: 10px;
  font-weight: 600;
  padding: 0 10px;
  width: auto;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--fg-muted);
}
.editor-toolbar .tb-mode:hover { color: var(--accent); }

/* Editor scroll wrapper — textarea scrolls natively when content overflows */
#editor-wrapper {
  flex: 1;
  display: block;
  overflow: hidden;
  padding: 0;
  min-height: 0;
  background: var(--bg-elevated);
}
#editor-paper {
  width: 100%;
  max-width: 760px;
  height: 100%;
  margin: 0 auto;
  background: var(--bg-elevated);
  position: relative;
  display: block;
}
#editor {
  display: block;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.7;
  color: var(--fg);
  caret-color: var(--accent);
  padding: 24px 32px 80px;
  resize: none;
  overflow-y: auto;
  overflow-x: hidden;
  tab-size: 2;
  -moz-tab-size: 2;
  font-variant-ligatures: common-ligatures;
  box-sizing: border-box;
}
#editor::placeholder { color: var(--fg-subtle); }
#editor-footer {
  padding: 6px 14px;
  font-size: 11px;
  color: var(--fg-subtle);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-header);
  flex-shrink: 0;
  height: 28px;
  font-family: var(--font-mono);
}
#editor-footer #mode-indicator { color: var(--fg-muted); }

/* WYSIWYG overlay disabled — source mode only */
#wysiwyg-render { display: none; }

/* ── Preview column — equal width to editor ── */
#preview-col {
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}
#preview-col.hidden { display: none; }
.preview-header {
  padding: 0 14px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fg-subtle);
  font-weight: 600;
  background: var(--bg-header);
  flex-shrink: 0;
  height: 36px;
  font-family: var(--font-sans);
}
.preview-close {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--fg-subtle);
  font-size: 16px;
  line-height: 1;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all var(--t-fast) var(--easing);
}
.preview-close:hover {
  background: var(--bg-hover);
  color: var(--fg);
}
#preview {
  flex: 1;
  overflow-y: auto;
  padding: 28px 32px 80px;
  font-family: var(--font-serif);
  font-size: 15px;
  line-height: 1.75;
  color: var(--fg);
  min-height: 0;
}
#preview h1 {
  font-size: 1.75em;
  font-weight: 700;
  margin: 1.0em 0 0.4em;
  letter-spacing: -0.4px;
  color: var(--fg);
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.3em;
}
#preview h2 {
  font-size: 1.35em;
  font-weight: 700;
  margin: 1.3em 0 0.3em;
  padding-bottom: 0.25em;
  border-bottom: 1px solid var(--border);
  color: var(--fg);
}
#preview h3 {
  font-size: 1.1em;
  font-weight: 600;
  margin: 1.0em 0 0.2em;
  color: var(--fg);
}
#preview p { margin: 0.7em 0; color: var(--fg); }
#preview ul, #preview ol { margin: 0.5em 0; padding-left: 1.6em; }
#preview li { margin: 0.2em 0; }
#preview code {
  background: var(--bg-input);
  padding: 0.1em 0.4em;
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 0.86em;
  color: var(--accent);
  border: 1px solid var(--border);
}
#preview pre {
  background: var(--bg-input);
  padding: 1em 1.2em;
  border-radius: var(--radius);
  overflow-x: auto;
  margin: 1em 0;
  border: 1px solid var(--border);
}
#preview pre code {
  background: none;
  padding: 0;
  color: var(--fg);
  border: none;
}
#preview blockquote {
  border-left: 3px solid var(--accent);
  margin: 0.8em 0;
  padding: 0.2em 1em;
  color: var(--fg-muted);
  font-style: italic;
  background: var(--bg-active);
  border-radius: 0 var(--radius) var(--radius) 0;
}
#preview img { max-width: 100%; border-radius: var(--radius); border: 1px solid var(--border); }
#preview table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.8em 0;
  font-size: 0.9em;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
#preview th, #preview td {
  border: 1px solid var(--border);
  padding: 0.5em 0.7em;
  text-align: left;
}
#preview th {
  background: var(--bg-input);
  font-weight: 600;
  color: var(--fg);
}
#preview a {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px dotted var(--accent);
}
#preview a:hover {
  border-bottom-style: solid;
  text-decoration: none;
}
#preview hr {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1.5em 0;
}

/* ── Toast ── */
#toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.toast {
  background: var(--bg-card);
  color: var(--fg);
  padding: 9px 14px;
  border-radius: var(--radius);
  font-size: 12px;
  font-weight: 500;
  box-shadow: var(--shadow-lg);
  animation: toastIn 0.2s var(--easing);
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border-strong);
  border-left: 3px solid var(--accent);
  font-family: var(--font-sans);
}
.toast.error { border-left-color: var(--destructive); }
@keyframes toastIn {
  from { transform: translateY(8px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

/* ── Focus Mode ── */
body.focus #sidebar, body.focus #preview-col { display: none; }
body.focus #app { grid-template-columns: 1fr; }

/* ── Scrollbar (subtle, dev-tool style) ── */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.08);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
}
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.16); background-clip: padding-box; border: 2px solid transparent; }

/* ── Print ── */
@media print {
  * { background: #fff !important; color: #000 !important; }
  #header, #sidebar, #preview-col, .editor-toolbar, #editor-footer, #toast-container { display: none !important; }
  #app { display: block !important; }
  #editor-col { background: #fff !important; }
  #editor-wrapper { padding: 0 !important; overflow: visible !important; }
  body { height: auto !important; overflow: visible !important; }
}

/* ── Responsive: collapse preview on small screens ── */
@media (max-width: 1100px) {
  #app { grid-template-columns: 220px 1fr; }
  #preview-col { display: none; }
  #preview-col.visible { display: flex; position: fixed; inset: 48px 0 0 220px; z-index: 30; background: var(--bg-card); }
}
@media (max-width: 720px) {
  #app { grid-template-columns: 1fr; }
  #sidebar { display: none; }
  #preview-col.visible { left: 0; }
}
`;
