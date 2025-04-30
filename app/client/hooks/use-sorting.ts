import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { DataTableSorting, Paths } from 'tw-react-components';
import { generalComparator } from 'tw-react-components';

export type Sorting<T> = ReturnType<typeof useSorting<T>>;

export function useSorting<T>(
  field?: Paths<T>,
  direction?: DataTableSorting<T>['direction'],
  mode: 'query' | 'state' = 'query',
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<URLSearchParams>(new URLSearchParams());

  const sorting = useMemo(
    () => (mode === 'query' ? searchParams : state),
    [mode, searchParams, state],
  );

  const setSorting = useCallback(
    (sorting: DataTableSorting<T>): void => {
      if (mode === 'query') {
        if (sorting.field !== (field ?? 'id')) {
          searchParams.set('sortBy', sorting.field as string);
        } else {
          searchParams.delete('sortBy');
        }

        if (sorting.direction !== (direction ?? 'asc')) {
          searchParams.set('sortDirection', sorting.direction);
        } else {
          searchParams.delete('sortDirection');
        }

        setSearchParams(searchParams);
      } else {
        setState(
          new URLSearchParams({
            sortBy: sorting.field ?? field ?? 'id',
            sortDirection: sorting.direction ?? 'asc',
          }),
        );
      }
    },
    [mode, field, direction, searchParams, setSearchParams],
  );

  return useMemo(
    () => ({
      searchParams: mode === 'query' ? searchParams.toString() : state.toString(),
      sorting: {
        field: (sorting.get('sortBy') ?? field ?? 'id') as Paths<T>,
        direction: (sorting.get('sortDirection') ?? direction ?? 'asc') as 'asc' | 'desc',
        comparator: generalComparator,
      },
      setSorting,
      onSortingChange: setSorting,
    }),
    [mode, searchParams, state, sorting, field, direction, setSorting],
  );
}
