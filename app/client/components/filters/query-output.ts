import type { FilterItem } from './types';

export function queryOutput(filters: Record<string, Required<FilterItem>[]>): string[][] {
  return Object.entries(filters).flatMap(([key, values]) =>
    values.map((filter) => [
      key,
      filter.field.customQuery
        ? String(filter.value)
        : `${filter.not ? '[not]' : ''}${filter.operation}(${
            filter.value instanceof Date ? filter.value.toISOString() : filter.value
          })`,
    ]),
  );
}
