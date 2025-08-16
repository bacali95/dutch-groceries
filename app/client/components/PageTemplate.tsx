import type { LucideIcon } from 'lucide-react';
import { ChevronRightIcon } from 'lucide-react';
import type { FC, ReactNode } from 'react';
import { Link } from 'react-router';
import type { FlexProps } from 'tw-react-components';
import { Button, Flex, Separator, Sidebar, cn } from 'tw-react-components';

import type { FiltersProps } from './filters';
import { FiltersContent, FiltersTrigger } from './filters';

type BreadCrumbProps = {
  title: ReactNode;
  to?: string;
  onClick?: () => void;
  hide?: boolean;
};

type Props = Omit<FlexProps, 'title'> & {
  icon?: LucideIcon;
  title?: ReactNode;
  breadcrumbs?: BreadCrumbProps[];
  actions?: ReactNode;
  bodyClassName?: string;
  filtersProps?: FiltersProps;
  headerBottomBorder?: boolean;
  isSubSection?: boolean;
};

export const PageTemplate: FC<Props> = ({
  className,
  bodyClassName,
  icon: Icon,
  title,
  breadcrumbs = [],
  actions,
  filtersProps,
  headerBottomBorder,
  isSubSection,
  children,
  ...props
}) => {
  return (
    <Flex
      className={cn('overflow-hidden', headerBottomBorder ? 'gap-0' : 'p-3', className)}
      direction="column"
      fullHeight
      fullWidth
      {...props}
    >
      <Flex
        className={cn(headerBottomBorder && 'border-b p-3')}
        align="center"
        justify="between"
        fullWidth
      >
        <Flex className="gap-2" align="center" fullWidth>
          {!isSubSection && (
            <>
              <Sidebar.Trigger />
              {(Icon || title || filtersProps) && (
                <Separator className="h-7" orientation="vertical" decorative />
              )}
            </>
          )}
          {Icon && (
            <Icon
              className={cn(
                'mr-2 ml-2 h-4 w-4 flex-shrink-0',
                breadcrumbs.filter((breadcrumb) => !breadcrumb.hide).length && 'mr-0',
              )}
            />
          )}
          {breadcrumbs.length > 0 && (
            <Flex className="gap-0" align="center">
              {breadcrumbs
                .filter((breadcrumb) => !breadcrumb.hide)
                .map((breadcrumb, index) => (
                  <Flex key={index} className="gap-0" align="center">
                    {breadcrumb.to ? (
                      <Link to={breadcrumb.to} onClick={breadcrumb.onClick}>
                        <Button className="px-2" variant="text">
                          {breadcrumb.title}
                        </Button>
                      </Link>
                    ) : (
                      <span onClick={breadcrumb.onClick}>{breadcrumb.title}</span>
                    )}
                    <ChevronRightIcon className="h-5 w-5" />
                  </Flex>
                ))}
            </Flex>
          )}
          {title && (
            <Flex className="font-medium" align="center">
              {title}
            </Flex>
          )}
          {filtersProps && <FiltersTrigger {...filtersProps} />}
        </Flex>
        {actions && (
          <Flex className="gap-2" align="center">
            {actions}
          </Flex>
        )}
      </Flex>
      {filtersProps && <FiltersContent {...filtersProps} />}
      <Flex
        className={cn('overflow-hidden', headerBottomBorder && 'p-3', bodyClassName)}
        direction="column"
        fullHeight
        fullWidth
      >
        {children}
      </Flex>
    </Flex>
  );
};
