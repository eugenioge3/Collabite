import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import type { Campaign, BusinessProfile } from '../../lib/types';
import { isBusinessProfileReady } from '../../lib/businessProfile';
import { getCampaignStatusMeta } from '../../lib/campaignStatus';
import { PlusCircle, Users, Briefcase } from 'lucide-react';

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [profileReady, setProfileReady] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/campaigns/mine'),
      api.get<BusinessProfile>('/businesses/me'),
    ])
      .then(([campaignsResponse, profileResponse]) => {
        setCampaigns(campaignsResponse.data);
        setProfileReady(isBusinessProfileReady(profileResponse.data, user?.email));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;

  const matched = campaigns.filter((c) => c.status === 'in_progress');
  const history = campaigns.filter((c) => ['completed', 'canceled', 'disputed'].includes(c.status));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            ¡Hola{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-gray-500">Panel de negocio</p>
        </div>
        <Link
          to={profileReady ? '/dashboard/business/campaigns/new' : '/dashboard/business/profile'}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition"
        >
          <PlusCircle size={18} /> {profileReady ? 'Nueva campaña' : 'Completar perfil'}
        </Link>
      </div>

      {!profileReady && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="font-semibold text-amber-900 mb-1">Completa tu perfil antes de publicar</p>
          <p className="text-sm text-amber-800">
            Solo faltan tres datos base: nombre del negocio, categoria y ciudad. Cuando lo cierres, ya puedes crear tu primera campana.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-5">
          <Briefcase className="text-primary mb-2" size={24} />
          <div className="text-2xl font-bold">{campaigns.length}</div>
          <p className="text-sm text-gray-500">Total campañas</p>
        </div>
        <div className="bg-white border rounded-lg p-5">
          <Users className="text-secondary mb-2" size={24} />
          <div className="text-2xl font-bold">{matched.length}</div>
          <p className="text-sm text-gray-500">Campañas cuadradas</p>
        </div>
        <div className="bg-white border rounded-lg p-5">
          <Briefcase className="text-accent mb-2" size={24} />
          <div className="text-2xl font-bold">{history.length}</div>
          <p className="text-sm text-gray-500">Historial</p>
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Mis campañas</h2>
          <Link to="/dashboard/business/campaigns" className="text-primary text-sm hover:underline">
            Ver todas
          </Link>
        </div>
        {campaigns.length === 0 ? (
          <p className="text-gray-400 text-sm">No tienes campañas aún. ¡Crea tu primera!</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.slice(0, 6).map((c) => {
              const statusMeta = getCampaignStatusMeta(c.status);
              const applicationsCount = c.applications_count ?? 0;
              const hasApplicants = applicationsCount > 0;
              const needsUnlock = hasApplicants && !c.escrow_funded && c.status !== 'draft';
              const applicantsLabel = `${applicationsCount} candidata${applicationsCount === 1 ? '' : 's'} aplicaron`;

              return (
                <Link
                  key={c.id}
                  to={`/dashboard/business/campaigns/${c.id}`}
                  className="bg-white border rounded-lg p-4 hover:border-primary transition"
                >
                  <h3 className="font-semibold mb-1 truncate">{c.title}</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{c.description}</p>
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className={`px-2 py-0.5 rounded-full ${statusMeta.badgeClassName}`}>{statusMeta.label}</span>
                    <span className="font-semibold text-primary">${c.budget} {c.currency}</span>
                  </div>
                  {hasApplicants && (
                    <p className={`text-xs mt-2 ${needsUnlock ? 'text-amber-700' : 'text-gray-600'}`}>
                      {needsUnlock ? `${applicantsLabel} · paga para desbloquear` : applicantsLabel}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{statusMeta.nextStep}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <Link to="/dashboard/business/campaigns?view=matched"
          className="px-4 py-2 border rounded-lg text-sm hover:border-primary transition">
          Campañas cuadradas
        </Link>
        <Link to="/dashboard/business/campaigns?view=history"
          className="px-4 py-2 border rounded-lg text-sm hover:border-primary transition">
          Historial de campañas
        </Link>
        <Link to="/dashboard/business/profile"
          className="px-4 py-2 border rounded-lg text-sm hover:border-primary transition">
          Editar perfil
        </Link>
        <Link to="/dashboard/business/rankings"
          className="px-4 py-2 border rounded-lg text-sm hover:border-primary transition">
          Ver rankings privados
        </Link>
        <Link to="/dashboard/business/verify"
          className="px-4 py-2 border rounded-lg text-sm hover:border-primary transition">
          Verificar Instagram/TikTok
        </Link>
      </div>
    </div>
  );
}
