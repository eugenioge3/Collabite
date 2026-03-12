import { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { BusinessProfile as BProfile, BusinessCategory } from '../../lib/types';
import { Save, Loader } from 'lucide-react';

const CATEGORIES: BusinessCategory[] = ['restaurant', 'bar', 'hotel', 'cafe'];

export default function BusinessProfile() {
  const [profile, setProfile] = useState<Partial<BProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/businesses/me')
      .then((r) => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await api.put('/businesses/me', profile);
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
      <h1 className="text-2xl font-bold mb-6">Perfil del negocio</h1>

      {msg && <div className="mb-4 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm">{msg}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre del negocio</label>
          <input name="business_name" value={profile.business_name || ''} onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea name="description" value={profile.description || ''} onChange={handleChange} rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select name="category" value={profile.category || ''} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
              <option value="">Seleccionar</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ciudad</label>
            <input name="city" value={profile.city || ''} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">URL Google Maps</label>
          <input name="google_maps_url" value={profile.google_maps_url || ''} onChange={handleChange}
            placeholder="https://maps.google.com/..."
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
