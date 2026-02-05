import { themeConfig, Theme, getSystemTheme } from '../../src/utils/markdown';

describe('Theme System', () => {
  describe('Theme Configuration', () => {
    it('should have light theme defined', () => {
      expect(themeConfig.light).toBeDefined();
      expect(themeConfig.light['--color-primary']).toBeDefined();
      expect(themeConfig.light['--color-bg']).toBeDefined();
      expect(themeConfig.light['--color-text']).toBeDefined();
    });

    it('should have dark theme defined', () => {
      expect(themeConfig.dark).toBeDefined();
      expect(themeConfig.dark['--color-primary']).toBeDefined();
      expect(themeConfig.dark['--color-bg']).toBeDefined();
      expect(themeConfig.dark['--color-text']).toBeDefined();
    });

    it('should have different values for light and dark themes', () => {
      expect(themeConfig.light['--color-bg']).not.toBe(themeConfig.dark['--color-bg']);
      expect(themeConfig.light['--color-text']).not.toBe(themeConfig.dark['--color-text']);
    });

    it('should have required CSS properties in each theme', () => {
      const required = ['--color-primary', '--color-bg', '--color-surface', '--color-text', '--color-border'];
      
      required.forEach(prop => {
        expect(themeConfig.light[prop]).toBeDefined();
        expect(themeConfig.dark[prop]).toBeDefined();
      });
    });
  });

  describe('Theme Types', () => {
    it('should accept valid theme values', () => {
      const validThemes: Theme[] = ['light', 'dark', 'system'];
      validThemes.forEach(theme => {
        expect(['light', 'dark', 'system'].includes(theme)).toBe(true);
      });
    });
  });

  describe('System Theme Detection', () => {
    it('should return a valid theme string', () => {
      const systemTheme = getSystemTheme();
      expect(['light', 'dark'].includes(systemTheme)).toBe(true);
    });
  });
});

describe('Theme Persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should save theme preference to localStorage', () => {
    localStorage.setItem('theme_preference', 'dark');
    const saved = localStorage.getItem('theme_preference');
    expect(saved).toBe('dark');
  });

  it('should load theme preference from localStorage', () => {
    localStorage.setItem('theme_preference', 'light');
    const saved = localStorage.getItem('theme_preference');
    expect(saved).toBe('light');
  });

  it('should handle missing theme preference', () => {
    const saved = localStorage.getItem('theme_preference');
    expect(saved).toBeNull();
  });

  it('should save system theme preference', () => {
    localStorage.setItem('theme_preference', 'system');
    const saved = localStorage.getItem('theme_preference');
    expect(saved).toBe('system');
  });
});
