export const css = `
:root {
  --bg: #ede8de;
  --bg-sidebar: #e4dfd4;
  --bg-header: #f5f1e8;
  --bg-paper: #fffef9;
  --bg-preview: #faf7f0;
  --ink: #2d2a26;
  --ink-muted: #78736d;
  --gold: #b8973e;
  --gold-light: rgba(184,151,62,0.08);
  --gold-hover: rgba(184,151,62,0.18);
  --border: rgba(0,0,0,0.07);
  --border-light: rgba(0,0,0,0.04);
  --shadow: 0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06);
  --font-mono: 'JetBrains Mono', 'SF Mono', monospace;
  --font-serif: 'Merriweather', 'Georgia', 'Noto Serif SC', serif;
  --font-sans: 'Inter', -apple-system, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
#header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 46px;
  padding: 0 20px;
  background: var(--bg-header);
  border-bottom: 1px solid var(--border);
  z-index: 20;
  flex-shrink: 0;
}
#logo {
  font-weight: 700;
  font-size: 14px;
  color: var(--ink);
  letter-spacing: -0.3px;
}
#logo span { color: var(--gold); }
.header-actions { display: flex; gap: 6px; align-items: center; }
.header-btn {
  background: none;
  border: 1px solid var(--border);
  color: var(--ink-muted);
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: 0.15s ease;
  font-family: var(--font-sans);
  display: flex;
  align-items: center;
  gap: 4px;
}
.header-btn:hover { background: var(--border-light); color: var(--ink); }
.header-btn.primary {
  background: var(--gold);
  color: #fff;
  border: none;
  font-weight: 600;
  padding: 5px 14px;
}
.header-btn.primary:hover { opacity: 0.88; }

/* ── Layout ── */
#app { flex: 1; display: flex; overflow: hidden; }

/* ── Sidebar ── */
#sidebar {
  width: 200px;
  min-width: 200px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-header { padding: 16px 14px 8px; display: flex; justify-content: space-between; align-items: center; }
.sidebar-title { font-size: 11px; letter-spacing: 0.06em; color: var(--ink-muted); font-weight: 600; text-transform: uppercase; }
.sidebar-new {
  background: none; border: 1px solid var(--border); color: var(--ink-muted);
  width: 24px; height: 24px; border-radius: 5px; cursor: pointer;
  font-size: 15px; line-height: 1; transition: 0.15s ease;
  display: flex; align-items: center; justify-content: center;
}
.sidebar-new:hover { background: var(--gold-light); color: var(--gold); border-color: var(--gold); }
#doc-list { flex: 1; overflow-y: auto; padding: 4px 8px; }
.doc-item {
  padding: 8px 10px; border-radius: 6px; cursor: pointer; font-size: 13px;
  color: var(--ink-muted); transition: 0.1s ease;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 1px;
}
.doc-item:hover { background: rgba(0,0,0,0.03); color: var(--ink); }
.doc-item.active { background: var(--gold-light); color: var(--gold); font-weight: 500; }
.doc-meta { font-size: 10px; color: #bbb; margin-top: 1px; }

/* ── Editor Column ── */
#editor-col { flex: 1; display: flex; flex-direction: column; background: var(--bg); position: relative; min-width: 0; }
.editor-toolbar {
  display: flex; align-items: center; gap: 1px; padding: 6px 14px;
  background: var(--bg-header); border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.editor-toolbar button {
  background: none; border: none; color: var(--ink-muted); width: 32px; height: 30px;
  border-radius: 5px; cursor: pointer; font-size: 13px; transition: 0.1s ease;
  display: flex; align-items: center; justify-content: center; font-family: var(--font-sans);
}
.editor-toolbar button:hover { background: var(--border-light); color: var(--ink); }
.editor-toolbar .tb-divider { width: 1px; height: 16px; background: var(--border); margin: 0 6px; }
.editor-toolbar .tb-mode { margin-left: auto; font-size: 11px; font-weight: 600; padding: 0 10px; width: auto; }

#editor-wrapper { flex: 1; display: flex; align-items: stretch; justify-content: center; overflow-y: auto; padding: 32px; }
#editor-paper {
  width: 100%; max-width: 740px;
  background: var(--bg-paper);
  border-radius: 4px;
  box-shadow: var(--shadow);
  position: relative;
}
#editor {
  display: block; width: 100%; min-height: 100%;
  background: transparent; border: none; outline: none;
  font-family: var(--font-mono); font-size: 15px; line-height: 1.8;
  color: var(--ink); caret-color: var(--gold);
  padding: 48px 60px; resize: none; overflow: hidden;
}
#editor::placeholder { color: #c5c0b5; }
#editor::selection { background: rgba(184,151,62,0.2); }
#editor-footer {
  padding: 6px 16px; font-size: 11px; color: var(--ink-muted);
  border-top: 1px solid var(--border); display: flex;
  justify-content: space-between; align-items: center;
  background: var(--bg-paper); flex-shrink: 0;
}

/* Remove old WYSIWYG overlay styles */
#wysiwyg-render { display: none; }
.source-mode .editor-toolbar .tb-mode,
.wysiwyg-mode .editor-toolbar .tb-mode { font-weight: 600; }

/* ── Preview Column ── */
#preview-col {
  width: 420px; min-width: 320px; background: var(--bg-preview);
  border-left: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0;
}
#preview-col.hidden { display: none; }
.preview-header {
  padding: 10px 16px; border-bottom: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
  font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--ink-muted); font-weight: 600; background: #fff;
  flex-shrink: 0;
}
.preview-close { background: none; border: none; cursor: pointer; color: #ccc; font-size: 18px; line-height: 1; }
.preview-close:hover { color: var(--ink-muted); }
#preview {
  flex: 1; overflow-y: auto; padding: 48px 36px;
  font-family: var(--font-serif); font-size: 15px; line-height: 1.8; color: #3a3732;
}
#preview h1 { font-size: 1.8em; font-weight: 800; margin: 1.2em 0 0.4em; letter-spacing: -0.3px; }
#preview h2 { font-size: 1.35em; font-weight: 700; margin: 1.3em 0 0.3em; padding-bottom: 0.25em; border-bottom: 1px solid var(--border); }
#preview h3 { font-size: 1.1em; font-weight: 600; margin: 1em 0 0.2em; }
#preview p { margin: 0.8em 0; }
#preview ul, #preview ol { margin: 0.5em 0; padding-left: 1.8em; }
#preview li { margin: 0.25em 0; }
#preview code { background: rgba(0,0,0,0.04); padding: 0.12em 0.35em; border-radius: 3px; font-family: var(--font-mono); font-size: 0.88em; }
#preview pre { background: rgba(0,0,0,0.02); padding: 1.2em; border-radius: 6px; overflow-x: auto; margin: 1em 0; border: 1px solid var(--border); }
#preview pre code { background: none; padding: 0; }
#preview blockquote { border-left: 3px solid var(--gold); margin: 0.8em 0; padding: 0.2em 1em; color: var(--ink-muted); font-style: italic; background: var(--gold-light); }
#preview img { max-width: 100%; border-radius: 4px; }
#preview table { width: 100%; border-collapse: collapse; margin: 0.8em 0; font-size: 0.9em; }
#preview th, #preview td { border: 1px solid var(--border); padding: 0.5em 0.7em; text-align: left; }
#preview th { background: rgba(0,0,0,0.02); font-weight: 600; }
#preview a { color: var(--gold); text-decoration: none; }
#preview a:hover { text-decoration: underline; }
#preview hr { border: none; border-top: 1px solid var(--border); margin: 1.5em 0; }

/* ── Toast ── */
#toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 100; display: flex; flex-direction: column; gap: 6px; }
.toast {
  background: #3a3732; color: #ede8de; padding: 8px 16px;
  border-radius: 8px; font-size: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.15);
  animation: toastIn 0.2s ease; display: flex; align-items: center; gap: 6px;
  border-left: 3px solid var(--gold);
}
.toast.error { border-left-color: #d9606a; }
@keyframes toastIn { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* ── Focus Mode ── */
body.focus #sidebar, body.focus #preview-col { display: none; }
body.focus #editor-paper { box-shadow: none; border-radius: 0; }
body.focus #editor-wrapper { padding: 0; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }

/* ── Print ── */
@media print {
  * { background: #fff !important; }
  #header, #sidebar, #preview-col, .editor-toolbar, #editor-footer, #toast-container { display: none !important; }
  #editor-col { background: #fff !important; }
  #editor-wrapper { padding: 0 !important; overflow: visible !important; }
  #editor-paper { box-shadow: none !important; max-width: none !important; }
  body { height: auto !important; overflow: visible !important; }
}
`;
