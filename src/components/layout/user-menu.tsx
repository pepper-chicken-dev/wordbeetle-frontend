import { getOptionalSession } from '@/lib/dal/session';
import { UserMenuPresenter } from './user-menu-presenter';

export async function UserMenu() {
  const session = await getOptionalSession();
  const name = session?.user?.name;
  const email = session?.user?.email;
  const image = session?.user?.image;
  const isGuest = session?.user?.isGuest ?? false;

  return (
    <UserMenuPresenter
      name={name}
      email={email}
      image={image}
      isGuest={isGuest}
    />
  );
}
