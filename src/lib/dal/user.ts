import 'server-only';

import { apiRequest } from './client';

export async function deleteCurrentUser(): Promise<void> {
  await apiRequest<void>({ method: 'DELETE', path: '/users/me' });
}
