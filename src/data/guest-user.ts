import 'server-only';

import type { AuthResponse, GuestUserDTO } from '@/types/dto';

export async function createGuestUser(): Promise<GuestUserDTO> {
  if (process.env.API_URL === undefined) {
    throw new Error('API_URL is not configured');
  }

  const response = await fetch(`${process.env.API_URL}/auth/guest`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Guest auth failed: ${response.status}`);
  }

  const result = (await response.json()) as AuthResponse;

  return {
    name: 'ゲスト',
    token: result.token,
  };
}
