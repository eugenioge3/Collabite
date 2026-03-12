import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import type { Campaign, Application } from '../../lib/types';
import { ArrowLeft, Users, CheckCircle, XCircle, Loader } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  disputed: 'bg-orange-100 text-orange-800',
};

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/campaigns/${id}`),
      api.get(`/applications/campaign/${id}`).catch(() => ({ data: [] })),
    ]).then(([c, a]) => {
      setCampaign(c.data);
      setApplications(a.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleAction = async (appId: string, action: 'accept' | 'reject') => {
    setActionLoading(appId);
    try {
      await api.patch(`/applications/${appId}/${action}`);
      setApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status: action === 'accept' ? 'accepted' : 'rejected' } : a)
      );
    } catch {}
    setActionLoading(null);
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;
  if (!campaign) return <div className="text-center py-20 text-gray-400">Campaña no encontrada</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/dashboard/business/campaigns" className="inline-flex items-center gap-1 text-gray-500 hover:text-primary mb-4 text-sm">
        <ArrowLeft size={16} /> Volver a mis campañas
      </Link>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 capitalize">
            {campaign.status.replace('_', ' ')}
          </span>
        </div>
        {campaign.description && <p className="text-gray-600 mb-4">{campaign.description}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-400">Presupuesto</span><br /><strong>${campaign.budget} {campaign.currency}</strong></div>
          <div><span className="text-gray-400">Ciudad</span><br /><strong>{campaign.city || '—'}</strong></div>
          <div><span className="text-gray-400">Nicho</span><br /><strong>{campaign.niche_required || 'Cualquiera'}</strong></div>
          <div><span className="text-gray-400">Fecha límite</span><br /><strong>{campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : '—'}</strong></div>
        </div>
        {campaign.deliverables.length > 0 && (
          <div className="mt-4">
            <span className="text-sm text-gray-400">Entregables</span>
            <div className="flex gap-2 mt-1 flex-wrap">
              {campaign.deliverables.map((d, i) => (
                <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{d.quantity}× {d.type}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Applications */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={20} /> Aplicaciones ({applications.length})
        </h2>
        {applications.length === 0 ? (
          <p className="text-gray-400 text-sm">Aún no hay aplicaciones.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((a) => (
              <div key={a.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Influencer {a.influencer_user_id.slice(0, 8)}...</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {a.message ? a.message.slice(0, 100) : 'Sin mensaje'}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  {a.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleAction(a.id, 'accept')}
                        disabled={actionLoading === a.id}
                        className="flex items-center gap-1 text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                      >
                        {actionLoading === a.id ? <Loader className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                        Aceptar
                      </button>
                      <button
                        onClick={() => handleAction(a.id, 'reject')}
                        disabled={actionLoading === a.id}
                        className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                      >
                        <XCircle size={14} /> Rechazar
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[a.status] || 'bg-gray-100'}`}>
                      {a.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
