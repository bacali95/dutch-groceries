import { redirect } from 'react-router';

import { destroySession, getSession } from '~/server';

import type { Route } from './+types/logout';

export async function loader({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  return redirect('/login', {
    headers: { 'Set-Cookie': await destroySession(session) },
  });
}
