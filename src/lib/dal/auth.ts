import 'server-only';

import type { AuthResponse } from '@/types/api';
import { ApiError, getBaseUrl } from './client';

export async function authGuest(): Promise<AuthResponse> {
  const response = await fetch(`${getBaseUrl()}/auth/guest`, {
    method: 'POST',
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }

  return (await response.json()) as AuthResponse;
}

export async function authGoogle(
  googleIdToken: string,
  guestToken?: string
): Promise<AuthResponse> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${googleIdToken}`,
  };

  if (guestToken !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${getBaseUrl()}/auth/google`, {
    method: 'POST',
    headers,
    body:
      guestToken !== undefined
        ? JSON.stringify({ guest_token: guestToken })
        : undefined,
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    throw new ApiError(response.status, body);
  }

  return (await response.json()) as AuthResponse;
}
