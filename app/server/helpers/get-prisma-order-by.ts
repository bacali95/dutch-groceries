import type { DataTableSorting, Paths } from 'tw-react-components';

export function getPrismaOrderBy<T>(
  orderBy: Request | URLSearchParams | DataTableSorting<T> | undefined,
  defaultField: Paths<T> = 'id' as Paths<T>,
  defaultDirection: DataTableSorting<T>['direction'] = 'asc',
) {
  const { field, direction } = (() => {
    if (orderBy instanceof Request) {
      const searchParams = new URL(orderBy.url).searchParams;

      return {
        field: searchParams.get('sortBy') ?? defaultField,
        direction: searchParams.get('sortDirection') ?? defaultDirection,
      };
    }

    if (orderBy instanceof URLSearchParams) {
      return {
        field: orderBy.get('sortBy') ?? defaultField,
        direction: orderBy.get('sortDirection') ?? defaultDirection,
      };
    }

    return orderBy ?? { field: defaultField, direction: defaultDirection };
  })();

  return field
    .split('.')
    .reverse()
    .reduce<any>((prev, curr) => ({ [curr]: prev }), direction);
}
