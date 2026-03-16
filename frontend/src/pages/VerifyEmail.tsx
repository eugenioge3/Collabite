import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MailCheck } from 'lucide-react';

const RESEND_COOLDOWN = 60;

export default function VerifyEmail() {
  const { verifyEmail, resendCode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as any)?.email as string | undefined;

  const [email, setEmail] = useState(emailFromState ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendMessage, setResendMessage] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = () => {
    setResendCountdown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyEmail(email, code);
      navigate('/login', {
        state: { message: '¡Correo verificado! Ya puedes iniciar sesión.' },
      });
    } catch (err: any) {
      const detail: string = err?.response?.data?.detail ?? '';
      if (detail.includes('CodeMismatchException') || detail.includes('Invalid verification code')) {
        setError('Código incorrecto. Revisa el correo e inténtalo de nuevo.');
      } else if (detail.includes('ExpiredCodeException') || detail.includes('expired')) {
        setError('El código expiró. Solicita uno nuevo abajo.');
      } else {
        setError(detail || 'Error al verificar. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendMessage('');
    try {
      await resendCode(email);
      setResendMessage('Nuevo código enviado. Revisa tu bandeja de entrada.');
      startCooldown();
    } catch {
      setError('No se pudo enviar el código. Inténtalo más tarde.');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <MailCheck className="text-primary" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">Verifica tu correo</h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Te enviamos un código de 6 dígitos a{' '}
          <span className="font-medium text-gray-700">{email || 'tu correo'}</span>.
          Ingrésalo aquí para activar tu cuenta.
        </p>

        {error && (
          <div className="bg-red-50 text-danger px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {resendMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!emailFromState && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
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
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código de verificación
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none tracking-widest text-center text-lg font-mono"
              placeholder="123456"
              autoComplete="one-time-code"
            />
          </div>

          <button
            type="submit"
            disabled={loading || code.length < 6}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Verificar cuenta'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-500">
          ¿No te llegó el correo?{' '}
          {resendCountdown > 0 ? (
            <span className="text-gray-400">
              Reenviar en {resendCountdown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-primary font-medium hover:underline"
            >
              Reenviar código
            </button>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-3">
          <Link to="/login" className="hover:underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
