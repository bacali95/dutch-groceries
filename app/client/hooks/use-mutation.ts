import { useCallback, useState } from 'react';
import { useToast } from 'tw-react-components';

export function useMutation<T extends (...args: any[]) => any>(
  fn: T,
  ...refresh: (() => void)[]
): [T, boolean] {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  return [
    useCallback(
      async (...args: Parameters<T>) => {
        setLoading(true);

        try {
          const result = await fn(...args);

          return result;
        } catch (error: any) {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: error instanceof Error ? error.message : 'An unknown error occurred',
          });
        } finally {
          setLoading(false);
          refresh.forEach((r) => r());
        }
      },
      [fn, refresh, toast],
    ) as T,
    loading,
  ];
}
