import { createRpcClient } from 'typesafe-rpc/client';

import type { RpcSchema } from '~/server';

export const api = createRpcClient<RpcSchema>('/rpc');
