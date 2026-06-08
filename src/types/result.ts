export interface MCQAnswer {
  questionId: string;
  selectedIndex: number;
  correctIndex: number;
  isCorrect: boolean;
}

export interface ShortAnswer {
  questionId: string;
  answer: string;
  marks?: number;
  graded?: boolean;
}

export type Answer = MCQAnswer | ShortAnswer;

export interface Result {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  examId: string;
  examTitle: string;
  type: 'mcq' | 'short_answer';
  score: number;
  total: number;
  answers: Answer[];
  timestamp: string;
  status: 'pending' | 'graded' | 'auto_graded';
}
