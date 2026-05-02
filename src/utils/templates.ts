export const css = `
:root {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --accent-primary: #818cf8;
  --accent-secondary: #c084fc;
  --accent-gradient: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-bg: rgba(30, 41, 59, 0.7);
  --glass-shine: rgba(255, 255, 255, 0.05);
  --danger: #f43f5e;
  --success: #10b981;
  --font-sans: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
* { box-sizing: border-box; margin: 0; padding: 0; outline: none; }
body {
  background-color: var(--bg-primary);
  background-image: 
    radial-gradient(circle at 10% 20%, rgba(129, 140, 248, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 90% 80%, rgba(192, 132, 252, 0.1) 0%, transparent 40%);
  color: var(--text-primary);
  font-family: var(--font-sans);
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
header {
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  z-index: 10;
}
.logo {
  font-weight: 800;
  font-size: 1.5rem;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}
.controls {
  display: flex;
  gap: 0.75rem;
}
button {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
button:hover {
  background: var(--glass-shine);
  border-color: rgba(255,255,255,0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
button.primary {
  background: var(--accent-gradient);
  border: none;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(129, 140, 248, 0.3);
}
button.primary:hover {
  opacity: 0.9;
  box-shadow: 0 6px 16px rgba(129, 140, 248, 0.4);
}
main {
  flex: 1;
  display: flex;
  height: calc(100vh - 70px);
}
.pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}
.pane-header {
  padding: 0.75rem 1.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  font-weight: 600;
  border-bottom: 1px solid var(--glass-border);
  display: flex;
  justify-content: space-between;
}
#editor {
  flex: 1;
  background: transparent;
  color: var(--text-primary);
  border: none;
  padding: 1.5rem;
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  border-right: 1px solid var(--glass-border);
}
#preview {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  font-size: 16px;
  line-height: 1.8;
}
/* Markdown Styles */
#preview h1, #preview h2, #preview h3 { margin-bottom: 1rem; color: var(--text-primary); }
#preview h1 { font-size: 2.25rem; font-weight: 800; letter-spacing: -1px; }
#preview h2 { font-size: 1.75rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 0.5rem; margin-top: 2rem; }
#preview p { margin-bottom: 1.5rem; color: #cbd5e1; }
#preview code { background: rgba(0,0,0,0.3); padding: 0.2rem 0.4rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.9em; color: #e2e8f0; }
#preview pre { background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 12px; overflow-x: auto; margin-bottom: 1.5rem; border: 1px solid var(--glass-border); }
#preview pre code { background: transparent; padding: 0; color: inherit; }
#preview blockquote { border-left: 4px solid var(--accent-primary); padding-left: 1rem; color: var(--text-secondary); font-style: italic; background: rgba(129, 140, 248, 0.05); padding: 1rem; border-radius: 0 8px 8px 0; }
#preview img { max-width: 100%; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
#preview ul, #preview ol { margin-left: 1.5rem; margin-bottom: 1.5rem; color: #cbd5e1; }
#preview a { color: var(--accent-primary); text-decoration: none; border-bottom: 1px dashed var(--accent-primary); transition: all 0.2s; }
#preview a:hover { color: var(--accent-secondary); border-bottom-style: solid; }
#preview table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
#preview th, #preview td { padding: 0.75rem; border: 1px solid var(--glass-border); text-align: left; }
#preview th { background: rgba(255,255,255,0.05); font-weight: 600; }
/* Scrollbars */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
/* Toasts */
#toast-container { position: fixed; bottom: 2rem; right: 2rem; z-index: 100; display: flex; flex-direction: column; gap: 0.5rem; }
.toast { background: var(--bg-secondary); border: 1px solid var(--glass-border); padding: 1rem 1.5rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); color: var(--text-primary); animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; gap: 0.75rem; min-width: 300px; }
.toast.success { border-left: 4px solid var(--success); }
.toast.error { border-left: 4px solid var(--danger); }
@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
/* Drop overlay */
#drop-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(6px);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 90;
}
#drop-overlay.visible {
  display: flex;
}
.drop-overlay-content {
  border: 1px dashed rgba(255,255,255,0.25);
  background: rgba(30, 41, 59, 0.65);
  border-radius: 16px;
  padding: 2rem 2.5rem;
  text-align: center;
  min-width: 320px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.drop-overlay-title {
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}
.drop-overlay-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
}
/* Loading */
.loader { border: 2px solid rgba(255,255,255,0.1); border-left-color: var(--accent-primary); border-radius: 50%; width: 16px; height: 16px; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
/* Mobile */
@media (max-width: 768px) {
  main { flex-direction: column; }
  #editor { border-right: none; border-bottom: 1px solid var(--glass-border); height: 50vh; }
  #preview { height: 50vh; }
  .controls span { display: none; }
}
/* Print styles */
@media print {
  @page { margin: 0.5in; }
  body {
    background: #ffffff !important;
    font-family: 'Inter', -apple-system, sans-serif;
  }
  header, .controls, #editor, #toast-container, .pane-header { display: none !important; }
  main { display: block !important; height: auto !important; overflow: visible !important; }
  .pane { display: block !important; width: 100% !important; }
  #preview {
    display: block !important;
    overflow: visible !important;
    height: auto !important;
    color: #000000 !important;
    background: #ffffff !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
  }
  /* Force black text for all elements */
  #preview, #preview p, #preview span, #preview div, #preview li, #preview td, #preview th {
    color: #000000 !important;
    background: transparent !important;
  }
  #preview h1, #preview h2, #preview h3, #preview h4, #preview h5, #preview h6 {
    color: #000000 !important;
    border-bottom-color: #000000 !important;
  }
  #preview code { background-color: #f3f4f6 !important; color: #1f2937 !important; }
  #preview pre { background-color: #f9fafb !important; white-space: pre-wrap; word-wrap: break-word; }
  #preview pre code { background: transparent !important; }
  #preview blockquote { background-color: #f9fafb !important; border-left-color: #000000 !important; color: #374151 !important; }
  #preview a { color: #000000 !important; text-decoration: underline !important; }
  #preview table, #preview th, #preview td { border-color: #000000 !important; border-collapse: collapse; }
  #preview th { background-color: #f3f4f6 !important; font-weight: 600; }
  #preview img { max-width: 100%; height: auto; }
  #preview ul, #preview ol { padding-left: 2em; }
  #preview li { margin: 0.5em 0; list-style-type: disc !important; }
  page-break-inside: avoid;
}
`;

