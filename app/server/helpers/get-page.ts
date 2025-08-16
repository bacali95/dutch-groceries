export function getPage(request: Request) {
  const searchParams = new URL(request.url).searchParams;

  return parseInt(searchParams.get('page') ?? '1') - 1;
}
