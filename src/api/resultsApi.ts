import { apiRequest } from './client';
import type { Result } from '../types/result';

export async function getResults(studentId?: string, examId?: string): Promise<Result[]> {
  const params = new URLSearchParams();
  if (studentId) params.set('studentId', studentId);
  if (examId) params.set('examId', examId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<Result[]>(`/results${query}`);
}

export async function submitResult(data: Omit<Result, 'timestamp'>): Promise<Result> {
  return apiRequest<Result>('/results', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function gradeResult(id: string, data: Partial<Result>): Promise<Result> {
  return apiRequest<Result>(`/results/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
