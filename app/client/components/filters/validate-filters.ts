import type { DeepNonNullable, FilterItem } from './types';

export function validateFilters(
  filters: Record<string, FilterItem[]>,
): Record<string, DeepNonNullable<FilterItem>[]> {
  return Object.fromEntries<DeepNonNullable<FilterItem>[]>(
    Object.entries(filters).filter((item): item is [string, DeepNonNullable<FilterItem>[]] => {
      const [, filters] = item;

      return filters.some((filter) => {
        switch (filter.field.type) {
          case 'boolean':
            return !!filter.operation && !!filter.value;
          default:
            return !!filter.operation && Array.isArray(filter.value)
              ? filter.value.length > 0
              : !!filter.value;
        }
      });
    }),
  );
}
