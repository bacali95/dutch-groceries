import type { Args } from 'typesafe-rpc';

import type { Prisma } from '~/prisma/client';

import type { AuthMethod } from '~/types';

import { redirectToLogin } from '../helpers';
import type { Context } from '../route';
import { getSession } from '../session';

type User = Prisma.UserGetPayload<{ omit: { password: true; sessionId: true } }>;

export const hasSession = async <Params, ExtraParams>({
  context: { request },
}: Args<Params, Context, ExtraParams>) => {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('user')) {
    throw redirectToLogin(request);
  }

  return { user: session.get('user') as User, method: 'basic' as AuthMethod };
};
