import React from 'react';
import Link from 'next/link';

export default function MentoriasLanding() {
  return (
    <main className="bg-white min-h-screen">
      {/* HERO SECTION */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-fuchsia-700 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Deja de adivinar tu carrera. Consigue un mentor que ya recorrió el camino.</h1>
          <p className="text-lg md:text-2xl mb-8">Acompañamiento personalizado y seguimiento de progreso real para profesionales IT. No estás solo en el sprint hacia tu próximo gran empleo.</p>
          <img src="/assets/mentoria-hero.jpg" alt="Mentoría 1-a-1" className="rounded-xl shadow-xl mx-auto mb-6 max-h-64 object-cover" />
          <Link href="#planes" className="inline-block bg-yellow-400 text-blue-900 font-bold py-4 px-8 rounded-lg shadow-lg text-xl hover:bg-yellow-300 transition">Quiero ser mentoreado</Link>
        </div>
      </section>

      {/* VENTAJAS Y VALOR */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto grid gap-8 md:grid-cols-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-2 text-blue-700">Acompañamiento en Progreso</h3>
            <p>No es una charla única. Evaluamos dónde estás y trazamos una ruta.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-2 text-blue-700">Seguimiento Real</h3>
            <p>Revisamos tus avances semana a semana. Si te trabas, lo resolvemos juntos.</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold text-lg mb-2 text-blue-700">Enfoque en Resultados</h3>
            <p>Optimizamos tu perfil, tu discurso técnico y tu estrategia de negociación.</p>
          </div>
        </div>
      </section>

      {/* PLANES */}
      <section id="planes" className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-fuchsia-700">Elige tu plan</h2>
          <p className="text-lg text-gray-700">Mentoría personalizada para cada etapa de tu carrera IT.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          <div className="flex-1 bg-gray-50 rounded-xl shadow-lg p-8 border-2 border-blue-200">
            <h3 className="text-2xl font-bold text-blue-700 mb-2">Plan "Aceleración"</h3>
            <p className="mb-4 text-gray-700">1 Mes · 4 sesiones (1 por semana) de 10 min de alto impacto.</p>
            <div className="text-3xl font-bold text-blue-900 mb-2">$25 USD</div>
            <p className="mb-4 text-gray-600">Ideal para destrabar un proceso de selección actual.</p>
            <Link href="/mentorias/checkout?plan=aceleracion" className="block bg-blue-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 transition mb-2">Quiero este plan</Link>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl shadow-lg p-8 border-2 border-fuchsia-200">
            <h3 className="text-2xl font-bold text-fuchsia-700 mb-2">Plan "Transformación"</h3>
            <p className="mb-4 text-gray-700">2 Meses · 8 sesiones (1 por semana) de 10 min.</p>
            <div className="text-3xl font-bold text-fuchsia-900 mb-2">$40 USD</div>
            <p className="mb-4 text-gray-600">Acompañamiento integral para un cambio de carrera o ascenso.</p>
            <Link href="/mentorias/checkout?plan=transformacion" className="block bg-fuchsia-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-fuchsia-700 transition mb-2">Quiero este plan</Link>
          </div>
        </div>
        <div className="mt-8 text-gray-600 text-center">
          ¿Quieres seguir? <span className="font-bold text-blue-700">Renueva tu plan fácilmente desde tu Dashboard.</span>
        </div>
      </section>

      {/* ACCIÓN Y FLUJO */}
      <section className="py-12 px-4 bg-gradient-to-br from-blue-50 to-fuchsia-50 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4 text-blue-700">¿Cómo funciona?</h3>
          <ol className="text-left text-lg text-gray-700 mx-auto max-w-xl list-decimal list-inside space-y-2">
            <li>Elige tu plan y paga con Stripe.</li>
            <li>Recibe tus credenciales y accede a tu Dashboard.</li>
            <li>Reserva tus sesiones en el calendario dinámico.</li>
            <li>Gestiona tus mentorías y renueva cuando quieras.</li>
          </ol>
          <div className="mt-8">
            <Link href="/mentorias/checkout" className="inline-block bg-yellow-400 text-blue-900 font-bold py-4 px-8 rounded-lg shadow-lg text-xl hover:bg-yellow-300 transition">Quiero ser mentoreado</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
