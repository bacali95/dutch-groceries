import type { DataTableSorting } from 'tw-react-components';

import { type Field, prismaOutput, queryParser, validateFilters } from '~/client';

export function getPage(request: Request) {
  const searchParams = new URL(request.url).searchParams;

  return parseInt(searchParams.get('page') ?? '1') - 1;
}
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

export function getPrismaFilters(searchParams: URLSearchParams, fields: Field[]) {
  const filters = queryParser(searchParams, fields);

  return prismaOutput(validateFilters(filters));
}
