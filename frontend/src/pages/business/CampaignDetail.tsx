import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/api';
import { getApiErrorMessage } from '../../lib/apiError';
import { getCampaignStatusMeta } from '../../lib/campaignStatus';
import type { Campaign, Application } from '../../lib/types';
import {
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  Loader,
  Lock,
  Unlock,
  MapPin,
  Rocket,
  Pencil,
  Trash2,
  CreditCard,
} from 'lucide-react';

const APPLICATION_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  disputed: 'bg-orange-100 text-orange-800',
};

type CampaignDetailLocationState = {
  notice?: string;
};

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const initialNotice = ((location.state ?? null) as CampaignDetailLocationState | null)?.notice ?? '';
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(initialNotice);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [campaignRes, appsRes] = await Promise.all([
        api.get(`/campaigns/${id}`),
        api.get(`/applications/campaign/${id}`).catch(() => ({ data: [] })),
      ]);
      setCampaign(campaignRes.data);
      setApplications(appsRes.data);
    } catch {
      setCampaign(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAction = async (appId: string, action: 'accept' | 'reject') => {
    setActionLoading(appId);
    setError('');
    try {
      const res = await api.patch(`/applications/${appId}/${action}`);
      setApplications((prev) =>
        prev.map((a) => a.id === appId ? res.data : a)
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'No se pudo actualizar la aplicación'));
    }
    setActionLoading(null);
  };

  const handleUnlockContact = async (appId: string) => {
    setActionLoading(appId);
    setError('');
    try {
      const res = await api.post(`/applications/${appId}/unlock-contact`);
      setApplications((prev) => prev.map((a) => (a.id === appId ? res.data : a)));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'No se pudo desbloquear el contacto'));
    }
    setActionLoading(null);
  };

  const handlePublishCampaign = async () => {
    if (!id || !campaign) return;
    setPublishing(true);
    setError('');
    try {
      const res = await api.post(`/campaigns/${id}/publish`);
      setCampaign(res.data);
      setNotice('Campaña publicada correctamente. Ya está visible para influencers.');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'No se pudo publicar la campaña'));
    }
    setPublishing(false);
  };

  const handleFundEscrow = async () => {
    if (!id || !campaign) return;
    setPaying(true);
    setError('');
    try {
      const res = await api.post(`/campaigns/${id}/fund-escrow`);
      setCampaign(res.data);
      const appsRes = await api.get(`/applications/campaign/${id}`).catch(() => ({ data: [] }));
      setApplications(appsRes.data);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'No se pudo completar el pago'));
    }
    setPaying(false);
  };

  const handleDeleteCampaign = async () => {
    if (!id || !campaign) return;
    const confirmed = window.confirm('Esta accion eliminara la campana publicada. Deseas continuar?');
    if (!confirmed) return;

    setDeleting(true);
    setError('');
    try {
      await api.delete(`/campaigns/${id}`);
      navigate('/dashboard/business/campaigns');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'No se pudo eliminar la campana'));
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-400">Cargando...</div>;
  if (!campaign) return <div className="text-center py-20 text-gray-400">Campaña no encontrada</div>;

  const statusMeta = getCampaignStatusMeta(campaign.status);
  const canEditDraft = campaign.status === 'draft';
  const canDeletePublished = campaign.status === 'active' || campaign.status === 'funded';
  const canPublishDraft = statusMeta.primaryAction === 'publish';
  const canFundCampaign = statusMeta.primaryAction === 'fund_escrow';
  const canReviewApplicants = statusMeta.primaryAction === 'review_applications';
  const needsPaymentToReview = !campaign.escrow_funded;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/dashboard/business/campaigns" className="inline-flex items-center gap-1 text-gray-500 hover:text-primary mb-4 text-sm">
        <ArrowLeft size={16} /> Volver a mis campañas
      </Link>

      {notice && (
        <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 text-sm mb-4">
          {notice}
        </div>
      )}

      <div className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Estado actual</p>
          <p className="font-semibold text-gray-900">{statusMeta.label}</p>
          <p className="text-sm text-gray-600">{statusMeta.nextStep}</p>
        </div>

        <div className="shrink-0">
          {canPublishDraft && (
            <button
              onClick={handlePublishCampaign}
              disabled={publishing}
              className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition disabled:opacity-50"
            >
              {publishing ? <Loader className="animate-spin" size={14} /> : <Rocket size={14} />}
              {publishing ? 'Publicando...' : statusMeta.ctaLabel}
            </button>
          )}

          {canFundCampaign && (
            <button
              onClick={handleFundEscrow}
              disabled={paying}
              className="inline-flex items-center gap-1.5 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50"
            >
              {paying ? <Loader className="animate-spin" size={14} /> : <CreditCard size={14} />}
              {paying ? 'Procesando pago...' : statusMeta.ctaLabel}
            </button>
          )}

          {canReviewApplicants && (
            <a
              href="#applications"
              className="inline-flex items-center gap-1.5 border border-primary text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/5 transition"
            >
              {statusMeta.ctaLabel}
            </a>
          )}

          {statusMeta.primaryAction === 'none' && (
            <span className="text-xs text-gray-500">Sin acciones pendientes</span>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold">{campaign.title}</h1>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusMeta.badgeClassName}`}>
              {statusMeta.label}
            </span>

            {canEditDraft && (
              <Link
                to={`/dashboard/business/campaigns/${campaign.id}/edit`}
                className="inline-flex items-center gap-1.5 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 transition"
              >
                <Pencil size={12} /> Editar draft
              </Link>
            )}

            {canDeletePublished && (
              <button
                onClick={handleDeleteCampaign}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 transition disabled:opacity-50"
              >
                {deleting ? <Loader className="animate-spin" size={12} /> : <Trash2 size={12} />}
                {deleting ? 'Eliminando...' : 'Eliminar publicada'}
              </button>
            )}
          </div>
        </div>
        {campaign.description && <p className="text-gray-600 mb-4">{campaign.description}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-400">Presupuesto</span><br /><strong>${campaign.budget} {campaign.currency}</strong></div>
          <div><span className="text-gray-400">Ciudad</span><br /><strong>{campaign.city || '—'}</strong></div>
          <div><span className="text-gray-400">Nicho</span><br /><strong>{campaign.niche_required || 'Cualquiera'}</strong></div>
          <div><span className="text-gray-400">Fecha límite</span><br /><strong>{campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : '—'}</strong></div>
        </div>
        {campaign.deliverables.length > 0 && (
          <div className="mt-4">
            <span className="text-sm text-gray-400">Entregables</span>
            <div className="flex gap-2 mt-1 flex-wrap">
              {campaign.deliverables.map((d, i) => (
                <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{d.quantity}× {d.type}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Applications */}
      <div id="applications">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={20} /> Aplicaciones ({applications.length})
        </h2>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-100 rounded-lg px-4 py-2 text-sm mb-4">
            {error}
          </div>
        )}

        {needsPaymentToReview ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-900 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold">{applications.length} influencers aplicaron</p>
              <p className="text-amber-800">Puedes ver previsualizaciones anonimas. Paga para desbloquear identidad y gestionar candidatos.</p>
            </div>
            <button
              onClick={handleFundEscrow}
              disabled={paying || campaign.status === 'draft'}
              className="inline-flex items-center justify-center gap-1.5 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-700 transition disabled:opacity-50"
            >
              {paying ? <Loader className="animate-spin" size={14} /> : <CreditCard size={14} />}
              {paying ? 'Procesando pago...' : 'Pagar y desbloquear'}
            </button>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 mb-4">
            Ya puedes evaluar y gestionar candidatos. El contacto directo se desbloquea por aplicación.
          </div>
        )}

        {applications.length === 0 ? (
          <p className="text-gray-400 text-sm">Aún no hay aplicaciones.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((a) => (
              <div key={a.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {needsPaymentToReview
                        ? 'Perfil reservado'
                        : (a.candidate?.display_name || `Influencer ${a.influencer_user_id.slice(0, 8)}...`)}
                    </p>
                    <div className="text-sm text-gray-500 mt-1 flex flex-wrap gap-3">
                      {a.candidate?.city && (
                        <span className="inline-flex items-center gap-1"><MapPin size={12} />{a.candidate.city}</span>
                      )}
                      {a.candidate?.niche && <span className="capitalize">{a.candidate.niche}</span>}
                      {a.candidate && (
                        <span>
                          {(a.candidate.followers_instagram + a.candidate.followers_tiktok + a.candidate.followers_youtube).toLocaleString()} seguidores
                        </span>
                      )}
                      {a.candidate && <span>ER {a.candidate.engagement_rate}%</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {needsPaymentToReview
                        ? 'Mensaje bloqueado hasta completar pago.'
                        : (a.message ? a.message.slice(0, 160) : 'Sin mensaje')}
                    </p>

                    <div className="mt-3 text-sm">
                      {!needsPaymentToReview && a.contact_unlocked ? (
                        <div className="text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
                          Contacto desbloqueado:
                          <div className="mt-1 flex flex-wrap gap-3">
                            {a.candidate?.instagram_handle && <span>@{a.candidate.instagram_handle}</span>}
                            {a.candidate?.tiktok_handle && <span>@{a.candidate.tiktok_handle}</span>}
                            {a.candidate?.youtube_handle && <span>@{a.candidate.youtube_handle}</span>}
                          </div>
                        </div>
                      ) : (
                        <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 inline-flex items-center gap-2">
                          <Lock size={14} />
                          {needsPaymentToReview ? 'Identidad bloqueada hasta pago' : 'Contacto bloqueado'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 min-w-[180px]">
                    {!needsPaymentToReview && !a.contact_unlocked && (
                      <button
                        onClick={() => handleUnlockContact(a.id)}
                        disabled={actionLoading === a.id}
                        className="inline-flex items-center gap-1 text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                      >
                        {actionLoading === a.id ? <Loader className="animate-spin" size={14} /> : <Unlock size={14} />}
                        Desbloquear contacto
                      </button>
                    )}

                    {!needsPaymentToReview && a.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAction(a.id, 'accept')}
                          disabled={actionLoading === a.id}
                          className="flex items-center gap-1 text-green-600 hover:bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                          {actionLoading === a.id ? <Loader className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleAction(a.id, 'reject')}
                          disabled={actionLoading === a.id}
                          className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                        >
                          <XCircle size={14} /> Rechazar
                        </button>
                      </>
                    ) : (
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${APPLICATION_STATUS_COLORS[a.status] || 'bg-gray-100'}`}>
                        {a.status}
                      </span>
                    )}

                    {needsPaymentToReview && (
                      <span className="text-xs text-gray-500">Paga para gestionar candidatos</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
