export interface ApiError {
  error: string;
  code: string;
  details?: string;
  message?: string;
  retryAfter?: number;
}

export function errorResponse(err: ApiError, status: number, extraHeaders?: Record<string, string>): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (err.retryAfter) {
    headers['Retry-After'] = String(err.retryAfter);
  }
  const { retryAfter, ...body } = err;
  return new Response(JSON.stringify({ ...body, retryAfter }), { status, headers });
}
