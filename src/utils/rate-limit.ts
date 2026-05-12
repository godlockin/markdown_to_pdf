const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_CACHE_SIZE = 1000;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function cleanupOldEntries(): void {
  const now = Date.now();
  if (rateLimitMap.size <= MAX_CACHE_SIZE) return;

  const entriesToDelete: string[] = [];
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      entriesToDelete.push(key);
    }
  }

  for (const key of entriesToDelete) {
    rateLimitMap.delete(key);
  }

  if (rateLimitMap.size > MAX_CACHE_SIZE) {
    const sortedEntries = Array.from(rateLimitMap.entries())
      .sort(([, a], [, b]) => a.resetTime - b.resetTime);

    const toDelete = sortedEntries.slice(0, rateLimitMap.size - MAX_CACHE_SIZE);
    for (const [key] of toDelete) {
      rateLimitMap.delete(key);
    }
  }
}

export function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    cleanupOldEntries();
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export function getClientIP(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'unknown';
}
