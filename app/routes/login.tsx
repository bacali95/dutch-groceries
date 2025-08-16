import { compareSync } from 'bcryptjs';
import { FormProvider, useForm } from 'react-hook-form';
import { data, redirect, useFetcher } from 'react-router';
import { Button, Card, Flex, FormInputs, ThemeSelector } from 'tw-react-components';

import { commitSession, getSession, prisma } from '~/server';

import { version } from '../../package.json' with { type: 'json' };
import type { Route } from './+types/login';

type Credentials = {
  email: string;
  password: string;
};

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const returnUrl = new URL(request.url).searchParams.get('returnUrl');

  if (session.has('user')) {
    return redirect(returnUrl ?? '/');
  }

  return data(
    { error: session.get('error') },
    { headers: { 'Set-Cookie': await commitSession(session) } },
  );
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  const form = await request.formData();
  const email = form.get('email')?.toString();
  const password = form.get('password')?.toString();

  const user = await prisma.user.findFirst({ where: { email } });

  if (!user || !password || !compareSync(password, user.password)) {
    session.set('error', 'Invalid username or password');

    return redirect('/login', { headers: { 'Set-Cookie': await commitSession(session) } });
  }

  const savedUser = await prisma.user.update({
    where: { id: user.id },
    data: { sessionId: session.id },
    omit: { password: true, sessionId: true },
  });

  const returnUrl = new URL(request.url).searchParams.get('returnUrl');

  session.set('user', savedUser);
  session.unset('error');

  return redirect(returnUrl ?? '/', {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}

export default function Index({ loaderData: { error } }: Route.ComponentProps) {
  const fetcher = useFetcher();

  const loginForm = useForm<Credentials>();

  return (
    <Flex className="relative h-screen w-screen bg-white pt-[25dvh] dark:bg-slate-900 dark:text-white">
      <ThemeSelector className="absolute top-2 right-2" />
      <Flex className="mx-8 gap-0" direction="column" align="center" fullWidth>
        <img
          className="mb-12 block h-32 max-w-sm dark:[filter:brightness(0)_invert(1)]"
          src="/images/logo-only.png"
          alt="Logo"
          loading="lazy"
        />
        <FormProvider {...loginForm}>
          <Card className="w-full p-4 md:max-w-sm">
            <fetcher.Form className="flex flex-col items-center gap-3" method="POST">
              <h1 className="py-4 text-2xl">Login</h1>
              <FormInputs.Text name="email" placeholder="Email" autoComplete="email" required />
              <FormInputs.Password
                name="password"
                placeholder="Password"
                autoComplete="username"
                required
              />
              {error && <div className="text-red-400">{error}</div>}
              <Button
                className="mx-auto w-fit px-6"
                type="submit"
                loading={fetcher.state !== 'idle'}
              >
                Login
              </Button>
            </fetcher.Form>
          </Card>
        </FormProvider>
        <div className="mt-2 text-xs">{version}</div>
      </Flex>
    </Flex>
  );
}
