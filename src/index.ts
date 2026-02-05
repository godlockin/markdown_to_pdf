import { sanitizeMarkdown, renderMarkdown, createHtmlTemplate, Theme, loadTheme, MAX_INPUT_LENGTH, validateInputLength } from './utils/markdown';

interface Env {
  MARKDOWN_CONTENT?: string;
}

interface RequestBody {
  markdown?: unknown;
  theme?: Theme;
}

const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_CACHE_SIZE = 1000;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function cleanupOldEntries(): void {
  const now = Date.now();
  if (rateLimitMap.size <= MAX_CACHE_SIZE) return;
  
  const entriesToDelete: string[] = [];
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      entriesToDelete.push(key);
    }
  }
  
  for (const key of entriesToDelete) {
    rateLimitMap.delete(key);
  }
  
  if (rateLimitMap.size > MAX_CACHE_SIZE) {
    const sortedEntries = Array.from(rateLimitMap.entries())
      .sort(([, a], [, b]) => a.resetTime - b.resetTime);
      
    const toDelete = sortedEntries.slice(0, rateLimitMap.size - MAX_CACHE_SIZE);
    for (const [key] of toDelete) {
      rateLimitMap.delete(key);
    }
  }
}

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    cleanupOldEntries();
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}

const METRICS = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  rateLimitedRequests: 0,
  totalRenderTime: 0,
  averageRenderTime: 0,
  startTime: Date.now()
};

function recordRequest(success: boolean, renderTime?: number): void {
  METRICS.totalRequests++;
  if (success) {
    METRICS.successfulRequests++;
    if (renderTime !== undefined) {
      METRICS.totalRenderTime += renderTime;
      METRICS.averageRenderTime = METRICS.totalRenderTime / METRICS.successfulRequests;
    }
  } else {
    METRICS.failedRequests++;
  }
}

function getMetrics(): Record<string, number | string> {
  const uptime = Date.now() - METRICS.startTime;
  return {
    totalRequests: METRICS.totalRequests,
    successfulRequests: METRICS.successfulRequests,
    failedRequests: METRICS.failedRequests,
    rateLimitedRequests: METRICS.rateLimitedRequests,
    averageRenderTime: METRICS.averageRenderTime.toFixed(2) + 'ms',
    uptime: Math.floor(uptime / 1000) + 's',
    activeRateLimitEntries: rateLimitMap.size
  };
}

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const securityHeaders = {
      ...corsHeaders,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
    };

    if (path === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy', 
        timestamp: Date.now(),
        version: '3.0.0'
      }), {
        headers: { ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (path === '/api/metrics') {
      return new Response(JSON.stringify({
        status: 'ok',
        metrics: getMetrics(),
        timestamp: Date.now()
      }), {
        headers: { ...securityHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (path === '/api/render') {
      if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }), {
          status: 405,
          headers: { ...securityHeaders, 'Content-Type': 'application/json' }
        });
      }

      const clientIP = getClientIP(request);
      if (!checkRateLimit(clientIP)) {
        METRICS.rateLimitedRequests++;
        return new Response(JSON.stringify({ error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED', retryAfter: 60, retryIn: 60 }), {
          status: 429,
          headers: { ...securityHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' }
        });
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

        if (typeof body.markdown !== 'string') {
          return new Response(JSON.stringify({
            error: 'Invalid request body',
            code: 'INVALID_REQUEST',
            details: 'markdown field is required and must be a string'
          }), {
            status: 400,
            headers: { ...securityHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (body.markdown.length > MAX_INPUT_LENGTH) {
          return new Response(JSON.stringify({
            error: 'Content too long',
            code: 'CONTENT_TOO_LONG',
            details: 'Markdown content must be less than ' + MAX_INPUT_LENGTH.toLocaleString() + ' characters'
          }), {
            status: 400,
            headers: { ...securityHeaders, 'Content-Type': 'application/json' }
          });
        }

        const validation = validateInputLength(body.markdown);
        if (!validation.valid) {
          return new Response(JSON.stringify({
            error: 'Content validation failed',
            code: 'VALIDATION_ERROR',
            details: validation.message
          }), {
            status: 400,
            headers: { ...securityHeaders, 'Content-Type': 'application/json' }
          });
        }

        const renderStart = Date.now();
        const sanitizedMarkdown = sanitizeMarkdown(body.markdown);
        const html = renderMarkdown(sanitizedMarkdown);
        const renderTime = Date.now() - renderStart;

        recordRequest(true, renderTime);

        return new Response(JSON.stringify({
          html,
          success: true,
          renderedAt: Date.now(),
          renderTime: renderTime + 'ms',
          contentLength: body.markdown.length
        }), {
          headers: { ...securityHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('API Error:', error);
        recordRequest(false);
        return new Response(JSON.stringify({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred while processing your request'
        }), {
          status: 500,
          headers: { ...securityHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (path === '/api/theme') {
      if (request.method === 'GET') {
        const theme = loadTheme();
        return new Response(JSON.stringify({ theme }), {
          headers: { ...securityHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      if (request.method === 'POST') {
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

          const theme = body.theme as Theme;
          if (['light', 'dark', 'system'].includes(theme)) {
            return new Response(JSON.stringify({ 
              success: true, 
              theme,
              applied: true 
            }), {
              headers: { ...securityHeaders, 'Content-Type': 'application/json' }
            });
          }
          return new Response(JSON.stringify({ 
            error: 'Invalid theme', 
            code: 'INVALID_THEME',
            validThemes: ['light', 'dark', 'system']
          }), {
            status: 400,
            headers: { ...securityHeaders, 'Content-Type': 'application/json' }
          });
        } catch {
          return new Response(JSON.stringify({ 
            error: 'Invalid request body',
            code: 'INVALID_REQUEST'
          }), {
            status: 400,
            headers: { ...securityHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    if (path === '/' || path === '/index.html') {
      const title = 'Markdown to PDF Converter';
      const content = '';
      const html = createHtmlTemplate(title, content);
      return new Response(html, {
        headers: { ...securityHeaders, 'Content-Type': 'text/html' }
      });
    }

    if (path.startsWith('/view/')) {
      try {
        const encodedMarkdown = decodeURIComponent(url.searchParams.get('data') || '');
        
        if (!encodedMarkdown) {
          return new Response(createHtmlTemplate('Error', '<div class="error-container"><h1>No Content</h1><p>No content provided for this view.</p></div>'), {
            status: 400,
            headers: { ...securityHeaders, 'Content-Type': 'text/html' }
          });
        }
        
        const sanitizedMarkdown = sanitizeMarkdown(encodedMarkdown);
        const html = renderMarkdown(sanitizedMarkdown);
        const pageHtml = createHtmlTemplate('Markdown Preview', html);
        return new Response(pageHtml, {
          headers: { ...securityHeaders, 'Content-Type': 'text/html' }
        });
      } catch {
        return new Response(createHtmlTemplate('Error', '<div class="error-container"><h1>Invalid Content</h1><p>Unable to decode the provided markdown content.</p></div>'), {
          status: 400,
          headers: { ...securityHeaders, 'Content-Type': 'text/html' }
        });
      }
    }

    if (path.startsWith('/static/')) {
      return new Response('Static content not found', {
        status: 404,
        headers: { ...securityHeaders, 'Content-Type': 'text/plain' }
      });
    }

    return new Response(createHtmlTemplate('404 - Page Not Found', '<div class="error-container"><h1>404</h1><p>The page you are looking for does not exist.</p></div>'), {
      status: 404,
      headers: { ...securityHeaders, 'Content-Type': 'text/html' }
    });
  }
};

export = worker;
