import { auth } from '@/lib/auth';
import { UserMenuPresenter } from './user-menu-presenter';

export async function UserMenu() {
  const session = await auth();
  const name = session?.user?.name;
  const email = session?.user?.email;
  const image = session?.user?.image;

  return <UserMenuPresenter name={name} email={email} image={image} />;
}
