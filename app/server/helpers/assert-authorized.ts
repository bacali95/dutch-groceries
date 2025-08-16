import { redirect } from 'react-router';

import type { User } from '~/prisma/client';

import { getSession } from '../session';

export async function assertAuthorized(request: Request): Promise<User> {
  const session = await getSession(request.headers.get('Cookie'));
  const url = new URL(request.url);

  if (!session.has('user')) {
    throw redirect(`/login?returnUrl=${url.pathname}${url.search}${url.hash}`);
  }

  return session.get('user') as User;
}
