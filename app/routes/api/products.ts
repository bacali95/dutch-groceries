import puppeteer from 'puppeteer';

import { ProductSourceType } from '~/generated/prisma';

import { createEntityApiHandler } from '~/server';
import type { ApiSchema, ProductSearchResult } from '~/types';

import type { Route } from './+types/products';

export async function action({ request }: Route.ActionArgs) {
  return createEntityApiHandler<ApiSchema, 'product'>(request, {
    searchOnline: async ({ search }) => {
      return Promise.all([scrapeAlbertHeijn(search), scrapeJumbo(search)]).then((results) =>
        results.flat(),
      );
    },
  });
}

async function scrapeAlbertHeijn(search: string): Promise<ProductSearchResult[]> {
  const browser = await puppeteer.launch();

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
        title: product.title,
        image: product.images.at(-1)?.url ?? '',
        price: product.price.now,
        url: product.link,
        source: ProductSourceType.ALBERT_HEIJN,
      }));
  } catch (error) {
    console.error(error);

    return [];
  } finally {
    await browser.close();
  }
}

async function scrapeJumbo(search: string): Promise<ProductSearchResult[]> {
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
    title: product.title,
    image: product.image,
    price: product.prices.price,
    url: product.link,
    source: ProductSourceType.JUMBO,
  }));
}
