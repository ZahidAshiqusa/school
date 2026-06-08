import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getResults, gradeResult } from '../../api/resultsApi';
import { getQuestions } from '../../api/questionsApi';
import type { Result, ShortAnswer } from '../../types/result';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

export default function GradeResults() {
  const { data: results, loading, refetch } = useApi(() => getResults(), []);
  const pendingResults = results?.filter((r) => r.status === 'pending' && r.type === 'short_answer') || [];
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [marks, setMarks] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);

  const { data: questions } = useApi(
    () => selectedResult ? getQuestions(selectedResult.examId) : Promise.resolve([]),
    [selectedResult?.examId]
  );

  const selectResult = (result: Result) => {
    setSelectedResult(result);
    setMarks((result.answers as ShortAnswer[]).map((a) => a.marks || 0));
  };

  const handleGrade = async () => {
    if (!selectedResult) return;
    setSaving(true);
    try {
      const answers = (selectedResult.answers as ShortAnswer[]).map((a, i) => ({
        ...a,
        marks: marks[i],
        graded: true,
      }));
      const totalScore = marks.reduce((sum, m) => sum + m, 0);
      await gradeResult(selectedResult.id, {
        answers,
        score: totalScore,
        status: 'graded',
      });
      setSelectedResult(null);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Grading failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  if (selectedResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Grade Submission</h1>
          <button onClick={() => setSelectedResult(null)} className="text-primary hover:underline">
            Back to List
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><span className="text-gray-500">Student:</span> <span className="font-bold">{selectedResult.studentName}</span></div>
            <div><span className="text-gray-500">ID:</span> <span className="font-bold">{selectedResult.studentId}</span></div>
            <div><span className="text-gray-500">Exam:</span> <span className="font-bold">{selectedResult.examTitle}</span></div>
            <div><span className="text-gray-500">Submitted:</span> <span className="font-bold">{formatDate(selectedResult.timestamp)}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          {(selectedResult.answers as ShortAnswer[]).map((answer, idx) => {
            const question = questions?.find((q) => q.id === answer.questionId);
            return (
              <div key={idx} className="bg-white rounded-xl shadow-md p-6">
                <p className="font-bold text-gray-800 mb-2">
                  Q{idx + 1}: {question?.question || 'Question not found'}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-3">
                  <p className="text-sm text-gray-500 mb-1">Student's Answer:</p>
                  <p className="text-gray-800">{answer.answer || '(No answer)'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marks (out of {selectedResult.total / selectedResult.answers.length})
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={selectedResult.total / selectedResult.answers.length}
                    value={marks[idx] || 0}
                    onChange={(e) => {
                      const newMarks = [...marks];
                      newMarks[idx] = Number(e.target.value);
                      setMarks(newMarks);
                    }}
                    className="w-24 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-md p-6">
          <p className="text-lg font-bold">Total: {marks.reduce((s, m) => s + m, 0)} / {selectedResult.total}</p>
          <Button onClick={handleGrade} disabled={saving}>
            {saving ? 'Saving...' : 'Save Grades'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Grade Submissions</h1>

      {pendingResults.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
          No pending submissions to grade.
        </div>
      ) : (
        <div className="space-y-3">
          {pendingResults.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl shadow-md p-5 flex items-center justify-between cursor-pointer hover:shadow-lg transition"
              onClick={() => selectResult(r)}
            >
              <div>
                <p className="font-bold text-gray-800">{r.studentName}</p>
                <p className="text-sm text-gray-500">{r.examTitle} - {formatDate(r.timestamp)}</p>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                Pending
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
