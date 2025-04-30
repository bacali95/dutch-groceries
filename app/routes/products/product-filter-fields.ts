import { useMemo } from 'react';

import type { Field } from '~/client';

export function useProductFilterFields(): Field[] {
  return useMemo(() => getProductFiltersFields(), []);
}

export function getProductFiltersFields(): Field[] {
  return [
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      field: 'name',
    },
  ];
}
