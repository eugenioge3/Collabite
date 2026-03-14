import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api';
import type {
  BusinessProfile,
  InfluencerProfile,
  SocialVerificationInitResponse,
  SocialVerificationStatusResponse,
  VerificationPlatform,
} from '../lib/types';
import { Clock3, Copy, RefreshCw, ShieldCheck } from 'lucide-react';

const PLATFORM_LABELS: Record<VerificationPlatform, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  verified: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-700',
};

export default function VerifySocial() {
  const { user } = useAuth();
  const [platform, setPlatform] = useState<VerificationPlatform>('instagram');
  const [accountHandle, setAccountHandle] = useState('');
  const [initData, setInitData] = useState<SocialVerificationInitResponse | null>(null);
  const [statusData, setStatusData] = useState<SocialVerificationStatusResponse | null>(null);
  const [loadingInit, setLoadingInit] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const loadSuggestedHandle = async (nextPlatform: VerificationPlatform) => {
    if (!user) return;

    try {
      if (user.role === 'influencer') {
        const res = await api.get<InfluencerProfile>('/influencers/me');
        const suggested = nextPlatform === 'instagram'
          ? res.data.instagram_handle
          : res.data.tiktok_handle;
        setAccountHandle(suggested || '');
      } else {
        const res = await api.get<BusinessProfile>('/businesses/me');
        const suggested = nextPlatform === 'instagram'
          ? res.data.instagram_handle
          : res.data.tiktok_handle;
        setAccountHandle(suggested || '');
      }
    } catch {
      setAccountHandle('');
    }
  };

  const fetchStatus = async (targetPlatform: VerificationPlatform) => {
    setLoadingStatus(true);
    try {
      const res = await api.get<SocialVerificationStatusResponse>('/verify/status', {
        params: { platform: targetPlatform },
      });
      setStatusData(res.data);
      setError('');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setStatusData(null);
      } else {
        setError(err.response?.data?.detail || 'No se pudo consultar el estado');
      }
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadSuggestedHandle(platform);
    fetchStatus(platform);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  useEffect(() => {
    if (!statusData || statusData.status !== 'pending') return;

    const poll = window.setInterval(() => {
      fetchStatus(statusData.platform);
    }, 7000);

    return () => window.clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusData?.status, statusData?.platform]);

  const pendingExpiresAt = useMemo(() => {
    const source = statusData?.status === 'pending'
      ? statusData.expires_at
      : initData?.expires_at;

    if (!source) return 0;

    const ms = new Date(source).getTime() - nowMs;
    return Math.max(0, Math.floor(ms / 1000));
  }, [statusData, initData, nowMs]);

  const handleInit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = accountHandle.trim().replace(/^@+/, '');
    if (!cleanHandle) {
      setError('Ingresa tu @handle antes de generar el código');
      return;
    }

    setLoadingInit(true);
    setError('');
    setCopied(false);

    try {
      const res = await api.post<SocialVerificationInitResponse>('/verify/init', {
        platform,
        account_handle: cleanHandle,
      });
      setInitData(res.data);
      await fetchStatus(platform);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudo iniciar verificación');
    } finally {
      setLoadingInit(false);
    }
  };

  const copyCode = async () => {
    const code = initData?.code || statusData?.code;
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Verificación social</h1>
        <p className="text-gray-500 text-sm">
          Genera un código, envíalo por DM a nuestra cuenta oficial y revisaremos manualmente.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-sm text-amber-800">
        Revisión manual diaria: el equipo valida códigos una vez al día. Si expira, puedes generar uno nuevo.
      </div>

      <div className="bg-white border rounded-xl p-5 mb-6">
        <div className="flex gap-2 mb-5">
          {(['instagram', 'tiktok'] as VerificationPlatform[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                platform === p
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {PLATFORM_LABELS[p]}
            </button>
          ))}
        </div>

        <form onSubmit={handleInit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tu @handle en {PLATFORM_LABELS[platform]}</label>
            <input
              value={accountHandle}
              onChange={(e) => setAccountHandle(e.target.value)}
              placeholder="ejemplo: mi_cuenta"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loadingInit}
            className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
          >
            {loadingInit ? 'Generando código...' : 'Generar código de verificación'}
          </button>
        </form>
      </div>

      {(initData || statusData) && (
        <div className="bg-white border rounded-xl p-5 mb-6">
          <h2 className="font-semibold mb-4">Código actual</h2>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl font-mono font-bold tracking-wide bg-gray-50 border rounded-lg px-4 py-2">
              {initData?.code || statusData?.code}
            </div>
            <button
              type="button"
              onClick={copyCode}
              className="inline-flex items-center gap-1 text-sm px-3 py-2 border rounded-lg hover:border-primary transition"
            >
              <Copy size={16} /> {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            {initData?.instructions || 'Envía este código por DM a nuestra cuenta oficial.'}
          </p>

          <div className="flex items-center gap-2 text-sm">
            <Clock3 size={15} className="text-gray-400" />
            <span className="text-gray-500">Tiempo restante:</span>
            <span className="font-semibold text-gray-700">{pendingExpiresAt}s</span>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Estado de verificación</h2>
          <button
            type="button"
            onClick={() => fetchStatus(platform)}
            disabled={loadingStatus}
            className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border rounded-lg hover:border-primary transition disabled:opacity-50"
          >
            <RefreshCw size={15} className={loadingStatus ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {statusData ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={16} className="text-gray-500" />
              <span className="text-sm text-gray-600">@{statusData.account_handle}</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[statusData.status] || 'bg-gray-100 text-gray-700'}`}>
                {statusData.status}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {statusData.status === 'verified' && 'Cuenta verificada. Ya puedes operar con mayor confianza.'}
              {statusData.status === 'pending' && 'Estamos esperando revisión del equipo.'}
              {statusData.status === 'rejected' && (statusData.review_notes || 'Código rechazado. Genera uno nuevo e intenta otra vez.')}
              {statusData.status === 'expired' && 'El código expiró. Genera uno nuevo para continuar.'}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No hay solicitudes de verificación para esta plataforma.</p>
        )}
      </div>

      {error && (
        <div className="mt-4 bg-red-50 text-red-700 border border-red-100 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
