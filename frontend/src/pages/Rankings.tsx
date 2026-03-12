import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { InfluencerProfile, Niche } from '../lib/types';
import { Trophy, MapPin, Instagram } from 'lucide-react';

const NICHES: Niche[] = ['food', 'nightlife', 'travel', 'lifestyle', 'fitness'];

export default function Rankings() {
  const [influencers, setInfluencers] = useState<InfluencerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('');

  const fetchRankings = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('sort', 'followers');
    params.set('limit', '50');
    if (city.trim()) params.set('city', city.trim());
    if (niche) params.set('niche', niche);
    api.get(`/influencers?${params}`)
      .then((r) => setInfluencers(r.data))
      .catch(() => setInfluencers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRankings(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRankings();
  };

  const totalFollowers = (inf: InfluencerProfile) =>
    inf.followers_instagram + inf.followers_tiktok + inf.followers_youtube;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Trophy className="text-secondary" /> Rankings de Influencers
        </h1>
        <p className="text-gray-500">Los mejores creadores de contenido gastronómico y de hospitalidad</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-8 justify-center">
        <input value={city} onChange={(e) => setCity(e.target.value)}
          placeholder="Filtrar por ciudad"
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm min-w-[180px]" />
        <select value={niche} onChange={(e) => setNiche(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white min-w-[140px]">
          <option value="">Todos los nichos</option>
          {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <button type="submit"
          className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition">
          Filtrar
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400">Cargando...</div>
      ) : influencers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No se encontraron influencers.</div>
      ) : (
        <div className="space-y-3">
          {influencers.map((inf, i) => (
            <div key={inf.user_id}
              className="bg-white border rounded-lg p-4 flex items-center gap-4 hover:border-primary transition">
              {/* Rank */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                i === 0 ? 'bg-yellow-100 text-yellow-700' :
                i === 1 ? 'bg-gray-200 text-gray-600' :
                i === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-gray-50 text-gray-400'
              }`}>
                {i + 1}
              </div>

              {/* Avatar placeholder */}
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                {inf.display_name ? inf.display_name[0].toUpperCase() : '?'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{inf.display_name || 'Sin nombre'}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                  {inf.city && (
                    <span className="flex items-center gap-0.5"><MapPin size={12} />{inf.city}</span>
                  )}
                  {inf.niche && (
                    <span className="capitalize">{inf.niche}</span>
                  )}
                  {inf.instagram_handle && (
                    <span className="flex items-center gap-0.5"><Instagram size={12} />{inf.instagram_handle}</span>
                  )}
                </div>
              </div>

              {/* Followers */}
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-primary">{totalFollowers(inf).toLocaleString()}</div>
                <div className="text-xs text-gray-400">seguidores totales</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SEO text */}
      <div className="mt-12 text-center text-sm text-gray-400 max-w-2xl mx-auto">
        <p>
          Collabite conecta a los mejores influencers de gastronomía, bares, hoteles y vida nocturna
          con negocios locales en toda Latinoamérica. Descubre los creadores de contenido con mayor
          alcance y engagement en tu ciudad.
        </p>
      </div>
    </div>
  );
}
