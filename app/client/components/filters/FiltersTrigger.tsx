import type { DropdownMenuContentProps } from '@radix-ui/react-dropdown-menu';
import { ListFilterIcon, XIcon } from 'lucide-react';
import type { FC } from 'react';
import { Badge } from 'tw-react-components';

import { FiltersTriggerWrapper } from './FiltersTriggerWrapper';
import type { FiltersProps } from './types';

export const FiltersTrigger: FC<
  FiltersProps & { mode?: 'start' | 'add'; align?: DropdownMenuContentProps['align'] }
> = (props) => {
  const hasFilters = Object.values(props.filters).some((filter) =>
    filter.some((item) => !!item.value),
  );

  return !hasFilters ? (
    <FiltersTriggerWrapper {...props}>
      <Badge
        className="ml-2 cursor-pointer rounded-md border border-dashed px-2"
        variant="outlined"
        prefixIcon={ListFilterIcon}
      >
        Filter
      </Badge>
    </FiltersTriggerWrapper>
  ) : (
    <Badge
      className="ml-2 cursor-pointer rounded-md border border-dashed px-2"
      suffixIcon={XIcon}
      color="red"
      variant="outlined"
      onClick={props.clearFilters}
    >
      Clear filters
    </Badge>
  );
};
