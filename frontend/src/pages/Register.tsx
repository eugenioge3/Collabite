import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../lib/types';
import { Building2, User, Eye, EyeOff, Check, X } from 'lucide-react';

function translateAuthError(err: any): string {
  const detail: string = err?.response?.data?.detail ?? err?.message ?? '';
  if (detail.includes('already exists') || detail.includes('UsernameExistsException'))
    return 'Ya existe una cuenta con ese correo. ¿Quieres iniciar sesión?';
  if (detail.includes('Password did not conform') || detail.includes('password') && detail.includes('policy'))
    return 'La contraseña no cumple los requisitos: mínimo 8 caracteres, mayúsculas, minúsculas, número y símbolo.';
  if (detail.includes('Invalid email'))
    return 'Correo electrónico no válido.';
  return detail || 'Ocurrió un error. Inténtalo de nuevo.';
}

const passwordRules = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Una minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un número', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Un símbolo (!@#$...)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Selecciona un tipo de cuenta');
      return;
    }
    const failingRule = passwordRules.find((r) => !r.test(password));
    if (failingRule) {
      setError(`Contraseña inválida: ${failingRule.label.toLowerCase()}.`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      const msg = await register(email, password, role);
      // In production (non-dev build), Cognito sends a verification code.
      // In local dev, registration auto-verifies.
      if (import.meta.env.DEV) {
        navigate('/login', { state: { message: msg } });
      } else {
        navigate('/verify-email', { state: { email } });
      }
    } catch (err: any) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

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
                onFocus={() => setShowRules(true)}
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
            {(showRules || password.length > 0) && (
              <ul className="mt-2 space-y-1">
                {passwordRules.map((rule) => {
                  const ok = rule.test(password);
                  return (
                    <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                      {ok ? <Check size={12} /> : <X size={12} />}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
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
