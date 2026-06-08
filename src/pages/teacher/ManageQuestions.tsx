import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getExams } from '../../api/examsApi';
import { getQuestions, createQuestion, deleteQuestion } from '../../api/questionsApi';
import type { MCQQuestion, ShortQuestion } from '../../types/question';
import { generateId } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

export default function ManageQuestions() {
  const { data: exams } = useApi(() => getExams(), []);
  const [selectedExam, setSelectedExam] = useState('');
  const { data: questions, loading, refetch } = useApi(
    () => selectedExam ? getQuestions(selectedExam) : Promise.resolve([]),
    [selectedExam]
  );
  const [showForm, setShowForm] = useState(false);
  const [qType, setQType] = useState<'mcq' | 'short'>('mcq');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !questionText.trim()) return;

    if (qType === 'mcq') {
      const q: MCQQuestion = {
        id: generateId(),
        examId: selectedExam,
        type: 'mcq',
        question: questionText,
        options,
        correctIndex,
      };
      await createQuestion(q);
    } else {
      const q: ShortQuestion = {
        id: generateId(),
        examId: selectedExam,
        type: 'short',
        question: questionText,
      };
      await createQuestion(q);
    }

    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setShowForm(false);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    await deleteQuestion(id);
    refetch();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Questions</h1>
        {selectedExam && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Question'}
          </Button>
        )}
      </div>

      {/* Exam Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Exam</label>
        <select
          value={selectedExam}
          onChange={(e) => setSelectedExam(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
        >
          <option value="">-- Select an exam --</option>
          {exams?.map((e) => (
            <option key={e.id} value={e.id}>{e.title} ({e.type})</option>
          ))}
        </select>
      </div>

      {/* Add Question Form */}
      {showForm && selectedExam && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Add New Question</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" checked={qType === 'mcq'} onChange={() => setQType('mcq')} />
                  MCQ
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" checked={qType === 'short'} onChange={() => setQType('short')} />
                  Short Answer
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                rows={3}
                required
              />
            </div>

            {qType === 'mcq' && (
              <>
                {options.map((opt, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Option {String.fromCharCode(65 + idx)}
                    </label>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx] = e.target.value;
                        setOptions(newOpts);
                      }}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                      required
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                  <select
                    value={correctIndex}
                    onChange={(e) => setCorrectIndex(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  >
                    {options.map((opt, idx) => (
                      <option key={idx} value={idx}>Option {String.fromCharCode(65 + idx)}: {opt}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <Button type="submit">Add Question</Button>
          </form>
        </div>
      )}

      {/* Questions List */}
      {loading ? (
        <Spinner />
      ) : questions && questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white rounded-xl shadow-md p-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 mb-2 inline-block">
                    {q.type === 'mcq' ? 'MCQ' : 'Short Answer'} - Q{idx + 1}
                  </span>
                  <p className="font-medium text-gray-800">{q.question}</p>
                  {q.type === 'mcq' && (
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      {q.options.map((opt, i) => (
                        <li key={i} className={i === q.correctIndex ? 'text-green-600 font-medium' : ''}>
                          {String.fromCharCode(65 + i)}. {opt} {i === q.correctIndex && ' ✓'}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : selectedExam ? (
        <p className="text-gray-500 text-center py-8">No questions yet for this exam.</p>
      ) : null}
    </div>
  );
}