export const js = `
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};
const showToast = (msg, type = 'info') => {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.innerHTML = '<span>' + msg + '</span>';
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
const isMarkdownFile = (file) => {
  if (!file || !file.name) return false;
  const name = String(file.name).toLowerCase();
  return name.endsWith('.md') || name.endsWith('.markdown');
};
const rejectFile = (message) => {
  showToast(message, 'error');
  alert(message);
};
const importMarkdownFile = async (file) => {
  if (!file) return;
  if (!isMarkdownFile(file)) {
    rejectFile('只支持导入 Markdown 文件（.md / .markdown）');
    return;
  }
  try {
    const content = await file.text();
    const editor = document.getElementById('editor');
    editor.value = content;
    render();
    showToast('已导入：' + file.name, 'success');
  } catch (e) {
    console.error('File import error:', e);
    rejectFile('导入失败：无法读取文件内容');
  }
};
// Markdown Rendering
const render = () => {
  const input = document.getElementById('editor').value;
  const preview = document.getElementById('preview');
  
  try {
    const rawHtml = marked.parse(input);
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    preview.innerHTML = cleanHtml;
    localStorage.setItem('content', input);
    updateStats(input);
  } catch (e) {
    console.error('Render error:', e);
  }
};
const updateStats = (text) => {
  const chars = text.length;
  const words = text.split(/\\s+/).filter(w => w.length > 0).length;
  document.getElementById('stats').textContent = words + ' words · ' + chars + ' chars';
};
// Export Functions
const exportPDF = async () => {
  const element = document.getElementById('preview');
  const btn = document.getElementById('btn-pdf');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<div class="loader"></div> Generating...';

  try {
    // Create print window with clean HTML
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    const htmlContent = element.innerHTML;

    const printHtml = '<!DOCTYPE html>' +
'<html>' +
'<head>' +
'  <title>Markdown Document</title>' +
'  <meta charset="utf-8">' +
'  <link rel="preconnect" href="https://fonts.googleapis.com">' +
'  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
'  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">' +
'  <style>' +
'    * { box-sizing: border-box; margin: 0; padding: 0; }' +
'    body {' +
'      background: #ffffff;' +
'      color: #000000;' +
'      font-family: "Inter", -apple-system, sans-serif;' +
'      line-height: 1.6;' +
'      padding: 40px;' +
'    }' +
'    h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.5em; color: #000000; }' +
'    h1 { font-size: 2em; font-weight: 800; }' +
'    h2 { font-size: 1.5em; border-bottom: 1px solid #000; padding-bottom: 0.5em; margin-top: 1.5em; }' +
'    h3 { font-size: 1.25em; margin-top: 1em; }' +
'    h4, h5, h6 { font-size: 1em; margin-top: 1em; }' +
'    p { margin: 1em 0; }' +
'    ul, ol { margin: 1em 0; padding-left: 2em; }' +
'    li { margin: 0.5em 0; }' +
'    code {' +
'      background: #f3f4f6;' +
'      padding: 0.2em 0.4em;' +
'      border-radius: 4px;' +
'      font-family: "JetBrains Mono", monospace;' +
'      font-size: 0.9em;' +
'      color: #1f2937;' +
'    }' +
'    pre {' +
'      background: #f9fafb;' +
'      padding: 1em;' +
'      border-radius: 8px;' +
'      overflow-x: auto;' +
'      margin: 1em 0;' +
'      border: 1px solid #e5e7eb;' +
'    }' +
'    pre code { background: transparent; padding: 0; }' +
'    blockquote {' +
'      border-left: 4px solid #000;' +
'      padding-left: 1em;' +
'      color: #374151;' +
'      background: #f9fafb;' +
'      padding: 1em;' +
'      margin: 1em 0;' +
'    }' +
'    img { max-width: 100%; height: auto; }' +
'    a { color: #000000; text-decoration: underline; }' +
'    table { width: 100%; border-collapse: collapse; margin: 1em 0; }' +
'    th, td { padding: 0.75em; border: 1px solid #000; text-align: left; }' +
'    th { background: #f3f4f6; font-weight: 600; }' +
'    hr { border: none; border-top: 1px solid #000; margin: 2em 0; }' +
'    strong { font-weight: 600; }' +
'    em { font-style: italic; }' +
'    @media print { @page { margin: 0.5in; } body { padding: 20px; } }' +
'    .print-hint { background: #fff3cd; border: 1px solid #ffc107; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; color: #856404; }' +
'    @media print { .print-hint { display: none !important; } }' +
'  </style>' +
'</head>' +
'<body>' +
'<div class="print-hint"><strong>📄 PDF Instructions:</strong> Select "Save as PDF" as destination, then click Save. Close this window after.</div>' +
htmlContent + '</body>' +
'</html>';

    printWindow.document.write(printHtml);
    printWindow.document.close();

    // Wait for fonts and content
    await printWindow.document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Print - do not auto-close window, let user close after saving
    printWindow.print();

    // Do not auto-close - user needs to manually close after saving PDF
    // setTimeout(() => printWindow.close(), 1000);

    showToast('Select "Save as PDF" in the print dialog', 'success');
  } catch (e) {
    console.error('PDF export error:', e);
    showToast('Export failed: ' + (e.message || 'Unknown error'), 'error');
  } finally {
    btn.innerHTML = originalText;
  }
};
const copyHTML = () => {
  const content = document.getElementById('preview').innerHTML;
  navigator.clipboard.writeText(content);
  showToast('HTML copied to clipboard!', 'success');
};
// Init
document.addEventListener('DOMContentLoaded', () => {
  const editor = document.getElementById('editor');
  const saved = localStorage.getItem('content');
  
  if (saved) {
    editor.value = saved;
    render();
  } else {
    editor.value = "# Welcome to Mercury\\n\\nStart typing to see the magic happen...";
    render();
  }
  editor.addEventListener('input', debounce(render, 300));
  
  document.getElementById('btn-pdf').addEventListener('click', exportPDF);
  document.getElementById('btn-copy').addEventListener('click', copyHTML);
  document.getElementById('btn-clear').addEventListener('click', () => {
    if(confirm('Clear all content?')) {
      editor.value = '';
      render();
      showToast('Cleared', 'info');
    }
  });

  const fileInput = document.getElementById('file-input');
  const importBtn = document.getElementById('btn-import');
  if (importBtn && fileInput) {
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const input = e.target;
      const file = input.files && input.files[0];
      input.value = '';
      await importMarkdownFile(file);
    });
  }

  const dropOverlay = document.getElementById('drop-overlay');
  let dragCounter = 0;
  const showOverlay = () => {
    if (dropOverlay) dropOverlay.classList.add('visible');
  };
  const hideOverlay = () => {
    if (dropOverlay) dropOverlay.classList.remove('visible');
  };

  window.addEventListener('dragenter', (e) => {
    if (!e.dataTransfer || !e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('Files')) return;
    dragCounter++;
    showOverlay();
  });
  window.addEventListener('dragover', (e) => {
    if (!e.dataTransfer) return;
    if (!e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('Files')) return;
    e.preventDefault();
  });
  window.addEventListener('dragleave', (e) => {
    if (!e.dataTransfer || !e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('Files')) return;
    dragCounter = Math.max(0, dragCounter - 1);
    if (dragCounter === 0) hideOverlay();
  });
  window.addEventListener('drop', async (e) => {
    if (!e.dataTransfer) return;
    if (!e.dataTransfer.types || !Array.from(e.dataTransfer.types).includes('Files')) return;
    e.preventDefault();
    dragCounter = 0;
    hideOverlay();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    await importMarkdownFile(file);
  });
});
`;

