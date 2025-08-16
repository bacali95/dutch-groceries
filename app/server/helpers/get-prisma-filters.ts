import { type Field, prismaOutput, queryParser, validateFilters } from '~/client';

export function getPrismaFilters(searchParams: URLSearchParams, fields: Field[]) {
  const filters = queryParser(searchParams, fields);

  return prismaOutput(validateFilters(filters));
}
