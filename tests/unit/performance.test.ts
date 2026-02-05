import { performanceMetrics, trackRenderPerformance } from '../../src/utils/markdown';

describe('Performance Metrics', () => {
  beforeEach(() => {
    performanceMetrics.reset();
  });

  describe('Metrics Initialization', () => {
    it('should have initial renderCount of 0', () => {
      expect(performanceMetrics.renderCount).toBe(0);
    });

    it('should have initial totalRenderTime of 0', () => {
      expect(performanceMetrics.totalRenderTime).toBe(0);
    });

    it('should have initial lastRenderTime of 0', () => {
      expect(performanceMetrics.lastRenderTime).toBe(0);
    });

    it('should have initial maxRenderTime of 0', () => {
      expect(performanceMetrics.maxRenderTime).toBe(0);
    });

    it('should have initial minRenderTime of Infinity', () => {
      expect(performanceMetrics.minRenderTime).toBe(Infinity);
    });

    it('should have initial memoryUsage of 0', () => {
      expect(performanceMetrics.memoryUsage).toBe(0);
    });
  });

  describe('Record Render', () => {
    it('should record render duration', () => {
      performanceMetrics.recordRender(10.5);
      expect(performanceMetrics.renderCount).toBe(1);
      expect(performanceMetrics.lastRenderTime).toBe(10.5);
    });

    it('should update total render time', () => {
      performanceMetrics.recordRender(10);
      performanceMetrics.recordRender(20);
      expect(performanceMetrics.totalRenderTime).toBe(30);
    });

    it('should update max render time', () => {
      performanceMetrics.recordRender(10);
      performanceMetrics.recordRender(50);
      performanceMetrics.recordRender(30);
      expect(performanceMetrics.maxRenderTime).toBe(50);
    });

    it('should update min render time', () => {
      performanceMetrics.recordRender(50);
      performanceMetrics.recordRender(10);
      performanceMetrics.recordRender(30);
      expect(performanceMetrics.minRenderTime).toBe(10);
    });

    it('should track multiple renders', () => {
      for (let i = 0; i < 10; i++) {
        performanceMetrics.recordRender(i * 10);
      }
      expect(performanceMetrics.renderCount).toBe(10);
      expect(performanceMetrics.totalRenderTime).toBe(450);
    });
  });

  describe('Average Render Time', () => {
    it('should calculate correct average', () => {
      performanceMetrics.recordRender(10);
      performanceMetrics.recordRender(20);
      performanceMetrics.recordRender(30);
      expect(performanceMetrics.getAverageRenderTime()).toBe(20);
    });

    it('should return 0 when no renders', () => {
      expect(performanceMetrics.getAverageRenderTime()).toBe(0);
    });
  });

  describe('Format Bytes', () => {
    it('should format bytes correctly', () => {
      expect(performanceMetrics.formatBytes(0)).toBe('0 B');
      expect(performanceMetrics.formatBytes(1024)).toBe('1 KB');
      expect(performanceMetrics.formatBytes(1024 * 1024)).toBe('1 MB');
      expect(performanceMetrics.formatBytes(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should format partial values', () => {
      expect(performanceMetrics.formatBytes(1500)).toBe('1.46 KB');
      expect(performanceMetrics.formatBytes(1500000)).toBe('1.43 MB');
    });
  });

  describe('Get Metrics', () => {
    it('should return all metrics', () => {
      performanceMetrics.recordRender(15);
      const metrics = performanceMetrics.getMetrics();
      
      expect(metrics.renderCount).toBe(1);
      expect(metrics.averageRenderTime).toBeDefined();
      expect(metrics.lastRenderTime).toBeDefined();
      expect(metrics.maxRenderTime).toBeDefined();
      expect(metrics.minRenderTime).toBeDefined();
      expect(metrics.memoryUsage).toBeDefined();
    });

    it('should reset metrics correctly', () => {
      performanceMetrics.recordRender(100);
      performanceMetrics.recordRender(200);
      performanceMetrics.reset();
      
      expect(performanceMetrics.renderCount).toBe(0);
      expect(performanceMetrics.totalRenderTime).toBe(0);
      expect(performanceMetrics.lastRenderTime).toBe(0);
      expect(performanceMetrics.maxRenderTime).toBe(0);
      expect(performanceMetrics.minRenderTime).toBe(Infinity);
    });
  });
});

describe('Track Render Performance', () => {
  it('should measure function execution time', () => {
    const start = performance.now();
    const result = trackRenderPerformance(() => {
      for (let i = 0; i < 10000; i++) { }
      return 'done';
    });
    const end = performance.now();
    
    expect(result).toBe('done');
    expect(performanceMetrics.renderCount).toBe(1);
    expect(performanceMetrics.lastRenderTime).toBeGreaterThanOrEqual(0);
  });

  it('should handle synchronous functions', () => {
    const result = trackRenderPerformance(() => 42);
    expect(result).toBe(42);
    expect(performanceMetrics.renderCount).toBe(1);
  });

  it('should handle functions with delays', () => {
    const start = performance.now();
    const result = trackRenderPerformance(() => {
      const start = Date.now();
      while (Date.now() - start < 50) { }
      return 'completed';
    });
    
    expect(result).toBe('completed');
    expect(performanceMetrics.lastRenderTime).toBeGreaterThanOrEqual(40);
  });
});
