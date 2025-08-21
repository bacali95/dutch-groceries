import { FormProvider, useForm } from 'react-hook-form';
import { data, redirect, useFetcher } from 'react-router';
import { Block, Card, Flex, ThemeSelector } from 'tw-react-components';

import { CloudflareAuthentication, CredentialsAuthentication } from '~/client';
import {
  type AuthenticationMethod,
  authenticate,
  commitSession,
  config,
  getSession,
} from '~/server';

import { version } from '../../package.json' with { type: 'json' };
import type { Route } from './+types/login';

type Credentials = {
  email: string;
  password: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (session.has('user')) {
    const returnUrl = new URL(request.url).searchParams.get('returnUrl');

    return redirect(returnUrl ?? '/');
  }

  return data(
    {
      error: session.get('error'),
      cloudflareEnabled: config.cloudflare.audience && config.cloudflare.teamDomain,
    },
    { headers: { 'Set-Cookie': await commitSession(session) } },
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const form = await request.formData();
  const method = form.get('method')?.toString() as AuthenticationMethod | undefined;

  if (!method || !(method in authenticate)) {
    throw new Response('Invalid authentication method', { status: 400 });
  }

  return authenticate[method](request, form, session);
}

export default function Index({ loaderData: { cloudflareEnabled, error } }: Route.ComponentProps) {
  const fetcher = useFetcher();

  const loginForm = useForm<Credentials>();

  return (
    <Flex
      className="bg-muted min-h-svh gap-6 p-6 md:p-10"
      direction="column"
      align="center"
      justify="center"
    >
      <ThemeSelector className="absolute top-2 right-2" />
      <Flex className="max-w-sm gap-6" direction="column" fullWidth>
        <img
          className="block h-20 self-center"
          src="/images/logo-only.png"
          alt="Logo"
          loading="lazy"
        />
        <FormProvider {...loginForm}>
          <Card className="bg-background w-full">
            <Card.Header className="text-center">
              <Card.Title>Welcome back</Card.Title>
              <Card.Description>
                {cloudflareEnabled
                  ? 'Login with your Cloudflare account'
                  : 'Login with your email and password'}
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <Flex className="gap-4" direction="column" align="center">
                {cloudflareEnabled && (
                  <>
                    <CloudflareAuthentication
                      form={fetcher.Form}
                      loading={fetcher.state !== 'idle'}
                    />
                    <Block
                      className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t"
                      fullWidth
                    >
                      <span className="bg-background text-muted-foreground relative z-10 px-2">
                        Or continue with
                      </span>
                    </Block>
                  </>
                )}
                <CredentialsAuthentication form={fetcher.Form} loading={fetcher.state !== 'idle'} />
                {error && <div className="text-sm text-red-400">{error}</div>}
              </Flex>
            </Card.Content>
          </Card>
        </FormProvider>
        <div className="text-muted-foreground self-center text-sm text-balance">
          Dutch Groceries v{version}
        </div>
      </Flex>
    </Flex>
  );
}
