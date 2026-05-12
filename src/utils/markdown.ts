import { marked } from 'marked';

export const MAX_INPUT_LENGTH = 50000;

export function validateInputLength(content: string): { valid: boolean; message?: string } {
  if (content.length > MAX_INPUT_LENGTH) {
    return {
      valid: false,
      message: 'Content length exceeds limit (max ' + MAX_INPUT_LENGTH + ' chars)'
    };
  }
  return { valid: true };
}

export function sanitizeMarkdown(markdown: string): string {
  let sanitized = markdown.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '#');
  sanitized = sanitized.replace(/on\w+\s*=\s*"[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*'[^']*'/gi, '');
  sanitized = sanitized.replace(/href\s*=\s*"data:[^"]*"/gi, 'href="#"');
  return sanitized;
}

export function renderMarkdown(markdown: string): string {
  try {
    const rawHtml = marked.parse(markdown) as string;
    // Client-side DOMPurify will handle full sanitization
    return rawHtml;
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return '<div class="error">Rendering failed</div>';
  }
}
