import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getExam } from '../../api/examsApi';
import { getQuestions } from '../../api/questionsApi';
import type { Exam } from '../../types/exam';
import type { Question } from '../../types/question';
import Spinner from '../../components/common/Spinner';
import MCQExam from './MCQExam';
import ShortAnswerExam from './ShortAnswerExam';

export default function TakeExam() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [examData, questionsData] = await Promise.all([
          getExam(id),
          getQuestions(id),
        ]);
        setExam(examData);
        setQuestions(questionsData);
        if (questionsData.length === 0) {
          setError('No questions available for this exam.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="py-20"><Spinner size="lg" /></div>;
  if (error || !exam) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-500 mb-4">{error || 'Exam not found'}</p>
        <button onClick={() => navigate('/student/dashboard')} className="text-primary hover:underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (exam.type === 'mcq') {
    return <MCQExam exam={exam} questions={questions.filter(q => q.type === 'mcq')} />;
  }

  return <ShortAnswerExam exam={exam} questions={questions.filter(q => q.type === 'short')} />;
}
