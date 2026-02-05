import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

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
  // Add server-side specific sanitization if needed, 
  // but DOMPurify is usually enough.
  return markdown;
}

export function renderMarkdown(markdown: string): string {
  try {
    const rawHtml = marked.parse(markdown) as string;
    return DOMPurify.sanitize(rawHtml);
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return '<div class="error">Rendering failed</div>';
  }
}
