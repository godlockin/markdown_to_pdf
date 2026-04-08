import { performance } from 'perf_hooks';
import { vi } from 'vitest';

beforeEach(() => {
  if (typeof global.performance === 'undefined') {
    (global as any).performance = {
      now: () => Date.now(),
      memory: {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0
      }
    };
  }
});

afterEach(() => {
  vi.clearAllMocks();
});

global.localStorage = {
  store: {} as Record<string, string>,
  getItem(key: string): string | null {
    return this.store[key] || null;
  },
  setItem(key: string, value: string): void {
    this.store[key] = value;
  },
  removeItem(key: string): void {
    delete this.store[key];
  },
  clear(): void {
    this.store = {};
  }
};
