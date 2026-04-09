# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start local dev server (Wrangler)
npm run build            # Type check only (noEmit)
npm run serve            # Run standalone server for testing
npm run test             # Run tests (Vitest)
npm run test:run         # Run tests once (no watch)
npm run test:coverage    # Run tests with coverage
npm run deploy           # Deploy to Cloudflare
```

## Architecture Overview

**Cloudflare Worker** - Server-side Markdown rendering with REST API.

### Core Structure

```
src/
  index.ts          # Worker entry: request routing, rate limiting, metrics
  utils/
    markdown.ts     # Sanitization (regex-based), rendering (marked), validation
    templates.ts    # HTML template generator with CSS/JS embedded
tests/
  unit/             # Unit tests (markdown, theme, export, performance)
  e2e/              # E2E rendering tests
  integration.test.ts
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Web UI (editor + preview) |
| `/api/render` | POST | Render markdown to HTML |
| `/view/{data}` | GET | Shared preview URL |
| `/api/health` | GET | Health check |
| `/api/metrics` | GET | Usage metrics |

### Key Patterns

**Rate Limiting**: In-memory Map with 60s windows, 100 req/min per IP. Auto-cleanup when cache exceeds 1000 entries.

**Security**:
- Server-side: regex-based sanitization (script/iframe removal, javascript: protocol replacement, event handler stripping)
- Client-side: DOMPurify for full XSS protection
- Headers: CSP, X-Content-Type-Options: nosniff, X-Frame-Options: DENY

**Note**: `isomorphic-dompurify` is NOT compatible with Cloudflare Workers runtime - use basic regex-based sanitization on server, full DOMPurify on client.

**Metrics**: In-memory counter tracking total/successful/failed requests, rate-limited requests, average render time, uptime.

### Type Safety

- Strict TypeScript mode enabled
- No `any` types - use `unknown` + type guards for errors
- Interfaces for all request/response bodies
- Env interface for Cloudflare bindings

### Testing

Test files:
- `tests/unit/markdown.test.ts` - Sanitization, input validation
- `tests/unit/theme.test.ts` - Theme configuration (light/dark)
- `tests/unit/export.test.ts` - PDF export manager
- `tests/unit/performance.test.ts` - Performance metrics
- `tests/e2e/rendering.test.ts` - End-to-end rendering tests
- `tests/integration.test.ts` - Integration tests

Run with `npm run test` (watch) or `npm run test:run` (single pass).

### Constraints

- Max input: 50,000 characters
- Client-side PDF via html2pdf.js (no server PDF generation)
- Single-instance (in-memory rate limit storage)

### Known Issues

- Tests reference `truncateContent` function that doesn't exist in `markdown.ts`
- Tests import `createHtmlTemplate`, `getSystemTheme` functions that don't exist
- Performance metrics tests expect browser `window.performanceMetrics` API
- Some sanitization tests fail (iframe removal, javascript: URL handling)

### Recent Fixes (v3.0.0)

**PDF Export Blank Issue**:
- Root cause: html2canvas cannot render dark theme content properly
- Fix: Switched to browser native `window.print()` API
- Print window opens with clean white-background HTML
- User manually selects "Save as PDF" in print dialog

**CSP Headers**:
- Added `https://fonts.googleapis.com` to style-src
- Added `https://fonts.gstatic.com` to font-src
- Google Fonts now load correctly

**Print Styles**:
- Forced white background and black text in `@media print`
- All UI elements hidden (header, editor, controls)
- Preview content optimized for print readability

---

## Lessons from Related Projects

### From formal_photos (Cloudflare Workers):

**1. Cloudflare Workers Timeout Limit**:
- Free tier: 50ms, Paid tier: 30 seconds
- Any processing >10s should use async job + polling pattern
- This project: Keep rendering <1s, PDF generation is client-side (no timeout issue)

**2. CSP Headers Required**:
```typescript
// Required security headers
'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self'; worker-src blob:;"
'X-Content-Type-Options': 'nosniff'
'X-Frame-Options': 'DENY'
'X-XSS-Protection': '1; mode=block'
```

**3. External Resource Loading**:
- Google Fonts must be allowlisted in CSP (style-src + font-src)
- CDN scripts (marked.js, DOMPurify) must be in script-src
- Images: Allow data: and blob: for client-side generation

### From personal-wiki (Knowledge Management):

**4. Fail-Fast + Graceful Degradation**:
- Validate input at startup (env vars, config)
- Return degradation report rather than crash
- This project: 50k char limit validation, rate limiting

**5. Knowledge Reuse Loop**:
- Each query/export enriches the system
- This project: localStorage saves content, metrics track usage

### From video_intelligent_analyzer (Markdown Report Generation):

**6. Robust Output Handling**:
- Large markdown files (28KB+) need efficient streaming
- Mermaid diagrams require proper escaping
- This project: Handles 2958 words / 28KB content

**7. Print-First PDF Strategy**:
- Browser native print > html2pdf.js for complex content
- Clean HTML with explicit white background + black text
- Hide all UI elements in `@media print`
