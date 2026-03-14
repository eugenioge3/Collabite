import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">Collabite</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/campaigns" className="text-gray-600 hover:text-primary transition">
              Campañas
            </Link>
            <Link to="/rankings" className="text-gray-600 hover:text-primary transition">
              Rankings
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/ops/verifications"
                  className="text-gray-600 hover:text-primary transition"
                >
                  Ops
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-500 hover:text-danger transition"
                >
                  <LogOut size={18} />
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-primary transition">
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 space-y-3">
          <Link to="/campaigns" className="block text-gray-600" onClick={() => setMobileOpen(false)}>
            Campañas
          </Link>
          <Link to="/rankings" className="block text-gray-600" onClick={() => setMobileOpen(false)}>
            Rankings
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-gray-600" onClick={() => setMobileOpen(false)}>
                Dashboard
              </Link>
              <Link to="/ops/verifications" className="block text-gray-600" onClick={() => setMobileOpen(false)}>
                Ops
              </Link>
              <button onClick={handleLogout} className="text-danger">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-gray-600" onClick={() => setMobileOpen(false)}>
                Iniciar sesión
              </Link>
              <Link to="/register" className="block text-primary font-semibold" onClick={() => setMobileOpen(false)}>
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
