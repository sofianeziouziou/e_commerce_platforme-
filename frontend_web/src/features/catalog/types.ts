export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  displayOrder: number;
};

export type Product = {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  sku?: string;
  unitLabel: string;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string;
  active: boolean;
  featured: boolean;
  availableQuantity?: number | null;
};

export type Promotion = {
  id: number;
  name: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  productIds: number[];
};
export type SortMode = 'featured' | 'price-asc' | 'price-desc' | 'name' | 'newest';
