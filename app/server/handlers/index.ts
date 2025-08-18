import { productHandlers } from './products';
import { userHandlers } from './users';

export const handlers = {
  user: userHandlers,
  product: productHandlers,
};

export type RpcSchema = typeof handlers;
