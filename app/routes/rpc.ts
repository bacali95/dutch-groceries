import { createRpcHandler } from 'typesafe-rpc/server';

import { handlers, prisma } from '~/server';
import type { Context, RpcSchema } from '~/server';

import type { Route } from './+types/rpc';

export async function action({ request }: Route.ActionArgs) {
  return createRpcHandler<RpcSchema, Context>({
    operations: handlers,
    context: { request, prisma },
  });
}
