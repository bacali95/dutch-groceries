import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { Args } from 'typesafe-rpc';

import type { AuthMethod } from '~/types';
import { getValueFromCookie } from '~/utils';

import { config } from '../config';
import { redirectToLogin } from '../helpers';
import { prisma } from '../prisma';
import type { Context } from '../route';

const JWKS = config.cloudflare.teamDomain
  ? createRemoteJWKSet(new URL(`${config.cloudflare.teamDomain}/cdn-cgi/access/certs`))
  : undefined;

export const hasCloudflareJwt = async <Params, ExtraParams>({
  context: { request },
}: Args<Params, Context, ExtraParams>) => {
  if (!config.cloudflare.audience || !config.cloudflare.teamDomain || !JWKS) {
    throw redirectToLogin(request);
  }

  const token =
    request.headers.get('Cf-Access-Jwt-Assertion') ??
    getValueFromCookie<string>(request.headers.get('Cookie') ?? '', 'CF_Authorization', '');

  if (!token) {
    throw redirectToLogin(request);
  }

  const result = await jwtVerify(token, JWKS, {
    issuer: config.cloudflare.teamDomain,
    audience: config.cloudflare.audience,
  });
  const email = result.payload.email as string;

  const user = await prisma.user.findFirst({
    where: { email },
    omit: { password: true, sessionId: true },
  });

  if (!user) {
    throw redirectToLogin(request);
  }

  return { user, method: 'cloudflare' as AuthMethod };
};
