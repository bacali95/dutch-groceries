import type { Session } from 'react-router';

import type { User } from '~/types';

import { redirectToLogin } from '../helpers';
import { authenticateCloudflare } from './cloudflare';
import { getSession } from './cookie';
import { authenticateCredentials } from './credentials';

export type AuthenticationMethod = 'credentials' | 'cloudflare';

export const authenticate: Record<
  AuthenticationMethod,
  (request: Request, form: FormData, session: Session) => Promise<Response>
> = {
  credentials: authenticateCredentials,
  cloudflare: authenticateCloudflare,
};

export async function assertAuthorized(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('user')) {
    throw redirectToLogin(request);
  }

  return session.get('user') as User;
}

export * from './cookie';
