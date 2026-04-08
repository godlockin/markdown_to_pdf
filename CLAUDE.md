# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start local dev server (Wrangler)
npm run build            # Type check only (noEmit)
npm run serve            # Run standalone server for testing
npm run test             # Run tests (Vitest)
npm run test:run         # Run tests once
npm run deploy           # Deploy to Cloudflare
```

## Architecture Overview

**Cloudflare Worker** - Server-side Markdown rendering with REST API.

### Core Structure

```
src/
  index.ts          # Worker entry: request routing, rate limiting, metrics
  utils/
    markdown.ts     # Sanitization (DOMPurify), rendering (marked), validation
    templates.ts    # HTML template generator with CSS/JS embedded
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

**Rate Limiting**: In-memory map with 60s windows, 100 req/min per IP. Auto-cleanup when cache exceeds 1000 entries.

**Security**: Server-side basic sanitization (script/event handler removal), client-side DOMPurify for full XSS protection. CSP headers, nosniff, Frame/DENY. All external calls (CDN scripts) explicitly allowlisted.

**Note**: `isomorphic-dompurify` is NOT compatible with Cloudflare Workers runtime - use basic regex-based sanitization on server, full DOMPurify on client.

**Metrics**: Global counter tracking total/successful/failed requests, average render time, uptime.

### Type Safety

- Strict TypeScript mode enabled
- No `any` types - use `unknown` + type guards for errors
- Interfaces for all request/response bodies
- Env interface for Cloudflare bindings

### Testing

Tests cover sanitization, input validation, XSS blocking, template generation, and performance. Run with `npm run test`.

### Constraints

- Max input: 50,000 characters
- Client-side PDF via html2pdf.js (no server PDF generation)
- Single-instance (in-memory rate limit storage)
