import type { DeepNonNullable, FilterItem } from './types';

export function prismaOutput(
  filters: Record<string, DeepNonNullable<FilterItem>[]>,
): { AND: object[] } | undefined {
  return !Object.values(filters).length
    ? undefined
    : {
        AND: Object.values(filters).map((values) =>
          values.length === 1
            ? mapFilterToPrisma(values[0])
            : { OR: values.map(mapFilterToPrisma) },
        ),
      };
}

function mapFilterToPrisma(filter: DeepNonNullable<FilterItem>) {
  const query = filter.field.customQuery
    ? filter.not
      ? { not: filter.field.customQuery(filter.value) }
      : filter.field.customQuery(filter.value)
    : filter.field.field
        .split('/')
        .reverse()
        .reduce<object>((prev, field) => ({ [field]: prev }), {
          ...(filter.not
            ? {
                not: {
                  [filter.operation]:
                    filter.value instanceof Date ? filter.value.toISOString() : filter.value,
                },
              }
            : filter.field.type === 'boolean'
              ? { equals: filter.value === 'true' }
              : {
                  [filter.operation]:
                    filter.value instanceof Date ? filter.value.toISOString() : filter.value,
                }),
          ...(filter.field.type === 'string' ? { mode: 'insensitive' } : undefined),
        });

  return filter.field.transformer ? filter.field.transformer(query) : query;
}
