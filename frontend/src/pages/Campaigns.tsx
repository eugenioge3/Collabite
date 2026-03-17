import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import {
  getMexicoCitiesByState,
  getMexicoStateOptions,
  normalizeMexicoCity,
  normalizeMexicoState,
} from '../lib/mxLocations';
import type { CampaignPublic, Niche } from '../lib/types';
import { Search, MapPin, DollarSign, CheckCircle, Store } from 'lucide-react';

const NICHES: Niche[] = ['food', 'nightlife', 'travel', 'lifestyle', 'fitness'];

export default function CampaignsPublic() {
  const [campaigns, setCampaigns] = useState<CampaignPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('');

  const stateOptions = getMexicoStateOptions(state);
  const cityOptions = getMexicoCitiesByState(state, city);

  const buildSearchParams = () => {
    const params = new URLSearchParams();
    params.set('status', 'open');
    if (state.trim()) params.set('state', state.trim());
    if (city.trim()) params.set('city', city.trim());
    if (niche) params.set('niche', niche);
    return params;
  };

  const handleStateChange = (value: string) => {
    const nextState = normalizeMexicoState(value) || '';
    if (state !== nextState) {
      setCity('');
    }
    setState(nextState);
  };

  const handleCityChange = (value: string) => {
    setCity(normalizeMexicoCity(value) || '');
  };

  const fetchCampaigns = () => {
    setLoading(true);
    const params = buildSearchParams();
    api.get(`/campaigns?${params}`)
      .then((r) => setCampaigns(r.data))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams();
    params.set('status', 'open');

    api.get(`/campaigns?${params}`)
      .then((r) => {
        if (active) setCampaigns(r.data);
      })
      .catch(() => {
        if (active) setCampaigns([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

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
        <select
          value={state}
          onChange={(e) => handleStateChange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white min-w-[180px]"
        >
          <option value="">Estado</option>
          {stateOptions.map((stateOption) => <option key={stateOption} value={stateOption}>{stateOption}</option>)}
        </select>

        <select
          value={city}
          onChange={(e) => handleCityChange(e.target.value)}
          disabled={!state}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white min-w-[180px] disabled:bg-gray-50"
        >
          <option value="">{state ? 'Ciudad' : 'Primero selecciona estado'}</option>
          {cityOptions.map((cityOption) => <option key={cityOption} value={cityOption}>{cityOption}</option>)}
        </select>

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
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-semibold text-lg group-hover:text-primary truncate">{c.title}</h3>
                {c.already_applied && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full shrink-0">
                    <CheckCircle size={12} /> Ya aplicaste
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{c.description || 'Sin descripción'}</p>

              {c.business_hint && (
                <div className="text-xs text-gray-600 bg-gray-50 border border-gray-100 rounded px-2.5 py-2 mb-3 inline-flex items-center gap-1.5">
                  <Store size={12} className="text-gray-400" />
                  <span className="line-clamp-1">{c.business_hint}</span>
                </div>
              )}

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
