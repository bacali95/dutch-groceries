import type { IApiSchema } from '~/types';

import { fetchData } from './fetch-data';

export type ApiClient<T extends IApiSchema> = {
  [K in keyof T]: {
    [L in keyof T[K]]: (
      params: Parameters<T[K][L]>[0],
      signal?: AbortSignal,
    ) => ReturnType<T[K][L]>;
  };
};

export function createApiClient<T extends IApiSchema>(
  endpoints: Record<keyof T, string>,
): ApiClient<T> {
  return new Proxy(
    {},
    {
      get: (_, entity: string) =>
        new Proxy(
          {},
          {
            get: (_, operation: string) => {
              return function (params: any, signal?: AbortSignal) {
                return fetchData(endpoints[entity], 'POST', { operation, params }, signal);
              };
            },
          },
        ),
    },
  ) as ApiClient<T>;
}
