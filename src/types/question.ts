export type QuestionType = 'mcq' | 'short';

export interface MCQQuestion {
  id: string;
  examId: string;
  type: 'mcq';
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ShortQuestion {
  id: string;
  examId: string;
  type: 'short';
  question: string;
}

export type Question = MCQQuestion | ShortQuestion;
