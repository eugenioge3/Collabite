import { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { InfluencerProfile as IProfile, Niche } from '../../lib/types';
import {
  getMexicoCitiesByState,
  getMexicoStateOptions,
  normalizeMexicoCity,
  normalizeMexicoLocationSelection,
  normalizeMexicoState,
} from '../../lib/mxLocations';
import { Save, Loader } from 'lucide-react';

const NICHES: Niche[] = ['food', 'nightlife', 'travel', 'lifestyle', 'fitness'];

export default function InfluencerProfile() {
  const [profile, setProfile] = useState<Partial<IProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/influencers/me')
      .then((r) => {
        const location = normalizeMexicoLocationSelection(r.data.state, r.data.city);
        setProfile({
          ...r.data,
          state: location.state,
          city: location.city,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stateOptions = getMexicoStateOptions(profile.state);
  const cityOptions = getMexicoCitiesByState(profile.state, profile.city);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextState = normalizeMexicoState(e.target.value) || '';
    setProfile((p) => ({
      ...p,
      state: nextState,
      city: p.state === nextState ? p.city : '',
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCity = normalizeMexicoCity(e.target.value) || '';
    setProfile((p) => ({ ...p, city: nextCity }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const location = normalizeMexicoLocationSelection(profile.state, profile.city);
      const payload = {
        ...profile,
        state: location.state,
        city: location.city,
      };

      const res = await api.put('/influencers/me', payload);
      setProfile(res.data);
      setMsg('Perfil actualizado');
    } catch {
      setMsg('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mi perfil</h1>

      {msg && <div className="mb-4 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm">{msg}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre de display</label>
          <input name="display_name" value={profile.display_name || ''} onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea name="bio" value={profile.bio || ''} onChange={handleChange} rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select name="state" value={profile.state || ''} onChange={handleStateChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
              <option value="">Seleccionar</option>
              {stateOptions.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ciudad</label>
            <select name="city" value={profile.city || ''} onChange={handleCityChange} disabled={!profile.state}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white disabled:bg-gray-50">
              <option value="">{profile.state ? 'Seleccionar' : 'Primero selecciona estado'}</option>
              {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nicho</label>
            <select name="niche" value={profile.niche || ''} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
              <option value="">Seleccionar</option>
              {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Instagram</label>
            <input name="instagram_handle" value={profile.instagram_handle || ''} onChange={handleChange}
              placeholder="@usuario" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">TikTok</label>
            <input name="tiktok_handle" value={profile.tiktok_handle || ''} onChange={handleChange}
              placeholder="@usuario" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">YouTube</label>
            <input name="youtube_handle" value={profile.youtube_handle || ''} onChange={handleChange}
              placeholder="@canal" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Precio estimado por post (MXN)</label>
          <input name="estimated_price_per_post" type="number" min={0}
            value={profile.estimated_price_per_post ?? ''} onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>

        <button type="submit" disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50">
          {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
          Guardar
        </button>
      </form>
    </div>
  );
}
