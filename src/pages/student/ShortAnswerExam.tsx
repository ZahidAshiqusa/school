import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTimer } from '../../hooks/useTimer';
import { submitResult } from '../../api/resultsApi';
import type { Exam } from '../../types/exam';
import type { ShortQuestion } from '../../types/question';
import type { ShortAnswer } from '../../types/result';
import { SHORT_ANSWER_TIMER_SECONDS } from '../../utils/constants';
import { generateId } from '../../utils/helpers';
import ShortAnswerQuestionComponent from '../../components/exam/ShortAnswerQuestion';
import ExamTimer from '../../components/exam/ExamTimer';
import ExamProgressBar from '../../components/exam/ExamProgressBar';
import Button from '../../components/common/Button';

interface ShortAnswerExamProps {
  exam: Exam;
  questions: ShortQuestion[];
}

export default function ShortAnswerExam({ exam, questions }: ShortAnswerExamProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ShortAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submitCurrentAnswer = useCallback(async (answerText?: string) => {
    const text = answerText ?? currentAnswer;
    const currentQ = questions[currentIndex];
    const newAnswer: ShortAnswer = {
      questionId: currentQ.id,
      answer: text,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
      setSubmitting(true);
      try {
        const result = await submitResult({
          id: generateId(),
          studentId: user?.id || '',
          studentName: user?.name || '',
          studentPhone: user?.phone || '',
          examId: exam.id,
          examTitle: exam.title,
          type: 'short_answer',
          score: 0,
          total: exam.totalMarks,
          answers: newAnswers,
          status: 'pending',
        });
        navigate(`/student/exam/${exam.id}/result`, { state: { result } });
      } catch {
        navigate('/student/dashboard');
      }
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, currentAnswer, answers, questions, exam, user, navigate]);

  const onTimerExpire = useCallback(() => {
    submitCurrentAnswer();
  }, [submitCurrentAnswer]);

  const { timeLeft, start, reset } = useTimer(SHORT_ANSWER_TIMER_SECONDS, onTimerExpire);

  useEffect(() => {
    start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset timer when question changes
  useEffect(() => {
    if (currentIndex > 0) {
      reset();
      start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  if (finished || submitting) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
        <p className="text-gray-600">Submitting your answers...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">No short answer questions available.</div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <ExamProgressBar current={currentIndex + 1} total={questions.length} />
        <ExamTimer timeLeft={timeLeft} total={SHORT_ANSWER_TIMER_SECONDS} />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <ShortAnswerQuestionComponent
          question={currentQuestion.question}
          answer={currentAnswer}
          onChange={setCurrentAnswer}
        />
        <div className="mt-6 flex justify-end">
          <Button onClick={() => submitCurrentAnswer()}>
            {currentIndex + 1 >= questions.length ? 'Submit All' : 'Next Question'}
          </Button>
        </div>
      </div>
    </div>
  );
}
