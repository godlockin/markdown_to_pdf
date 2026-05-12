import { sanitizeMarkdown, renderMarkdown, MAX_INPUT_LENGTH, validateInputLength } from './utils/markdown';
import { renderPage } from './utils/templates';
import { checkRateLimit, getClientIP } from './utils/rate-limit';
import { recordRequest, incrementRateLimited, getMetrics } from './utils/metrics';

interface Env {
  MARKDOWN_CONTENT?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_SITE_KEY?: string;
  API_KEY?: string;
}

interface RequestBody {
  markdown?: unknown;
  turnstileToken?: unknown;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
};

const securityHeaders = {
  ...corsHeaders,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; worker-src blob:;",
};

function jsonResponse(body: Record<string, unknown>, status: number, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...securityHeaders, 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function handleHealth(): Response {
  return jsonResponse({ status: 'healthy', timestamp: Date.now(), version: '3.0.0' }, 200);
}

function handleMetrics(): Response {
  return jsonResponse({ status: 'ok', metrics: getMetrics(), timestamp: Date.now() }, 200);
}

async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token }),
  });
  const data = await res.json() as { success: boolean };
  return data.success === true;
}

async function handleRender(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }, 405);
  }

  const clientIP = getClientIP(request);
  if (!checkRateLimit(clientIP)) {
    incrementRateLimited();
    return jsonResponse(
      { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED', retryAfter: 60 },
      429,
      { 'Retry-After': '60' }
    );
  }

  try {
    let body: RequestBody = {};
    const contentType = request.headers.get('Content-Type');

    if (contentType?.includes('application/json')) {
      try {
        body = await request.json() as RequestBody;
      } catch {
        body = {};
      }
    }

    // API Key takes priority (programmatic access)
    const apiKey = request.headers.get('X-API-Key');
    const hasApiKey = env.API_KEY && apiKey === env.API_KEY;

    if (!hasApiKey && env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SITE_KEY) {
      if (typeof body.turnstileToken !== 'string') {
        return jsonResponse({ error: 'Turnstile verification required', code: 'TURNSTILE_REQUIRED', siteKey: env.TURNSTILE_SITE_KEY }, 401);
      }
      const valid = await verifyTurnstile(body.turnstileToken, env.TURNSTILE_SECRET_KEY);
      if (!valid) {
        return jsonResponse({ error: 'Turnstile verification failed', code: 'TURNSTILE_INVALID' }, 401);
      }
    }

    if (typeof body.markdown !== 'string') {
      return jsonResponse(
        { error: 'Invalid request body', code: 'INVALID_REQUEST', details: 'markdown field is required and must be a string' },
        400
      );
    }

    if (body.markdown.length > MAX_INPUT_LENGTH) {
      return jsonResponse(
        { error: 'Content too long', code: 'CONTENT_TOO_LONG', details: 'Markdown content must be less than ' + MAX_INPUT_LENGTH.toLocaleString() + ' characters' },
        400
      );
    }

    const validation = validateInputLength(body.markdown);
    if (!validation.valid) {
      return jsonResponse(
        { error: 'Content validation failed', code: 'VALIDATION_ERROR', details: validation.message },
        400
      );
    }

    const renderStart = Date.now();
    const sanitizedMarkdown = sanitizeMarkdown(body.markdown);
    const html = renderMarkdown(sanitizedMarkdown);
    const renderTime = Date.now() - renderStart;

    recordRequest(true, renderTime);

    return jsonResponse({
      html,
      success: true,
      renderedAt: Date.now(),
      renderTime: renderTime + 'ms',
      contentLength: body.markdown.length,
    }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('API Error:', { message, code: 'INTERNAL_ERROR' });
    recordRequest(false);
    return jsonResponse(
      { error: 'Internal server error', code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      500
    );
  }
}

function handleView(url: URL): Response {
  try {
    const markdown = decodeURIComponent(url.searchParams.get('data') || '');
    if (!markdown) {
      return new Response(renderPage('Error', '# No Content\nNo content provided for this view.'), {
        status: 400,
        headers: { ...securityHeaders, 'Content-Type': 'text/html' },
      });
    }
    const sanitized = sanitizeMarkdown(markdown);
    const html = renderPage('Markdown Preview', sanitized);
    return new Response(html, { headers: { ...securityHeaders, 'Content-Type': 'text/html' } });
  } catch {
    return new Response(renderPage('Error', '# Invalid Content\nUnable to decode key content.'), {
      status: 400,
      headers: { ...securityHeaders, 'Content-Type': 'text/html' },
    });
  }
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (path === '/api/health') return handleHealth();
    if (path === '/api/metrics') return handleMetrics();
    if (path === '/api/render') return handleRender(request, env);
    if (path === '/' || path === '/index.html') {
      return new Response(renderPage('Mercury - Markdown to PDF', '', env.TURNSTILE_SITE_KEY), {
        headers: { ...securityHeaders, 'Content-Type': 'text/html' },
      });
    }
    if (path.startsWith('/view/')) return handleView(url);
    if (path.startsWith('/static/')) {
      return new Response('Static content not found', {
        status: 404,
        headers: { ...securityHeaders, 'Content-Type': 'text/plain' },
      });
    }

    return new Response(renderPage('404 - Page Not Found', '# 404\nThe page you are looking for does not exist.'), {
      status: 404,
      headers: { ...securityHeaders, 'Content-Type': 'text/html' },
    });
  }
};

export default worker;
