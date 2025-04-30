import { CherryIcon, EditIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useFetcher, useNavigate } from 'react-router';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  type DataTableColumn,
  Flex,
  getDisplayDate,
  useLayoutContext,
} from 'tw-react-components';

import type { Prisma } from '~/generated/prisma';

import {
  PageTemplate,
  RefreshButton,
  useFilters,
  usePagination,
  useSorting,
  useTimeOffsetContext,
  useToastContext,
} from '~/client';
import { getPage, getPrismaFilters, getPrismaOrderBy, prisma } from '~/server';

import type { Route } from './+types';
import { getProductFiltersFields, useProductFilterFields } from './product-filter-fields';

type Product = Prisma.ProductGetPayload<{
  include: {
    tags: { include: { tag: true } };
    images: { include: { image: true } };
    sources: true;
  };
}>;

export async function loader({ request }: Route.LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const page = getPage(request);
  const orderBy = getPrismaOrderBy(request);
  const fields = getProductFiltersFields();
  const where = getPrismaFilters(searchParams, fields);

  const [products, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        tags: { include: { tag: true } },
        images: { include: { image: true } },
        sources: true,
      },
      skip: 25 * (page ?? 0),
      take: 25,
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, totalItems };
}

export async function action({ request }: Route.ActionArgs) {
  switch (request.method) {
    case 'DELETE': {
      const { id } = await request.json();

      return prisma.product.delete({ where: { id } });
    }
  }

  return new Response('Method not allowed', { status: 405 });
}

export default function Index({ loaderData: { products, totalItems } }: Route.ComponentProps) {
  const { toast } = useToastContext();
  const { showIds } = useLayoutContext();
  const timeOffset = useTimeOffsetContext();
  const navigate = useNavigate();
  const fetcher = useFetcher();

  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    onConfirm: () => void;
  }>();

  const { currentPage, setCurrentPage } = usePagination();
  const fields = useProductFilterFields();
  const filtersProps = useFilters(fields);
  const { sorting, setSorting } = useSorting<Product>();

  const columns: DataTableColumn<Product>[] = [
    {
      header: '#',
      field: 'id',
      hide: !showIds,
    },
    {
      header: 'Image',
      field: 'images',
      align: 'center',
      noSorting: true,
      render: (product) => (
        <img
          className="h-20 w-20 rounded-lg object-cover"
          src={product.images[0]?.image.url}
          height={200}
          alt={product.images[0]?.imageId.toString()}
          loading="lazy"
        />
      ),
    },
    {
      header: 'Name',
      field: 'name',
      align: 'center',
      noSorting: true,
      render: (product) => {
        return (
          <Flex className="gap-2" direction="column" align="center">
            {product.name}
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {getDisplayDate(product.updatedAt, { locale: 'en', offset: timeOffset })}
            </div>
          </Flex>
        );
      },
    },
    {
      header: 'Tags',
      field: 'tags',
      align: 'center',
      noSorting: true,
      render: (product) => (
        <Flex className="gap-2">
          {product.tags.map((tag) => (
            <Badge key={tag.tagId} size="small">
              {tag.tag.name}
            </Badge>
          ))}
        </Flex>
      ),
    },
  ];

  return (
    <PageTemplate
      icon={CherryIcon}
      title="Products"
      actions={
        <>
          <RefreshButton />
          <Button prefixIcon={PlusIcon} onClick={() => navigate('/products/new')} />
        </>
      }
      filtersProps={filtersProps}
      fullWidth
      fullHeight
    >
      <DataTable
        rows={products}
        columns={columns}
        sorting={{ sorting, onSortingChange: setSorting }}
        pagination={{ currentPage, setCurrentPage, totalItems }}
        onRowClick={(product) => navigate(`/products/${product.id}`)}
        actions={[
          {
            icon: EditIcon,
            onClick: (product) => navigate(`/products/${product.id}`),
          },
          {
            color: 'red',
            icon: Trash2Icon,
            onClick: ({ id }) =>
              setDeleteDialogState({
                open: true,
                onConfirm: async () => {
                  await fetcher.submit({ id }, { method: 'DELETE', encType: 'application/json' });

                  toast('success', 'Product deleted successfully');
                },
              }),
          },
        ]}
      />
      <ConfirmDialog
        title="Are you sure?"
        onConfirm={deleteDialogState?.onConfirm ?? (() => undefined)}
        open={deleteDialogState?.open ?? false}
        onClose={() => setDeleteDialogState(undefined)}
      >
        Are you sure you want to delete this product?
      </ConfirmDialog>
    </PageTemplate>
  );
}
