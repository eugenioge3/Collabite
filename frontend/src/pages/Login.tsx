import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../lib/types';
import { Eye, EyeOff } from 'lucide-react';

function translateAuthError(err: any): string {
  const detail: string = err?.response?.data?.detail ?? err?.message ?? '';
  if (err?.response?.status === 403 && detail.includes('not verified'))
    return 'Tu correo no está verificado. Revisa tu bandeja de entrada o';
  if (detail.includes('NotAuthorizedException') || detail.includes('Invalid email or password'))
    return 'Correo o contraseña incorrectos.';
  if (detail.includes('UserNotFoundException'))
    return 'No existe una cuenta con ese correo.';
  if (detail.includes('UserNotConfirmedException'))
    return 'Tu correo no está verificado. Revisa tu bandeja de entrada o';
  return detail || 'Ocurrió un error. Inténtalo de nuevo.';
}

export default function Login() {
  const { login, devLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as any)?.message as string | undefined;
  const unverifiedEmail = (location.state as any)?.unverifiedEmail as string | undefined;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [needsVerify, setNeedsVerify] = useState<string | null>(unverifiedEmail ?? null);
  const [loading, setLoading] = useState(false);
  const [devLoadingRole, setDevLoadingRole] = useState<UserRole | null>(null);
  const isDev = import.meta.env.DEV;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsVerify(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = translateAuthError(err);
      if (err?.response?.status === 403 || msg.includes('no está verificado')) {
        setNeedsVerify(email);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (role: UserRole) => {
    setError('');
    setDevLoadingRole(role);
    try {
      await devLogin(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al iniciar demo local');
    } finally {
      setDevLoadingRole(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Iniciar sesión</h1>
        <p className="text-gray-500 text-center mb-8">
          Bienvenido de vuelta a Collabite
        </p>

        {successMessage && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {successMessage}
          </div>
        )}

        {needsVerify && (
          <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg mb-4 text-sm">
            Tu correo no está verificado.{' '}
            <Link
              to="/verify-email"
              state={{ email: needsVerify }}
              className="font-semibold underline"
            >
              Verificar ahora
            </Link>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-danger px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Regístrate
          </Link>
        </p>

        {isDev && (
          <div className="mt-8 border-t pt-5">
            <p className="text-xs text-gray-500 mb-3">Acceso rápido local (modo demo)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDevLogin('influencer')}
                disabled={!!devLoadingRole || loading}
                className="px-4 py-2 rounded-lg border hover:border-primary text-sm font-medium transition disabled:opacity-50"
              >
                {devLoadingRole === 'influencer' ? 'Entrando...' : 'Entrar demo Influencer'}
              </button>
              <button
                type="button"
                onClick={() => handleDevLogin('business')}
                disabled={!!devLoadingRole || loading}
                className="px-4 py-2 rounded-lg border hover:border-primary text-sm font-medium transition disabled:opacity-50"
              >
                {devLoadingRole === 'business' ? 'Entrando...' : 'Entrar demo Negocio'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
