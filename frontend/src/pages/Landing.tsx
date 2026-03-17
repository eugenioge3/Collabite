import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  ArrowRight,
  Shield,
  Zap,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Sparkles,
  MapPinned,
} from 'lucide-react';

export default function Landing() {
  const { user } = useAuth();
  const publishCtaHref = user?.role === 'business'
    ? '/dashboard/business/campaigns/new'
    : '/register?role=business';

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles size={14} /> Enfoque local: Cancun y Riviera Maya
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            Publica una campaña en
            <br />
            <span className="text-secondary-light">10 minutos, no en semanas</span>
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            Collabite conecta restaurantes, bares y hoteles con influencers locales verificados.
            Publicas tu campaña, recibes postulaciones y pagas con escrow seguro al aprobar contenido.
          </p>

          <div className="max-w-3xl mx-auto mb-8 grid gap-2 sm:grid-cols-3 text-sm text-left">
            <div className="rounded-lg bg-white/10 border border-white/20 px-3 py-2">1) Publica objetivo, ciudad y presupuesto.</div>
            <div className="rounded-lg bg-white/10 border border-white/20 px-3 py-2">2) Recibe candidatas locales verificadas.</div>
            <div className="rounded-lg bg-white/10 border border-white/20 px-3 py-2">3) Desbloquea contacto y activa colaboracion.</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={publishCtaHref}
              className="bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2"
            >
              Publicar mi primera campana <ArrowRight size={18} />
            </Link>
            <Link
              to={user?.role === 'influencer' ? '/dashboard/influencer' : '/register?role=influencer'}
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              Quiero postularme como influencer <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">¿Cómo funciona?</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">
            En 3 simples pasos, conecta tu negocio con el influencer perfecto
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Publica tu campaña',
                desc: 'Define tu presupuesto, ciudad, tipo de contenido y nicho. Deposita el pago en escrow seguro.',
                icon: <Zap className="text-primary" size={32} />,
              },
              {
                step: '2',
                title: 'Recibe postulaciones',
                desc: 'Influencers verificados se postulan. Revisa sus estadísticas reales, engagement y portafolio.',
                icon: <Users className="text-primary" size={32} />,
              },
              {
                step: '3',
                title: 'Aprueba y paga',
                desc: 'El influencer crea el contenido. Tú apruebas y el pago se libera automáticamente.',
                icon: <DollarSign className="text-primary" size={32} />,
              },
            ].map((item) => (
              <div key={item.step} className="bg-surface rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local examples */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Ejemplos locales para empezar hoy</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Casos de uso pensados para Cancun y alrededores. Cada ejemplo se puede publicar como campana desde tu dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Restaurante en Cancun',
                city: 'Cancun',
                objective: 'Promocionar menu de temporada entre locales y turistas.',
                format: '2 reels + 3 stories',
              },
              {
                title: 'Beach club en Playa del Carmen',
                city: 'Playa del Carmen',
                objective: 'Aumentar reservaciones para fines de semana.',
                format: '1 reel + 1 TikTok + cobertura en vivo',
              },
              {
                title: 'Hotel boutique en Tulum',
                city: 'Tulum',
                objective: 'Impulsar escapadas de 2-3 noches en temporada media.',
                format: '1 reel + carrusel + reseña corta',
              },
            ].map((example) => (
              <article key={example.title} className="rounded-xl border border-gray-200 bg-surface p-6">
                <div className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full mb-3">
                  <MapPinned size={12} /> {example.city}
                </div>
                <h3 className="text-lg font-semibold mb-2">{example.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{example.objective}</p>
                <p className="text-sm text-gray-500">Formato sugerido: {example.format}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué Collabite?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Shield size={24} />, title: 'Pagos en Escrow', desc: 'Tu dinero está protegido hasta que apruebes el contenido.' },
              { icon: <CheckCircle size={24} />, title: 'Influencers Verificados', desc: 'Stats reales de Instagram y TikTok, verificados con OAuth.' },
              { icon: <TrendingUp size={24} />, title: 'Métricas Reales', desc: 'Engagement rate, seguidores, demografía de audiencia — sin números inflados.' },
              { icon: <Users size={24} />, title: 'Talento Local', desc: 'Encuentra influencers en tu ciudad que conocen tu mercado.' },
              { icon: <Zap size={24} />, title: 'Rápido y Simple', desc: 'Publica una campaña en minutos. Recibe postulaciones el mismo día.' },
              { icon: <DollarSign size={24} />, title: 'Precios Transparentes', desc: 'Calculadora de precio estimado para cada creador. Sin sorpresas.' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-lg p-6 border border-gray-100">
                <div className="text-primary mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Publica tu primera campana hoy</h2>
          <p className="text-indigo-100 mb-8">
            Crea tu cuenta de negocio y en minutos tendras tu campana activa para recibir postulaciones locales.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={publishCtaHref}
              className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Publicar primera campana
            </Link>
            <Link
              to="/campaigns"
              className="inline-block border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition"
            >
              Ver campanas activas
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="font-bold text-white text-lg">Collabite</span>
          <span className="text-sm">© {new Date().getFullYear()} Collabite. Todos los derechos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