export function renderPage(title: string, content: string = ''): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.8/purify.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
  <style>${css}</style>
</head>
<body>
  <header>
    <div class="logo">Mercury</div>
    <div class="controls">
      <button id="btn-import">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 20h16M7 16l5-5m0 0l5 5m-5-5v9M12 3v8" /></svg>
        <span>Import</span>
      </button>
      <button id="btn-clear">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        <span>Clear</span>
      </button>
      <button id="btn-copy">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        <span>Copy HTML</span>
      </button>
      <button id="btn-pdf" class="primary">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        <span>Export PDF</span>
      </button>
    </div>
  </header>
  <input id="file-input" type="file" accept=".md,.markdown,text/markdown" style="display:none" />
  <main>
    <div class="pane">
      <div class="pane-header">
        <span>Markdown Input</span>
        <span id="stats"></span>
      </div>
      <textarea id="editor" placeholder="Type some markdown...">${content}</textarea>
    </div>
    <div class="pane">
      <div class="pane-header">
        <span>Live Preview</span>
      </div>
      <div id="preview"></div>
    </div>
  </main>
  <div id="drop-overlay" aria-hidden="true">
    <div class="drop-overlay-content">
      <div class="drop-overlay-title">Drop Markdown to Import</div>
      <div class="drop-overlay-subtitle">只支持 .md / .markdown，导入后会覆盖当前内容</div>
    </div>
  </div>
  <div id="toast-container"></div>
  <script>
    ${js}
  </script>
</body>
</html>`;
}
