import { css } from './css';

export { css };

export function getTurnstileScript(siteKey: string): string {
  return '<scr' + 'ipt src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></scr' + 'ipt>';
}

export function getTurnstileWidget(siteKey: string): string {
  return '<div id="turnstile-widget"></div><scr' + 'ipt>window.onloadTurnstile=function(){if(typeof turnstile!=="undefined"){turnstile.render("#turnstile-widget",{sitekey:"' + siteKey + '",callback:function(t){window.__turnstileToken=t}});}};if(document.readyState==="complete")onloadTurnstile();else document.addEventListener("DOMContentLoaded",onloadTurnstile);</scr' + 'ipt>';
}

const clientJS = `!(function(){
var D=function(f,d){var t;return function(){clearTimeout(t);t=setTimeout(function(){f.apply(null,arguments)},d)}};
var T=function(m,t){t=t||'info';var c=$('#toast-container'),e=document.createElement('div');e.className='toast '+t;e.textContent=m;c.appendChild(e);setTimeout(function(){e.style.opacity='0';e.style.transform='translateY(12px)';setTimeout(function(){e.remove()},250)},2800)};
var $=function(s){return document.getElementById(s)};
var S={wm:true,po:true,fm:false,sc:false,cd:{id:'default',title:'',content:''}};
var RH=function(md){try{return DOMPurify.sanitize(marked.parse(md))}catch(e){return''}};
var US=function(t){var w=t.split(/\\\\s+/).filter(function(x){return x.length>0}).length;$('stats').textContent=w+' words \\\\u00b7 '+t.length+' chars'};
var R=function(){var ed=$('editor'),md=ed.value,h=RH(md);$('wysiwyg-render').innerHTML=h;$('preview').innerHTML=h;try{var r=ed.scrollTop/(ed.scrollHeight-ed.clientHeight||1),pv=$('preview');pv.scrollTop=r*(pv.scrollHeight-pv.clientHeight)}catch(e){}US(md);SD()};
var SS=function(){var ed=$('editor');$('wysiwyg-render').scrollTop=ed.scrollTop};
var ST='md_docs',AT='md_active';
var LD=function(){try{return JSON.parse(localStorage.getItem(ST)||'[]')}catch(e){return[]}};
var SD=function(){S.cd.content=$('editor').value;var ds=LD(),i=ds.findIndex(function(d){return d.id===S.cd.id});if(i>=0)ds[i]=S.cd;else ds.push(S.cd);localStorage.setItem(ST,JSON.stringify(ds));RDL()};
var EH=function(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML};
var RDL=function(){var l=$('doc-list'),ds=LD();if(!ds.length){ds.push({id:'default',title:'Welcome',content:'# Welcome to Mercury\\\\n\\\\nStart writing...'});localStorage.setItem(ST,JSON.stringify(ds))};l.innerHTML=ds.map(function(d){var a=d.id===S.cd.id?' active':'',p=(d.content.split('\\\\n')[0]||'').replace(/^#+\\\\s*/,'').slice(0,40)||'Untitled';return'<div class="doc-item'+a+'" data-id="'+d.id+'"><div>'+EH(p)+'</div><div class="doc-meta">'+(d.content.split(/\\\\s+/).filter(function(w){return w.length>0}).length)+' words</div></div>'}).join('');l.querySelectorAll('.doc-item').forEach(function(el){el.addEventListener('click',function(){var id=el.dataset.id,ds=LD(),d=ds.find(function(x){return x.id===id});if(d)LDO(d)})})};
var LDO=function(d){S.cd=d;$('editor').value=d.content;localStorage.setItem(AT,d.id);R();RDL()};
var ND=function(){var id='doc_'+Date.now(),d={id:id,title:'Untitled',content:'# Untitled\\\\n\\\\n'};S.cd=d;$('editor').value=d.content;var ds=LD();ds.push(d);localStorage.setItem(ST,JSON.stringify(ds));localStorage.setItem(AT,id);R();RDL();T('New document created')};
var TM=function(){S.wm=!S.wm;var c=$('editor-col'),b=$('btn-toggle-mode'),ind=$('mode-indicator'),ed=$('editor');if(S.wm){c.classList.remove('source-mode');c.classList.add('wysiwyg-mode');b.textContent='WYSIWYG';ind.textContent='WYSIWYG';$('wysiwyg-render').innerHTML=RH(ed.value);SS()}else{c.classList.remove('wysiwyg-mode');c.classList.add('source-mode');b.textContent='Source';ind.textContent='Source'}};
var TP=function(){S.po=!S.po;$('preview-col').classList.toggle('hidden',!S.po)};
var TF=function(){S.fm=!S.fm;document.body.classList.toggle('focus',S.fm);$('btn-focus').textContent=S.fm?'Exit Focus':'Focus'};
var TS=function(){S.sc=!S.sc;$('sidebar').classList.toggle('collapsed',S.sc);$('sidebar-collapse').innerHTML=S.sc?'\\\\u25b6':'\\\\u25c0'};
var WS=function(b,a){var ed=$('editor'),s=ed.selectionStart,e=ed.selectionEnd,t=ed.value,sel=t.substring(s,e),rep=b+sel+a;ed.value=t.substring(0,s)+rep+t.substring(e);ed.focus();ed.setSelectionRange(s+b.length,s+b.length+sel.length);R()};
var IH=function(){var ed=$('editor'),ln=ed.value.substring(0,ed.selectionStart).split('\\\\n').pop()||'',h=ln.startsWith('## ')?'### ':ln.startsWith('# ')?'## ':'# ',s=ed.selectionStart-(ln.startsWith('#')?ln.split(' ')[0].length+1:0);ed.setSelectionRange(s,ed.selectionStart);document.execCommand('insertText',false,h);R()};
var EP=function(){var hc=$('preview').innerHTML,pw=window.open('','_blank','width=800,height=600');var html='<!DOCTYPE html><html><head><meta charset="utf-8"><title>Export</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Merriweather:ital@0;1&family=JetBrains+Mono&display=swap" rel="stylesheet"><style>body{background:#fff;color:#1a1a1a;font-family:Merriweather,Georgia,serif;line-height:1.75;padding:60px 80px;max-width:800px;margin:0 auto}h1{font-size:2em;font-weight:800;margin:1.2em 0 .5em}h2{font-size:1.4em;font-weight:700;margin:1.5em 0 .4em;border-bottom:1px solid #ddd;padding-bottom:.3em}p{margin:.8em 0}code{background:#f5f2ed;padding:.15em .4em;border-radius:3px;font-size:.88em}pre{background:#f8f5f0;padding:1em;border-radius:6px}blockquote{border-left:3px solid #c8a87c;margin:1em 0;padding:.3em 1em;color:#6b6560;font-style:italic}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:.6em;text-align:left}th{background:#f5f2ed}a{color:#b8973e}img{max-width:100%}@media print{@page{margin:.5in}body{padding:20px}}.print-hint{background:#fff3cd;border:1px solid #ffc107;padding:1rem;margin-bottom:1rem;border-radius:6px;color:#856404;font-family:Inter,sans-serif}@media print{.print-hint{display:none!important}}</style></head><body><div class="print-hint"><strong>PDF:</strong> Select Save as PDF in the print dialog, then Save.</div>'+hc+'</body></html>';pw.document.write(html);pw.document.close();pw.document.fonts.ready.then(function(){setTimeout(function(){pw.print()},800)});T('Select Save as PDF')};
var CH=function(){navigator.clipboard.writeText($('preview').innerHTML);T('HTML copied to clipboard')};
var IF=async function(f){if(!f.name.match(/\\\\.(md|markdown)$/i)){T('Only .md / .markdown supported','error');return}try{var c=await f.text(),id='doc_'+Date.now(),d={id:id,title:f.name.replace(/\\\\.(md|markdown)$/i,''),content:c};S.cd=d;$('editor').value=c;var ds=LD();ds.push(d);localStorage.setItem(ST,JSON.stringify(ds));localStorage.setItem(AT,id);R();RDL();T('Imported: '+f.name)}catch(e){T('Failed to read file','error')}};
document.addEventListener('DOMContentLoaded',function(){var ed=$('editor'),ds=LD(),aid=localStorage.getItem(AT);if(aid){var d=ds.find(function(x){return x.id===aid});if(d){S.cd=d;ed.value=d.content}}else if(ds.length>0){S.cd=ds[0];ed.value=ds[0].content}else{ed.value='# Welcome to Mercury\\\\n\\\\nStart writing...'}R();RDL();$('editor-col').classList.add('wysiwyg-mode');ed.addEventListener('input',function(){R()});ed.addEventListener('scroll',SS);ed.addEventListener('keydown',function(e){var m=e.metaKey||e.ctrlKey;if(m&&e.key==='/'){e.preventDefault();TM()}if(m&&e.key==='b'){e.preventDefault();WS('**','**')}if(m&&e.key==='i'){e.preventDefault();WS('*','*')}if(m&&e.shiftKey&&e.key==='F'){e.preventDefault();TF()}});document.querySelectorAll('.editor-toolbar button[data-action]').forEach(function(b){b.addEventListener('click',function(){var a=this.dataset.action;if(a==='bold')WS('**','**');if(a==='italic')WS('*','*');if(a==='heading')IH();if(a==='link'){var u=prompt('URL:')||'';if(u)WS('[',']('+u+')')}if(a==='list'){var ed=$('editor'),ls=ed.value.lastIndexOf('\\\\n',ed.selectionStart-1)+1;ed.setSelectionRange(ls,ls);document.execCommand('insertText',false,'- ');R()}})});$('btn-toggle-mode').addEventListener('click',TM);$('btn-toggle-preview').addEventListener('click',TP);$('btn-focus').addEventListener('click',TF);$('btn-pdf').addEventListener('click',EP);$('btn-copy').addEventListener('click',CH);$('btn-import').addEventListener('click',function(){$('file-input').click()});$('btn-close-preview').addEventListener('click',function(){S.po=false;$('preview-col').classList.add('hidden')});$('btn-new-doc').addEventListener('click',ND);$('sidebar-collapse').addEventListener('click',TS);var fi=$('file-input');fi.addEventListener('change',async function(){var f=fi.files[0];fi.value='';if(f)await IF(f)});var ew=$('editor-wrapper');ew.addEventListener('dragover',function(e){e.preventDefault()});ew.addEventListener('drop',async function(e){e.preventDefault();var f=e.dataTransfer.files[0];if(f)await IF(f)});setInterval(SD,5000)});
})();`;

