import type { LucideIcon } from 'lucide-react';
import type { SelectItem } from 'tw-react-components';

export type Value = null | string | number | boolean | Date | (string | number | boolean | Date)[];

export type FiltersProps = {
  searchParams: string;
  fields: Field[];
  filters: Record<string, FilterItem[]>;
  outputs: {
    query: string;
    prisma: object[];
  };
  updateFilter: (field: string, filter: FilterItem) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
  loadSelectables: (field: Field) => Promise<SelectItem<string | number, boolean>[]>;
};

export type FieldType =
  | 'number'
  | 'string'
  | 'boolean'
  | 'date'
  | 'dateTime'
  | 'relation'
  | 'relation-multiple';

export type Field = {
  key: string;
  label: string;
  icon?: LucideIcon;
  selectables?:
    | SelectItem<string | number, boolean>[]
    | (() => Promise<SelectItem<string | number, boolean>[]>);
  cachedSelectables?: SelectItem<string | number, boolean>[];
  transformer?: (query: object) => object;
  customQuery?: (value: Value) => object;
} & (
  | {
      type: Exclude<FieldType, 'relation' | 'relation-multiple'>;
      field: string;
    }
  | {
      type: 'relation' | 'relation-multiple';
      field: string;
      constructor:
        | typeof Number
        | typeof String
        | ((value: string | number) => Date)
        | typeof Boolean;
    }
);

export type FilterItem = {
  field: Field;
  operation: string | null;
  not: boolean | null;
  value: Value;
};

export type DeepNonNullable<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};
