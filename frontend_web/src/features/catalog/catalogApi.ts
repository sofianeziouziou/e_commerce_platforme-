import { env } from '../../shared/config/env';
import { fallbackCategories, fallbackProducts, fallbackPromotions } from './fallbackCatalog';
import type { Category, Product, Promotion, SortMode } from './types';

type PageResponse<T> = {
  content: T[];
};

async function getJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${env.apiBaseUrl}${path}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getCatalogData(sort: SortMode = 'featured') {
  const query = new URLSearchParams({ size: '96', sort });
  const [categories, productsPage, promotions] = await Promise.all([
    getJson<Category[]>('/catalog/categories', fallbackCategories),
    getJson<PageResponse<Product>>(`/catalog/products?${query.toString()}`, { content: fallbackProducts }),
    getJson<Promotion[]>('/catalog/promotions', fallbackPromotions),
  ]);

  return {
    categories,
    products: productsPage.content,
    promotions,
    fromFallback: productsPage.content === fallbackProducts,
  };
}

export async function getProductBySlug(slug: string) {
  const fallback = fallbackProducts.find((product) => product.slug === slug) ?? fallbackProducts[0];
  return getJson<Product>(`/catalog/products/${slug}`, fallback);
}

export async function getSimilarProducts(slug: string) {
  const fallbackProduct = fallbackProducts.find((product) => product.slug === slug);
  const fallback = fallbackProducts
    .filter((product) => product.categoryId === fallbackProduct?.categoryId && product.slug !== slug)
    .slice(0, 4);
  return getJson<Product[]>(`/catalog/products/${slug}/similar?size=4`, fallback);
}
