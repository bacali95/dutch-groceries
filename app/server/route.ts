import type { BaseContext } from 'typesafe-rpc';
import { Route } from 'typesafe-rpc/server';

import type { PrismaClient } from '~/prisma/client';

import { hasCloudflareJwt, hasSession } from './middleware';

export type Context = BaseContext & {
  prisma: PrismaClient;
};

export function route<Params extends object, ExtraParams = object>() {
  return new Route<Params, Context, ExtraParams>().middleware(hasSession, hasCloudflareJwt);
}
