import { CherryIcon, EditIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  type DataTableColumn,
  Flex,
  getDisplayDate,
  useLayoutContext,
  useToast,
} from 'tw-react-components';

import {
  PageTemplate,
  RefreshButton,
  api,
  useApiPromise,
  useFilters,
  useMutation,
  usePagination,
  useSorting,
  useTimeOffsetContext,
} from '~/client';
import type { Product } from '~/types';

import { useProductFilterFields } from './product-filter-fields';

export default function Index() {
  const { toast } = useToast();
  const { showIds } = useLayoutContext();
  const timeOffset = useTimeOffsetContext();
  const navigate = useNavigate();

  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    onConfirm: () => void;
  }>();

  const { currentPage, setCurrentPage } = usePagination();
  const fields = useProductFilterFields();
  const filtersProps = useFilters(fields);
  const { sorting, setSorting } = useSorting<Product>();

  const {
    data: [products, totalItems] = [[], 0],
    isLoading,
    refetch,
  } = useApiPromise(api.product.getPage, {
    page: currentPage,
    filters: filtersProps.outputs.prisma,
    sorting,
  });

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
          src={product.images[0]?.url}
          height={200}
          alt={product.images[0]?.id.toString()}
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

  const [handleDeleteProduct, isDeleting] = useMutation(async (id: number) => {
    await api.product.delete({ id });

    toast({
      variant: 'success',
      title: 'Success',
      message: 'Product deleted successfully',
    });
  }, refetch);

  return (
    <PageTemplate
      icon={CherryIcon}
      title="Products"
      actions={
        <>
          <RefreshButton onClick={() => refetch()} />
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
        isLoading={isLoading}
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
            loading: isDeleting,
            onClick: (product) =>
              setDeleteDialogState({
                open: true,
                onConfirm: () => handleDeleteProduct(product.id),
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
