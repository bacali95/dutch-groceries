import {
  BrushIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  HashIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router';
import { DropdownMenu, Sidebar, useLayoutContext, useSidebar } from 'tw-react-components';

import type { User } from '~/generated/prisma';

export const NavUser: FC<{
  version: string;
  user: User;
}> = ({ version, user }) => {
  const { theme, setTheme, showIds, toggleShowIds } = useLayoutContext();
  const { isMobile } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Sidebar.MenuButton
          size="lg"
          className="h-auto data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <img
            className="h-8 w-8 rounded-lg"
            src={`https://ui-avatars.com/api/?name=${user.name ?? '-'}`}
            alt={user.name}
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
          <ChevronsUpDownIcon className="ml-auto size-4" />
        </Sidebar.MenuButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg text-sm"
        side={isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenu.Label className="flex items-center gap-2 p-1.5 text-left font-normal">
          <img
            className="h-8 w-8 rounded-lg"
            src={`https://ui-avatars.com/api/?name=${user.name ?? '-'}`}
            alt={user.name}
          />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.name}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
        </DropdownMenu.Label>
        <DropdownMenu.Separator />
        <DropdownMenu.Group>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>
              <DropdownMenu.Icon icon={BrushIcon} />
              Theme
            </DropdownMenu.SubTrigger>
            <DropdownMenu.Portal>
              <DropdownMenu.SubContent className="text-sm">
                {(['light', 'dark', 'system'] as const).map((item) => (
                  <DropdownMenu.Item
                    key={item}
                    className="capitalize"
                    onClick={() => setTheme(item)}
                  >
                    <DropdownMenu.Icon
                      icon={item === 'light' ? SunIcon : item === 'dark' ? MoonIcon : MonitorIcon}
                    />
                    {item}
                    {theme === item && <DropdownMenu.Icon className="ml-auto" icon={CheckIcon} />}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>
          <DropdownMenu.Item onClick={toggleShowIds}>
            <DropdownMenu.Icon icon={HashIcon} />
            {showIds ? 'Hide IDs' : 'Show IDs'}
            {showIds && <DropdownMenu.Icon className="ml-auto" icon={CheckIcon} />}
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <Link to="/secure/logout">
          <DropdownMenu.Item className="w-full cursor-pointer">
            <DropdownMenu.Icon icon={LogOutIcon} />
            Logout
          </DropdownMenu.Item>
        </Link>
        <DropdownMenu.Separator />
        <DropdownMenu.Item className="py-0.5 text-sm font-semibold" disabled>
          v{version}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
