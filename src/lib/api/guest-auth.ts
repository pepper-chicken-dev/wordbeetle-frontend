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

export async function createGuestUser(): Promise<GuestAuthResponse> {
  const apiUrl = process.env.API_URL;

  if (apiUrl === undefined) {
    throw new Error('API_URL is not configured');
  }

  const response = await fetch(`${apiUrl}/auth/guest`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(`Guest auth failed: ${response.status}`);
  }

  return (await response.json()) as GuestAuthResponse;
}
