import { apiRequest } from './client';
import type { User } from '../types/user';

type UserWithoutPassword = Omit<User, 'password'>;

export async function getUsers(role?: string): Promise<UserWithoutPassword[]> {
  const query = role ? `?role=${role}` : '';
  return apiRequest<UserWithoutPassword[]>(`/users${query}`);
}

export async function getUser(id: string): Promise<UserWithoutPassword> {
  return apiRequest<UserWithoutPassword>(`/users/${id}`);
}

export async function createUser(data: { id: string; role: string; name: string; phone?: string; password?: string }): Promise<UserWithoutPassword> {
  return apiRequest<UserWithoutPassword>('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: string, data: Partial<User>): Promise<UserWithoutPassword> {
  return apiRequest<UserWithoutPassword>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string): Promise<void> {
  return apiRequest<void>(`/users/${id}`, { method: 'DELETE' });
}
