import 'server-only';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown
  ) {
    super(`API error: ${status}`);
    this.name = 'ApiError';
  }
}

export function getBaseUrl(): string {
  const url = process.env.API_URL;

  if (url === undefined) {
    throw new Error('API_URL is not configured');
  }

  return url;
}
