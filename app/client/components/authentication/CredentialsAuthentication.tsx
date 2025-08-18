import type { FC } from 'react';
import { Button, FormInputs } from 'tw-react-components';

import type { AuthenticationProps } from '.';

export const CredentialsAuthentication: FC<AuthenticationProps> = ({ form: Form, loading }) => (
  <Form className="flex w-full flex-col items-center gap-4 [&>div>label>span]:hidden" method="POST">
    <FormInputs.Text
      name="email"
      label="Email"
      placeholder="m@example.com"
      autoComplete="email"
      required
    />
    <FormInputs.Password name="password" label="Password" autoComplete="username" required />
    <input type="hidden" name="method" value="credentials" />
    <Button className="w-full justify-center" type="submit" loading={loading}>
      Login
    </Button>
  </Form>
);
