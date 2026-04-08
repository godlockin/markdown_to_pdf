/**
 * E2E Tests for Markdown to PDF Worker
 * Tests the full pipeline: API -> Rendering -> Output
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { marked } from 'marked';

// Import actual source code
import { sanitizeMarkdown, renderMarkdown, validateInputLength, MAX_INPUT_LENGTH } from '../../src/utils/markdown';
import { renderPage } from '../../src/utils/templates';

describe('E2E: Markdown Rendering Pipeline', () => {
  describe('Basic Rendering', () => {
    it('should render simple markdown', () => {
      const markdown = '# Hello World';
      const result = renderMarkdown(markdown);
      expect(result).toContain('<h1>');
      expect(result).toContain('Hello World');
      expect(result).toContain('</h1>');
    });

    it('should render multiple elements', () => {
      const markdown = `# Title
## Subtitle
**Bold** and *italic*
- Item 1
- Item 2
`;
      const result = renderMarkdown(markdown);
      expect(result).toContain('<h1>');
      expect(result).toContain('<h2>');
      expect(result).toContain('<strong>');
      expect(result).toContain('<em>');
      expect(result).toContain('<ul>');
    });

    it('should render code blocks', () => {
      const markdown = '```typescript\nconst x = 1;\n```';
      const result = renderMarkdown(markdown);
      expect(result).toContain('<pre>');
      expect(result).toContain('language-typescript');
    });

    it('should render tables', () => {
      const markdown = `| A | B |
|---|---|
| 1 | 2 |`;
      const result = renderMarkdown(markdown);
      expect(result).toContain('<table>');
      expect(result).toContain('<thead>');
      expect(result).toContain('<tbody>');
    });
  });

  describe('Security Sanitization', () => {
    it('should remove script tags', () => {
      const malicious = '<script>alert("xss")</script>Content';
      const sanitized = sanitizeMarkdown(malicious);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
      expect(sanitized).toContain('Content');
    });

    it('should remove javascript: protocols', () => {
      const malicious = '[Click](javascript:alert(1))';
      const sanitized = sanitizeMarkdown(malicious);
      expect(sanitized).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const malicious = '<div onclick="evil()">Test</div>';
      const sanitized = sanitizeMarkdown(malicious);
      expect(sanitized.toLowerCase()).not.toContain('onclick');
    });

    it('should handle case variations', () => {
      const attacks = [
        '<SCRIPT>alert(1)</SCRIPT>',
        '<ScRiPt>alert(2)</sCrIpT>',
        '<script  >alert(3)</script>',
      ];
      attacks.forEach(attack => {
        const sanitized = sanitizeMarkdown(attack);
        expect(sanitized.toLowerCase()).not.toContain('<script');
      });
    });

    it('should preserve safe HTML after sanitization', () => {
      const safe = `# Safe Content
<p>Normal paragraph</p>
**Bold text**
`;
      const sanitized = sanitizeMarkdown(safe);
      expect(sanitized).toContain('# Safe Content');
      expect(sanitized).toContain('Normal paragraph');
    });
  });

  describe('Input Validation', () => {
    it('should accept content under limit', () => {
      const content = 'a'.repeat(MAX_INPUT_LENGTH);
      const result = validateInputLength(content);
      expect(result.valid).toBe(true);
    });

    it('should reject content over limit', () => {
      const content = 'a'.repeat(MAX_INPUT_LENGTH + 1);
      const result = validateInputLength(content);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('exceeds limit');
    });

    it('should accept empty content', () => {
      const result = validateInputLength('');
      expect(result.valid).toBe(true);
    });

    it('should accept whitespace content', () => {
      const result = validateInputLength('   \n\t  ');
      expect(result.valid).toBe(true);
    });
  });

  describe('Full Pipeline: Markdown to HTML Page', () => {
    it('should generate complete HTML page', () => {
      const markdown = '# Test Document\n\nContent here.';
      const title = 'Test Page';
      const html = renderPage(title, markdown);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain(title);
      expect(html).toContain('<textarea id="editor"');
      expect(html).toContain('<div id="preview"');
    });

    it('should include required CDN scripts', () => {
      const html = renderPage('Test', '');
      expect(html).toContain('marked.min.js');
      expect(html).toContain('dompurify');
      expect(html).toContain('html2pdf');
    });

    it('should include CSS styles', () => {
      const html = renderPage('Test', '');
      expect(html).toContain('<style>');
      expect(html).toContain('--bg-primary');
      expect(html).toContain('--accent-primary');
    });

    it('should include interactive JavaScript', () => {
      const html = renderPage('Test', '');
      expect(html).toContain('const debounce');
      expect(html).toContain('const exportPDF');
      expect(html).toContain('DOMContentLoaded');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty markdown', () => {
      const result = renderMarkdown('');
      expect(result).toBeDefined();
    });

    it('should handle very long single line', () => {
      const markdown = 'a'.repeat(10000);
      const result = renderMarkdown(markdown);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle special characters', () => {
      const markdown = '中文 & 日本語 & 한국어 & <>&"';
      const result = renderMarkdown(markdown);
      expect(result).toBeDefined();
    });

    it('should handle mixed scripts', () => {
      const markdown = `
# English
## 中文标题
### 日本語タイトル
Content in multiple languages.
`;
      const result = renderMarkdown(markdown);
      expect(result).toContain('English');
      expect(result).toContain('中文');
      expect(result).toContain('日本語');
    });
  });

  describe('Performance', () => {
    it('should render large document under 100ms', () => {
      const largeMarkdown = '# Large Doc\n\n' + 'a'.repeat(40000);
      const start = performance.now();
      renderMarkdown(sanitizeMarkdown(largeMarkdown));
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should sanitize large document under 50ms', () => {
      const largeContent = 'x'.repeat(40000);
      const start = performance.now();
      sanitizeMarkdown(largeContent);
      const duration = performance.now() - start;
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should render game report format', () => {
      const markdown = `# Dreams & Disruptions

## 模拟情景报告

**议题**: AI 与未来工作

### 玩家档案

| 玩家 | 职业 | 年龄 |
|------|------|------|
| 特朗普 | 政治家 | 70+ |
| 马斯克 | 企业家 | 50+ |

**核心观点**:
- 技术革新
- 社会变革
`;
      const result = renderMarkdown(markdown);
      expect(result).toContain('<h1>');
      expect(result).toContain('<table>');
      expect(result).toContain('<ul>');
    });

    it('should render technical documentation', () => {
      const markdown = `# API Documentation

## Usage

\`\`\`typescript
const client = new APIClient();
await client.connect();
\`\`\`

### Response Format

\`JSON\` object with:
- \`status\`: string
- \`data\`: object
`;
      const result = renderMarkdown(markdown);
      expect(result).toContain('<h1>');
      expect(result).toContain('<pre>');
      expect(result).toContain('<code>');
    });
  });
});
