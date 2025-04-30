import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

export default [
  route('status', 'routes/status.ts'),
  layout('routes/layout.tsx', [
    index('routes/groceries/index.tsx'),
    route('products', 'routes/products/index.tsx'),
    route('products/new', 'routes/products/product-form/index.tsx'),
  ]),
  ...prefix('api', [route('products', 'routes/api/products.ts')]),
] satisfies RouteConfig;
