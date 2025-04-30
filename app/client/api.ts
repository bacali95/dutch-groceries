import type { ApiSchema } from '~/types';

import { createApiClient } from './helpers';

export const api = createApiClient<ApiSchema>({
  product: '/api/products.data',
});