export function renderPage(title: string, content: string = '', siteKey?: string): string {
  const ts = siteKey ? getTurnstileWidget(siteKey) : '';
  const tsScript = siteKey ? '<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>' : '';
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  ${tsScript}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.8/purify.min.js"></script>
  <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
  <style>${css}</style>
</head>
<body>

<header id="header">
  <div id="logo"><span>&#9670;</span> Mercury</div>
  <div class="header-actions">
    <button class="header-btn" id="btn-focus" title="Focus Mode (Cmd+Shift+F)">Focus</button>
    <button class="header-btn" id="btn-import">Import</button>
    <button class="header-btn" id="btn-copy">Copy HTML</button>
    <button class="header-btn primary" id="btn-pdf">Export PDF</button>
  </div>
</header>

<div id="app">

  <aside id="sidebar">
    <div class="sidebar-header">
      <span class="sidebar-title">Documents</span>
      <button class="sidebar-new" id="btn-new-doc" title="New Document">+</button>
    </div>
    <div id="doc-list"></div>
  </aside>

  <button id="sidebar-collapse" title="Toggle Sidebar">◀</button>

  <section id="editor-col">
    <div class="editor-toolbar">
      <button title="Bold (Ctrl+B)" data-action="bold">B</button>
      <button title="Italic (Ctrl+I)" data-action="italic"><em>I</em></button>
      <button title="Heading" data-action="heading">H</button>
      <button title="Code" data-action="code">&lt;/&gt;</button>
      <button title="Link" data-action="link">&#x1F517;</button>
      <button title="List" data-action="list">&#x2630;</button>
      <span class="tb-divider"></span>
      <button title="Toggle Preview (Ctrl+P)" id="btn-toggle-preview">&#x25A3;</button>
      <button class="tb-mode" id="btn-toggle-mode" title="Toggle Source/WYSIWYG (Ctrl+/)">WYSIWYG</button>
    </div>
    <div id="editor-wrapper">
      <div id="editor-paper">
        <div id="wysiwyg-render"></div>
        <textarea id="editor" placeholder="Start writing..." spellcheck="false">${content}</textarea>
      </div>
    </div>
    <div id="editor-footer">
      <span id="stats">0 words · 0 chars</span>
      <span id="mode-indicator">WYSIWYG</span>
    </div>
  </section>

  <section id="preview-col">
    <div class="preview-header">
      <span>Preview</span>
      <button class="preview-close" id="btn-close-preview" title="Close Preview">&times;</button>
    </div>
    <div id="preview"></div>
  </section>

</div>

<input id="file-input" type="file" accept=".md,.markdown,text/markdown" style="display:none" />
<div id="toast-container"></div>
${ts}

<script>${clientJS}</script>
</body>
</html>`;
}
