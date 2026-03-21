import { auth } from '@/lib/auth';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API error: ${status}`);
    this.name = 'ApiError';
  }
}

async function getToken(): Promise<string> {
  const session = await auth();
  const token = session?.user?.accessToken;

  if (token === undefined || token === null) {
    throw new Error('Not authenticated');
  }

  return token;
}

function getBaseUrl(): string {
  const url = process.env.API_URL;

  if (url === undefined) {
    throw new Error('API_URL is not configured');
  }

  return url;
}

type RequestOptions = {
  method: string;
  path: string;
  body?: unknown;
};

export async function apiRequest<T>(options: RequestOptions): Promise<T> {
  const token = await getToken();
  const baseUrl = getBaseUrl();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${baseUrl}${options.path}`, {
    method: options.method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
