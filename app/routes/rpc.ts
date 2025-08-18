import { createRpcHandler } from 'typesafe-rpc/server';

import { assertAuthorized, enhancePrismaClient, handlers } from '~/server';
import type { Context, RpcSchema } from '~/server';

import type { Route } from './+types/rpc';

export async function action({ request }: Route.ActionArgs) {
  const user = await assertAuthorized(request);
  const prisma = await enhancePrismaClient(request);

  return createRpcHandler<RpcSchema, Context>({
    operations: handlers,
    context: { request, prisma, user },
    errorHandler: (error) => error,
    hooks: {
      preCall: ({ entity, operation }) => {
        console.info(`[IN] RPC call ${String(entity)}.${String(operation)}`);
      },
      postCall: ({ entity, operation }, performance) => {
        console.info(
          `[OUT] RPC call ${String(entity)}.${String(operation)} in ${performance.toFixed(3)}ms`,
        );
      },
      error: ({ entity, operation }, performance, error) => {
        console.error(
          `[OUT] RPC call ${String(entity)}.${String(operation)} failed in ${performance.toFixed(3)}ms`,
          error instanceof Response ? '' : error,
        );
      },
    },
  });
}
