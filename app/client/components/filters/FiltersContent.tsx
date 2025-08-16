import { PlusIcon, XIcon } from 'lucide-react';
import type { FC } from 'react';
import {
  Badge,
  DropdownMenu,
  Flex,
  type SelectItem,
  Spinner,
  getDisplayDate,
} from 'tw-react-components';

import { useTimeOffsetContext } from '../../contexts';
import { useApiPromise } from '../../hooks';
import { FiltersTriggerWrapper } from './FiltersTriggerWrapper';
import { operations } from './constants';
import type { Field, FilterItem, FiltersProps } from './types';

export const FiltersContent: FC<FiltersProps> = (props) => {
  const { filters, updateFilter, removeFilter } = props;

  const filtersItems = Object.values(filters)
    .flat()
    .filter((filter) => !!filter.value);
  const availableFields = props.fields.filter(
    (field) => !filtersItems.some((filter) => filter.field.key === field.key),
  );

  if (!filtersItems.length) return;

  return (
    <Flex className="text-sm" wrap>
      {filtersItems.map((filter, index) => (
        <Flex
          key={`${filter.field.key}-${index}`}
          className="h-full [align-items:stretch] gap-0 divide-x-2 divide-white overflow-hidden rounded-md bg-slate-100 dark:divide-slate-900 dark:bg-slate-700"
        >
          <Flex className="px-2" align="center" fullHeight>
            {filter.field.label}
          </Flex>
          {filter.field.type !== 'boolean' && !filter.field.customQuery && (
            <>
              {filter.not && (
                <Flex
                  className="cursor-pointer bg-slate-200 px-2 dark:bg-slate-800"
                  align="center"
                  onClick={() => updateFilter(filter.field.key, { ...filter, not: false })}
                  fullHeight
                >
                  Not
                </Flex>
              )}
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Flex
                    className="cursor-pointer bg-slate-200 px-2 dark:bg-slate-800"
                    align="center"
                    fullHeight
                  >
                    {filter.operation && operations[filter.field.type][filter.operation]}
                  </Flex>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content className="w-32" align="start">
                  {Object.entries(operations[filter.field.type])
                    .filter(([op]) => !(filter.not && op === 'not'))
                    .map(([op, opLabel]) => (
                      <DropdownMenu.Item
                        key={op}
                        onSelect={() =>
                          updateFilter(filter.field.key, {
                            ...filter,
                            ...(op === 'not' ? { not: true } : { operation: op }),
                          })
                        }
                      >
                        {opLabel}
                      </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
              </DropdownMenu>
            </>
          )}
          <FiltersTriggerWrapper {...props} filter={filter}>
            <Flex className="cursor-pointer px-2" align="center" fullHeight>
              <FilterValue filter={filter} loadSelectables={props.loadSelectables} />
            </Flex>
          </FiltersTriggerWrapper>
          <Flex
            className="cursor-pointer px-1 transition-colors hover:bg-red-500 hover:text-white dark:hover:bg-red-600"
            align="center"
            fullHeight
            onClick={() => removeFilter(filter.field.key)}
          >
            <XIcon className="h-4 w-4" />
          </Flex>
        </Flex>
      ))}
      {availableFields.length > 0 && (
        <FiltersTriggerWrapper {...props} fields={availableFields}>
          <Badge
            className="cursor-pointer justify-center rounded-md border border-dashed"
            variant="outlined"
            prefixIcon={PlusIcon}
          />
        </FiltersTriggerWrapper>
      )}
    </Flex>
  );
};

const FilterValue: FC<{
  filter: FilterItem;
  loadSelectables: (field: Field) => Promise<SelectItem<string | number, boolean>[]>;
}> = ({ filter, loadSelectables }) => {
  const field = filter.field;

  const timeOffset = useTimeOffsetContext();

  const { data: selectables = [], isLoading } = useApiPromise(
    loadSelectables,
    field,
    field.type !== 'relation' && field.type !== 'relation-multiple',
  );

  switch (field.type) {
    case 'string':
    case 'number':
      return filter.value as number | string;
    case 'date':
    case 'dateTime':
      return getDisplayDate(filter.value as Date, { offset: timeOffset });
    case 'relation':
    case 'relation-multiple':
      return isLoading ? (
        <Spinner className="h-4 w-4 bg-transparent" />
      ) : (
        selectables
          .filter((item) => (filter.value as (string | number)[]).includes(item.id))
          .map((item) => item.label)
          .join(', ')
      );
    case 'boolean':
      return String(filter.value) === 'true' ? 'Yes' : 'No';
  }
};
