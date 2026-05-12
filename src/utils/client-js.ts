// Mercury Editor — Client-side interactive logic
// Three-column studio layout with WYSIWYG markdown editing

const debounce = (fn: Function, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: unknown[]) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), delay); };
};

const toast = (msg: string, type: 'info' | 'error' = 'info') => {
  const container = document.getElementById('toast-container')!;
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(12px)'; setTimeout(() => el.remove(), 250); }, 2800);
};

// ── State ──
const state = {
  wysiwygMode: true,
  previewOpen: true,
  focusMode: false,
  sidebarCollapsed: false,
  currentDoc: { id: 'default', title: 'Untitled', content: '' } as { id: string; title: string; content: string },
};

// ── Render ──
const renderHTML = (markdown: string): string => {
  try {
    const raw = marked.parse(markdown) as string;
    return DOMPurify.sanitize(raw);
  } catch { return ''; }
};

const updateStats = (text: string) => {
  const words = text.split(/\s+/).filter(w => w.length > 0).length;
  const chars = text.length;
  document.getElementById('stats')!.textContent = words + ' words \u00B7 ' + chars + ' chars';
};

const render = () => {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  const md = editor.value;
  const html = renderHTML(md);

  // WYSIWYG overlay
  const renderDiv = document.getElementById('wysiwyg-render')!;
  renderDiv.innerHTML = html;

  // Side preview column
  document.getElementById('preview')!.innerHTML = html;

  // Sync scroll approximately
  const scrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1);
  const preview = document.getElementById('preview')!;
  preview.scrollTop = scrollRatio * (preview.scrollHeight - preview.clientHeight);

  updateStats(md);
  saveDoc();
};

// ── WYSIWYG sync ──
const syncScroll = () => {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  const renderDiv = document.getElementById('wysiwyg-render')!;
  renderDiv.scrollTop = editor.scrollTop;
};

// ── Document management ──
const STORAGE_KEY = 'mercury_docs';
const ACTIVE_KEY = 'mercury_active';

const loadDocs = (): { id: string; title: string; content: string }[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};
const saveDocs = (docs: { id: string; title: string; content: string }[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
};
const saveDoc = () => {
  state.currentDoc.content = (document.getElementById('editor') as HTMLTextAreaElement).value;
  const docs = loadDocs();
  const idx = docs.findIndex(d => d.id === state.currentDoc.id);
  if (idx >= 0) { docs[idx] = { ...state.currentDoc }; } else { docs.push({ ...state.currentDoc }); }
  saveDocs(docs);
  renderDocList();
};

const renderDocList = () => {
  const list = document.getElementById('doc-list')!;
  const docs = loadDocs();
  if (!docs.length) {
    // Seed with default doc
    docs.push({ id: 'default', title: 'Welcome', content: '# Welcome to Mercury\n\nStart writing to see the magic...' });
    saveDocs(docs);
  }
  list.innerHTML = docs.map(d => {
    const active = d.id === state.currentDoc.id ? ' active' : '';
    const preview = d.content.split('\n')[0].replace(/^#+\s*/, '').slice(0, 40) || 'Untitled';
    const words = d.content.split(/\s+/).filter(w => w.length > 0).length;
    return `<div class="doc-item${active}" data-id="${d.id}">
      <div>${escapeHtml(preview)}</div>
      <div class="doc-meta">${words} words</div>
    </div>`;
  }).join('');

  // Click handlers
  list.querySelectorAll('.doc-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = (el as HTMLElement).dataset.id!;
      const docs = loadDocs();
      const doc = docs.find(d => d.id === id);
      if (doc) { loadDocument(doc); }
    });
  });
};

const loadDocument = (doc: { id: string; title: string; content: string }) => {
  state.currentDoc = doc;
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  editor.value = doc.content;
  localStorage.setItem(ACTIVE_KEY, doc.id);
  render();
  renderDocList();
};

const newDocument = () => {
  const id = 'doc_' + Date.now();
  const doc = { id, title: 'Untitled', content: '# Untitled\n\n' };
  state.currentDoc = doc;
  (document.getElementById('editor') as HTMLTextAreaElement).value = doc.content;
  const docs = loadDocs();
  docs.push(doc);
  saveDocs(docs);
  localStorage.setItem(ACTIVE_KEY, id);
  render();
  renderDocList();
  toast('New document created');
};

const escapeHtml = (s: string) => {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
};

