import { useNavigate } from 'react-router';

import { ProductFormModal } from './ProductFormModal';

export default function ProductForm() {
  const navigate = useNavigate();

  return (
    <ProductFormModal
      open
      onClose={() => navigate('/products')}
      onSubmit={(product) => {
        alert(JSON.stringify(product, null, 2));
        navigate('/products');
      }}
    />
  );
}
