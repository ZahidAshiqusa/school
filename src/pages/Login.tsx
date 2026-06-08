import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/user';
import Button from '../components/common/Button';

export default function Login() {
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get('role') || 'student') as UserRole;
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password, role);
      switch (role) {
        case 'admin': navigate('/admin/dashboard'); break;
        case 'teacher': navigate('/teacher/dashboard'); break;
        case 'student': navigate('/student/dashboard'); break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const roleLabels: Record<UserRole, string> = {
    student: 'Student',
    teacher: 'Teacher',
    admin: 'Admin',
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to Study Hub Hasilpur</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Role Tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            {(['student', 'teacher', 'admin'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
                  role === r
                    ? 'bg-primary text-white shadow'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {roleLabels[r]}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {role === 'admin' ? 'Admin Username' : 'Student/Teacher ID'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                placeholder={role === 'admin' ? 'Enter admin username' : 'Enter your ID'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-danger text-sm p-3 rounded-lg">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : `Sign in as ${roleLabels[role]}`}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
