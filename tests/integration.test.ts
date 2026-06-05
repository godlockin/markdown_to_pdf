import { sanitizeMarkdown, renderMarkdown, validateInputLength } from '../src/utils/markdown';
import { renderPage } from '../src/utils/templates';

describe('Integration Tests', () => {
  describe('Full Markdown Pipeline', () => {
    it('should sanitize and render complete markdown', () => {
      const rawMarkdown = `# Test Document

## Section 1

This is a paragraph with **bold** and *italic* text.

\`\`\`javascript
console.log('Hello');
\`\`\`

- Item 1
- Item 2
- Item 3

| Column A | Column B |
|----------|----------|
| Cell 1   | Cell 2   |
`;
      
      const sanitized = sanitizeMarkdown(rawMarkdown);
      expect(sanitized).toContain('# Test Document');
      expect(sanitized).toContain('## Section 1');
      expect(sanitized).not.toContain('<script');
    });

    it('should handle XSS attempts in markdown', () => {
      const maliciousMarkdown = `# Hacked

<script>alert('xss')</script>

[Click me](javascript:alert('xss'))

<img src="x" onerror="alert('xss')">

<div onclick="alert('xss')">Click</div>
`;
      
      const sanitized = sanitizeMarkdown(maliciousMarkdown);
      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).not.toContain('onerror');
      expect(sanitized).not.toContain('onclick');
    });

    it('should handle edge cases gracefully', () => {
      const edgeCases = [
        '',
        ' ',
        '\n',
        '#',
        'a'.repeat(10000),
        '```\n'.repeat(100),
        '|'.repeat(1000),
      ];

      edgeCases.forEach(input => {
        expect(() => sanitizeMarkdown(input)).not.toThrow();
        expect(() => validateInputLength(input)).not.toThrow();
      });
    });
  });

  describe('Template Generation', () => {
    it('should create valid HTML template', () => {
      const template = renderPage('Test', '<h1>Hello</h1>');

      expect(template).toContain('<!DOCTYPE html>');
      expect(template).toContain('<html');
      expect(template).toContain('Test');
      expect(template).toContain('<h1>Hello</h1>');
      expect(template).toContain('</html>');
    });

    it('should include required scripts in template', () => {
      const template = renderPage('Test', '');
      
      expect(template).toContain('marked.min.js');
      expect(template).toContain('dompurify');
    });

    it('should include CSS variables', () => {
      const template = renderPage('Test', '');
      
      expect(template).toContain('--accent');
      expect(template).toContain('--bg-elevated');
      expect(template).toContain('--fg');
    });
  });

  describe('Content Length Validation', () => {
    it('should validate various content lengths', () => {
      const testCases = [
        { length: 0, valid: true },
        { length: 1, valid: true },
        { length: 49999, valid: true },
        { length: 50000, valid: true },
        { length: 50001, valid: false },
        { length: 100000, valid: false },
      ];

      testCases.forEach(({ length, valid }) => {
        const content = 'a'.repeat(length);
        const result = validateInputLength(content);
        expect(result.valid).toBe(valid);
      });
    });
  });

  describe('Performance', () => {
    it('should sanitize large content efficiently', () => {
      const largeContent = 'a'.repeat(50000);
      const start = performance.now();
      sanitizeMarkdown(largeContent);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(100);
    });

    it('should validate input quickly', () => {
      const content = 'a'.repeat(50000);
      const start = performance.now();
      validateInputLength(content);
      const duration = performance.now() - start;
      
      expect(duration).toBeLessThan(10);
    });
  });
});

describe('Security Tests', () => {
  it('should block all script injection attempts', () => {
    const attacks = [
      '<script>alert(1)</script>',
      '<ScRiPt>alert(2)</sCrIpT>',
      '<script    >alert(3)</script>',
      '<script src="evil.js"></script>',
    ];

    attacks.forEach(attack => {
      const result = sanitizeMarkdown(attack);
      expect(result).not.toContain('<script');
    });
  });

  it('should block event handlers', () => {
    const events = [
      'onclick',
      'onload',
      'onerror',
      'onmouseover',
      'ONCLICK',
    ];

    events.forEach(event => {
      const input = `<div ${event}="alert(1)">Test</div>`;
      const result = sanitizeMarkdown(input);
      expect(result.toLowerCase()).not.toContain(event.toLowerCase());
    });
  });

  it('should block data URLs in href', () => {
    const input = '<a href="data:text/html,<script>alert(1)</script>">Link</a>';
    const result = sanitizeMarkdown(input);
    expect(result).toContain('href="#"');
  });
});
