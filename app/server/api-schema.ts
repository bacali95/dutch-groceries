import type { IApiSchema } from '~/types';

export async function createEntityApiHandler<T extends IApiSchema, E extends keyof T>(
  request: Request,
  operations: T[E],
) {
  if (request.method !== 'POST') {
    throw new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { operation, params } = await request.json();

    return operations[operation](params);
  } catch (error: any) {
    throw new Response(error.message, { status: 400 });
  }
}
