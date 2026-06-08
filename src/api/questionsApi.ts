import { apiRequest } from './client';
import type { Question } from '../types/question';

export async function getQuestions(examId?: string, type?: string): Promise<Question[]> {
  const params = new URLSearchParams();
  if (examId) params.set('examId', examId);
  if (type) params.set('type', type);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<Question[]>(`/questions${query}`);
}

export async function createQuestion(data: Question): Promise<Question> {
  return apiRequest<Question>('/questions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
  return apiRequest<Question>(`/questions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteQuestion(id: string): Promise<void> {
  return apiRequest<void>(`/questions/${id}`, { method: 'DELETE' });
}
