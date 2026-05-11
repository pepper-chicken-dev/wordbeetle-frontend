import 'server-only';

import { verifySession } from './session';

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API error: ${status}`);
    this.name = 'ApiError';
  }
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

export type ListParams = {
  page?: number;
  perPage?: number;
};

export function buildListPath(base: string, params?: ListParams): string {
  const search = new URLSearchParams();
  if (params?.page !== undefined) {
    search.set('page', String(params.page));
  }
  if (params?.perPage !== undefined) {
    search.set('per_page', String(params.perPage));
  }
  const qs = search.toString();
  return qs === '' ? base : `${base}?${qs}`;
}

export async function apiRequest<T>(options: RequestOptions): Promise<T> {
  const { accessToken } = await verifySession();
  const baseUrl = getBaseUrl();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
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
