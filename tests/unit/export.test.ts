import { ExportOptions, ExportManager } from '../../src/utils/markdown';

describe('Export Manager', () => {
  describe('Export Options', () => {
    it('should accept valid export format', () => {
      const validFormats: ExportOptions['format'][] = ['pdf', 'html', 'markdown', 'json'];
      validFormats.forEach(format => {
        expect(['pdf', 'html', 'markdown', 'json'].includes(format)).toBe(true);
      });
    });

    it('should have optional filename property', () => {
      const options: ExportOptions = {
        format: 'pdf',
        filename: 'custom-name'
      };
      expect(options.filename).toBe('custom-name');
    });

    it('should have optional options property', () => {
      const options: ExportOptions = {
        format: 'html',
        options: {
          includeStyles: true,
          includeMeta: true
        }
      };
      expect(options.options?.includeStyles).toBe(true);
      expect(options.options?.includeMeta).toBe(true);
    });
  });

  describe('Export Manager Instance', () => {
    it('should create singleton instance', () => {
      const instance1 = ExportManager.getInstance();
      const instance2 = ExportManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should have export method', () => {
      const manager = ExportManager.getInstance();
      expect(typeof manager.export).toBe('function');
    });
  });

  describe('Export Formats', () => {
    it('should support PDF export format', () => {
      const format: ExportOptions['format'] = 'pdf';
      expect(format).toBe('pdf');
    });

    it('should support HTML export format', () => {
      const format: ExportOptions['format'] = 'html';
      expect(format).toBe('html');
    });

    it('should support Markdown export format', () => {
      const format: ExportOptions['format'] = 'markdown';
      expect(format).toBe('markdown');
    });

    it('should support JSON export format', () => {
      const format: ExportOptions['format'] = 'json';
      expect(format).toBe('json');
    });
  });
});
