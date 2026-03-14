import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { CampaignPublic } from '../lib/types';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Loader } from 'lucide-react';

export default function CampaignPublicDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState('');
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get(`/campaigns/${id}`)
      .then((r) => setCampaign(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    setError('');
    try {
      await api.post(`/applications/campaigns/${id}/apply`, { message: message || null });
      setApplied(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al aplicar');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;
  if (!campaign) return <div className="text-center py-20 text-gray-400">Campaña no encontrada</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/campaigns" className="inline-flex items-center gap-1 text-gray-500 hover:text-primary mb-4 text-sm">
        <ArrowLeft size={16} /> Volver a campañas
      </Link>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{campaign.title}</h1>
        {campaign.description && <p className="text-gray-600 mb-4">{campaign.description}</p>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
          <div className="flex items-center gap-1.5">
            <DollarSign className="text-primary" size={16} />
            <div>
              <span className="text-gray-400 block text-xs">Presupuesto</span>
              <strong>${campaign.budget} {campaign.currency}</strong>
            </div>
          </div>
          {campaign.city && (
            <div className="flex items-center gap-1.5">
              <MapPin className="text-primary" size={16} />
              <div>
                <span className="text-gray-400 block text-xs">Ciudad</span>
                <strong>{campaign.city}</strong>
              </div>
            </div>
          )}
          {campaign.deadline && (
            <div className="flex items-center gap-1.5">
              <Calendar className="text-primary" size={16} />
              <div>
                <span className="text-gray-400 block text-xs">Fecha límite</span>
                <strong>{new Date(campaign.deadline).toLocaleDateString()}</strong>
              </div>
            </div>
          )}
          {campaign.min_followers > 0 && (
            <div className="flex items-center gap-1.5">
              <Users className="text-primary" size={16} />
              <div>
                <span className="text-gray-400 block text-xs">Seguidores mín.</span>
                <strong>{campaign.min_followers.toLocaleString()}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {campaign.niche_required && (
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded capitalize">{campaign.niche_required}</span>
          )}
          {campaign.deliverables.map((d, i) => (
            <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded">
              {d.quantity}× {d.type}
            </span>
          ))}
        </div>

        {campaign.includes.length > 0 && (
          <div>
            <span className="text-sm font-medium text-gray-700">Incluye:</span>
            <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
              {campaign.includes.map((inc, i) => <li key={i}>{inc}</li>)}
            </ul>
          </div>
        )}
      </div>

      {/* Apply section */}
      {user?.role === 'influencer' && !applied && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Aplicar a esta campaña</h2>
          {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-3 text-sm">{error}</div>}
          <form onSubmit={handleApply} className="space-y-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Mensaje para el negocio (opcional)"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
            />
            <button type="submit" disabled={applying}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50">
              {applying ? <Loader className="animate-spin" size={16} /> : null}
              {applying ? 'Aplicando...' : 'Enviar aplicación'}
            </button>
          </form>
        </div>
      )}

      {applied && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-700 font-semibold">¡Aplicación enviada!</p>
          <p className="text-green-600 text-sm mt-1">El negocio revisará tu perfil y te contactará.</p>
        </div>
      )}

      {!user && (
        <div className="bg-gray-50 border rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-3">Inicia sesión para aplicar a esta campaña</p>
          <Link to="/login" className="text-primary font-semibold hover:underline">Iniciar sesión</Link>
        </div>
      )}
    </div>
  );
}
