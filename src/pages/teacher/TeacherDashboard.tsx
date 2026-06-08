import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getExams } from '../../api/examsApi';
import { getResults } from '../../api/resultsApi';
import Spinner from '../../components/common/Spinner';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data: exams, loading: examsLoading } = useApi(() => getExams(), []);
  const { data: results, loading: resultsLoading } = useApi(() => getResults(), []);

  const pendingGrading = results?.filter((r) => r.status === 'pending') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">Teacher Dashboard</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-500">Total Exams</p>
          <p className="text-3xl font-bold text-primary">{exams?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-500">Pending Grading</p>
          <p className="text-3xl font-bold text-amber-500">{pendingGrading.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-sm text-gray-500">Total Submissions</p>
          <p className="text-3xl font-bold text-secondary">{results?.length || 0}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          to="/teacher/questions"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-primary"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-2">Manage Questions</h3>
          <p className="text-gray-500 text-sm">Add, edit, or remove exam questions</p>
        </Link>
        <Link
          to="/teacher/grading"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-amber-500"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-2">Grade Submissions</h3>
          <p className="text-gray-500 text-sm">
            {pendingGrading.length > 0
              ? `${pendingGrading.length} submissions pending review`
              : 'No pending submissions'}
          </p>
        </Link>
      </div>

      {/* Recent Results */}
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Submissions</h2>
        {resultsLoading ? (
          <Spinner />
        ) : results && results.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Exam</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Score</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.slice(-10).reverse().map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3">{r.studentName}</td>
                      <td className="px-4 py-3">{r.examTitle}</td>
                      <td className="px-4 py-3">{r.type === 'mcq' ? 'MCQ' : 'Short Answer'}</td>
                      <td className="px-4 py-3">{r.score}/{r.total}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No submissions yet.</p>
        )}
      </section>
    </div>
  );
}
