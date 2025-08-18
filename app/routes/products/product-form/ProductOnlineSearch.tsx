import { PackageSearchIcon } from 'lucide-react';
import { type FC, useEffect, useMemo, useState } from 'react';
import { Block, Flex, Spinner, TextInput } from 'tw-react-components';

import type { StoreKey } from '~/prisma/enums';

import {
  PRODUCT_SOURCE_ICONS,
  PRODUCT_SOURCE_LABELS,
  api,
  debounce,
  useApiPromise,
} from '~/client';
import type { ProductOnlineSearchResult } from '~/types';

type ProductOnlineSearchProps = {
  onSelect: (product: ProductOnlineSearchResult) => void;
};

export const ProductOnlineSearch: FC<ProductOnlineSearchProps> = ({}) => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useApiPromise(api.product.searchOnline, { search }, !search);

  const groupedData = useMemo(
    () =>
      data?.reduce(
        (acc, product) => {
          for (const source of product.sources) {
            acc[source.storeKey] ??= [];
            acc[source.storeKey].push(product);
          }

          return acc;
        },
        {} as Record<string, ProductOnlineSearchResult[]>,
      ) ?? {},
    [data],
  );

  useEffect(() => {
    if (!search) return;

    console.log(search);
  }, [search]);

  return (
    <Flex className="flex-1 gap-4" direction="column" fullHeight>
      <TextInput
        className="w-1/3"
        name="search"
        label="Search"
        onChange={debounce((e) => setSearch(e.target.value), 500)}
        suffixIcon={PackageSearchIcon}
      />
      {!data?.length || isLoading ? (
        <Flex
          className="flex-1 gap-2"
          direction="column"
          fullWidth
          fullHeight
          align="center"
          justify="center"
        >
          {isLoading ? (
            <Spinner />
          ) : (
            <span className="text-sm text-gray-500">
              {data ? 'No products found' : 'Fill in the name of the product to search'}
            </span>
          )}
        </Flex>
      ) : (
        <Flex className="gap-8" direction="column">
          {(Object.entries(groupedData) as [StoreKey, ProductOnlineSearchResult[]][]).map(
            ([source, products]) => {
              const Icon = PRODUCT_SOURCE_ICONS[source];

              return (
                <Flex key={source} className="gap-4" direction="column">
                  <span className="flex items-center gap-2 text-lg font-bold">
                    <Icon className="h-5 w-5" />
                    {PRODUCT_SOURCE_LABELS[source]}
                  </span>
                  <Block className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                    {products.map((product, index) => (
                      <Flex
                        key={index}
                        className="gap-4"
                        direction="column"
                        align="center"
                        fullWidth
                      >
                        <img
                          className="h-32 w-32 rounded-md"
                          src={product.images[0].url}
                          alt={product.name}
                        />
                        <span className="text-center text-sm">{product.name}</span>
                      </Flex>
                    ))}
                  </Block>
                </Flex>
              );
            },
          )}
        </Flex>
      )}
    </Flex>
  );
};
