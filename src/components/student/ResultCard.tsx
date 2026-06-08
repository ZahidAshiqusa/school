import type { Result } from '../../types/result';
import { calculatePercentage, formatDate } from '../../utils/helpers';

interface ResultCardProps {
  result: Result;
}

export default function ResultCard({ result }: ResultCardProps) {
  const percentage = calculatePercentage(result.score, result.total);
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-800">{result.examTitle}</h3>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          result.status === 'graded' || result.status === 'auto_graded'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {result.status === 'pending' ? 'Pending Review' : 'Graded'}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>Score: {result.score}/{result.total}</span>
        <span>{percentage}%</span>
        <span>{formatDate(result.timestamp)}</span>
      </div>
    </div>
  );
}
