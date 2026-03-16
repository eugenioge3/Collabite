import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import { getApiErrorMessage } from '../../lib/apiError';
import type { BusinessCategory } from '../../lib/types';
import {
  BUSINESS_CATEGORY_LABELS,
  createBusinessProfileForm,
  getBusinessProfileChecklist,
  getBusinessProfileFieldErrors,
  getBusinessProfileUpdatePayload,
  isBusinessProfileReady,
} from '../../lib/businessProfile';
import { Save, Loader, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORIES: BusinessCategory[] = ['restaurant', 'bar', 'hotel', 'cafe'];

export default function BusinessProfile() {
  const { user } = useAuth();
  const [form, setForm] = useState(createBusinessProfileForm());
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOptional, setShowOptional] = useState(false);

  useEffect(() => {
    api.get('/businesses/me')
      .then((r) => {
        setForm(createBusinessProfileForm(r.data, user?.email));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = getBusinessProfileFieldErrors(form, user?.email);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setMessage({
        type: 'error',
        text: 'Completa nombre del negocio, categoria y ciudad antes de continuar.',
      });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put('/businesses/me', getBusinessProfileUpdatePayload(form));
      setForm(createBusinessProfileForm(res.data, user?.email));
      setErrors({});
      setMessage({ type: 'success', text: 'Perfil guardado. Ya puedes avanzar a crear tu campana.' });
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: getApiErrorMessage(err, 'No se pudo guardar el perfil. Intentalo de nuevo.'),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;

  const checklist = getBusinessProfileChecklist(form, user?.email);
  const completedFields = checklist.filter((item) => item.complete).length;
  const profileReady = isBusinessProfileReady(form, user?.email);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Perfil del negocio</h1>
        <p className="text-gray-600">
          Solo te pedimos 3 datos para empezar. El resto lo puedes completar despues.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <p className="text-sm font-medium text-gray-700">Listo para publicar</p>
            <p className="text-sm text-gray-500">{completedFields} de 3 campos esenciales completos</p>
          </div>
          {profileReady ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
              <CheckCircle2 size={16} /> Perfil listo
            </span>
          ) : (
            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              Falta completar el perfil
            </span>
          )}
        </div>

        <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(completedFields / 3) * 100}%` }}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {checklist.map((item) => (
            <div
              key={item.key}
              className={`rounded-xl border px-3 py-2 text-sm ${item.complete ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border bg-white p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre del negocio *</label>
            <input
              name="business_name"
              value={form.business_name}
              onChange={handleChange}
              placeholder="Ej. Tacos del Mar"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.business_name ? 'border-red-300' : ''}`}
            />
            {errors.business_name && <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1">Categoria *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white ${errors.category ? 'border-red-300' : ''}`}
              >
                <option value="">Seleccionar</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {BUSINESS_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ciudad *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ej. Cancun"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.city ? 'border-red-300' : ''}`}
              />
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <button
            type="button"
            onClick={() => setShowOptional((current) => !current)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <p className="font-semibold">Detalles opcionales</p>
              <p className="text-sm text-gray-500">Agrega contexto extra si quieres mejorar confianza y conversion.</p>
            </div>
            {showOptional ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showOptional && (
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descripcion corta</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Que tipo de experiencia ofreces y por que alguien iria a visitarte"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Estado</label>
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Ej. Quintana Roo"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pais</label>
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL de Google Maps</label>
                <input
                  name="google_maps_url"
                  value={form.google_maps_url}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none ${errors.google_maps_url ? 'border-red-300' : ''}`}
                />
                {errors.google_maps_url && <p className="mt-1 text-sm text-red-600">{errors.google_maps_url}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Instagram</label>
                  <input
                    name="instagram_handle"
                    value={form.instagram_handle}
                    onChange={handleChange}
                    placeholder="@tunegocio"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">TikTok</label>
                  <input
                    name="tiktok_handle"
                    value={form.tiktok_handle}
                    onChange={handleChange}
                    placeholder="@tunegocio"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
          >
          {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
          Guardar
          </button>

          {profileReady && (
            <Link
              to="/dashboard/business/campaigns/new"
              className="text-center px-6 py-2.5 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/5 transition"
            >
              Crear primera campana
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}
