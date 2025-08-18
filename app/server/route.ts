import type { BaseContext } from 'typesafe-rpc';
import { Route } from 'typesafe-rpc/server';

import type { PrismaClient } from '~/prisma/client';

import type { User } from '~/types';

export type Context = BaseContext & {
  user: User;
  prisma: PrismaClient;
};

export function route<Params extends object>() {
  return new Route<Params, Context>();
}
