import { PackageSearchIcon } from 'lucide-react';
import { type FC, useEffect, useMemo, useState } from 'react';
import { Block, Flex, Spinner, TextInput } from 'tw-react-components';

import {
  PRODUCT_SOURCE_ICONS,
  PRODUCT_SOURCE_LABELS,
  api,
  debounce,
  useApiPromise,
} from '~/client';
import type { ProductSourceType } from '~/prisma/client';
import type { ProductSearchResult } from '~/types';

type ProductOnlineSearchProps = {
  onSelect: (product: ProductSearchResult) => void;
};

export const ProductOnlineSearch: FC<ProductOnlineSearchProps> = ({}) => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useApiPromise(api.product.searchOnline, { search }, !search);

  const groupedData = useMemo(
    () =>
      data?.reduce(
        (acc, product) => {
          const source = product.source;

          acc[source] ??= [];
          acc[source].push(product);

          return acc;
        },
        {} as Record<ProductSourceType, ProductSearchResult[]>,
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
        name="search"
        label="Search"
        onChange={debounce((e) => setSearch(e.target.value), 200)}
        suffixIcon={PackageSearchIcon}
        onSuffixIconClick={() => {
          console.log('clicked');
        }}
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
          {(Object.entries(groupedData) as [ProductSourceType, ProductSearchResult[]][]).map(
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
                          src={product.image}
                          alt={product.title}
                        />
                        <span className="text-center text-sm">{product.title}</span>
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
