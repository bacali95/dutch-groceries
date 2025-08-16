import { useForm } from 'react-hook-form';
import { Dialog, FormDialog } from 'tw-react-components';

import type { Product } from '~/prisma/client';

import type { ProductSearchResult } from '~/types';

import { ProductOnlineSearch } from './ProductOnlineSearch';

export type ProductFormModalProps = {
  open: boolean;
  onSubmit: (data: Product) => void;
  onClose: () => void;
};

export const ProductFormModal = ({ open, onClose, onSubmit }: ProductFormModalProps) => {
  const form = useForm<Product>();

  const onProductSelect = (product: ProductSearchResult) => {
    form.setValue('name', product.title);
  };

  return (
    <FormDialog
      as={Dialog}
      open={open}
      className="min-h-[80vh] max-w-6xl"
      formClassName="flex-1"
      title="New Product"
      form={form}
      onClose={onClose}
      onSubmit={onSubmit}
    >
      <ProductOnlineSearch onSelect={onProductSelect} />
    </FormDialog>
  );
};
