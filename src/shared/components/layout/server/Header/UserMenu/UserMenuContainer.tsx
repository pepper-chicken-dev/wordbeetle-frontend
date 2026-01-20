import { auth } from '@/features/auth/lib/auth';
import { UserMenuPresenter } from './UserMenuPresenter';

export async function UserMenuContainer() {
  const session = await auth();
  const name = session?.user?.name;
  const email = session?.user?.email;
  const image = session?.user?.image;

  return <UserMenuPresenter name={name} email={email} image={image} />;
}
