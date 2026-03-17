import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FAQ_ITEMS } from '../lib/faqContent';
import { ChevronDown, ChevronUp, Shield, CreditCard, Unlock } from 'lucide-react';

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface">
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">FAQ de pago y seguridad</h1>
          <p className="text-indigo-100 text-lg max-w-3xl mx-auto">
            Respuestas cortas para publicar con confianza: proceso de pago, desbloqueo de candidatas y proteccion de datos.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5">
              <CreditCard size={14} /> Pago transparente
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5">
              <Unlock size={14} /> Desbloqueo por aplicacion
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/25 px-3 py-1.5">
              <Shield size={14} /> Seguridad y control de datos
            </span>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-10">
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article key={item.question} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-3"
                >
                  <span className="font-semibold text-gray-900">{item.question}</span>
                  {isOpen ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl bg-white border border-gray-200 p-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-gray-900">¿Listo para publicar tu primera campana?</p>
            <p className="text-sm text-gray-500">Si eres negocio, puedes ir directo al flujo de publicacion.</p>
          </div>
          <Link
            to="/register?role=business"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary-dark transition"
          >
            Crear cuenta de negocio
          </Link>
        </div>
      </section>
    </div>
  );
}
