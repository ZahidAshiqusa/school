import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getExams } from '../../api/examsApi';
import { getResults } from '../../api/resultsApi';
import ExamCard from '../../components/student/ExamCard';
import ResultCard from '../../components/student/ResultCard';
import InstallPWA from '../../components/common/InstallPWA';
import Spinner from '../../components/common/Spinner';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: exams, loading: examsLoading } = useApi(() => getExams(), []);
  const { data: results, loading: resultsLoading } = useApi(
    () => getResults(user?.id),
    [user?.id]
  );

  const activeExams = exams?.filter((e) => e.isActive) || [];
  const recentResults = results?.slice(-5).reverse() || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
          <p className="text-gray-500 mt-1">Your exam dashboard</p>
        </div>
        <div className="flex gap-3">
          <InstallPWA />
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
        </div>
      </div>

      {/* Active Exams */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Examinations</h2>
        {examsLoading ? (
          <Spinner />
        ) : activeExams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            No active examinations available.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Results */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Results</h2>
        {resultsLoading ? (
          <Spinner />
        ) : recentResults.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            No results yet. Take an exam to see your results here.
          </div>
        ) : (
          <div className="space-y-3">
            {recentResults.map((result) => (
              <ResultCard key={result.id} result={result} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
