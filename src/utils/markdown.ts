export function sanitizeMarkdown(markdown: string): string {
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, 'data-blocked:')
    .replace(/<[^>]+>/g, (match) => {
      const allowedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'strong', 'em', 'u', 's', 'del', 'ins', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'];
      const tagName = match.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/)?.[1]?.toLowerCase();
      if (allowedTags.includes(tagName || '')) {
        if (tagName === 'a') {
          return match.replace(/href\s*=\s*["']?([^"'\s>]+)["']?/i, (m, href) => {
            if (href.startsWith('javascript:') || href.startsWith('data:')) {
              return 'href="#"';
            }
            return m;
          });
        }
        if (tagName === 'img') {
          return match.replace(/src\s*=\s*["']?([^"'\s>]+)["']?/i, (m, src) => {
            if (src.startsWith('javascript:') || src.startsWith('data:')) {
              return 'src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E"';
            }
            return m;
          });
        }
        return match;
      }
      return '';
    });
}

export function safeRender(markdown: string): string {
  if (typeof marked === 'undefined' || typeof marked.parse !== 'function') {
    return '<div class="error-container"><h1>加载失败</h1><p>marked.js 未正确加载，请刷新页面重试</p></div>';
  }
  if (typeof DOMPurify === 'undefined' || typeof DOMPurify.sanitize !== 'function') {
    return '<div class="error-container"><h1>加载失败</h1><p>DOMPurify 未正确加载，请刷新页面重试</p></div>';
  }
  
  try {
    const result = marked.parse(markdown);
    if (result instanceof Promise) {
      return '<div class="error-container"><h1>渲染错误</h1><p>异步渲染不支持</p></div>';
    }
    return DOMPurify.sanitize(result, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'strong', 'em', 'u', 's', 'del', 'ins', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']
    });
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return '<div class="error-container"><h1>渲染错误</h1><p>内容渲染失败，请检查输入格式</p></div>';
  }
}

export function renderMarkdown(markdown: string): string {
  return safeRender(markdown);
}

export const themeConfig = {
  light: {
    '--color-primary': '#5a67d8',
    '--color-primary-dark': '#4c51bf',
    '--color-primary-light': '#7c85e0',
    '--color-bg': '#f7fafc',
    '--color-surface': '#ffffff',
    '--color-text': '#2d3748',
    '--color-text-muted': '#718096',
    '--color-border': '#e2e8f0',
    '--gradient-bg': 'linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)'
  },
  dark: {
    '--color-primary': '#7c85e0',
    '--color-bg': '#1a202c',
    '--color-surface': '#2d3748',
    '--color-text': '#f7fafc',
    '--color-text-muted': '#a0aec0',
    '--color-border': '#4a5568',
    '--gradient-bg': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
  }
};

export type Theme = 'light' | 'dark' | 'system';

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark');
  const config = isDark ? themeConfig.dark : themeConfig.light;
  
  Object.entries(config).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  
  localStorage.setItem('theme_preference', theme);
}

export function loadTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'system';
  const saved = localStorage.getItem('theme_preference') as Theme;
  return ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
}

export interface ExportOptions {
  format: 'pdf' | 'html' | 'markdown' | 'json';
  filename?: string;
  options?: {
    includeStyles?: boolean;
    includeMeta?: boolean;
  };
}

export interface ExportResult {
  blob: Blob;
  filename: string;
}

export class ExportManager {
  private static instance: ExportManager;
  
  static getInstance(): ExportManager {
    if (!ExportManager.instance) {
      ExportManager.instance = new ExportManager();
    }
    return ExportManager.instance;
  }
  
