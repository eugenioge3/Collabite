import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import type { CampaignPublic, Niche } from '../lib/types';
import { Search, MapPin, DollarSign } from 'lucide-react';

const NICHES: Niche[] = ['food', 'nightlife', 'travel', 'lifestyle', 'fitness'];

export default function CampaignsPublic() {
  const [campaigns, setCampaigns] = useState<CampaignPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('');

  const fetchCampaigns = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('status', 'open');
    if (city.trim()) params.set('city', city.trim());
    if (niche) params.set('niche', niche);
    api.get(`/campaigns?${params}`)
      .then((r) => setCampaigns(r.data))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCampaigns();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Campañas disponibles</h1>
      <p className="text-gray-500 mb-6">Encuentra campañas que se ajusten a tu perfil</p>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-[200px]">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={city} onChange={(e) => setCity(e.target.value)}
            placeholder="Ciudad"
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
        </div>
        <select value={niche} onChange={(e) => setNiche(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white min-w-[140px]">
          <option value="">Todos los nichos</option>
          {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <button type="submit"
          className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition">
          <Search size={16} /> Buscar
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">Cargando...</div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p>No se encontraron campañas con esos filtros.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <Link key={c.id} to={`/campaigns/${c.id}`}
              className="bg-white border rounded-lg p-5 hover:border-primary transition group">
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary truncate">{c.title}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.description || 'Sin descripción'}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {c.niche_required && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded capitalize">{c.niche_required}</span>
                )}
                {c.city && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded flex items-center gap-1">
                    <MapPin size={10} />{c.city}
                  </span>
                )}
                {c.min_followers > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.min_followers.toLocaleString()}+ seg.</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  {c.deliverables.length > 0 && <span>{c.deliverables.length} entregable{c.deliverables.length > 1 ? 's' : ''}</span>}
                </div>
                <span className="text-primary font-bold flex items-center gap-0.5">
                  <DollarSign size={14} />{c.budget} {c.currency}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
