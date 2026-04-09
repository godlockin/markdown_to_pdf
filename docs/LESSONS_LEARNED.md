# Mercury (Markdown to PDF) - Lessons & Learns

**Project**: Mercury - Markdown to PDF Worker v3.0.0
**Source**: `/Users/chenchen/working/sourcecode/tools/dev-tools/markdown_to_pdf`
**Extracted**: 2026-04-09

---

## Top Lessons Learned

### 1. Browser Native Print > Third-Party PDF Libraries

**Problem**: html2pdf.js (html2canvas + jsPDF) generates blank PDFs when rendering dark theme content.

**Root Cause**:
- html2canvas clones DOM elements and renders to canvas
- Dark theme with CSS variables and backdrop-filter causes rendering issues
- Cloned elements lose computed styles, resulting in 45 pages of blank output

**Solution**:
```javascript
// ❌ WRONG: html2pdf.js fails on dark theme
await html2pdf().set(opt).from(element).save();

// ✅ CORRECT: Browser native print API
const printWindow = window.open('', '_blank', 'width=800,height=600');
const htmlContent = element.innerHTML;

// Build print document with string concatenation
const printHtml = '<!DOCTYPE html>' +
  '<html><head><title>Markdown Document</title>' +
  '<meta charset="utf-8">' +
  '<style>body { background: #ffffff; color: #000000; }</style>' +
  '</head><body>' + htmlContent + '</body></html>';

printWindow.document.write(printHtml);
printWindow.document.close();
await printWindow.document.fonts.ready;
printWindow.print();
// Don't auto-close - let user save PDF manually
```

**Note**: `document.write()` is safe here because the HTML content is already sanitized by DOMPurify before being inserted into the preview element.

**Effect**:
- Works with any CSS (gradients, backdrop-filter, etc.)
- Text remains selectable (not images)
- User controls PDF settings (paper size, margins, scale)

**Lesson**: For client-side PDF generation, prefer browser native print over canvas-based libraries when dealing with complex CSS.

---

### 2. CSP Headers Must Allow External Fonts

**Problem**: Google Fonts stylesheet blocked by Content-Security-Policy, causing fallback fonts and poor print quality.

**Root Cause**: Initial CSP only allowed `'self'` for style-src and font-src.

**Solution**:
```typescript
// ❌ WRONG: Blocks Google Fonts
'Content-Security-Policy': "default-src 'self'; style-src 'self'; font-src 'self';"

// ✅ CORRECT: Allow Google Fonts
'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com;"
```

**Required CSP for this project**:
```typescript
{
  'script-src': "'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
  'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src': "'self' data: https://fonts.gstatic.com",
  'img-src': "'self' data: https: blob:",
  'worker-src': "blob:",
  'connect-src': "'self'"
}
```

**Lesson**: CSP headers must explicitly allowlist all external CDN resources (fonts, scripts, images) - test with browser DevTools Network tab.

---

### 3. Print Styles Must Force Contrast

**Problem**: Print output inherits dark theme colors, resulting in black background and invisible text.

**Solution**:
```css
/* Print media query with !important overrides */
@media print {
  @page { margin: 0.5in; }

  body {
    background: #ffffff !important;
    color: #000000 !important;
    font-family: 'Inter', -apple-system, sans-serif;
  }

  /* Hide all UI elements */
  header, .controls, #editor, .pane-header, #toast-container {
    display: none !important;
  }

  /* Force black text on ALL elements */
  #preview, #preview p, #preview span, #preview div,
  #preview li, #preview td, #preview th {
    color: #000000 !important;
    background: transparent !important;
  }

  /* Code blocks need light background */
  #preview code {
    background-color: #f3f4f6 !important;
    color: #1f2937 !important;
  }

  #preview pre {
    background-color: #f9fafb !important;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  /* Links should be underlined (no hover effects) */
  #preview a {
    color: #000000 !important;
    text-decoration: underline !important;
  }
}
```

**Lesson**: Print styles must override ALL colors with `!important`, target every element type explicitly, and test with actual print preview.

---

### 4. Cloudflare Workers: Keep Sync Processing Under 1 Second

**Problem**: Cloudflare Workers have strict timeout limits (free tier: 50ms, paid: 30s).

**Solution**:
- Server-side: Markdown rendering with marked.js (~20-100ms)
- Client-side: PDF generation (no server timeout)
- Rate limiting: In-memory Map (O(1) lookup, no DB)

**Pattern**:
```typescript
// ✅ Fast sync operation (<1s)
const html = marked.parse(markdown);
return new Response(JSON.stringify({ html }));

// ❌ Don't do: Long-running async operations in Workers
// Use job queue + polling pattern instead
```

**Lesson**: Cloudflare Workers are ideal for fast, stateless transformations. For async/long tasks, use job queue pattern (see formal_photos lesson).

---

### 5. Server + Client XSS Defense in Depth

**Problem**: User-provided markdown could contain XSS attacks.

**Solution**: Two-layer defense

**Layer 1 - Server (Cloudflare Worker)**:
```typescript
// Regex-based sanitization (Workers-safe)
function sanitizeMarkdown(md: string): string {
  return md
    .replace(/<script\b.*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/javascript:/gi, 'blocked:');
}
```

**Layer 2 - Client (Browser)**:
```javascript
// Full DOM sanitization with DOMPurify
const rawHtml = marked.parse(input);
const cleanHtml = DOMPurify.sanitize(rawHtml);
preview.innerHTML = cleanHtml;
```

**Note**: `isomorphic-dompurify` is NOT compatible with Cloudflare Workers runtime - must use regex on server.

**Lesson**: Server-side basic sanitization + client-side full sanitization = defense in depth without runtime compatibility issues.

---

### 6. Don't Auto-Close Print Window

**Problem**: Auto-closing print window (1s timeout) interrupts user's PDF saving workflow.

**Solution**:
```javascript
// ❌ WRONG: Closes before user saves
printWindow.print();
setTimeout(() => printWindow.close(), 1000);

// ✅ CORRECT: Let user close manually
printWindow.print();
// No auto-close - user controls when to close
showToast('Select "Save as PDF" in the print dialog', 'success');
```

**Enhancement**: Add visible instruction banner (hidden in print):
```html
<div class="print-hint">
  <strong>📄 PDF Instructions:</strong>
  Select "Save as PDF" as destination, then click Save.
  Close this window after.
</div>
<style>
.print-hint {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  color: #856404;
}
@media print { .print-hint { display: none !important; } }
</style>
```

**Lesson**: Don't automate user workflows they can control - provide clear instructions instead.

---

## Quick Reference Table

| # | Category | Core Principle | Applies To |
|---|----------|----------------|------------|
| 1 | PDF Generation | Browser print > html2pdf for complex CSS | Any PDF export feature |
| 2 | Security | CSP must allowlist external fonts | Cloudflare Workers with CDN resources |
| 3 | Print Styles | Force contrast with `!important` on every element | Any print-optimized CSS |
| 4 | Cloudflare | Keep sync processing <1s | All Worker endpoints |
| 5 | XSS Defense | Server regex + client DOMPurify | User-generated content rendering |
| 6 | UX | Don't auto-close user-controlled dialogs | Print/save workflows |

---

## Related Projects Lessons

- **formal_photos**: Cloudflare Workers timeout handling, CSP headers
- **personal-wiki**: Fail-fast validation, knowledge reuse loops
- **video_intelligent_analyzer**: Large markdown handling, Mermaid diagrams

---

**Last Updated**: 2026-04-09
**Version**: v3.0.0
