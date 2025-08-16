import { productHandlers } from './products';

export const handlers = {
  product: productHandlers,
};

export type RpcSchema = typeof handlers;
