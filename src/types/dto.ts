export type GuestUserDTO = {
  name: string;
  token: string;
};

export type AuthUser = {
  email: string;
  name: string;
  avatar_url: string;
  guest_expires_at: string | null;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};
