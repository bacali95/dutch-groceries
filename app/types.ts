import type { ProductSourceType } from './generated/prisma';

export type IApiSchema = {
  [entity: string]: {
    [operation: string]: (params: any) => Promise<any>;
  };
};

export type ApiSchema = {
  product: {
    searchOnline: (params: { search: string }) => Promise<ProductSearchResult[]>;
  };
};

export type ProductSearchResult = {
  title: string;
  image: string;
  price: number;
  url: string;
  source: ProductSourceType;
};
