import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { API_URL, MAX_MARKDOWN_LENGTH } from './constants.js';

const API_KEY = process.env.MARKDOWN_RENDER_API_KEY || '';

interface RenderResponse { html: string; success: boolean; renderedAt: number; renderTime: string; contentLength: number; [key: string]: unknown; }
interface ApiError { error: string; code: string; }

async function render(markdown: string): Promise<RenderResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['X-API-Key'] = API_KEY;
  const res = await fetch(API_URL, { method: 'POST', headers, body: JSON.stringify({ markdown }) });
  const data = await res.json() as RenderResponse | ApiError;
  if (!res.ok) { const e = data as ApiError; throw new Error('API error: ' + e.error + ' (' + e.code + ')'); }
  return data as RenderResponse;
}

const server = new McpServer({ name: 'markdown-renderer-mcp-server', version: '1.1.0' });
server.registerTool('render_markdown', {
  title: 'Render Markdown to HTML',
  description: 'Render markdown to sanitized HTML via Cloudflare Worker API.',
  inputSchema: z.object({ markdown: z.string().min(1).max(MAX_MARKDOWN_LENGTH).describe('The markdown text to render') }).strict(),
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
}, async ({ markdown }) => {
  try {
    const r = await render(markdown);
    return { content: [{ type: 'text', text: r.html }], structuredContent: r };
  } catch (e) {
    return { content: [{ type: 'text', text: 'Error: ' + (e instanceof Error ? e.message : String(e)) }] };
  }
});
async function main() { await server.connect(new StdioServerTransport()); }
main().catch((e: unknown) => { console.error('Fatal:', e); process.exit(1); });