// ── Mode toggling ──
const toggleMode = () => {
  state.wysiwygMode = !state.wysiwygMode;
  const editorCol = document.getElementById('editor-col')!;
  const btn = document.getElementById('btn-toggle-mode')!;
  const indicator = document.getElementById('mode-indicator')!;
  const editor = document.getElementById('editor') as HTMLTextAreaElement;

  if (state.wysiwygMode) {
    editorCol.classList.remove('source-mode');
    editorCol.classList.add('wysiwyg-mode');
    btn.textContent = 'WYSIWYG';
    indicator.textContent = 'WYSIWYG';
    // Re-sync rendered view
    const html = renderHTML(editor.value);
    document.getElementById('wysiwyg-render')!.innerHTML = html;
    syncScroll();
  } else {
    editorCol.classList.remove('wysiwyg-mode');
    editorCol.classList.add('source-mode');
    btn.textContent = 'Source';
    indicator.textContent = 'Source';
  }
};

const togglePreview = () => {
  state.previewOpen = !state.previewOpen;
  const col = document.getElementById('preview-col')!;
  if (state.previewOpen) {
    col.classList.remove('hidden');
  } else {
    col.classList.add('hidden');
  }
};

const toggleFocus = () => {
  state.focusMode = !state.focusMode;
  document.body.classList.toggle('focus', state.focusMode);
  const btn = document.getElementById('btn-focus')!;
  btn.textContent = state.focusMode ? 'Exit Focus' : 'Focus';
};

const toggleSidebar = () => {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  document.getElementById('sidebar')!.classList.toggle('collapsed', state.sidebarCollapsed);
  const collapseBtn = document.getElementById('sidebar-collapse')!;
  collapseBtn.innerHTML = state.sidebarCollapsed ? '&#9654;' : '&#9664;';
};

// ── Markdown helpers ──
const wrapSelection = (before: string, after: string) => {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const text = editor.value;
  const selected = text.substring(start, end);
  const replacement = before + selected + after;
  editor.value = text.substring(0, start) + replacement + text.substring(end);
  editor.focus();
  editor.setSelectionRange(start + before.length, start + before.length + selected.length);
  render();
};

const insertHeading = () => {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  const line = editor.value.substring(0, editor.selectionStart).split('\n').pop() || '';
  const hashes = line.startsWith('## ') ? '### ' : line.startsWith('# ') ? '## ' : '# ';
  const start = editor.selectionStart - (line.startsWith('#') ? line.split(' ')[0].length + 1 : 0);
  editor.setSelectionRange(start, editor.selectionStart);
  document.execCommand('insertText', false, hashes);
  render();
};

const insertLink = () => {
  const url = prompt('URL:') || '';
  if (url) wrapSelection('[', '](' + url + ')');
};

const insertList = () => {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  const lineStart = editor.value.lastIndexOf('\n', editor.selectionStart - 1) + 1;
  editor.setSelectionRange(lineStart, lineStart);
  document.execCommand('insertText', false, '- ');
  render();
};

// ── Export ──
const exportPDF = () => {
  const htmlContent = document.getElementById('preview')!.innerHTML;
  const printWindow = window.open('', '_blank', 'width=800,height=600')!;

  const printHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Export</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Merriweather:ital@0;1&family=JetBrains+Mono&display=swap" rel="stylesheet">' +
    '<style>' +
    'body{background:#fff;color:#1a1a1a;font-family:Merriweather,Georgia,serif;line-height:1.75;padding:60px 80px;max-width:800px;margin:0 auto}' +
    'h1{font-size:2em;font-weight:800;margin:1.2em 0 .5em}h2{font-size:1.4em;font-weight:700;margin:1.5em 0 .4em;border-bottom:1px solid #ddd;padding-bottom:.3em}' +
    'h3{font-size:1.15em;font-weight:600;margin:1em 0 .3em}p{margin:.8em 0}' +
    'code{background:#f5f2ed;padding:.15em .4em;border-radius:3px;font-family:"JetBrains Mono",monospace;font-size:.88em}' +
    'pre{background:#f8f5f0;padding:1em;border-radius:6px;overflow-x:auto}pre code{background:none;padding:0}' +
    'blockquote{border-left:3px solid #c8a87c;margin:1em 0;padding:.3em 1em;color:#6b6560;font-style:italic}' +
    'table{width:100%;border-collapse:collapse;margin:1em 0}th,td{border:1px solid #ddd;padding:.6em;text-align:left}th{background:#f5f2ed}' +
    'a{color:#b8973e}img{max-width:100%}' +
    '@media print{@page{margin:.5in}body{padding:20px}}' +
    '.print-hint{background:#fff3cd;border:1px solid #ffc107;padding:1rem;margin-bottom:1rem;border-radius:6px;color:#856404;font-family:Inter,sans-serif}' +
    '@media print{.print-hint{display:none!important}}' +
    '</style></head><body>' +
    '<div class="print-hint"><strong>PDF:</strong> Select "Save as PDF" in the print dialog, then Save.</div>' +
    htmlContent + '</body></html>';

  printWindow.document.write(printHtml);
  printWindow.document.close();
  printWindow.document.fonts.ready.then(() => {
    setTimeout(() => { printWindow.print(); }, 800);
  });
  toast('Select "Save as PDF" in the print dialog');
};

