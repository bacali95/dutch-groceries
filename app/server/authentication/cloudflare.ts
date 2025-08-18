import { type JWTVerifyResult, createRemoteJWKSet, jwtVerify } from 'jose';
import { type Session, redirect } from 'react-router';

import { getValueFromCookie } from '~/utils';

import { config } from '../config';
import { prisma } from '../prisma';
import { commitSession } from './cookie';

const JWKS = config.cloudflare.teamDomain
  ? createRemoteJWKSet(new URL(`${config.cloudflare.teamDomain}/cdn-cgi/access/certs`))
  : undefined;

export async function authenticateCloudflare(request: Request, form: FormData, session: Session) {
  if (!config.cloudflare.audience || !config.cloudflare.teamDomain || !JWKS) {
    return failLogin(session, 'Cloudflare authentication is not configured');
  }

  const token =
    request.headers.get('Cf-Access-Jwt-Assertion') ??
    getValueFromCookie<string>(request.headers.get('Cookie') ?? '', 'CF_Authorization', '');

  if (!token) {
    return failLogin(session, 'No Cloudflare token found');
  }

  let result: JWTVerifyResult<{ email: string }>;

  try {
    result = await jwtVerify(token, JWKS, {
      issuer: config.cloudflare.teamDomain,
      audience: config.cloudflare.audience,
    });
  } catch {
    return failLogin(session, 'Invalid Cloudflare token');
  }

  const email = result.payload.email;

  const user = await prisma.user.findFirst({
    where: { email },
    omit: { password: true, sessionId: true },
  });

  if (!user) {
    return failLogin(session, 'User not found');
  }

  const returnUrl = new URL(request.url).searchParams.get('returnUrl');

  session.set('user', user);
  session.unset('error');

  return redirect(returnUrl ?? '/', {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

async function failLogin(session: Session, error: string) {
  session.set('error', error);

  return redirect('/login', { headers: { 'Set-Cookie': await commitSession(session) } });
}
