import { CheckIcon } from 'lucide-react';
import type { FC } from 'react';
import { useMemo, useState } from 'react';
import {
  Button,
  DateTimeInput,
  DropdownMenu,
  Flex,
  NumberInput,
  type SelectItem,
  TextInput,
} from 'tw-react-components';

import { useApiPromise } from '../../hooks';
import { getFilterDefaultOperation } from './query-parser';
import type { Field, FilterItem } from './types';

export type FilterOptionsProps = {
  field: Field;
  value?: FilterItem['value'];
  onSubmit: (field: string, value: FilterItem['value']) => void;
  loadSelectables: (field: Field) => Promise<SelectItem<string | number, boolean>[]>;
};

export const StringFilterOptions: FC<FilterOptionsProps> = ({ value, field, onSubmit }) => {
  const [search, setSearch] = useState<string>(value ? String(value) : '');

  const submit = () => {
    const [constructor] = getFilterDefaultOperation(field);

    onSubmit(
      field.key,
      !search
        ? null
        : field.type === 'relation' || field.type === 'relation-multiple'
          ? search.split(',').map((item) => constructor(item))
          : constructor(search),
    );
  };

  return (
    <Flex className="gap-1" align="center">
      <TextInput
        autoFocus
        value={search}
        placeholder={field.label}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && submit()}
      />
      <Button className="h-7 w-7" color="green" prefixIcon={CheckIcon} onClick={submit} />
    </Flex>
  );
};

export const NumberFilterOptions: FC<FilterOptionsProps> = ({
  field,
  value: initialValue,
  onSubmit,
}) => {
  const [value, setValue] = useState<string>(initialValue ? String(initialValue) : '');

  const submit = () => {
    const [constructor] = getFilterDefaultOperation(field);

    onSubmit(
      field.key,
      !value
        ? null
        : field.type === 'relation' || field.type === 'relation-multiple'
          ? value.split(',').map((item) => constructor(item))
          : constructor(value),
    );
  };

  return (
    <Flex className="gap-1">
      <NumberInput
        autoFocus
        value={value}
        placeholder={field.label}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && submit()}
      />
      <Button className="h-7 w-7" color="green" prefixIcon={CheckIcon} onClick={submit} />
    </Flex>
  );
};

export const DateFilterOptions: FC<FilterOptionsProps> = ({ field, value, onSubmit }) => (
  <DateTimeInput
    className="[&>div:nth-child(2)]:w-72"
    placeholder={field.label}
    type={field.type === 'date' ? 'date' : 'datetime-local'}
    value={value as Date}
    onChange={(date) => {
      const value = date ? date.toISOString() : null;
      const [constructor] = getFilterDefaultOperation(field);

      onSubmit(
        field.key,
        !value
          ? null
          : field.type === 'relation' || field.type === 'relation-multiple'
            ? value.split(',').map((item) => constructor(item))
            : constructor(value),
      );
    }}
  />
);

export const BooleanFilterOptions: FC<FilterOptionsProps> = ({ field, value, onSubmit }) =>
  [
    { id: 'yes', label: 'Yes', value: 'true' },
    { id: 'no', label: 'No', value: 'false' },
  ].map((item) => (
    <DropdownMenu.CheckboxItem
      key={item.id}
      className="cursor-pointer"
      checked={value === item.value}
      onSelect={() => onSubmit(field.key, item.value)}
    >
      {item.label}
    </DropdownMenu.CheckboxItem>
  ));

export const SelectFilterOptions: FC<FilterOptionsProps> = ({
  value = [],
  field,
  onSubmit,
  loadSelectables,
}) => {
  const [search, setSearch] = useState<string>('');

  const { data: items = [], isLoading } = useApiPromise(loadSelectables, field);

  const filteredItems = useMemo(
    () => items.filter((item) => item.label.toLowerCase().includes(search.toLowerCase())) ?? [],
    [items, search],
  );

  return (
    <>
      <TextInput
        placeholder={field.label}
        onChange={(event) => setSearch(event.target.value)}
        onKeyDown={(event) => event.stopPropagation()}
      />
      <DropdownMenu.Separator />
      <DropdownMenu.Group className="max-h-[18rem] overflow-auto">
        {isLoading ? (
          <DropdownMenu.Item disabled>Loading...</DropdownMenu.Item>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <DropdownMenu.CheckboxItem
              key={item.id}
              className="cursor-pointer"
              checked={(value as (string | number)[]).includes(item.id)}
              onCheckedChange={(checked) => {
                const [constructor] = getFilterDefaultOperation(field);
                const selected = value as (string | number)[];
                const newValue =
                  field.type === 'relation' || field.type === 'relation-multiple'
                    ? String(item.value)
                        .split(',')
                        .map((item) => constructor(item))
                    : [constructor(value)];

                onSubmit(
                  field.key,
                  checked
                    ? [...selected, ...newValue]
                    : selected.filter((v) => !newValue.includes(v)),
                );
              }}
            >
              {item.label}
            </DropdownMenu.CheckboxItem>
          ))
        ) : (
          <DropdownMenu.Item disabled>No items</DropdownMenu.Item>
        )}
      </DropdownMenu.Group>
    </>
  );
};
