import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import type { Application } from '../../lib/types';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  completed: 'Completada',
  disputed: 'Disputa',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  disputed: 'bg-orange-100 text-orange-800',
};

export default function InfluencerApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/applications/mine')
      .then((r) => setApps(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mis aplicaciones</h1>

      {apps.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-4">No has aplicado a ninguna campaña aún.</p>
          <Link to="/campaigns" className="text-primary hover:underline">Explorar campañas</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <Link to={`/campaigns/${a.campaign_id}`} className="font-semibold hover:text-primary truncate block">
                  Campaña {a.campaign_id.slice(0, 8)}...
                </Link>
                <p className="text-sm text-gray-500 mt-0.5">
                  {a.message ? a.message.slice(0, 80) + (a.message.length > 80 ? '...' : '') : 'Sin mensaje'}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                {a.payout_amount && (
                  <span className="text-sm font-semibold text-primary">${a.payout_amount}</span>
                )}
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-600'}`}>
                  {STATUS_LABELS[a.status] || a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
