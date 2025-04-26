import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  layout('routes/layout.tsx', [
    index('routes/groceries/index.tsx'),
    route('products', 'routes/products/index.tsx'),
  ]),
] satisfies RouteConfig;
