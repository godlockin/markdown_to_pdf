const METRICS = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  rateLimitedRequests: 0,
  totalRenderTime: 0,
  averageRenderTime: 0,
  startTime: Date.now()
};

export function recordRequest(success: boolean, renderTime?: number): void {
  METRICS.totalRequests++;
  if (success) {
    METRICS.successfulRequests++;
    if (renderTime !== undefined) {
      METRICS.totalRenderTime += renderTime;
      METRICS.averageRenderTime = METRICS.totalRenderTime / METRICS.successfulRequests;
    }
  } else {
    METRICS.failedRequests++;
  }
}

export function incrementRateLimited(): void {
  METRICS.rateLimitedRequests++;
}

export function getMetrics(): Record<string, number | string> {
  const uptime = Date.now() - METRICS.startTime;
  return {
    totalRequests: METRICS.totalRequests,
    successfulRequests: METRICS.successfulRequests,
    failedRequests: METRICS.failedRequests,
    rateLimitedRequests: METRICS.rateLimitedRequests,
    averageRenderTime: METRICS.averageRenderTime.toFixed(2) + 'ms',
    uptime: Math.floor(uptime / 1000) + 's',
  };
}
