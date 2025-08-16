import type { ProductSourceType } from '~/prisma/client';

export type AuthMethod = 'basic' | 'cloudflare';

export type ProductSearchResult = {
  title: string;
  image: string;
  price: number;
  url: string;
  source: ProductSourceType;
};
