import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
  getMexicoCitiesByState,
  getMexicoStateOptions,
  normalizeMexicoCity,
  normalizeMexicoState,
} from '../../lib/mxLocations';
import type { InfluencerBusinessRanking, Niche } from '../../lib/types';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, ShieldCheck } from 'lucide-react';

const NICHES: Niche[] = ['food', 'nightlife', 'travel', 'lifestyle', 'fitness'];

export default function InfluencerRankingsPrivate() {
  const [influencers, setInfluencers] = useState<InfluencerBusinessRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('');

  const stateOptions = getMexicoStateOptions(state);
  const cityOptions = getMexicoCitiesByState(state, city);

  const fetchRankings = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('sort_by', 'followers_instagram');
    params.set('limit', '50');
    if (state.trim()) params.set('state', state.trim());
    if (city.trim()) params.set('city', city.trim());
    if (niche) params.set('niche', niche);

    api.get(`/influencers/private/rankings?${params}`)
      .then((r) => setInfluencers(r.data))
      .catch(() => setInfluencers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRankings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRankings();
  };

  const totalFollowers = (inf: InfluencerBusinessRanking) =>
    inf.followers_instagram + inf.followers_tiktok + inf.followers_youtube;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link
        to="/dashboard/business"
        className="inline-flex items-center gap-1 text-gray-500 hover:text-primary mb-4 text-sm"
      >
        <ArrowLeft size={16} /> Volver al dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-1">Rankings privados</h1>
      <p className="text-gray-500 mb-6">Vista detallada para negocios dentro de Collabite</p>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-sm text-green-800">
        Acceso protegido para negocios autenticados. Contactos visibles para contratación en plataforma.
      </div>

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

        <select
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white min-w-[140px]"
        >
          <option value="">Todos los nichos</option>
          {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <button
          type="submit"
          className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition"
        >
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
            <div
              key={inf.user_id}
              className="bg-white border rounded-lg p-4 flex items-center gap-4 hover:border-primary transition"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                i === 0 ? 'bg-yellow-100 text-yellow-700' :
                i === 1 ? 'bg-gray-200 text-gray-600' :
                i === 2 ? 'bg-orange-100 text-orange-700' :
                'bg-gray-50 text-gray-400'
              }`}>
                {i + 1}
              </div>

              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                {inf.display_name ? inf.display_name[0].toUpperCase() : '?'}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{inf.display_name || 'Sin nombre'}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-0.5">
                  {inf.city && (
                    <span className="flex items-center gap-0.5"><MapPin size={12} />{inf.city}</span>
                  )}
                  {inf.niche && (
                    <span className="capitalize">{inf.niche}</span>
                  )}
                  {inf.verified && (
                    <span className="flex items-center gap-0.5"><ShieldCheck size={12} />Verificado</span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-primary">{totalFollowers(inf).toLocaleString()}</div>
                <div className="text-xs text-gray-400">seguidores totales</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
