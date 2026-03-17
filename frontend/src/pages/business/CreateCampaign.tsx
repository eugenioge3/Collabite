import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { getApiErrorMessage } from '../../lib/apiError';
import { getPublishCampaignValidationMessage } from '../../lib/campaignPublish';
import {
  getMexicoCitiesByState,
  getMexicoStateOptions,
  normalizeMexicoCity,
  normalizeMexicoLocationSelection,
  normalizeMexicoState,
} from '../../lib/mxLocations';
import type { Niche, Currency } from '../../lib/types';
import { Loader } from 'lucide-react';

const NICHES: Niche[] = ['food', 'nightlife', 'travel', 'lifestyle', 'fitness'];
const CURRENCIES: Currency[] = ['MXN', 'USD'];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    currency: 'MXN' as Currency,
    city: '',
    state: '',
    niche_required: '' as Niche | '',
    min_followers: '0',
    max_followers: '',
    deadline: '',
    max_applicants: '',
    deliverables: [{ type: 'Instagram Reel', quantity: 1 }],
    includes: [''],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitMode, setSubmitMode] = useState<'draft' | 'publish'>('publish');

  const stateOptions = getMexicoStateOptions(form.state);
  const cityOptions = getMexicoCitiesByState(form.state, form.city);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextState = normalizeMexicoState(e.target.value) || '';
    setForm((f) => ({
      ...f,
      state: nextState,
      city: f.state === nextState ? f.city : '',
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCity = normalizeMexicoCity(e.target.value) || '';
    setForm((f) => ({ ...f, city: nextCity }));
  };

  const addDeliverable = () => setForm((f) => ({
    ...f,
    deliverables: [...f.deliverables, { type: '', quantity: 1 }],
  }));

  const updateDeliverable = (i: number, field: string, value: string | number) => {
    setForm((f) => ({
      ...f,
      deliverables: f.deliverables.map((d, idx) => idx === i ? { ...d, [field]: value } : d),
    }));
  };

  const removeDeliverable = (i: number) => {
    setForm((f) => ({ ...f, deliverables: f.deliverables.filter((_, idx) => idx !== i) }));
  };

  const submitCampaign = async (mode: 'draft' | 'publish' = 'publish') => {
    setError('');

    if (mode === 'publish') {
      const validationMessage = getPublishCampaignValidationMessage({
        title: form.title,
        budget: form.budget,
        city: form.city,
        niche_required: form.niche_required,
      });

      if (validationMessage) {
        setError(validationMessage);
        return;
      }
    }

    setLoading(true);
    setSubmitMode(mode);
    try {
      const location = normalizeMexicoLocationSelection(form.state, form.city);

      const payload = {
        title: form.title.trim(),
        description: form.description || null,
        budget: parseFloat(form.budget),
        currency: form.currency,
        city: location.city,
        state: location.state,
        niche_required: form.niche_required || null,
        min_followers: parseInt(form.min_followers) || 0,
        max_followers: form.max_followers ? parseInt(form.max_followers) : null,
        deadline: form.deadline || null,
        max_applicants: form.max_applicants ? parseInt(form.max_applicants) : null,
        deliverables: form.deliverables.filter((d) => d.type.trim()),
        includes: form.includes.filter((i) => i.trim()),
        publish_now: mode === 'publish',
      };
      const res = await api.post('/campaigns', payload);
      navigate(`/dashboard/business/campaigns/${res.data.id}`, {
        state: {
          notice: mode === 'publish'
            ? 'Campaña publicada correctamente. Ya está visible para influencers.'
            : 'Borrador guardado. Cuando quieras, entra y publica la campaña.',
        },
      });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Error al crear campaña'));
    } finally {
      setLoading(false);
    }
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitCampaign('publish');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Nueva campaña</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 mb-4">
        Flujo recomendado: 1) guarda borrador, 2) publica cuando tengas título, presupuesto, ciudad y nicho.
      </div>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      <form onSubmit={handlePublishSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input name="title" value={form.title} onChange={handleChange} required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            placeholder="Ej: Reseña de menú de temporada" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Presupuesto *</label>
            <input name="budget" type="number" min={1} step={0.01} value={form.budget} onChange={handleChange} required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Moneda</label>
            <select name="currency" value={form.currency} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              name="state"
              value={form.state}
              onChange={handleStateChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="">Seleccionar</option>
              {stateOptions.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ciudad *</label>
            <select
              name="city"
              value={form.city}
              onChange={handleCityChange}
              disabled={!form.state}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white disabled:bg-gray-50"
            >
              <option value="">{form.state ? 'Seleccionar' : 'Primero selecciona estado'}</option>
              {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nicho requerido *</label>
            <select name="niche_required" value={form.niche_required} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
              <option value="">Cualquiera</option>
              {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Seguidores mínimos</label>
            <input name="min_followers" type="number" min={0} value={form.min_followers} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha límite</label>
            <input name="deadline" type="date" value={form.deadline} onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
          </div>
        </div>

        {/* Deliverables */}
        <div>
          <label className="block text-sm font-medium mb-2">Entregables</label>
          {form.deliverables.map((d, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input value={d.type} onChange={(e) => updateDeliverable(i, 'type', e.target.value)}
                placeholder="Tipo (Ej: Instagram Reel)"
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
              <input type="number" min={1} value={d.quantity}
                onChange={(e) => updateDeliverable(i, 'quantity', parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm" />
              {form.deliverables.length > 1 && (
                <button type="button" onClick={() => removeDeliverable(i)}
                  className="text-red-400 hover:text-red-600 px-2">✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={addDeliverable}
            className="text-primary text-sm hover:underline">+ Agregar entregable</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => submitCampaign('draft')}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            {loading && submitMode === 'draft' ? <Loader className="animate-spin" size={18} /> : null}
            {loading && submitMode === 'draft' ? 'Guardando...' : 'Guardar borrador'}
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
          >
            {loading && submitMode === 'publish' ? <Loader className="animate-spin" size={18} /> : null}
            {loading && submitMode === 'publish' ? 'Publicando...' : 'Publicar campaña'}
          </button>
        </div>
      </form>
    </div>
  );
}
