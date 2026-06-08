import { apiRequest } from './client';
import type { Exam } from '../types/exam';

export async function getExams(): Promise<Exam[]> {
  return apiRequest<Exam[]>('/exams');
}

export async function getExam(id: string): Promise<Exam> {
  return apiRequest<Exam>(`/exams/${id}`);
}

export async function createExam(data: Omit<Exam, 'createdBy' | 'createdAt'>): Promise<Exam> {
  return apiRequest<Exam>('/exams', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateExam(id: string, data: Partial<Exam>): Promise<Exam> {
  return apiRequest<Exam>(`/exams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteExam(id: string): Promise<void> {
  return apiRequest<void>(`/exams/${id}`, { method: 'DELETE' });
}
