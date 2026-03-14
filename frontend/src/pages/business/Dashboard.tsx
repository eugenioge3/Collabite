import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import type { Campaign } from '../../lib/types';
import { PlusCircle, Users, Briefcase } from 'lucide-react';

export default function BusinessDashboard() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/campaigns/mine')
      .then((r) => setCampaigns(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;

  const active = campaigns.filter((c) => ['active', 'in_progress', 'funded'].includes(c.status));
  const completed = campaigns.filter((c) => c.status === 'completed');

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
          to="/dashboard/business/campaigns/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition"
        >
          <PlusCircle size={18} /> Nueva campaña
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-5">
          <Briefcase className="text-primary mb-2" size={24} />
          <div className="text-2xl font-bold">{campaigns.length}</div>
          <p className="text-sm text-gray-500">Total campañas</p>
        </div>
        <div className="bg-white border rounded-lg p-5">
          <Users className="text-secondary mb-2" size={24} />
          <div className="text-2xl font-bold">{active.length}</div>
          <p className="text-sm text-gray-500">Activas</p>
        </div>
        <div className="bg-white border rounded-lg p-5">
          <Briefcase className="text-accent mb-2" size={24} />
          <div className="text-2xl font-bold">{completed.length}</div>
          <p className="text-sm text-gray-500">Completadas</p>
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
            {campaigns.slice(0, 6).map((c) => (
              <Link key={c.id} to={`/dashboard/business/campaigns/${c.id}`}
                className="bg-white border rounded-lg p-4 hover:border-primary transition">
                <h3 className="font-semibold mb-1 truncate">{c.title}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{c.status}</span>
                  <span className="font-semibold text-primary">${c.budget} {c.currency}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
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
