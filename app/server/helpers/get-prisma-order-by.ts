import type { DataTableSorting } from 'tw-react-components';

export function getPrismaOrderBy<T>(
  request: Request | URLSearchParams,
  field?: string,
  direction?: DataTableSorting<T>['direction'],
) {
  const searchParams = request instanceof Request ? new URL(request.url).searchParams : request;

  return (searchParams.get('sortBy') ?? field ?? 'id')
    .split('.')
    .reverse()
    .reduce<any>(
      (prev, curr) => ({ [curr]: prev }),
      searchParams.get('sortDirection') ?? direction ?? 'asc',
    );
}
