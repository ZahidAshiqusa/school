import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { useAuth } from '../../context/AuthContext';
import type { Result } from '../../types/result';
import { calculatePercentage } from '../../utils/helpers';
import Button from '../../components/common/Button';

export default function ExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const resultRef = useRef<HTMLDivElement>(null);
  const result = (location.state as { result?: Result })?.result;

  if (!result) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Result Found</h2>
        <button onClick={() => navigate('/student/dashboard')} className="text-primary hover:underline">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const percentage = calculatePercentage(result.score, result.total);
  const correct = result.type === 'mcq'
    ? result.answers.filter((a) => 'isCorrect' in a && a.isCorrect).length
    : 0;
  const incorrect = result.type === 'mcq'
    ? result.answers.filter((a) => 'isCorrect' in a && !a.isCorrect).length
    : 0;
  const total = result.answers.length;

  const handleDownload = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        backgroundColor: '#f9fafb',
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `progress_report_${result.studentId}_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('Screenshot failed:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div ref={resultRef} className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-1">Study Hub Hasilpur</h1>
          <p className="text-gray-500">Progress Report</p>
        </div>

        <div className="border-t border-b border-gray-200 py-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Student Name</p>
              <p className="font-bold">{result.studentName}</p>
            </div>
            <div>
              <p className="text-gray-500">Student ID</p>
              <p className="font-bold">{result.studentId}</p>
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-bold">{result.studentPhone}</p>
            </div>
            <div>
              <p className="text-gray-500">Exam</p>
              <p className="font-bold">{result.examTitle}</p>
            </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-8 ${
            percentage >= 50 ? 'border-green-500' : 'border-red-500'
          }`}>
            <div>
              <p className={`text-4xl font-bold ${percentage >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                {percentage}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-primary">{result.score}/{result.total}</p>
            <p className="text-sm text-gray-500">Marks</p>
          </div>
          {result.type === 'mcq' ? (
            <>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{correct}</p>
                <p className="text-sm text-gray-500">Correct</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{incorrect}</p>
                <p className="text-sm text-gray-500">Incorrect</p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{total}</p>
                <p className="text-sm text-gray-500">Questions</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {result.status === 'pending' ? 'Pending' : 'Graded'}
                </p>
                <p className="text-sm text-gray-500">Status</p>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-400">
          Examination Center: Study Hub Hasilpur | Examiner: Muhammad Azam
        </p>
      </div>

      <div className="flex gap-3 mt-6 justify-center">
        <Button onClick={handleDownload} variant="secondary">
          Download Progress Report
        </Button>
        <Button onClick={() => navigate('/student/dashboard')} variant="outline">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
