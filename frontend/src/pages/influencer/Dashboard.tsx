import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import type { Campaign, Application } from '../../lib/types';
import { Briefcase, FileText, Star } from 'lucide-react';

export default function InfluencerDashboard() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/campaigns?status=open&limit=5').catch(() => ({ data: [] })),
      api.get('/applications/mine').catch(() => ({ data: [] })),
    ]).then(([c, a]) => {
      setCampaigns(c.data);
      setApplications(a.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex justify-center py-20"><div className="text-gray-400">Cargando...</div></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">
        ¡Hola{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
      </h1>
      <p className="text-gray-500 mb-8">Panel de influencer</p>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-5">
          <Briefcase className="text-primary mb-2" size={24} />
          <div className="text-2xl font-bold">{campaigns.length}</div>
          <p className="text-sm text-gray-500">Campañas disponibles</p>
        </div>
        <div className="bg-white border rounded-lg p-5">
          <FileText className="text-secondary mb-2" size={24} />
          <div className="text-2xl font-bold">{applications.length}</div>
          <p className="text-sm text-gray-500">Mis aplicaciones</p>
        </div>
        <div className="bg-white border rounded-lg p-5">
          <Star className="text-accent mb-2" size={24} />
          <div className="text-2xl font-bold">
            {applications.filter((a) => a.status === 'accepted').length}
          </div>
          <p className="text-sm text-gray-500">Aceptadas</p>
        </div>
      </div>

      {/* Recent campaigns */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Campañas recientes</h2>
          <Link to="/campaigns" className="text-primary text-sm hover:underline">Ver todas</Link>
        </div>
        {campaigns.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay campañas disponibles.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((c) => (
              <Link
                key={c.id}
                to={`/campaigns/${c.id}`}
                className="bg-white border rounded-lg p-4 hover:border-primary transition"
              >
                <h3 className="font-semibold mb-1 truncate">{c.title}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{c.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{c.city}</span>
                  <span className="font-semibold text-primary">${c.budget}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="flex gap-3 flex-wrap">
        <Link
          to="/dashboard/influencer/profile"
          className="px-4 py-2 border rounded-lg text-sm hover:border-primary transition"
        >
          Editar perfil
        </Link>
        <Link
          to="/dashboard/influencer/applications"
          className="px-4 py-2 border rounded-lg text-sm hover:border-primary transition"
        >
          Mis aplicaciones
        </Link>
        <Link
          to="/dashboard/influencer/verify"
          className="px-4 py-2 border rounded-lg text-sm hover:border-primary transition"
        >
          Verificar Instagram/TikTok
        </Link>
      </div>
    </div>
  );
}
