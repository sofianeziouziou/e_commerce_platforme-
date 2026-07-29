import { env } from '../../shared/config/env';

async function apiGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({ message: `HTTP ${response.status}` }))).message || `HTTP ${response.status}`);
  return response.json();
}

async function apiPost<T>(path: string, body: unknown, token: string): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (response.status === 204) return undefined as T;
  if (!response.ok) throw new Error((await response.json().catch(() => ({ message: `HTTP ${response.status}` }))).message || `HTTP ${response.status}`);
  return response.json();
}

async function apiPut<T>(path: string, body: unknown, token: string): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (response.status === 204) return undefined as T;
  if (!response.ok) throw new Error((await response.json().catch(() => ({ message: `HTTP ${response.status}` }))).message || `HTTP ${response.status}`);
  return response.json();
}

async function apiDelete(path: string, token: string): Promise<void> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error((await response.json().catch(() => ({ message: `HTTP ${response.status}` }))).message || `HTTP ${response.status}`);
}

export type DashboardSummary = {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  deliveredOrders: number;
  todayOrders: number;
  totalCustomers: number;
  activePromotions: number;
  totalRevenue: number;
};

export type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  active: boolean;
  displayOrder: number;
};

export type ProductItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  sku: string | null;
  unitLabel: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string | null;
  active: boolean;
  featured: boolean;
  categoryName: string;
  categoryId?: number;
  stock: number | null;
};

export type OrderItem = {
  id: number;
  orderNumber: string;
  status: string;
  subtotalAmount: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  customerNote: string | null;
  customerEmail: string;
  customerName: string;
  createdAt: string;
};

export type PromotionItem = {
  id: number;
  name: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  productCount: number;
};

export type CustomerItem = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
};

export function getDashboard(token: string): Promise<DashboardSummary> {
  return apiGet<DashboardSummary>('/admin/dashboard', token);
}

export function getCategories(token: string): Promise<CategoryItem[]> {
  return apiGet<CategoryItem[]>('/admin/categories', token);
}

export function createCategory(token: string, data: { name: string; description?: string; imageUrl?: string; displayOrder: number }): Promise<CategoryItem> {
  return apiPost<CategoryItem>('/admin/categories', data, token);
}

export function updateCategory(token: string, id: number, data: { name: string; description?: string; imageUrl?: string; active: boolean; displayOrder: number }): Promise<CategoryItem> {
  return apiPut<CategoryItem>(`/admin/categories/${id}`, data, token);
}

export function deleteCategory(token: string, id: number): Promise<void> {
  return apiDelete(`/admin/categories/${id}`, token);
}

export function getProducts(token: string, search?: string, page?: number, size?: number): Promise<ProductItem[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (page != null) params.set('page', page.toString());
  if (size != null) params.set('size', size.toString());
  const qs = params.toString();
  return apiGet<ProductItem[]>(`/admin/products${qs ? '?' + qs : ''}`, token);
}

export function createProduct(token: string, data: {
  categoryId: number; name: string; unitLabel: string; price: number;
  description?: string; brand?: string; sku?: string; oldPrice?: number;
  imageUrl?: string; featured?: boolean; initialQuantity?: number;
}): Promise<ProductItem> {
  return apiPost<ProductItem>('/admin/products', data, token);
}

export function updateProduct(token: string, id: number, data: {
  categoryId: number; name: string; unitLabel: string; price: number;
  description?: string; brand?: string; sku?: string; oldPrice?: number | null;
  imageUrl?: string; active: boolean; featured: boolean;
}): Promise<ProductItem> {
  return apiPut<ProductItem>(`/admin/products/${id}`, data, token);
}

export function deleteProduct(token: string, id: number): Promise<void> {
  return apiDelete(`/admin/products/${id}`, token);
}

export function updateInventory(token: string, productId: number, data: { quantity: number; lowStockThreshold: number }): Promise<void> {
  return apiPut<void>(`/admin/products/${productId}/inventory`, data, token);
}

export function getOrders(token: string, status?: string, page?: number, size?: number): Promise<OrderItem[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (page != null) params.set('page', page.toString());
  if (size != null) params.set('size', size.toString());
  const qs = params.toString();
  return apiGet<OrderItem[]>(`/admin/orders${qs ? '?' + qs : ''}`, token);
}

export function updateOrderStatus(token: string, id: number, status: string): Promise<OrderItem> {
  return apiPut<OrderItem>(`/admin/orders/${id}/status`, { status }, token);
}

export function getPromotions(token: string): Promise<PromotionItem[]> {
  return apiGet<PromotionItem[]>('/admin/promotions', token);
}

export function getCustomers(token: string, search?: string, page?: number): Promise<CustomerItem[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (page != null) params.set('page', page.toString());
  return apiGet<CustomerItem[]>(`/admin/customers${params.toString() ? '?' + params.toString() : ''}`, token);
}

export function getNotificationCount(token: string): Promise<{ count: number }> {
  return apiGet<{ count: number }>('/admin/notifications/count', token);
}

export type OrderDetailAddress = {
  recipientName: string;
  phoneNumber: string;
  streetLine: string;
  city: string;
  governorate: string;
  postalCode: string;
};

export type OrderDetailItem = {
  id: number;
  productName: string;
  unitLabel: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
};

export type AdminOrderDetail = {
  id: number;
  orderNumber: string;
  status: string;
  subtotalAmount: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  customerNote: string | null;
  createdAt: string;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  address: OrderDetailAddress;
  items: OrderDetailItem[];
};

export function getOrderDetail(token: string, orderId: number): Promise<AdminOrderDetail> {
  return apiGet<AdminOrderDetail>(`/admin/orders/${orderId}`, token);
}
