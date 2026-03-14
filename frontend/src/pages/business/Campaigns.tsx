import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import type { Campaign } from '../../lib/types';
import { PlusCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  funded: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-indigo-100 text-indigo-700',
  canceled: 'bg-red-100 text-red-700',
  disputed: 'bg-orange-100 text-orange-700',
};

export default function BusinessCampaigns() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const view = searchParams.get('view') || 'all';

  useEffect(() => {
    api.get('/campaigns/mine')
      .then((r) => setCampaigns(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const matched = campaigns.filter((c) => c.status === 'in_progress');
  const history = campaigns.filter((c) => ['completed', 'canceled', 'disputed'].includes(c.status));

  const visibleCampaigns =
    view === 'matched'
      ? matched
      : view === 'history'
        ? history
        : campaigns;

  const title =
    view === 'matched'
      ? 'Campañas cuadradas'
      : view === 'history'
        ? 'Historial de campañas'
        : 'Mis campañas';

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Link
          to="/dashboard/business/campaigns/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition text-sm"
        >
          <PlusCircle size={16} /> Nueva campaña
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setSearchParams({ view: 'all' })}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            view === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todas ({campaigns.length})
        </button>
        <button
          onClick={() => setSearchParams({ view: 'matched' })}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            view === 'matched' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cuadradas ({matched.length})
        </button>
        <button
          onClick={() => setSearchParams({ view: 'history' })}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            view === 'history' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Historial ({history.length})
        </button>
      </div>

      {visibleCampaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="mb-4">No hay campañas en esta sección.</p>
          <Link to="/dashboard/business/campaigns/new" className="text-primary hover:underline">
            Crear primera campaña
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleCampaigns.map((c) => (
            <Link key={c.id} to={`/dashboard/business/campaigns/${c.id}`}
              className="block bg-white border rounded-lg p-4 hover:border-primary transition">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{c.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{c.city || 'Sin ciudad'} · {c.niche_required || 'Sin nicho'}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="font-semibold text-primary text-sm">${c.budget} {c.currency}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[c.status] || 'bg-gray-100 text-gray-600'}`}>
                    {c.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
