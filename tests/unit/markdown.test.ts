import { sanitizeMarkdown, validateInputLength } from '../../src/utils/markdown';

describe('Sanitize Markdown', () => {
  it('should remove script tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    const result = sanitizeMarkdown(input);
    expect(result).not.toContain('<script');
    expect(result).toContain('Hello');
  });

  it('should remove iframe tags', () => {
    const input = '<iframe src="evil.com"></iframe>Content';
    const result = sanitizeMarkdown(input);
    expect(result).not.toContain('<iframe');
    expect(result).toContain('Content');
  });

  it('should remove event handlers', () => {
    const input = '<div onclick="alert(1)">Test</div>';
    const result = sanitizeMarkdown(input);
    expect(result).not.toContain('onclick');
    expect(result).toContain('Test');
  });

  it('should allow safe HTML tags', () => {
    const input = '<h1>Title</h1><p>Paragraph</p><strong>Bold</strong>';
    const result = sanitizeMarkdown(input);
    expect(result).toContain('<h1>');
    expect(result).toContain('<p>');
    expect(result).toContain('<strong>');
  });

  it('should sanitize javascript: protocol', () => {
    const input = '<a href="javascript:alert(1)">Link</a>';
    const result = sanitizeMarkdown(input);
    expect(result).not.toContain('javascript:');
    expect(result).toContain('Link');
  });

  it('should handle single-quoted event handlers', () => {
    const input = "<div onclick='alert(1)'>Test</div>";
    const result = sanitizeMarkdown(input);
    expect(result).not.toContain('onclick');
    expect(result).toContain('Test');
  });

  it('should sanitize data: URIs in href', () => {
    const input = '<a href="data:text/html,<script>alert(1)</script>">Link</a>';
    const result = sanitizeMarkdown(input);
    expect(result).toContain('href="#"');
    expect(result).toContain('Link');
  });

  it('should remove javascript: protocol', () => {
    const input = 'javascript:alert("xss")';
    const result = sanitizeMarkdown(input);
    expect(result).not.toContain('javascript:');
  });

  it('should handle empty input', () => {
    const input = '';
    const result = sanitizeMarkdown(input);
    expect(result).toBe('');
  });

  it('should handle long content without errors', () => {
    const input = 'a'.repeat(10000);
    const result = sanitizeMarkdown(input);
    expect(result.length).toBe(10000);
  });
});

describe('Input Validation', () => {
  it('should pass valid input length', () => {
    const content = 'a'.repeat(1000);
    const result = validateInputLength(content);
    expect(result.valid).toBe(true);
  });

  it('should reject input exceeding max length', () => {
    const content = 'a'.repeat(50001);
    const result = validateInputLength(content);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('50000');
  });

  it('should reject input at exact max length', () => {
    const content = 'a'.repeat(50000);
    const result = validateInputLength(content);
    expect(result.valid).toBe(true);
  });

});
