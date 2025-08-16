import { useCallback, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import type { SelectItem } from 'tw-react-components';

import type { Field, FilterItem, FiltersProps } from '../components';
import { prismaOutput, queryOutput, queryParser, validateFilters } from '../components';

const keysToBePreserved = ['sortBy', 'sortDirection'];

export function useFilters(_fields: Field[], mode: 'query' | 'state' = 'query') {
  const [fields, setFields] = useState<Field[]>(_fields);
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

  const promisesRef = useRef<Record<string, Promise<SelectItem<string | number, boolean>[]>>>({});

  const loadSelectables = useCallback(async (field: Field) => {
    if (field.cachedSelectables) return field.cachedSelectables;

    if (typeof field.selectables === 'function') {
      const selectablesPromise = promisesRef.current[field.key] ?? field.selectables();

      promisesRef.current[field.key] = selectablesPromise;

      const selectables = await selectablesPromise;

      delete promisesRef.current[field.key];

      setFields((prevFields) =>
        prevFields.map((prevField) =>
          prevField.key === field.key
            ? { ...prevField, cachedSelectables: selectables }
            : prevField,
        ),
      );

      return selectables;
    }

    return field.selectables ?? [];
  }, []);

  return useMemo(
    () =>
      ({
        searchParams: mode === 'query' ? searchParams.toString() : state.toString(),
        fields,
        filters,
        outputs: {
          query: new URLSearchParams(queryOutput(validateFilters(filters))).toString(),
          prisma: prismaOutput(validateFilters(filters))?.AND ?? [],
        },
        updateFilter,
        removeFilter,
        clearFilters,
        loadSelectables,
      }) satisfies FiltersProps,
    [
      clearFilters,
      fields,
      filters,
      loadSelectables,
      mode,
      removeFilter,
      searchParams,
      state,
      updateFilter,
    ],
  );
}

export function getPrismaFilters(searchParams: URLSearchParams, fields: Field[]) {
  const filters = queryParser(searchParams, fields);

  return prismaOutput(validateFilters(filters));
}
