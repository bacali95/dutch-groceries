import { EditIcon, PlusIcon, Trash2Icon, UsersIcon } from 'lucide-react';
import { useState } from 'react';
import { useRouteLoaderData } from 'react-router';
import {
  Button,
  ConfirmDialog,
  DataTable,
  type DataTableColumn,
  useLayoutContext,
  useToast,
} from 'tw-react-components';

import { UserRole } from '~/prisma/enums';

import { PageTemplate, RefreshButton, api, useApiPromise, useMutation, useSorting } from '~/client';
import type { User } from '~/types';

import { UserForm } from './UserForm';

export default function Index() {
  const { toast } = useToast();
  const profile = useRouteLoaderData<User>('protected');
  const { showIds } = useLayoutContext();

  const [user, setUser] = useState<Partial<User>>();
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    onConfirm: () => void;
  }>();
  const { sorting, setSorting } = useSorting<User>();

  const { data: users = [], isLoading, refetch } = useApiPromise(api.user.getAll, { sorting });

  const columns: DataTableColumn<User>[] = [
    {
      header: '#',
      field: 'id',
      hide: !showIds,
    },
    {
      header: 'Name',
      field: 'name',
      render: (user) => (
        <div className="flex flex-col gap-0.5">
          <div>{user.name}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{user.role}</div>
        </div>
      ),
    },
    {
      header: 'Email',
      field: 'email',
    },
  ];

  const [handleDeleteUser, isDeleting] = useMutation(async (id: number) => {
    await api.user.delete({ id });

    toast({
      variant: 'success',
      title: 'Success',
      description: 'User removed',
    });
  }, refetch);

  return (
    <PageTemplate
      icon={UsersIcon}
      title="Users"
      actions={
        <>
          <RefreshButton onClick={() => refetch()} />
          {profile?.role === UserRole.ADMIN && (
            <Button prefixIcon={PlusIcon} onClick={() => setUser({})} />
          )}
        </>
      }
      fullWidth
    >
      <DataTable
        rows={users}
        columns={columns}
        isLoading={isLoading}
        sorting={{ sorting, onSortingChange: setSorting }}
        actions={[
          {
            icon: EditIcon,
            hide: profile?.role !== UserRole.ADMIN,
            onClick: setUser,
          },
          {
            color: 'red',
            icon: Trash2Icon,
            loading: isDeleting,
            hide: (item) => profile?.role !== UserRole.ADMIN || item.email === profile?.email,
            onClick: (item) =>
              setDeleteDialogState({ open: true, onConfirm: () => handleDeleteUser(item.id) }),
          },
        ]}
      />
      <ConfirmDialog
        open={deleteDialogState?.open ?? false}
        title="Confirm"
        onConfirm={deleteDialogState?.onConfirm ?? (() => undefined)}
        onClose={() => setDeleteDialogState(undefined)}
      >
        Are you sure you want to remove this user?
      </ConfirmDialog>
      <UserForm user={user} onSubmit={() => refetch()} onClose={() => setUser(undefined)} />
    </PageTemplate>
  );
}
