import type { Args } from 'typesafe-rpc';

import { UserRole } from '~/prisma/client';

import type { Context } from './route';

export const isAdmin = async <Params>({ context: { user } }: Args<Params, Context>) => {
  if (user.role !== UserRole.ADMIN) {
    throw new Response('Forbidden', { status: 403 });
  }
};
