import { apiRequest } from './client';
import type { User, UserRole } from '../types/user';

interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export async function login(username: string, password: string, role: UserRole): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password, role }),
  });
}

export function logout(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

export function getStoredUser(): Omit<User, 'password'> | null {
  const stored = localStorage.getItem('auth_user');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem('auth_token');
}
