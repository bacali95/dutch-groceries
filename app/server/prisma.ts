import { PrismaPg } from '@prisma/adapter-pg';

import { type Prisma, PrismaClient } from '~/prisma/client';

import { getSession } from './authentication';
import { cache } from './cache';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

const PRISMA_CACHE_DEPENDENCIES: Record<string, string[]> = {};

export const enhancePrismaClient = async <T = PrismaClient>(
  request: Request,
  prismaClient = prisma,
): Promise<T> => {
  const session = await getSession(request.headers.get('Cookie'));
  const user = session.get('user');

  return makePrismaCacheable(prismaClient, user, PRISMA_CACHE_DEPENDENCIES) as T;
};

function makePrismaCacheable<T>(
  prisma: T,
  user?: Prisma.UserModel,
  cacheDependencies: Record<string, string[]> = {},
): T {
  return new Proxy(
    {},
    {
      get: (_, entity: any): any => {
        if (
          typeof entity !== 'string' ||
          entity.startsWith('$') ||
          entity.startsWith('_') ||
          entity === 'then'
        ) {
          return (prisma as any)[entity];
        }

        return new Proxy(
          {},
          {
            get: (_: any, operation: any): any =>
              async function (params: any) {
                if (isCacheableOperation(operation)) {
                  return cache
                    .getOrPopulate(
                      getPrismaCacheKeyPrefix(entity, operation, user?.role),
                      params,
                      (prisma as any)[entity][operation],
                    )
                    .catch((error) => {
                      throw new Response(error.message, { status: 404 });
                    });
                }

                const [result] = await Promise.all([
                  (prisma as any)[entity][operation](params),
                  ...[entity, ...(cacheDependencies[entity] ?? [])].map((item) =>
                    cache.remove(`query:${item}:*`),
                  ),
                ]);

                return result;
              },
          },
        );
      },
    },
  ) as T;
}

function getPrismaCacheKeyPrefix(
  entity: string,
  operation: string,
  roleName = 'anonymous',
): string {
  return `query:${entity}:${operation}:${roleName}`;
}

function isCacheableOperation(operation: string): boolean {
  return operation.startsWith('find') || ['count', 'aggregate', 'groupBy'].includes(operation);
}
