import { Link } from 'react-router-dom';
import type { Exam } from '../../types/exam';
import Button from '../common/Button';

interface ExamCardProps {
  exam: Exam;
}

export default function ExamCard({ exam }: ExamCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">{exam.title}</h3>
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          exam.type === 'mcq' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
        }`}>
          {exam.type === 'mcq' ? 'MCQ' : 'Short Answer'}
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-4">{exam.description || 'No description'}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Total Marks: {exam.totalMarks}</span>
        {exam.isActive ? (
          <Link to={`/student/exam/${exam.id}`}>
            <Button size="sm">Start Exam</Button>
          </Link>
        ) : (
          <span className="text-sm text-gray-400">Not Available</span>
        )}
      </div>
    </div>
  );
}
