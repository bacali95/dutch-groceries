import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';

import type { Field, FilterItem, FiltersProps } from '../components';
import { queryOutput, queryParser, validateFilters } from '../components';

const keysToBePreserved = ['sortBy', 'sortDirection'];

export function useFilters(fields: Field[], mode: 'query' | 'state' = 'query') {
  const [searchParams, setSearchParams] = useSearchParams();
  const [state, setState] = useState<URLSearchParams>(new URLSearchParams());

  const filters = useMemo(
    () => queryParser(mode === 'query' ? searchParams : state, fields),
    [fields, mode, searchParams, state],
  );

  const setFilters = useCallback(
    (filters?: Record<string, FilterItem[]>) => {
      if (mode === 'query') {
        setSearchParams(
          (prevState) =>
            new URLSearchParams([
              ...queryOutput(validateFilters(filters ?? {})),
              ...keysToBePreserved
                .filter((key) => prevState.has(key))
                .map((key) => [key, prevState.get(key)] as [string, string]),
            ]),
        );
      } else {
        setState(new URLSearchParams(queryOutput(validateFilters(filters ?? {}))));
      }
    },
    [mode, setSearchParams],
  );

  const updateFilter = useCallback(
    (field: string, filter: FilterItem) => {
      filters[field] = [filter];

      setFilters(filters);
    },
    [filters, setFilters],
  );

  const removeFilter = useCallback(
    (field: string) => {
      delete filters[field];

      setFilters(filters);
    },
    [filters, setFilters],
  );

  const clearFilters = useCallback(() => setFilters({}), [setFilters]);

  return useMemo(
    () =>
      ({
        searchParams: mode === 'query' ? searchParams.toString() : state.toString(),
        fields,
        filters,
        updateFilter,
        removeFilter,
        clearFilters,
      }) satisfies FiltersProps,
    [clearFilters, fields, filters, mode, removeFilter, searchParams, state, updateFilter],
  );
}
