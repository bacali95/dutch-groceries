import { CherryIcon, ShoppingCartIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import type { LayoutSidebarProps } from 'tw-react-components';
import { Layout, SIDEBAR_COOKIE_NAME, Sidebar, SidebarContextProvider } from 'tw-react-components';
import { orMiddleware } from 'typesafe-rpc/server';

import { prisma } from '~/server';
import { hasCloudflareJwt, hasSession } from '~/server/middleware';
import { getValueFromCookie } from '~/utils';

import { version } from '../../package.json' with { type: 'json' };
import type { Route } from './+types/protected';
import { NavUser } from './nav-user';

export async function loader({ request }: Route.LoaderArgs) {
  const { user } = await orMiddleware(
    hasSession,
    hasCloudflareJwt,
  )({ params: {}, extraParams: {}, context: { request, prisma } });

  return {
    user,
    sidebarOpen: getValueFromCookie<boolean>(
      request.headers.get('Cookie') ?? '',
      SIDEBAR_COOKIE_NAME,
      false,
    ),
  };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const sidebarProps: LayoutSidebarProps = useMemo(
    () => ({
      className: 'py-1',
      variant: 'inset',
      header: (
        <Link to="/">
          <Sidebar.MenuButton size="lg">
            <img
              className="block h-8 w-8 rounded-lg p-1 dark:bg-slate-200"
              src="/images/logo-only.png"
              alt="Logo"
              loading="lazy"
            />
            <span className="ml-1 text-lg font-semibold">Dutch Groceries</span>
          </Sidebar.MenuButton>
        </Link>
      ),
      items: [
        {
          type: 'group',
          items: [
            {
              pathname: '',
              title: 'Groceries',
              Icon: ShoppingCartIcon,
            },
            {
              pathname: 'products',
              title: 'Products',
              Icon: CherryIcon,
            },
          ],
        },
      ],
      footer: <NavUser version={version} user={loaderData.user} />,
      basePath: '/',
    }),
    [],
  );

  return (
    <SidebarContextProvider defaultOpen={loaderData.sidebarOpen}>
      <Layout
        className="p-0"
        sidebarProps={sidebarProps}
        NavLink={NavLink}
        useLocation={useLocation}
      >
        <Outlet />
      </Layout>
    </SidebarContextProvider>
  );
}