  private createStyledHTML(content: string, title: string): string {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, sans-serif; line-height: 1.8; color: #2d3748; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 2em; margin: 1em 0 0.5em; }
        h2 { font-size: 1.5em; margin: 1em 0 0.5em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
        p { margin: 1em 0; }
        code { background: #edf2f7; padding: 2px 6px; border-radius: 4px; }
        pre { background: #2d3748; color: #f7fafc; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 1em 0; }
        pre code { background: none; padding: 0; color: inherit; }
        ul, ol { margin-left: 1.5em; margin-bottom: 1em; }
        blockquote { border-left: 4px solid #5a67d8; padding-left: 1em; margin: 1em 0; color: #718096; }
        table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
        th { background: #f7fafc; }
        img { max-width: 100%; height: auto; }
        a { color: #5a67d8; text-decoration: none; }
        hr { border: none; border-top: 2px solid #e2e8f0; margin: 2em 0; }
    </style>
</head>
<body>
${content}
</body>
</html>`;
  }
  
  async exportPDF(content: string, title: string = 'document'): Promise<ExportResult> {
    return new Promise((resolve, reject) => {
      if (typeof html2pdf === 'undefined') {
        reject(new Error('html2pdf.js 未加载'));
        return;
      }
      
      const element = document.createElement('div');
      element.innerHTML = this.createStyledHTML(content, title);
      
      const opt = {
        margin: [15, 15, 15, 15],
        filename: title + '.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      html2pdf().set(opt).from(element).save()
        .then(() => resolve({ blob: new Blob(), filename: title + '.pdf' }))
        .catch(reject);
    });
  }
  
  async exportHTML(content: string, title: string = 'document'): Promise<ExportResult> {
    const html = this.createStyledHTML(content, title);
    const blob = new Blob([html], { type: 'text/html' });
    return { blob, filename: title + '.html' };
  }
  
  async exportMarkdown(markdown: string, _title: string = 'document'): Promise<ExportResult> {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    return { blob, filename: 'document.md' };
  }
  
  async exportJSON(content: string, title: string = 'document'): Promise<ExportResult> {
    const data = {
      title,
      exportedAt: new Date().toISOString(),
      content,
      html: content
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    return { blob, filename: title + '.json' };
  }
  
  async export(content: string, options: ExportOptions): Promise<ExportResult> {
    const title = options.filename || 'document';
    
    switch (options.format) {
      case 'pdf': return this.exportPDF(content, title);
      case 'html': return this.exportHTML(content, title);
      case 'markdown': return this.exportMarkdown(content, title);
      case 'json': return this.exportJSON(content, title);
      default: throw new Error('不支持的导出格式: ' + options.format);
    }
  }
}

export const performanceMetrics = {
  renderCount: 0,
  totalRenderTime: 0,
  lastRenderTime: 0,
  maxRenderTime: 0,
  minRenderTime: Infinity,
  memoryUsage: 0,
  
  reset(): void {
    this.renderCount = 0;
    this.totalRenderTime = 0;
    this.lastRenderTime = 0;
    this.maxRenderTime = 0;
    this.minRenderTime = Infinity;
  },
  
  recordRender(duration: number): void {
    this.renderCount++;
    this.totalRenderTime += duration;
    this.lastRenderTime = duration;
    this.maxRenderTime = Math.max(this.maxRenderTime, duration);
    this.minRenderTime = Math.min(this.minRenderTime, duration);
    this.updateMemory();
  },
  
  updateMemory(): void {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      this.memoryUsage = (performance as any).memory.usedJSHeapSize;
    }
  },
  
  getAverageRenderTime(): number {
    return this.renderCount > 0 ? this.totalRenderTime / this.renderCount : 0;
  },
  
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  
  getMetrics(): Record<string, number | string> {
    this.updateMemory();
    return {
      renderCount: this.renderCount,
      averageRenderTime: this.getAverageRenderTime().toFixed(2) + 'ms',
      lastRenderTime: this.lastRenderTime.toFixed(2) + 'ms',
      maxRenderTime: this.maxRenderTime.toFixed(2) + 'ms',
      minRenderTime: this.minRenderTime === Infinity ? 'N/A' : this.minRenderTime.toFixed(2) + 'ms',
      memoryUsage: this.formatBytes(this.memoryUsage)
    };
  }
};

export function trackRenderPerformance<T>(fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (result instanceof Promise) {
    return result.finally(() => performanceMetrics.recordRender(duration)) as T;
  }
  
  performanceMetrics.recordRender(duration);
  return result;
 }

export function renderPerformancePanel(): string {
  const metrics = performanceMetrics.getMetrics();
  return '<div class="performance-panel" style="background: var(--color-surface); border-radius: 8px; padding: 16px; margin-top: 16px; border: 1px solid var(--color-border);"><h4 style="margin: 0 0 12px; font-size: 14px;">性能监控</h4><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 12px;"><div><span style="color: var(--color-text-muted);">渲染次数:</span> <strong>' + metrics.renderCount + '</strong></div><div><span style="color: var(--color-text-muted);">平均耗时:</span> <strong>' + metrics.averageRenderTime + '</strong></div><div><span style="color: var(--color-text-muted);">上次耗时:</span> <strong>' + metrics.lastRenderTime + '</strong></div><div><span style="color: var(--color-text-muted);">最大耗时:</span> <strong>' + metrics.maxRenderTime + '</strong></div><div><span style="color: var(--color-text-muted);">最小耗时:</span> <strong>' + metrics.minRenderTime + '</strong></div><div><span style="color: var(--color-text-muted);">内存占用:</span> <strong>' + metrics.memoryUsage + '</strong></div></div></div>';
}

export interface CloudStorage {
  save(id: string, content: string): Promise<string>;
  load(id: string): Promise<string | null>;
}

export class CloudStorageManager implements CloudStorage {
  private static instance: CloudStorageManager;
  private baseUrl: string = '';
  
  static getInstance(): CloudStorageManager {
    if (!CloudStorageManager.instance) {
      CloudStorageManager.instance = new CloudStorageManager();
    }
    return CloudStorageManager.instance;
  }
  
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
  
  async save(id: string, content: string): Promise<string> {
    if (!this.baseUrl) {
      throw new Error('Cloud storage not configured');
    }
    
    try {
      const response = await fetch(this.baseUrl + '/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content })
      });
      
      if (!response.ok) throw new Error('Failed to save');
      
      const data = await response.json() as { shareUrl: string };
      return data.shareUrl;
    } catch (error) {
      console.error('Cloud save error:', error);
      throw error;
    }
  }
  
  async load(id: string): Promise<string | null> {
    if (!this.baseUrl) {
      throw new Error('Cloud storage not configured');
    }
    
    try {
      const response = await fetch(this.baseUrl + '/api/share/' + id);
      
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Failed to load');
      
      const data = await response.json() as { content: string };
      return data.content;
    } catch (error) {
      console.error('Cloud load error:', error);
      throw error;
    }
  }
}

export function generateShareId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateShareLink(content: string): string {
  const id = generateShareId();
  const encoded = encodeURIComponent(content);
  return window.location.origin + '/view/' + id + '?data=' + encoded;
}

export async function confirmClear(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(false);
      return;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = '<style>.confirm-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10001;animation:fadeIn 0.2s ease;}.confirm-dialog{background:var(--color-surface,#fff);padding:24px;border-radius:12px;max-width:320px;text-align:center;animation:slideUp 0.3s ease;}.confirm-dialog h3{margin:0 0 12px;color:var(--color-text,#2d3748);}.confirm-dialog p{margin:0 0 20px;color:var(--color-text-muted,#718096);font-size:14px;}.confirm-buttons{display:flex;gap:12px;justify-content:center;}.confirm-btn{padding:10px 24px;border:none;border-radius:8px;cursor:pointer;font-weight:600;transition:all 0.2s;}.confirm-btn.cancel{background:#e2e8f0;color:#4a5568;}.confirm-btn.confirm{background:#f56565;color:white;}@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}@keyframes slideUp{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}</style><div class="confirm-dialog"><h3>确认清空</h3><p>确定要清空所有内容吗？此操作无法撤销。</p><div class="confirm-buttons"><button class="confirm-btn cancel">取消</button><button class="confirm-btn confirm">清空</button></div></div>';
    
    document.body.appendChild(overlay);
    
    const cleanup = () => {
      overlay.style.animation = 'fadeIn 0.2s ease reverse';
      setTimeout(() => overlay.remove(), 200);
    };
    
    const cancelBtn = overlay.querySelector('.cancel') as HTMLButtonElement;
    const confirmBtn = overlay.querySelector('.confirm') as HTMLButtonElement;
    
    cancelBtn?.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });
    
    confirmBtn?.addEventListener('click', () => {
      cleanup();
      resolve(true);
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        cleanup();
        resolve(false);
      }
    });
  });
}

export const MAX_INPUT_LENGTH = 50000;

export function validateInputLength(content: string): { valid: boolean; message?: string } {
  if (content.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      message: '内容长度超出限制 (最大 ' + MAX_INPUT_LENGTH + ' 字符，当前 ' + content.length + ' 字符)'
    };
  }
  return { valid: true };
}

export function truncateContent(content: string, maxLength: number = MAX_INPUT_LENGTH): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength);
}

export function createHtmlTemplate(title: string, content: string): string {
  return '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n    <meta name="description" content="Cloudflare Workers Markdown to PDF Converter - 实时渲染、一键导出">\n    <meta name="theme-color" content="#5a67d8">\n    <title>' + title + '</title>\n    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js" crossorigin="anonymous"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" crossorigin="anonymous"></script>\n    <script src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.8/purify.min.js" crossorigin="anonymous"></script>\n    <style>\n        :root {\n            --color-primary: #5a67d8;\n            --color-primary-dark: #4c51bf;\n            --color-secondary: #718096;\n            --color-success: #48bb78;\n            --color-error: #f56565;\n            --color-warning: #ed8936;\n            --color-info: #4299e1;\n            --color-bg: #f7fafc;\n            --color-surface: #ffffff;\n            --color-text: #2d3748;\n            --color-text-muted: #718096;\n            --color-border: #e2e8f0;\n            --color-focus: #5a67d8;\n            --radius-sm: 4px;\n            --radius-md: 8px;\n            --radius-lg: 12px;\n            --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);\n            --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);\n            --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);\n            --transition-fast: 150ms ease;\n            --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;\n            --font-mono: "SF Mono", Monaco, Inconsolata, "Fira Code", monospace;\n        }\n        :root.dark {\n            --color-primary: #7c85e0;\n            --color-bg: #1a202c;\n            --color-surface: #2d3748;\n            --color-text: #f7fafc;\n            --color-text-muted: #a0aec0;\n            --color-border: #4a5568;\n            --color-success: #68d391;\n            --color-error: #fc8181;\n            --color-warning: #f6ad55;\n            --color-info: #63b3ed;\n        }\n        :root { background: var(--gradient-bg, linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)); }\n        :root.dark { --gradient-bg: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); }\n        * { margin: 0; padding: 0; box-sizing: border-box; }\n        html { scroll-behavior: smooth; }\n        body { font-family: var(--font-sans); line-height: 1.7; color: var(--color-text); background: var(--gradient-bg); min-height: 100vh; padding: 16px; }\n        @media (min-width: 768px) { body { padding: 24px; } }\n        .skip-link { position: absolute; top: -100px; left: 50%; transform: translateX(-50%); background: var(--color-primary); color: white; padding: 12px 24px; border-radius: var(--radius-md); z-index: 10000; text-decoration: none; font-weight: 600; transition: top var(--transition-fast); }\n        .skip-link:focus { top: 16px; }\n        .container { max-width: 1200px; margin: 0 auto; background: var(--color-surface); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); overflow: hidden; }\n        .header { background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%); color: white; padding: 24px 20px; text-align: center; }\n        @media (min-width: 768px) { .header { padding: 32px 24px; } }\n        .header h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 8px; }\n        @media (min-width: 768px) { .header h1 { font-size: 2rem; } }\n        .header p { font-size: 0.875rem; opacity: 0.9; }\n        .controls { padding: 16px; background: var(--color-bg); border-bottom: 1px solid var(--color-border); display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; align-items: center; }\n        @media (min-width: 768px) { .controls { padding: 20px; gap: 16px; } }\n        .btn { padding: 10px 20px; border: none; border-radius: var(--radius-md); cursor: pointer; font-size: 0.875rem; font-weight: 600; transition: all var(--transition-fast); display: inline-flex; align-items: center; gap: 8px; min-height: 44px; min-width: 44px; }\n        @media (min-width: 768px) { .btn { padding: 12px 24px; font-size: 1rem; } }\n        .btn:focus { outline: none; box-shadow: 0 0 0 3px rgba(90, 103, 216, 0.3); }\n        .btn-primary { background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%); color: white; }\n        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(90, 103, 216, 0.4); }\n        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }\n        .btn-secondary { background: var(--color-surface); color: var(--color-text); border: 1px solid var(--color-border); }\n        .btn-secondary:hover:not(:disabled) { background: var(--color-bg); border-color: var(--color-primary); }\n        .btn-success { background: var(--color-success); color: white; }\n        .btn-success:hover:not(:disabled) { background: #38a169; transform: translateY(-2px); }\n        .theme-btn { background: transparent; border: 1px solid var(--color-border); color: var(--color-text); }\n        .theme-btn:hover { background: var(--color-bg); }\n        .export-dropdown { position: relative; display: inline-block; }\n        .export-menu { position: absolute; top: 100%; right: 0; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); min-width: 160px; z-index: 1000; display: none; animation: dropdownFade 0.2s ease; }\n        .export-menu.show { display: block; }\n        @keyframes dropdownFade { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }\n        .export-menu button { display: block; width: 100%; padding: 10px 16px; text-align: left; background: none; border: none; color: var(--color-text); cursor: pointer; transition: background var(--transition-fast); }\n        .export-menu button:hover { background: var(--color-bg); }\n        .keyboard-hint { font-size: 0.75rem; color: var(--color-text-muted); margin-left: auto; display: none; }\n        @media (min-width: 768px) { .keyboard-hint { display: block; } }\n        .keyboard-hint kbd { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: 2px 6px; font-family: var(--font-mono); font-size: 0.7rem; }\n        .editor-container { display: flex; flex-direction: column; height: calc(100vh - 180px); min-height: 400px; }\n        @media (min-width: 1024px) { .editor-container { flex-direction: row; height: calc(100vh - 200px); } }\n        .editor-wrapper { flex: 1; display: flex; flex-direction: column; border-bottom: 1px solid var(--color-border); }\n        @media (min-width: 1024px) { .editor-wrapper { border-bottom: none; border-right: 1px solid var(--color-border); } }\n        .editor-label { padding: 8px 16px; background: var(--color-bg); color: var(--color-text-muted); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; }\n        .char-count { font-size: 0.7rem; color: var(--color-text-muted); }\n        .char-count.warning { color: var(--color-warning); }\n        .char-count.error { color: var(--color-error); }\n        .editor { flex: 1; padding: 16px; border: none; resize: none; font-family: var(--font-mono); font-size: 14px; line-height: 1.7; background: var(--color-bg); color: var(--color-text); min-height: 200px; }\n        @media (min-width: 768px) { .editor { padding: 20px; font-size: 15px; } }\n        .editor:focus { outline: none; background: var(--color-surface); }\n        .editor::placeholder { color: var(--color-text-muted); }\n        .preview-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; }\n        .preview-label { padding: 8px 16px; background: var(--color-bg); color: var(--color-text-muted); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--color-border); }\n        .preview { flex: 1; padding: 16px; overflow: auto; background: var(--color-surface); }\n        @media (min-width: 768px) { .preview { padding: 24px; } }\n        .preview h1 { font-size: 1.75rem; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; color: var(--color-text); line-height: 1.3; }\n        .preview h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; color: var(--color-text); line-height: 1.3; border-bottom: 2px solid var(--color-border); padding-bottom: 0.4em; }\n        .preview h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1.25em; margin-bottom: 0.5em; color: var(--color-text); }\n        .preview p { margin-bottom: 1em; line-height: 1.8; }\n        .preview code { background: #edf2f7; padding: 3px 8px; border-radius: var(--radius-sm); font-family: var(--font-mono); font-size: 0.9em; color: #e53e3e; }\n        :root.dark .preview code { background: #4a5568; color: #fc8181; }\n        .preview pre { background: #2d3748; color: #f7fafc; padding: 16px; border-radius: var(--radius-md); overflow-x: auto; margin: 1em 0; }\n        .preview pre code { background: none; padding: 0; color: inherit; font-size: 0.875em; }\n        .preview ul, .preview ol { margin-left: 1.5em; margin-bottom: 1em; }\n        .preview li { margin-bottom: 0.5em; }\n        .preview blockquote { border-left: 4px solid var(--color-primary); padding-left: 1em; margin: 1em 0; color: var(--color-text-muted); font-style: italic; }\n        .preview table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.95em; }\n        .preview th, .preview td { border: 1px solid var(--color-border); padding: 10px 12px; text-align: left; }\n        .preview th { background: var(--color-bg); font-weight: 600; }\n        .preview tr:nth-child(even) { background: var(--color-bg); }\n        .preview img { max-width: 100%; height: auto; border-radius: var(--radius-md); margin: 1em 0; }\n        .preview a { color: var(--color-primary); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color var(--transition-fast); }\n        .preview a:hover { border-bottom-color: var(--color-primary); }\n        .preview hr { border: none; border-top: 2px solid var(--color-border); margin: 2em 0; }\n        .error-container { padding: 40px 20px; text-align: center; }\n        .error-container h1 { font-size: 2rem; color: var(--color-error); margin-bottom: 16px; }\n        .error-container p { color: var(--color-text-muted); }\n        @media print { body { background: white; padding: 0; } .container { box-shadow: none; border-radius: 0; } .controls, .editor-wrapper, .editor-label, .preview-label, .performance-panel { display: none; } .editor-container { display: block; height: auto; } .preview { padding: 20px; } }\n        .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 10000; display: flex; flex-direction: column; gap: 12px; }\n        .toast { background: var(--color-surface); padding: 14px 20px; border-radius: var(--radius-md); box-shadow: var(--shadow-lg); display: flex; align-items: center; gap: 12px; animation: slideIn 0.3s ease; min-width: 280px; max-width: 400px; }\n        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }\n        .toast.success { border-left: 4px solid var(--color-success); }\n        .toast.error { border-left: 4px solid var(--color-error); }\n        .toast.info { border-left: 4px solid var(--color-info); }\n        .toast.warning { border-left: 4px solid var(--color-warning); }\n        .toast-icon { font-size: 1.25rem; }\n        .toast-message { flex: 1; font-size: 0.9rem; color: var(--color-text); }\n        .toast-close { background: none; border: none; color: var(--color-text-muted); cursor: pointer; padding: 4px; font-size: 1.2rem; line-height: 1; transition: color var(--transition-fast); }\n        .loading-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.9); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease; }\n        .loading-overlay.active { opacity: 1; visibility: visible; }\n        .loading-spinner { width: 48px; height: 48px; border: 4px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; }\n        @keyframes spin { to { transform: rotate(360deg); } }\n        .loading-text { margin-top: 16px; font-size: 1rem; color: var(--color-text-muted); }\n        .status-indicator { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; color: var(--color-text-muted); }\n        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-success); }\n        .status-dot.saving { background: var(--color-warning); animation: pulse 1s infinite; }\n        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }\n        .auto-save-indicator { position: absolute; top: 8px; right: 16px; display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: var(--color-text-muted); opacity: 0; transition: opacity var(--transition-normal); }\n        .auto-save-indicator.visible { opacity: 1; }\n        .share-link-container { margin-top: 12px; padding: 12px; background: var(--color-bg); border-radius: var(--radius-md); display: none; }\n        .share-link-container.show { display: block; }\n        .share-link-input { width: 100%; padding: 8px 12px; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); color: var(--color-text); font-size: 0.875rem; }\n    </style>\n</head>\n<body>\n    <a href="#main-content" class="skip-link">跳转到主要内容</a>\n    <div class="container" role="main" id="main-content">\n        <div class="header">\n            <h1>Markdown to PDF</h1>\n            <p>实时渲染 · 多格式导出 · Cloudflare 部署</p>\n        </div>\n        <div class="controls" role="toolbar" aria-label="操作按钮">\n            <div class="export-dropdown">\n                <button class="btn btn-primary" id="exportBtn" aria-label="导出选项"><span aria-hidden="true">导出</span> 导出</button>\n                <div class="export-menu" id="exportMenu" role="menu">\n                    <button role="menuitem" data-format="pdf">PDF</button>\n                    <button role="menuitem" data-format="html">HTML</button>\n                    <button role="menuitem" data-format="markdown">Markdown</button>\n                    <button role="menuitem" data-format="json">JSON</button>\n                </div>\n            </div>\n            <button class="btn btn-secondary" id="themeBtn" aria-label="切换主题"><span aria-hidden="true">主题</span></button>\n            <button class="btn btn-secondary" id="loadExampleBtn" aria-label="加载示例内容">示例</button>\n            <button class="btn btn-secondary" id="copyBtn" aria-label="复制内容">复制</button>\n            <button class="btn btn-secondary" id="shareBtn" aria-label="分享">分享</button>\n            <button class="btn btn-secondary" id="clearBtn" aria-label="清空">清空</button>\n            <button class="btn btn-secondary" id="perfBtn" aria-label="性能">性能</button>\n            <div class="status-indicator" aria-live="polite"><span class="status-dot" id="statusDot"></span><span id="statusText">已保存</span></div>\n        </div>\n        <div class="editor-container">\n            <div class="editor-wrapper">\n                <div class="editor-label" id="editorLabel"><span>Markdown 编辑器</span><span class="char-count" id="charCount">0 / 50000</span></div>\n                <textarea class="editor" id="markdownInput" placeholder="在这里输入 Markdown 内容..." spellcheck="false" aria-label="Markdown 输入区域" maxlength="50000"></textarea>\n                <div class="auto-save-indicator" id="autoSaveIndicator" aria-hidden="true"><span class="status-dot saving"></span><span>自动保存中...</span></div>\n            </div>\n            <div class="preview-wrapper">\n                <div class="preview-label" id="previewLabel">实时预览</div>\n                <div class="preview" id="preview" role="region" aria-label="预览区域">' + content + '</div>\n            </div>\n        </div>\n        <div class="share-link-container" id="shareContainer"><input type="text" class="share-link-input" id="shareLinkInput" readonly></div>\n    </div>\n    <div class="toast-container" id="toastContainer" role="alert" aria-live="assertive"></div>\n    <div class="loading-overlay" id="loadingOverlay" role="status" aria-label="加载中"><div class="loading-spinner"></div><div class="loading-text" id="loadingText">正在处理...</div></div>\n    <script>\n        const MAX_INPUT_LENGTH = 50000;\n        const STORAGE_KEY = "markdown_pdf_content";\n        const DEBOUNCE_DELAY = 300;\n        const THEMES = ["light", "dark", "system"];\n        let currentTheme = "system";\n        let renderTimeout = null;\n        let saveTimeout = null;\n        let perfPanelVisible = false;\n        \n        const elements = {\n            markdownInput: document.getElementById("markdownInput"),\n            preview: document.getElementById("preview"),\n            toastContainer: document.getElementById("toastContainer"),\n            loadingOverlay: document.getElementById("loadingOverlay"),\n            loadingText: document.getElementById("loadingText"),\n            statusDot: document.getElementById("statusDot"),\n            statusText: document.getElementById("statusText"),\n            autoSaveIndicator: document.getElementById("autoSaveIndicator"),\n            charCount: document.getElementById("charCount"),\n            exportBtn: document.getElementById("exportBtn"),\n            exportMenu: document.getElementById("exportMenu"),\n            themeBtn: document.getElementById("themeBtn"),\n            shareContainer: document.getElementById("shareContainer"),\n            shareLinkInput: document.getElementById("shareLinkInput")\n        };\n        \n        function showToast(message, type, duration) {\n            type = type || "info";\n            duration = duration || 3000;\n            const icons = { success: "成功", error: "错误", warning: "警告", info: "信息" };\n            const toast = document.createElement("div");\n            toast.className = "toast " + type;\n            toast.innerHTML = "<span class="toast-icon">" + icons[type] + "</span><span class="toast-message">" + message + "</span><button class="toast-close">&times;</button>";\n            toast.querySelector(".toast-close").addEventListener("click", function() { toast.remove(); });\n            elements.toastContainer.appendChild(toast);\n            setTimeout(function() { if (toast.parentNode) { toast.style.animation = "slideIn 0.3s ease reverse"; setTimeout(function() { toast.remove(); }, 300); } }, duration);\n        }\n        \n        function showLoading(message) {\n            message = message || "正在处理...";\n            elements.loadingText.textContent = message;\n            elements.loadingOverlay.classList.add("active");\n        }\n        \n        function hideLoading() {\n            elements.loadingOverlay.classList.remove("active");\n        }\n        \n        function updateStatus(status) {\n            elements.statusDot.className = "status-dot";\n            if (status === "saving") { elements.statusDot.classList.add("saving"); elements.statusText.textContent = "保存中..."; }\n            else if (status === "saved") { elements.statusText.textContent = "已保存"; }\n            else if (status === "error") { elements.statusText.textContent = "保存失败"; }\n            else { elements.statusText.textContent = status; }\n        }\n        \n        function updateCharCount() {\n            var length = elements.markdownInput.value.length;\n            elements.charCount.textContent = length.toLocaleString() + " / " + MAX_INPUT_LENGTH.toLocaleString();\n            elements.charCount.classList.remove("warning", "error");\n            if (length > MAX_INPUT_LENGTH * 0.9) { elements.charCount.classList.add("error"); }\n            else if (length > MAX_INPUT_LENGTH * 0.8) { elements.charCount.classList.add("warning"); }\n        }\n        \n        function getSystemTheme() {\n            return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";\n        }\n        \n        function applyTheme(theme) {\n            currentTheme = theme;\n            var isDark = theme === "dark" || (theme === "system" && getSystemTheme() === "dark");\n            var root = document.documentElement;\n            var configs = {\n                light: {\n                    "--color-primary": "#5a67d8",\n                    "--color-bg": "#f7fafc",\n                    "--color-surface": "#ffffff",\n                    "--color-text": "#2d3748",\n                    "--color-text-muted": "#718096",\n                    "--color-border": "#e2e8f0",\n                    "--gradient-bg": "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)"\n                },\n                dark: {\n                    "--color-primary": "#7c85e0",\n                    "--color-bg": "#1a202c",\n                    "--color-surface": "#2d3748",\n                    "--color-text": "#f7fafc",\n                    "--color-text-muted": "#a0aec0",\n                    "--color-border": "#4a5568",\n                    "--gradient-bg": "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"\n                }\n            };\n            var config = isDark ? configs.dark : configs.light;\n            for (var key in config) { if (config.hasOwnProperty(key)) { root.style.setProperty(key, config[key]); } }\n            localStorage.setItem("theme_preference", theme);\n            var icons = { light: "亮色", dark: "暗色", system: "自动" };\n            elements.themeBtn.innerHTML = "<span aria-hidden="true\">主题</span> " + icons[theme];\n        }\n        \n        function cycleTheme() {\n            var currentIndex = THEMES.indexOf(currentTheme);\n            var nextIndex = (currentIndex + 1) % THEMES.length;\n            applyTheme(THEMES[nextIndex]);\n        }\n        \n        function debouncedRender() {\n            if (renderTimeout) { clearTimeout(renderTimeout); }\n            renderTimeout = setTimeout(function() {\n                var markdown = elements.markdownInput.value;\n                var start = performance.now();\n                var html = "";\n                if (typeof marked !== "undefined" && typeof DOMPurify !== "undefined") {\n                    var rawHtml = marked.parse(markdown);\n                    if (!(rawHtml instanceof Promise)) {\n                        html = DOMPurify.sanitize(rawHtml, {\n                            ALLOWED_TAGS: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "hr", "strong", "em", "u", "s", "del", "ins", "code", "pre", "blockquote", "ul", "ol", "li", "a", "img", "table", "thead", "tbody", "tr", "th", "td", "div", "span"],\n                            ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "id", "target", "rel"]\n                        });\n                    }\n                }\n                elements.preview.innerHTML = html;\n                var duration = performance.now() - start;\n                if (typeof window.performanceMetrics !== "undefined") { window.performanceMetrics.recordRender(duration); }\n                if (perfPanelVisible) { togglePerformancePanel(); togglePerformancePanel(); }\n            }, DEBOUNCE_DELAY);\n        }\n        \n        function debouncedSave() {\n            if (saveTimeout) { clearTimeout(saveTimeout); }\n            saveTimeout = setTimeout(function() {\n                try {\n                    var content = elements.markdownInput.value;\n                    localStorage.setItem(STORAGE_KEY, content);\n                    updateStatus("saved");\n                } catch (e) {\n                    updateStatus("error");\n                    showToast("自动保存失败", "warning");\n                }\n            }, DEBOUNCE_DELAY);\n        }\n        \n        function loadFromStorage() {\n            try {\n                var saved = localStorage.getItem(STORAGE_KEY);\n                if (saved) {\n                    elements.markdownInput.value = saved;\n                    updateCharCount();\n                    debouncedRender();\n                }\n            } catch (e) { console.warn("无法从本地存储加载内容"); }\n        }\n        \n        function getTitleFromPreview() {\n            var h1 = elements.preview.querySelector("h1");\n            return h1 ? h1.innerText : "document";\n        }\n        \n        async function exportContent(format) {\n            var content = elements.markdownInput.value;\n            var title = getTitleFromPreview();\n            showLoading("正在导出 " + format.toUpperCase() + "...");\n            try {\n                if (format === "pdf") {\n                    if (typeof html2pdf === "undefined") throw new Error("html2pdf 未加载");\n                    var element = document.createElement("div");\n                    element.innerHTML = "<div style=\"padding: 40px; font-family: serif; max-width: 800px; margin: 0 auto;\"><h1 style=\"text-align: center; font-size: 28px; margin-bottom: 40px;\">" + title + "</h1><div>" + elements.preview.innerHTML + "</div></div>";\n                    await html2pdf().set({\n                        margin: [15, 15, 15, 15],\n                        filename: title + ".pdf",\n                        image: { type: "jpeg", quality: 0.98 },\n                        html2canvas: { scale: 2, useCORS: true },\n                        jsPDF: { unit: "mm", format: "a4" }\n                    }).from(element).save();\n                } else if (format === "html") {\n                    var html = "<!DOCTYPE html><html lang=\"zh-CN\"><head><meta charset=\"UTF-8\"><title>" + title + "</title></head><body>" + elements.preview.innerHTML + "</body></html>";\n                    var blob = new Blob([html], { type: "text/html" });\n                    var url = URL.createObjectURL(blob);\n                    var a = document.createElement("a");\n                    a.href = url;\n                    a.download = title + ".html";\n                    a.click();\n                    URL.revokeObjectURL(url);\n                } else if (format === "markdown") {\n                    var blob = new Blob([content], { type: "text/markdown" });\n                    var url = URL.createObjectURL(blob);\n                    var a = document.createElement("a");\n                    a.href = url;\n                    a.download = "document.md";\n                    a.click();\n                    URL.revokeObjectURL(url);\n                } else if (format === "json") {\n                    var data = { title: title, exportedAt: new Date().toISOString(), content: content };\n                    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });\n                    var url = URL.createObjectURL(blob);\n                    var a = document.createElement("a");\n                    a.href = url;\n                    a.download = title + ".json";\n                    a.click();\n                    URL.revokeObjectURL(url);\n                }\n                showToast("已导出 " + format.toUpperCase(), "success");\n            } catch (error) {\n                console.error("Export error:", error);\n                showToast("导出失败: " + error.message, "error");\n            } finally {\n                hideLoading();\n            }\n        }\n        \n        function loadExample() {\n            var example = "# 欢迎使用 Markdown to PDF\\n\\n## 项目介绍\\n\\n这是一个基于 Cloudflare Workers 的 Markdown 渲染和 PDF 导出工具。\\n\\n### 主要功能\\n\\n- 实时 Markdown 渲染\\n- 多格式导出 (PDF/HTML/Markdown/JSON)\\n- 主题切换 (亮色/暗色/自动)\\n- 响应式设计\\n- 自动保存\\n\\n### 代码示例\\n\\n```javascript\\nfunction hello() {\\n    console.log(\\"Hello, World!\\");\\n}\\n```\\n\\n---\\n\\n## 使用说明\\n\\n1. 输入 Markdown 内容\\n2. 右侧预览渲染效果\\n3. 点击导出按钮选择格式\\n";\n            elements.markdownInput.value = example;\n            updateCharCount();\n            debouncedRender();\n            debouncedSave();\n            showToast("已加载示例内容", "success");\n        }\n        \n        async function copyMarkdown() {\n            try {\n                await navigator.clipboard.writeText(elements.markdownInput.value);\n                showToast("已复制到剪贴板", "success");\n            } catch (e) {\n                showToast("复制失败", "error");\n            }\n        }\n        \n        async function shareContent() {\n            var content = elements.markdownInput.value;\n            var id = Math.random().toString(36).substring(2, 10);\n            var encoded = encodeURIComponent(content);\n            var shareUrl = window.location.origin + "/view/" + id + "?data=" + encoded;\n            elements.shareLinkInput.value = shareUrl;\n            elements.shareContainer.classList.add("show");\n            try {\n                await navigator.clipboard.writeText(shareUrl);\n                showToast("分享链接已复制", "success");\n            } catch (e) {\n                showToast("复制失败，请手动复制", "warning");\n            }\n        }\n        \n        async function clearEditor() {\n            var confirmed = await window.confirmClear();\n            if (confirmed) {\n                elements.markdownInput.value = "";\n                updateCharCount();\n                debouncedRender();\n                debouncedSave();\n                showToast("已清空内容", "info");\n            }\n        }\n        \n        function togglePerformancePanel() {\n            perfPanelVisible = !perfPanelVisible;\n            var existing = document.querySelector(".performance-panel");\n            if (existing) existing.remove();\n            if (perfPanelVisible) {\n                var metrics = window.performanceMetrics || {\n                    getMetrics: function() {\n                        return { renderCount: 0, averageRenderTime: "0ms", lastRenderTime: "0ms", maxRenderTime: "0ms", minRenderTime: "N/A", memoryUsage: "N/A" };\n                    }\n                };\n                var data = metrics.getMetrics();\n                var panel = document.createElement("div");\n                panel.className = "performance-panel";\n                panel.style.cssText = "background: var(--color-surface); border-radius: 8px; padding: 16px; margin: 16px; border: 1px solid var(--color-border);";\n                panel.innerHTML = "<h4 style=\"margin: 0 0 12px; font-size: 14px;\">性能监控</h4><div style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; font-size: 12px;\"><div><span style=\"color: var(--color-text-muted);\">渲染次数:</span> <strong>" + data.renderCount + "</strong></div><div><span style=\"color: var(--color-text-muted);\">平均耗时:</span> <strong>" + data.averageRenderTime + "</strong></div><div><span style=\"color: var(--color-text-muted);">上次耗时:</span> <strong>" + data.lastRenderTime + "</strong></div><div><span style=\"color: var(--color-text-muted);">最大耗时:</span> <strong>" + data.maxRenderTime + "</strong></div><div><span style=\"color: var(--color-text-muted);">最小耗时:</span> <strong>" + data.minRenderTime + "</strong></div><div><span style=\"color: var(--color-text-muted);">内存占用:</span> <strong>" + data.memoryUsage + "</strong></div></div>";\n                elements.preview.parentNode.appendChild(panel);\n            }\n        }\n        \n        function setupEventListeners() {\n            elements.markdownInput.addEventListener("input", function() {\n                updateStatus("saving");\n                elements.autoSaveIndicator.classList.add("visible");\n                updateCharCount();\n                debouncedRender();\n                debouncedSave();\n            });\n            elements.exportBtn.addEventListener("click", function() { elements.exportMenu.classList.toggle("show"); });\n            elements.exportMenu.querySelectorAll("[data-format]").forEach(function(btn) {\n                btn.addEventListener("click", function() { exportContent(this.dataset.format); elements.exportMenu.classList.remove("show"); });\n            });\n            document.addEventListener("click", function(e) { if (!e.target.closest(".export-dropdown")) { elements.exportMenu.classList.remove("show"); } });\n            elements.themeBtn.addEventListener("click", cycleTheme);\n            document.getElementById("loadExampleBtn").addEventListener("click", loadExample);\n            document.getElementById("copyBtn").addEventListener("click", copyMarkdown);\n            document.getElementById("shareBtn").addEventListener("click", shareContent);\n            document.getElementById("clearBtn").addEventListener("click", clearEditor);\n            document.getElementById("perfBtn").addEventListener("click", togglePerformancePanel);\n            document.addEventListener("keydown", function(e) {\n                if ((e.ctrlKey || e.metaKey) && e.key === "s") {\n                    e.preventDefault();\n                    debouncedSave();\n                    showToast("已保存", "success");\n                }\n                if ((e.ctrlKey || e.metaKey) && e.key === "b") {\n                    e.preventDefault();\n                    var start = elements.markdownInput.selectionStart;\n                    var end = elements.markdownInput.selectionEnd;\n                    var text = elements.markdownInput.value;\n                    elements.markdownInput.value = text.substring(0, start) + "**" + text.substring(start, end) + "**" + text.substring(end);\n                    elements.markdownInput.focus();\n                    elements.markdownInput.setSelectionRange(start + 2, end + 2);\n                    debouncedRender();\n                    debouncedSave();\n                }\n            });\n            window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function() { if (currentTheme === "system") { applyTheme("system"); } });\n        }\n        \n        window.performanceMetrics = {\n            renderCount: 0,\n            totalRenderTime: 0,\n            lastRenderTime: 0,\n            maxRenderTime: 0,\n            minRenderTime: Infinity,\n            memoryUsage: 0,\n            recordRender: function(duration) {\n                this.renderCount++;\n                this.totalRenderTime += duration;\n                this.lastRenderTime = duration;\n                this.maxRenderTime = Math.max(this.maxRenderTime, duration);\n                this.minRenderTime = Math.min(this.minRenderTime, duration);\n                this.updateMemory();\n            },\n            updateMemory: function() {\n                if (performance.memory) { this.memoryUsage = performance.memory.usedJSHeapSize; }\n            },\n            getAverageRenderTime: function() { return this.renderCount > 0 ? this.totalRenderTime / this.renderCount : 0; },\n            formatBytes: function(bytes) {\n                if (bytes === 0) return "0 B";\n                var k = 1024;\n                var sizes = ["B", "KB", "MB", "GB"];\n                var i = Math.floor(Math.log(bytes) / Math.log(k));\n                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];\n            },\n            getMetrics: function() {\n                this.updateMemory();\n                return {\n                    renderCount: this.renderCount,\n                    averageRenderTime: this.getAverageRenderTime().toFixed(2) + "ms",\n                    lastRenderTime: this.lastRenderTime.toFixed(2) + "ms",\n                    maxRenderTime: this.maxRenderTime.toFixed(2) + "ms",\n                    minRenderTime: this.minRenderTime === Infinity ? "N/A" : this.minRenderTime.toFixed(2) + "ms",\n                    memoryUsage: this.formatBytes(this.memoryUsage)\n                };\n            }\n        };\n        \n        window.confirmClear = function() {\n            return new Promise(function(resolve) {\n                var overlay = document.createElement("div");\n                overlay.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:10001;";\n                overlay.innerHTML = "<div style=\"background:var(--color-surface,#fff);padding:24px;border-radius:12px;max-width:320px;text-align:center;\"><h3 style=\"margin:0 0 12px;\">确认清空</h3><p style=\"margin:0 0 20px;font-size:14px;color:#718096;\">确定要清空所有内容吗？此操作无法撤销。</p><div style=\"display:flex;gap:12px;justify-content:center;\"><button style=\"padding:10px 24px;border:none;border-radius:8px;cursor:pointer;background:#e2e8f4;color:#4a5568;font-weight:600;\">取消</button><button style=\"padding:10px 24px;border:none;border-radius:8px;cursor:pointer;background:#f56565;color:white;font-weight:600;\">清空</button></div></div>";\n                document.body.appendChild(overlay);\n                var cleanup = function() { overlay.remove(); resolve(false); };\n                overlay.querySelector("button").addEventListener("click", cleanup);\n                overlay.querySelectorAll("button")[1].addEventListener("click", function() { cleanup(); resolve(true); });\n                overlay.addEventListener("click", function(e) { if (e.target === overlay) { cleanup(); } });\n            });\n        };\n        \n        applyTheme(localStorage.getItem("theme_preference") || "system");\n        loadFromStorage();\n        setupEventListeners();\n    </script>\n</body>\n</html>';
}
