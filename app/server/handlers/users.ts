import { hash } from 'bcryptjs';
import type { DataTableSorting } from 'tw-react-components';

import type { User, UserRole } from '~/prisma/client';
import * as Prisma from '~/prisma/models';

import { getPrismaOrderBy } from '../helpers';
import { isAdmin } from '../middlewares';
import { route } from '../route';

export const userHandlers = {
  getAll: route<{ sorting?: DataTableSorting<User> }>()
    .middleware(isAdmin)
    .handle(({ params: { sorting }, context: { prisma } }) =>
      prisma.user.findMany({
        orderBy: getPrismaOrderBy(sorting),
        omit: { password: true, sessionId: true },
      }),
    ),
  getByRoles: route<{ roles: UserRole[] }>()
    .middleware(isAdmin)
    .handle(({ params: { roles }, context: { prisma } }) =>
      prisma.user.findMany({
        where: { role: { in: roles } },
        omit: { password: true, sessionId: true },
      }),
    ),
  create: route<Prisma.UserCreateInput | Prisma.UserUncheckedCreateInput>()
    .middleware(isAdmin)
    .handle(async ({ params, context: { prisma } }) =>
      prisma.user.create({
        data: await hashPassword(params),
        omit: { password: true, sessionId: true },
      }),
    ),
  update: route<{ id: number } & (Prisma.UserUpdateInput | Prisma.UserUncheckedUpdateInput)>()
    .middleware(isAdmin)
    .handle(async ({ params: { id, ...params }, context: { prisma } }) =>
      prisma.user.update({
        where: { id },
        data: await hashPassword(params),
        omit: { password: true, sessionId: true },
      }),
    ),
  delete: route<{ id: number }>()
    .middleware(isAdmin)
    .handle(({ params: { id }, context: { prisma } }) => prisma.user.delete({ where: { id } })),
};

async function hashPassword<
  T extends { password?: string | Prisma.StringFieldUpdateOperationsInput },
>(data: T) {
  return {
    ...data,
    password: typeof data.password === 'string' ? await hash(data.password, 10) : data.password,
  };
}
