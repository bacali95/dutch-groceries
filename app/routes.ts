import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  route('status', 'routes/status.ts'),
  route('rpc', 'routes/rpc.ts'),
  layout('routes/layout.tsx', [
    route('login', 'routes/login.tsx'),
    route('logout', 'routes/logout.tsx'),
    layout('routes/protected.tsx', { id: 'protected' }, [
      index('routes/groceries/index.tsx'),
      route('products', 'routes/products/index.tsx'),
      route('products/new', 'routes/products/product-form/index.tsx'),
      route('users', 'routes/users/index.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
