import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import type { Campaign, Currency, Niche } from '../../lib/types';
import { ArrowLeft, Loader } from 'lucide-react';

const NICHES: Niche[] = ['food', 'nightlife', 'travel', 'lifestyle', 'fitness'];
const CURRENCIES: Currency[] = ['MXN', 'USD'];

export default function EditCampaign() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
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

  useEffect(() => {
    if (!id) return;
    api.get(`/campaigns/${id}`)
      .then((res) => {
        const campaign: Campaign = res.data;
        if (campaign.status !== 'draft') {
          setError('Solo se pueden editar campañas en borrador.');
          return;
        }

        setForm({
          title: campaign.title,
          description: campaign.description || '',
          budget: String(campaign.budget),
          currency: campaign.currency,
          city: campaign.city || '',
          state: campaign.state || '',
          niche_required: campaign.niche_required || '',
          min_followers: String(campaign.min_followers || 0),
          max_followers: campaign.max_followers != null ? String(campaign.max_followers) : '',
          deadline: campaign.deadline || '',
          max_applicants: campaign.max_applicants != null ? String(campaign.max_applicants) : '',
          deliverables: campaign.deliverables.length > 0 ? campaign.deliverables : [{ type: '', quantity: 1 }],
          includes: campaign.includes.length > 0 ? campaign.includes : [''],
        });
      })
      .catch((err: any) => {
        setError(err.response?.data?.detail || 'No se pudo cargar la campaña');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setError('');
    setSaving(true);

    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        budget: parseFloat(form.budget),
        currency: form.currency,
        city: form.city || null,
        state: form.state || null,
        niche_required: form.niche_required || null,
        min_followers: parseInt(form.min_followers) || 0,
        max_followers: form.max_followers ? parseInt(form.max_followers) : null,
        deadline: form.deadline || null,
        max_applicants: form.max_applicants ? parseInt(form.max_applicants) : null,
        deliverables: form.deliverables.filter((d) => d.type.trim()),
        includes: form.includes.filter((i) => i.trim()),
      };

      await api.put(`/campaigns/${id}`, payload);
      navigate(`/dashboard/business/campaigns/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'No se pudo guardar el borrador');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        to={id ? `/dashboard/business/campaigns/${id}` : '/dashboard/business/campaigns'}
        className="inline-flex items-center gap-1 text-gray-500 hover:text-primary mb-4 text-sm"
      >
        <ArrowLeft size={16} /> Volver a la campaña
      </Link>

      <h1 className="text-2xl font-bold mb-6">Editar borrador</h1>

      {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titulo *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descripcion</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Presupuesto</label>
            <input
              name="budget"
              type="number"
              value={form.budget}
              min={1}
              step={0.01}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Moneda</label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Ciudad</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nicho requerido</label>
            <select
              name="niche_required"
              value={form.niche_required}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="">Cualquiera</option>
              {NICHES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Seguidores minimos</label>
            <input
              name="min_followers"
              type="number"
              min={0}
              value={form.min_followers}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha limite</label>
            <input
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Entregables</label>
          {form.deliverables.map((d, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                value={d.type}
                onChange={(e) => updateDeliverable(i, 'type', e.target.value)}
                placeholder="Tipo (Ej: Instagram Reel)"
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
              />
              <input
                type="number"
                min={1}
                value={d.quantity}
                onChange={(e) => updateDeliverable(i, 'quantity', parseInt(e.target.value) || 1)}
                className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
              />
              {form.deliverables.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDeliverable(i)}
                  className="text-red-400 hover:text-red-600 px-2"
                >
                  x
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addDeliverable} className="text-primary text-sm hover:underline">
            + Agregar entregable
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition disabled:opacity-50"
        >
          {saving ? <Loader className="animate-spin" size={18} /> : null}
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  );
}
