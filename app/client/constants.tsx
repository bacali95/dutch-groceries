import { PackageSearchIcon } from 'lucide-react';
import type { FC } from 'react';

import type { ProductSourceType } from '~/generated/prisma';

export const PRODUCT_SOURCE_LABELS: Record<ProductSourceType, string> = {
  MANUAL: 'Manually added',
  ALBERT_HEIJN: 'Albert Heijn',
  JUMBO: 'Jumbo',
  HOOGVLIET: 'Hoogvliet',
};

export const PRODUCT_SOURCE_ICONS: Record<ProductSourceType, FC<{ className: string }>> = {
  MANUAL: PackageSearchIcon,
  ALBERT_HEIJN: ({ className }) => (
    <img
      className={className}
      src="https://static.ah.nl/ah-static/images/ah-ui-bridge-components/logo/logo-ah.svg"
    />
  ),
  JUMBO: ({ className }) => (
    <img className={className} src="https://www.jumbo.com/favicon-32x32.png?v=3" />
  ),
  HOOGVLIET: ({ className }) => (
    <img
      className={className}
      src="https://www.hoogvliet.com/INTERSHOP/static/WFS/org-webshop-Site/-/-/nl_NL/img/logo_is7.ico"
    />
  ),
};
