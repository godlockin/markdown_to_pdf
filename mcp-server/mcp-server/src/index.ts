#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { API_URL, MAX_MARKDOWN_LENGTH, TOKEN_URL } from './constants.js';

const TURNSTILE_TOKEN = process.env.TURNSTILE_TOKEN || '';

const RenderInputSchema = z.object({
  markdown: z.string().min(1).max(MAX_MARKDOWN_LENGTH).describe('Markdown text to render'),
}).strict();

interface RenderResponse {
  html: string; success: boolean; renderedAt: number;
  renderTime: string; contentLength: number; [key: string]: unknown;
}
interface ApiError { error: string; code: string; siteKey?: string; }

async function render(markdown: string): Promise<RenderResponse> {
  const body: Record<string, unknown> = { markdown };
  if (TURNSTILE_TOKEN) (body as any).turnstileToken = TURNSTILE_TOKEN;
  const res = await fetch(API_URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json() as RenderResponse | ApiError;
  if (!res.ok) {
    const err = data as ApiError;
    if (err.code === 'TURNSTILE_REQUIRED')
      throw new Error('Turnstile required. Visit ' + TOKEN_URL + ' to get a token, then set TURNSTILE_TOKEN env var.');
    if (err.code === 'TURNSTILE_INVALID')
      throw new Error('Turnstile token expired. Get a fresh one at ' + TOKEN_URL);
    if (err.code === 'RATE_LIMIT_EXCEEDED')
      throw new Error('Rate limit exceeded. Retry in 60s.');
    throw new Error('API error: ' + err.error + ' (' + err.code + ')');
  }
  return data as RenderResponse;
}

const server = new McpServer({ name: 'markdown-renderer-mcp-server', version: '1.1.0' });

server.registerTool('render_markdown', {
  title: 'Render Markdown to HTML',
  description: 'Render markdown to sanitized HTML via remote Worker (Turnstile-protected). Set TURNSTILE_TOKEN env var with a token from ' + TOKEN_URL + '. Returns clean HTML without CSS/JS wrapping.',
  inputSchema: RenderInputSchema,
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
}, async ({ markdown }) => {
  try {
    const result = await render(markdown);
    return { content: [{ type: 'text', text: result.html }], structuredContent: result };
  } catch (e) {
    return { content: [{ type: 'text', text: 'Error: ' + (e instanceof Error ? e.message : String(e)) }] };
  }
});

async function main() {
  const t = new StdioServerTransport();
  await server.connect(t);
}
main().catch((e: unknown) => { console.error('Fatal:', e); process.exit(1); });
