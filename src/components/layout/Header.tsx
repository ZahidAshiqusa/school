import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'teacher': return '/teacher/dashboard';
      case 'student': return '/student/dashboard';
      default: return '/';
    }
  };

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl md:text-2xl font-bold tracking-tight">
          Study Hub Hasilpur
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link to={getDashboardLink()} className="hover:text-blue-200 transition">
                Dashboard
              </Link>
              <span className="text-blue-200 text-sm">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-sm transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200 transition">Login</Link>
              <Link
                to="/login?role=student"
                className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-sm transition"
              >
                Student Login
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <nav className="md:hidden bg-primary-dark px-4 py-3 flex flex-col gap-2">
          {user ? (
            <>
              <Link
                to={getDashboardLink()}
                className="hover:text-blue-200 transition py-1"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
              <span className="text-blue-200 text-sm py-1">
                {user.name} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-left bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-200 transition py-1" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/login?role=admin" className="hover:text-blue-200 transition py-1" onClick={() => setMenuOpen(false)}>
                Admin Login
              </Link>
              <Link to="/login?role=teacher" className="hover:text-blue-200 transition py-1" onClick={() => setMenuOpen(false)}>
                Teacher Login
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