const copyHTML = () => {
  navigator.clipboard.writeText(document.getElementById('preview')!.innerHTML);
  toast('HTML copied to clipboard');
};

// ── File import ──
const importFile = async (file: File) => {
  if (!file.name.match(/\.(md|markdown)$/i)) {
    toast('Only .md / .markdown files supported', 'error');
    return;
  }
  try {
    const content = await file.text();
    const id = 'doc_' + Date.now();
    const doc = { id, title: file.name.replace(/\.(md|markdown)$/i, ''), content };
    state.currentDoc = doc;
    (document.getElementById('editor') as HTMLTextAreaElement).value = content;
    const docs = loadDocs();
    docs.push(doc);
    saveDocs(docs);
    localStorage.setItem(ACTIVE_KEY, id);
    render();
    renderDocList();
    toast('Imported: ' + file.name);
  } catch {
    toast('Failed to read file', 'error');
  }
};

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;

  // Load state
  const docs = loadDocs();
  const activeId = localStorage.getItem(ACTIVE_KEY);
  if (activeId && docs.find(d => d.id === activeId)) {
    const doc = docs.find(d => d.id === activeId)!;
    state.currentDoc = doc;
    editor.value = doc.content;
  } else if (docs.length > 0) {
    state.currentDoc = docs[0];
    editor.value = docs[0].content;
  } else {
    editor.value = '# Welcome to Mercury\n\nStart writing to see the magic...';
  }
  render();
  renderDocList();

  // Start in WYSIWYG mode
  document.getElementById('editor-col')!.classList.add('wysiwyg-mode');

  // Editor input
  editor.addEventListener('input', render);
  editor.addEventListener('scroll', syncScroll);

  // Keyboard shortcuts
  editor.addEventListener('keydown', (e: KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key === '/') { e.preventDefault(); toggleMode(); }
    if (mod && e.key === 'b') { e.preventDefault(); wrapSelection('**', '**'); }
    if (mod && e.key === 'i') { e.preventDefault(); wrapSelection('*', '*'); }
    if (mod && e.shiftKey && e.key === 'F') { e.preventDefault(); toggleFocus(); }
    if (mod && e.key === '\\') { e.preventDefault(); togglePreview(); }
  });

  // Toolbar buttons
  document.querySelectorAll('.editor-toolbar button[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.action!;
      switch (action) {
        case 'bold': wrapSelection('**', '**'); break;
        case 'italic': wrapSelection('*', '*'); break;
        case 'heading': insertHeading(); break;
        case 'code': wrapSelection('`', '`'); break;
        case 'link': insertLink(); break;
        case 'list': insertList(); break;
      }
    });
  });

  // Mode toggle
  document.getElementById('btn-toggle-mode')!.addEventListener('click', toggleMode);
  document.getElementById('btn-toggle-preview')!.addEventListener('click', togglePreview);

  // Header buttons
  document.getElementById('btn-focus')!.addEventListener('click', toggleFocus);
  document.getElementById('btn-pdf')!.addEventListener('click', exportPDF);
  document.getElementById('btn-copy')!.addEventListener('click', copyHTML);
  document.getElementById('btn-import')!.addEventListener('click', () => {
    document.getElementById('file-input')!.click();
  });
  document.getElementById('btn-close-preview')!.addEventListener('click', () => {
    state.previewOpen = false;
    document.getElementById('preview-col')!.classList.add('hidden');
  });

  // Sidebar
  document.getElementById('btn-new-doc')!.addEventListener('click', newDocument);
  document.getElementById('sidebar-collapse')!.addEventListener('click', toggleSidebar);

  // File input
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (file) await importFile(file);
  });

  // Drag & drop on editor
  const editorWrapper = document.getElementById('editor-wrapper')!;
  editorWrapper.addEventListener('dragover', (e: DragEvent) => { e.preventDefault(); });
  editorWrapper.addEventListener('drop', async (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) await importFile(file);
  });

  // Auto-save periodic
  setInterval(saveDoc, 5000);
});
