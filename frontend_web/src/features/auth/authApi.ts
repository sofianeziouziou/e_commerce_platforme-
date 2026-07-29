import { env } from '../../shared/config/env';

export type UserSummary = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roles: string[];
};

export type AuthResponse = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: UserSummary;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
};

export type UpdateProfileRequest = {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
};

async function apiPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function apiGet<T>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${env.apiBaseUrl}${path}`, { headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

async function apiPut<T>(path: string, body: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export function login(data: LoginRequest): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/login', data);
}

export function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiPost<AuthResponse>('/auth/register', data);
}

export function getCurrentUser(token: string): Promise<UserSummary> {
  return apiGet<UserSummary>('/auth/me', token);
}

export function updateProfile(token: string, data: UpdateProfileRequest): Promise<UserSummary> {
  return apiPut<UserSummary>('/auth/me', data, token);
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/forgot-password', { email });
}

export function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/reset-password', { token, newPassword });
}

export function logout(): Promise<{ message: string }> {
  return apiPost<{ message: string }>('/auth/logout', {});
}