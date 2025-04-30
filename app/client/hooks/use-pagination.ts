import type { SetStateAction } from 'react';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

export function usePagination() {
  const [searchParams, setSearchParams] = useSearchParams();

  const setCurrentPage = useCallback(
    (page: SetStateAction<number>): void => {
      if (typeof page !== 'number') return;

      if (page) {
        searchParams.set('page', String(page + 1));
      } else {
        searchParams.delete('page');
      }

      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams],
  );

  return useMemo(
    () => ({
      currentPage: parseInt(searchParams.get('page') ?? '1') - 1,
      setCurrentPage,
    }),
    [searchParams, setCurrentPage],
  );
}
