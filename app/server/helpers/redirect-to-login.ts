import { redirect } from 'react-router';

export function redirectToLogin(request: Request) {
  const url = new URL(request.url);
  const returnUrl = `${url.pathname}${url.search}${url.hash}`;

  return redirect(returnUrl === '/' ? '/login' : `/login?returnUrl=${returnUrl}`);
}
