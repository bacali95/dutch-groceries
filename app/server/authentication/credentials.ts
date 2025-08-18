import { compareSync } from 'bcryptjs';
import { type Session, redirect } from 'react-router';

import { prisma } from '../prisma';
import { commitSession } from './cookie';

export async function authenticateCredentials(request: Request, form: FormData, session: Session) {
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
