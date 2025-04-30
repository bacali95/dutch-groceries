import { CherryIcon, ShoppingCartIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import type { LayoutSidebarProps, ThemeState } from 'tw-react-components';
import {
  Layout,
  LayoutContextProvider,
  SHOW_IDS_COOKIE_NAME,
  SIDEBAR_COOKIE_NAME,
  Sidebar,
  SidebarContextProvider,
  THEME_COOKIE_NAME,
} from 'tw-react-components';

import { ToastContextProvider } from '~/client';
import { getValueFromCookie } from '~/utils';

import { version } from '../../package.json';
import type { Route } from './+types/layout';
import { NavUser } from './nav-user';

export function loader({ request }: Route.LoaderArgs) {
  return {
    theme: getValueFromCookie<ThemeState>(
      request.headers.get('Cookie') ?? '',
      THEME_COOKIE_NAME,
      'system',
    ),
    sidebarOpen: getValueFromCookie<boolean>(
      request.headers.get('Cookie') ?? '',
      SIDEBAR_COOKIE_NAME,
      false,
    ),
    showIds: getValueFromCookie<boolean>(
      request.headers.get('Cookie') ?? '',
      SHOW_IDS_COOKIE_NAME,
      false,
    ),
  };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const sidebarProps: LayoutSidebarProps = useMemo(
    () => ({
      className: 'py-1',
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
      footer: (
        <NavUser
          version={version}
          user={{ id: 1, name: 'John Doe', email: 'john.doe@example.com' }}
        />
      ),
      basePath: '/',
    }),
    [],
  );

  return (
    <ToastContextProvider>
      <LayoutContextProvider theme={loaderData.theme} showIds={loaderData.showIds}>
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
      </LayoutContextProvider>
    </ToastContextProvider>
  );
}
