import type { Field, FilterItem } from './types';

export function queryParser(query: URLSearchParams, fields: Field[]): Record<string, FilterItem[]> {
  const filters: Record<string, FilterItem[]> = {};

  for (const field of fields) {
    if (field.key === 'page') {
      throw new Error('Key as "page" is not allowed');
    }

    const values = query.getAll(field.key);

    filters[field.key] = [];

    if (field.customQuery) {
      filters[field.key].push(
        ...values.map((value) => ({
          field,
          not: null,
          operation: null,
          value: value.split(',').map((item) => field.constructor(item)),
        })),
      );

      continue;
    }

    for (const value of values) {
      const [, not, operation, filterValue] = /^(\[not])?([^(]*)\((.*)\)$/.exec(value ?? '') ?? [];

      const [constructor, defaultOperation] = getFilterDefaultOperation(field);

      filters[field.key].push({
        field,
        operation: operation ?? defaultOperation,
        not: !!not,
        value: !filterValue
          ? null
          : field.type === 'relation' || field.type === 'relation-multiple'
            ? filterValue.split(',').map((item) => constructor(item))
            : constructor(filterValue),
      });
    }
  }

  return filters;
}

export function getFilterDefaultOperation(
  field: Field,
): [typeof Number | typeof String | ((value: string | number) => Date) | typeof Boolean, string] {
  switch (field.type) {
    case 'relation':
      return [field.constructor, 'in'];
    case 'relation-multiple':
      return [field.constructor, 'hasSome'];
    case 'number':
      return [Number, 'equals'];
    case 'date':
    case 'dateTime':
      return [(value: string | number) => new Date(value), 'gte'];
    case 'boolean':
      return [String, 'equals'];
    default:
      return [String, 'contains'];
  }
}
