import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../lib/types';
import { Building2, User, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Selecciona un tipo de cuenta');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const msg = await register(email, password, role);
      setSuccess(msg);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-accent text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">¡Cuenta creada!</h1>
          <p className="text-gray-500 mb-6">{success}</p>
          <Link
            to="/login"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2">Crear cuenta</h1>
        <p className="text-gray-500 text-center mb-8">
          Únete a Collabite y empieza a colaborar
        </p>

        {error && (
          <div className="bg-red-50 text-danger px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setRole('business')}
            className={`p-4 rounded-lg border-2 text-center transition ${
              role === 'business'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Building2
              className={`mx-auto mb-2 ${role === 'business' ? 'text-primary' : 'text-gray-400'}`}
              size={32}
            />
            <span className={`font-semibold ${role === 'business' ? 'text-primary' : 'text-gray-700'}`}>
              Negocio
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Restaurante, bar, hotel
            </p>
          </button>

          <button
            type="button"
            onClick={() => setRole('influencer')}
            className={`p-4 rounded-lg border-2 text-center transition ${
              role === 'influencer'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <User
              className={`mx-auto mb-2 ${role === 'influencer' ? 'text-primary' : 'text-gray-400'}`}
              size={32}
            />
            <span className={`font-semibold ${role === 'influencer' ? 'text-primary' : 'text-gray-700'}`}>
              Influencer
            </span>
            <p className="text-xs text-gray-500 mt-1">
              Creador de contenido
            </p>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none pr-10"
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Mayúsculas, minúsculas, números y símbolos</p>
          </div>

          <button
            type="submit"
            disabled={loading || !role}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
