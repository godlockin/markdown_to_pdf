import { performance } from 'perf_hooks';

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
  jest.clearAllMocks();
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
