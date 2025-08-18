import puppeteer from 'puppeteer';
import type { DataTableSorting } from 'tw-react-components';

import { StoreKey } from '~/prisma/client';
import * as Prisma from '~/prisma/models';

import type { Product, ProductOnlineSearchResult } from '~/types';

import { getPrismaOrderBy } from '../helpers';
import { route } from '../route';

export const productHandlers = {
  searchOnline: route<{ search: string }>().handle<ProductOnlineSearchResult[]>(
    ({ params: { search } }) =>
      Promise.all([scrapeAlbertHeijn(search), scrapeJumbo(search)]).then((results) =>
        results.flat(),
      ),
  ),
  getPage: route<{
    page: number;
    filters?: Prisma.ProductWhereInput[];
    sorting?: DataTableSorting<Product>;
  }>().handle(({ params: { page, filters, sorting }, context: { prisma } }) =>
    Promise.all([
      prisma.product.findMany({
        where: { AND: filters },
        include: {
          tags: { include: { tag: true } },
          images: true,
          variants: { include: { sources: true } },
        },
        skip: 25 * (page ?? 0),
        take: 25,
        orderBy: getPrismaOrderBy(sorting),
      }),
      prisma.product.count({ where: { AND: filters } }),
    ]),
  ),
  create: route<Prisma.ProductCreateInput | Prisma.ProductUncheckedCreateInput>().handle(
    ({ params, context: { prisma } }) => prisma.product.create({ data: params }),
  ),
  update: route<
    { id: number } & (Prisma.ProductUpdateInput | Prisma.ProductUncheckedUpdateInput)
  >().handle(({ params: { id, ...data }, context: { prisma } }) =>
    prisma.product.update({ where: { id }, data }),
  ),
  delete: route<{ id: number }>().handle(({ params: { id }, context: { prisma } }) =>
    prisma.product.delete({ where: { id } }),
  ),
};

async function scrapeAlbertHeijn(search: string): Promise<ProductOnlineSearchResult[]> {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

  try {
    const page = await browser.newPage();

    page.setExtraHTTPHeaders({
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      Referer: 'https://www.google.com/',
    });

    await page.goto(`https://www.ah.nl/zoeken/api/products/search?query=${search}&size=10`);

    const html = await page.$eval('body > pre', (el) => el.innerText);

    const result = JSON.parse(html) as {
      cards: {
        type: string;
        products: {
          id: number;
          title: string;
          link: string;
          brand: string;
          images: { url: string }[];
          price: { now: number };
        }[];
      }[];
    };

    return result.cards
      .filter((card) => card.type === 'default')
      .flatMap((card) => card.products)
      .slice(0, 6)
      .map((product) => ({
        id: -1,
        name: product.title,
        brand: product.brand,
        images: product.images.map((image) => ({ id: -1, url: image.url, variantId: -1 })),
        sources: [
          {
            id: -1,
            price: product.price.now,
            url: product.link,
            storeKey: StoreKey.ALBERT_HEIJN,
            variantId: -1,
          },
        ],
        productId: -1,
      }));
  } catch (error) {
    console.error(error);

    return [];
  } finally {
    await browser.close();
  }
}

async function scrapeJumbo(search: string): Promise<ProductOnlineSearchResult[]> {
  const query = `
    query SearchProducts($input: ProductSearchInput!) {
      searchProducts(input: $input) {
        products {
          ...SearchProductDetails
        }
      }
    }

    fragment SearchProductDetails on Product {
      id: sku
      brand
      title
      image
      link
      retailSet
      prices: price {
        price
        promoPrice
        pricePerUnit {
          price
          unit
        }
      }
    }
  `;

  const variables = {
    input: {
      searchType: 'keyword',
      searchTerms: search,
      friendlyUrl: `?searchType=keyword&searchTerms=${search}`,
      offSet: 0,
      currentUrl: `/producten/?searchType=keyword&searchTerms=${search}`,
      previousUrl: '',
      bloomreachCookieId: '',
    },
  };

  const response = await fetch('https://www.jumbo.com/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const data = (await response.json()) as {
    data: {
      searchProducts: {
        products: {
          id: string;
          brand: string;
          title: string;
          image: string;
          link: string;
          retailSet: boolean;
          prices: { price: number };
        }[];
      };
    };
  };

  return data.data.searchProducts.products.slice(0, 6).map((product) => ({
    id: -1,
    name: product.title,
    brand: product.brand,
    images: [{ id: -1, url: product.image, variantId: -1 }],
    sources: [
      {
        id: -1,
        url: product.link,
        price: product.prices.price,
        storeKey: StoreKey.JUMBO,
        variantId: -1,
      },
    ],
    productId: -1,
  }));
}
