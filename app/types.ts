import type { Prisma } from '~/prisma/client';
import type { StoreKey } from '~/prisma/enums';

export type User = Prisma.UserGetPayload<{ omit: { password: true; sessionId: true } }>;

export type Product = Prisma.ProductGetPayload<{
  include: {
    tags: { include: { tag: true } };
    images: true;
    // sources: true;
  };
}>;

export type ProductOnlineSearchResult = Prisma.ProductVariantGetPayload<{
  include: { images: true; sources: true };
}>;

export const AvailableStoreMetadata: Record<
  StoreKey,
  { key: StoreKey; name: string; url: string }
> = Object.freeze({
  ALBERT_HEIJN: {
    key: 'ALBERT_HEIJN',
    name: 'Albert Heijn',
    url: 'https://www.ah.nl',
  },
  JUMBO: {
    key: 'JUMBO',
    name: 'Jumbo',
    url: 'https://www.jumbo.com',
  },
});
