import { env } from '../../shared/config/env';

function headers(token: string): Record<string, string> {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function handleResponse(response: Response): Promise<any> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.status === 204 ? undefined : response.json();
}

export type CartItemResponse = {
  id: number;
  productId: number;
  productName: string;
  imageUrl: string;
  unitLabel: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type CartResponse = {
  id: number;
  items: CartItemResponse[];
  subtotal: number;
};

export type AddressResponse = {
  id: number;
  label: string;
  recipientName: string;
  phoneNumber: string;
  streetLine: string;
  city: string;
  governorate: string;
  postalCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  defaultAddress: boolean;
};

export type AddressRequest = {
  label: string;
  recipientName: string;
  phoneNumber: string;
  streetLine: string;
  city: string;
  governorate: string;
  postalCode?: string;
  defaultAddress: boolean;
};

export type OrderItemResponse = {
  id: number;
  productId?: number;
  productName: string;
  unitLabel: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl?: string | null;
};

export type OrderResponse = {
  id: number;
  orderNumber: string;
  status: string;
  subtotalAmount: number;
  deliveryFee: number;
  discountAmount: number;
  totalAmount: number;
  customerNote?: string | null;
  address: AddressResponse | null;
  items: OrderItemResponse[];
  createdAt: string;
};

export function getCart(token: string): Promise<CartResponse> {
  return fetch(`${env.apiBaseUrl}/cart`, { headers: headers(token) }).then(handleResponse);
}

export function addCartItem(token: string, productId: number, quantity: number): Promise<CartResponse> {
  return fetch(`${env.apiBaseUrl}/cart/items`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ productId, quantity }),
  }).then(handleResponse);
}

export function updateCartItem(token: string, itemId: number, quantity: number): Promise<CartResponse> {
  return fetch(`${env.apiBaseUrl}/cart/items/${itemId}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({ quantity }),
  }).then(handleResponse);
}

export function removeCartItem(token: string, itemId: number): Promise<CartResponse> {
  return fetch(`${env.apiBaseUrl}/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: headers(token),
  }).then(handleResponse);
}

export function clearCart(token: string): Promise<void> {
  return fetch(`${env.apiBaseUrl}/cart`, {
    method: 'DELETE',
    headers: headers(token),
  }).then(handleResponse);
}

export function getAddresses(token: string): Promise<AddressResponse[]> {
  return fetch(`${env.apiBaseUrl}/addresses`, { headers: headers(token) }).then(handleResponse);
}

export function createAddress(token: string, data: AddressRequest): Promise<AddressResponse> {
  return fetch(`${env.apiBaseUrl}/addresses`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(data),
  }).then(handleResponse);
}

export function updateAddress(token: string, id: number, data: AddressRequest): Promise<AddressResponse> {
  return fetch(`${env.apiBaseUrl}/addresses/${id}`, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(data),
  }).then(handleResponse);
}

export function deleteAddress(token: string, id: number): Promise<void> {
  return fetch(`${env.apiBaseUrl}/addresses/${id}`, {
    method: 'DELETE',
    headers: headers(token),
  }).then(handleResponse);
}

export function createOrder(token: string, addressId: number, customerNote?: string): Promise<OrderResponse> {
  return fetch(`${env.apiBaseUrl}/orders`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ addressId, customerNote: customerNote || null }),
  }).then(handleResponse);
}

export function getOrders(token: string, page = 0, size = 20): Promise<OrderResponse[]> {
  return fetch(`${env.apiBaseUrl}/orders?page=${page}&size=${size}`, { headers: headers(token) }).then(handleResponse);
}

export function getOrder(token: string, orderId: number): Promise<OrderResponse> {
  return fetch(`${env.apiBaseUrl}/orders/${orderId}`, { headers: headers(token) }).then(handleResponse);
}

export function getProductById(token: string, productId: number): Promise<{ id: number; name: string; imageUrl: string; price: number; unitLabel: string; slug: string }> {
  return fetch(`${env.apiBaseUrl}/catalog/products/${productId}`, { headers: headers(token) }).then(handleResponse);
}

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: string;
  readAt: string | null;
  createdAt: string;
};

export function getNotifications(token: string, page = 0, size = 20): Promise<NotificationItem[]> {
  return fetch(`${env.apiBaseUrl}/notifications?page=${page}&size=${size}`, { headers: headers(token) }).then(handleResponse);
}

export function getUnreadCount(token: string): Promise<number> {
  return fetch(`${env.apiBaseUrl}/notifications/unread-count`, { headers: headers(token) }).then(handleResponse);
}

export function markAllNotificationsRead(token: string): Promise<void> {
  return fetch(`${env.apiBaseUrl}/notifications/read-all`, { method: 'PUT', headers: headers(token) }).then(handleResponse);
}
