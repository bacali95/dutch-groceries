import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, FormDialog, FormInputs, useToast } from 'tw-react-components';

import type { Prisma } from '~/prisma/client';
import { UserRole } from '~/prisma/enums';

import { api, useMutation } from '~/client';
import type { User } from '~/types';

type Props<T extends Prisma.UserModel> = {
  user?: Partial<T>;
  onSubmit: (id: number, user: T) => void;
  onClose: () => void;
};

const roles = [UserRole.ADMIN, UserRole.USER];

export const UserForm = <T extends Prisma.UserModel>({ user, onClose, onSubmit }: Props<T>) => {
  const { toast } = useToast();

  const form = useForm<any>({ defaultValues: structuredClone(user) });

  useEffect(() => {
    form.reset(structuredClone(user));
  }, [form, user]);

  const [handleSubmit] = useMutation(async (user: User) => {
    if ('password' in user && !user.password) {
      delete user.password;
    }

    const newUser = (await (user.id
      ? api.user.update(user)
      : api.user.create(user as unknown as Prisma.UserCreateInput))) as T;

    toast({
      variant: 'success',
      title: 'Success',
      description: `User was ${user.id ? 'updated' : 'created'}`,
    });

    onSubmit(newUser.id, newUser);
    onClose();
  });

  return (
    <FormDialog
      className="!max-w-xl"
      as={Dialog}
      open={!!user}
      title={user?.id ? `Update user ${user?.name}` : 'Create user'}
      form={form}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <FormInputs.Text name="name" label="Name" placeholder="Name" autoComplete="off" required />
      <FormInputs.Email name="email" label="Email" placeholder="Email" autoComplete="email" />
      <FormInputs.Password
        name="password"
        label="Password"
        placeholder="Password"
        autoComplete="new-password"
        required={!user?.id}
      />
      <FormInputs.Select
        name="roleName"
        label="Role"
        placeholder="Role"
        items={roles.map((role) => ({
          id: role,
          label: role,
          value: role,
        }))}
        required
      />
    </FormDialog>
  );
};
