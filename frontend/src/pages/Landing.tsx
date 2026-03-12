import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, DollarSign, Users, TrendingUp, CheckCircle } from 'lucide-react';

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-32 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">
            Conecta tu negocio con
            <br />
            <span className="text-secondary-light">influencers locales</span>
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            La plataforma segura que conecta restaurantes y negocios de hospitality
            con creadores de contenido verificados en tu ciudad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2"
            >
              Soy un Negocio <ArrowRight size={18} />
            </Link>
            <Link
              to="/register"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition flex items-center justify-center gap-2"
            >
              Soy Influencer <ArrowRight size={18} />
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
          <h2 className="text-3xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-indigo-100 mb-8">
            Crea tu cuenta gratis y empieza a conectar con los mejores creadores de tu ciudad.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            Crear cuenta gratis
          </Link>
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
