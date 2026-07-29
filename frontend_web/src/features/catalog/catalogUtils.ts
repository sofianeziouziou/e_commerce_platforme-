import type { Product, Promotion, SortMode } from './types';

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND', minimumFractionDigits: 3 }).format(price);

export function isAvailable(product: Product) {
  return product.availableQuantity == null || product.availableQuantity > 0;
}

export function hasPromotion(product: Product, promotions: Promotion[]) {
  return product.oldPrice != null || promotions.some((promotion) => promotion.productIds.includes(product.id));
}

export function discountLabel(product: Product, promotions: Promotion[]) {
  const promotion = promotions.find((item) => item.productIds.includes(product.id));
  if (promotion?.discountType === 'PERCENTAGE') {
    return `-${Math.round(promotion.discountValue)}%`;
  }
  if (promotion?.discountType === 'FIXED_AMOUNT') {
    return `-${promotion.discountValue.toFixed(0)} DT`;
  }
  if (product.oldPrice) {
    return `-${Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%`;
  }
  return null;
}

export function sortProducts(products: Product[], sort: SortMode) {
  return [...products].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'newest') return b.id - a.id;
    return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name);
  });
}

