import 'server-only';

import type { GuestUserDTO } from '@/types/dto';

type GuestAuthResponse = {
  user: {
    id: number;
    provider: string;
    provider_uid: string;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
    guest_expires_at: string | null;
  };
  token: string;
};

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

  const result = (await response.json()) as GuestAuthResponse;

  return {
    id: String(result.user.id),
    name: result.user.name ?? 'ゲスト',
    token: result.token,
    apiUserId: result.user.id,
  };
}
