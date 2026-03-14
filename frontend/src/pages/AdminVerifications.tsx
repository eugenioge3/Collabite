import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import type {
  ManualPendingVerificationItem,
  VerificationPlatform,
} from '../lib/types';
import { CheckCircle2, Search, ShieldAlert, XCircle } from 'lucide-react';

const STATUS_STYLE = 'text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800';

export default function AdminVerifications() {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('ops_admin_token') || '');
  const [platform, setPlatform] = useState<'' | VerificationPlatform>('');
  const [codeFilter, setCodeFilter] = useState('');
  const [items, setItems] = useState<ManualPendingVerificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noteById, setNoteById] = useState<Record<string, string>>({});
  const [quickPlatform, setQuickPlatform] = useState<VerificationPlatform>('instagram');
  const [quickCode, setQuickCode] = useState('');
  const [quickHandle, setQuickHandle] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);

  const canQuery = adminToken.trim().length > 0;

  const pendingCount = useMemo(() => items.length, [items]);

  const fetchPending = async () => {
    if (!canQuery) {
      setError('Ingresa el token admin para consultar pendientes.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.get<ManualPendingVerificationItem[]>('/api/verify/admin/pending', {
        headers: { 'x-admin-token': adminToken.trim() },
        params: {
          platform: platform || undefined,
          code: codeFilter.trim() || undefined,
        },
      });
      setItems(res.data);
    } catch (err: any) {
      setItems([]);
      setError(err.response?.data?.detail || 'No se pudo obtener verificaciones pendientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canQuery) return;
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToken = () => {
    if (!adminToken.trim()) return;
    localStorage.setItem('ops_admin_token', adminToken.trim());
    fetchPending();
  };

  const approve = async (item: ManualPendingVerificationItem) => {
    try {
      await axios.post(
        '/api/verify/admin/approve',
        {
          verification_id: item.verification_id,
          review_notes: noteById[item.verification_id] || null,
        },
        { headers: { 'x-admin-token': adminToken.trim() } }
      );
      await fetchPending();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudo aprobar.');
    }
  };

  const reject = async (item: ManualPendingVerificationItem) => {
    try {
      await axios.post(
        '/api/verify/admin/reject',
        {
          verification_id: item.verification_id,
          review_notes: noteById[item.verification_id] || null,
        },
        { headers: { 'x-admin-token': adminToken.trim() } }
      );
      await fetchPending();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudo rechazar.');
    }
  };

  const approveByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canQuery) {
      setError('Ingresa el token admin para aprobar por código.');
      return;
    }
    if (!quickCode.trim()) {
      setError('Ingresa un código válido.');
      return;
    }

    setQuickLoading(true);
    setError('');

    try {
      await axios.post(
        '/api/verify/admin/approve-by-code',
        {
          platform: quickPlatform,
          code: quickCode.trim().toUpperCase(),
          account_handle: quickHandle.trim() || null,
          review_notes: quickNote.trim() || null,
        },
        { headers: { 'x-admin-token': adminToken.trim() } }
      );

      setQuickCode('');
      setQuickHandle('');
      setQuickNote('');
      await fetchPending();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudo aprobar por código.');
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Moderación de verificaciones</h1>
      <p className="text-gray-500 text-sm mb-6">
        Vista interna para revisar DMs y aprobar/rechazar códigos manualmente.
      </p>

      <div className="bg-white border rounded-xl p-5 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Token admin</label>
            <input
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="MANUAL_VERIFICATION_ADMIN_TOKEN"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={saveToken}
              className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition"
            >
              Guardar token y cargar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-5 mb-6">
        <div className="grid sm:grid-cols-4 gap-3">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as '' | VerificationPlatform)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-sm"
          >
            <option value="">Todas las plataformas</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>

          <input
            value={codeFilter}
            onChange={(e) => setCodeFilter(e.target.value.toUpperCase())}
            placeholder="Filtrar por código (CBT-XXXXXX)"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
          />

          <button
            type="button"
            onClick={fetchPending}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:border-primary transition text-sm disabled:opacity-50"
          >
            <Search size={16} /> Buscar pendientes
          </button>

          <div className="flex items-center justify-center text-sm bg-gray-50 border rounded-lg">
            Pendientes: <span className="font-bold ml-1">{pendingCount}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-5 mb-6">
        <h2 className="font-semibold mb-3">Aprobación rápida por código</h2>
        <form onSubmit={approveByCode} className="grid md:grid-cols-5 gap-3">
          <select
            value={quickPlatform}
            onChange={(e) => setQuickPlatform(e.target.value as VerificationPlatform)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-sm"
          >
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>

          <input
            value={quickCode}
            onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
            placeholder="Código (CBT-XXXXXX)"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
          />

          <input
            value={quickHandle}
            onChange={(e) => setQuickHandle(e.target.value)}
            placeholder="Handle opcional"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
          />

          <input
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            placeholder="Nota opcional"
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
          />

          <button
            type="submit"
            disabled={quickLoading}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-50"
          >
            {quickLoading ? 'Aprobando...' : 'Aprobar código'}
          </button>
        </form>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-700 border border-red-100 rounded-lg px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white border rounded-xl p-8 text-center text-gray-500 text-sm">
          No hay verificaciones pendientes con los filtros actuales.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.verification_id} className="bg-white border rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-sm font-semibold">{item.platform.toUpperCase()}</span>
                <span className={STATUS_STYLE}>{item.status}</span>
                <span className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</span>
              </div>

              <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700 mb-3">
                <div>
                  Usuario: <span className="font-medium">{item.user_email}</span> ({item.user_role})
                </div>
                <div>
                  Handle: <span className="font-medium">@{item.account_handle}</span>
                </div>
                <div>
                  Código: <span className="font-mono font-bold">{item.code}</span>
                </div>
                <div>
                  Expira: <span className="font-medium">{new Date(item.expires_at).toLocaleString()}</span>
                </div>
              </div>

              <textarea
                value={noteById[item.verification_id] || ''}
                onChange={(e) => setNoteById((prev) => ({ ...prev, [item.verification_id]: e.target.value }))}
                placeholder="Notas internas opcionales"
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm mb-3"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => approve(item)}
                  className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                >
                  <CheckCircle2 size={16} /> Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => reject(item)}
                  className="inline-flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                >
                  <XCircle size={16} /> Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 flex items-start gap-2">
        <ShieldAlert size={16} className="mt-0.5" />
        Compara el DM recibido en Instagram/TikTok con código y handle antes de aprobar.
      </div>
    </div>
  );
}
