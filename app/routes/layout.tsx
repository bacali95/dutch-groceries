import { Outlet } from 'react-router';
import type { ThemeState } from 'tw-react-components';
import {
  LayoutContextProvider,
  SHOW_IDS_COOKIE_NAME,
  THEME_COOKIE_NAME,
} from 'tw-react-components';

import { ToastContextProvider } from '~/client';
import { getValueFromCookie } from '~/utils';

import type { Route } from './+types/layout';

export async function loader({ request }: Route.LoaderArgs) {
  return {
    theme: getValueFromCookie<ThemeState>(
      request.headers.get('Cookie') ?? '',
      THEME_COOKIE_NAME,
      'system',
    ),
    showIds: getValueFromCookie<boolean>(
      request.headers.get('Cookie') ?? '',
      SHOW_IDS_COOKIE_NAME,
      false,
    ),
  };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  return (
    <ToastContextProvider>
      <LayoutContextProvider theme={loaderData.theme} showIds={loaderData.showIds}>
        <Outlet />
      </LayoutContextProvider>
    </ToastContextProvider>
  );
}
