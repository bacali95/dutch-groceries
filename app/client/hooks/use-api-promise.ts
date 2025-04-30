import { useCallback, useEffect, useMemo, useState } from 'react';

export function useApiPromise<T extends (params: any, signal?: AbortSignal) => Promise<any>>(
  promise: T,
  params: Parameters<T>[0],
  disabled = false,
) {
  const [data, setData] = useState<Awaited<ReturnType<T>>>();
  const [isLoading, setIsLoading] = useState(false);
  const stringifiedParams = useMemo(() => JSON.stringify(params), [params]);

  const refetch = useCallback(
    async (signal?: AbortSignal) => {
      if (disabled) return;

      setIsLoading(true);

      try {
        setData(await promise(params, signal));
      } finally {
        setIsLoading(false);
      }
    },
    [disabled, stringifiedParams],
  );

  useEffect(() => {
    const abortController = new AbortController();

    refetch(abortController.signal);

    return () => abortController.abort();
  }, [refetch]);

  return { data, isLoading, refetch };
}
