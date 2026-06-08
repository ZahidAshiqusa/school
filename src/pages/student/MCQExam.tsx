import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTimer } from '../../hooks/useTimer';
import { submitResult } from '../../api/resultsApi';
import type { Exam } from '../../types/exam';
import type { MCQQuestion } from '../../types/question';
import type { MCQAnswer } from '../../types/result';
import { MCQ_TIMER_SECONDS } from '../../utils/constants';
import { generateId } from '../../utils/helpers';
import MCQQuestionComponent from '../../components/exam/MCQQuestion';
import ExamTimer from '../../components/exam/ExamTimer';
import ExamProgressBar from '../../components/exam/ExamProgressBar';

interface MCQExamProps {
  exam: Exam;
  questions: MCQQuestion[];
}

export default function MCQExam({ exam, questions }: MCQExamProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<MCQAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const marksPerQuestion = questions.length > 0 ? exam.totalMarks / questions.length : 0;

  const handleNext = useCallback(async () => {
    const currentQ = questions[currentIndex];
    const newAnswer: MCQAnswer = {
      questionId: currentQ.id,
      selectedIndex: selectedOption ?? -1,
      correctIndex: currentQ.correctIndex,
      isCorrect: selectedOption === currentQ.correctIndex,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIndex + 1 >= questions.length) {
      // Exam complete - calculate and submit
      setFinished(true);
      setSubmitting(true);
      const score = newAnswers.filter((a) => a.isCorrect).length * marksPerQuestion;
      try {
        const result = await submitResult({
          id: generateId(),
          studentId: user?.id || '',
          studentName: user?.name || '',
          studentPhone: user?.phone || '',
          examId: exam.id,
          examTitle: exam.title,
          type: 'mcq',
          score,
          total: exam.totalMarks,
          answers: newAnswers,
          status: 'auto_graded',
        });
        navigate(`/student/exam/${exam.id}/result`, { state: { result } });
      } catch {
        navigate('/student/dashboard');
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, selectedOption, answers, questions, exam, user, marksPerQuestion, navigate]);

  const onTimerExpire = useCallback(() => {
    handleNext();
  }, [handleNext]);

  const { timeLeft, start } = useTimer(MCQ_TIMER_SECONDS, onTimerExpire);

  // Auto-start timer for each question
  useState(() => {
    start();
  });

  // Restart timer when question changes
  const handleSelect = (index: number) => {
    setSelectedOption(index);
    // Auto-advance after a short delay
    setTimeout(() => {
      handleNext();
    }, 300);
  };

  if (finished) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600">Submitting your answers...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">No MCQ questions available.</div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <ExamProgressBar current={currentIndex + 1} total={questions.length} />
        <ExamTimer timeLeft={timeLeft} total={MCQ_TIMER_SECONDS} />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <MCQQuestionComponent
          question={currentQuestion.question}
          options={currentQuestion.options}
          selectedIndex={selectedOption}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
