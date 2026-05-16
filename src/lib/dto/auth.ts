import 'server-only';

import { authGoogle, authGuest } from '@/lib/dal/auth';

export type GuestAuthUserView = {
  name: string;
  token: string;
  guestExpiresAt: string | null;
};

export type GoogleAuthUserView = {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  token: string;
};

export async function getGuestAuthView(): Promise<GuestAuthUserView> {
  const result = await authGuest();
  return {
    name: 'ゲスト',
    token: result.token,
    guestExpiresAt: result.user.guest_expires_at,
  };
}

export async function getGoogleAuthView(
  googleIdToken: string,
  guestToken?: string
): Promise<GoogleAuthUserView> {
  const result = await authGoogle(googleIdToken, guestToken);
  return {
    name: result.user.name,
    email: result.user.email,
    avatarUrl: result.user.avatar_url,
    token: result.token,
  };
}
