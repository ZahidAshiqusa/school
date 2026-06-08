import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { getUsers } from '../../api/usersApi';
import { getExams } from '../../api/examsApi';
import { getResults } from '../../api/resultsApi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: users } = useApi(() => getUsers(), []);
  const { data: exams } = useApi(() => getExams(), []);
  const { data: results } = useApi(() => getResults(), []);

  const students = users?.filter((u) => u.role === 'student') || [];
  const teachers = users?.filter((u) => u.role === 'teacher') || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
        <p className="text-gray-500 mt-1">Welcome, {user?.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-sm text-gray-500">Students</p>
          <p className="text-3xl font-bold text-primary">{students.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-sm text-gray-500">Teachers</p>
          <p className="text-3xl font-bold text-secondary">{teachers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-sm text-gray-500">Exams</p>
          <p className="text-3xl font-bold text-purple-600">{exams?.length || 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5">
          <p className="text-sm text-gray-500">Results</p>
          <p className="text-3xl font-bold text-amber-500">{results?.length || 0}</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-primary"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-1">Manage Users</h3>
          <p className="text-gray-500 text-sm">Add, edit, or remove teachers and students</p>
        </Link>
        <Link
          to="/admin/exams"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-secondary"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-1">Manage Exams</h3>
          <p className="text-gray-500 text-sm">Create exams and configure questions</p>
        </Link>
        <Link
          to="/admin/results"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border-l-4 border-amber-500"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-1">View Results</h3>
          <p className="text-gray-500 text-sm">View all student results and download reports</p>
        </Link>
      </div>
    </div>
  );
}
