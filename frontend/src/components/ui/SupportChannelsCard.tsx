import { Bot, Mail } from 'lucide-react';
import { PILOT_SUPPORT_CHANNEL } from '../../lib/supportChannels';

type SupportChannelsCardProps = {
  title?: string;
  description?: string;
  className?: string;
};

export default function SupportChannelsCard({
  title = 'Tienes dudas? Te ayudamos en minutos.',
  description = 'Si te atoras en este paso, escribenos por correo y te guiamos en el piloto.',
  className = '',
}: SupportChannelsCardProps) {
  return (
    <div className={`rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 ${className}`.trim()}>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-emerald-800">{description}</p>

      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <a
          href={PILOT_SUPPORT_CHANNEL.emailUrl}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700 transition"
        >
          <Mail size={14} />
          Correo: {PILOT_SUPPORT_CHANNEL.emailLabel}
        </a>
      </div>

      <div className="mt-3 space-y-1 text-xs text-emerald-800">
        <p><span className="font-semibold">Tiempo objetivo:</span> {PILOT_SUPPORT_CHANNEL.responseTimeGoal}</p>
        <p><span className="font-semibold">Responsable piloto:</span> {PILOT_SUPPORT_CHANNEL.supportOwner}</p>
        <p className="inline-flex items-center gap-1"><Bot size={12} />{PILOT_SUPPORT_CHANNEL.upcomingAutomationNote}</p>
      </div>
    </div>
  );
}
