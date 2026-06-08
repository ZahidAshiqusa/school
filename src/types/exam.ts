export type ExamType = 'mcq' | 'short_answer';

export interface Exam {
  id: string;
  title: string;
  description: string;
  type: ExamType;
  totalMarks: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}
