import React from 'react';
import Link from 'next/link';

export default function MentoriasCheckout() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-gray-50 rounded-xl shadow-lg p-8 border-2 border-blue-100">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Completa tu mentoría</h1>
        <p className="mb-6 text-gray-700">Selecciona tus upsells y paga con Stripe para comenzar tu proceso de mentoría personalizada.</p>
        {/* Simulación de upsells */}
        <div className="mb-6">
          <label className="flex items-center mb-2">
            <input type="checkbox" className="mr-2" />
            <span>Analizador de CV <span className="text-blue-700 font-bold">+ $5</span></span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span>Simulador de Entrevista <span className="text-fuchsia-700 font-bold">+ $2</span></span>
          </label>
        </div>
        <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 transition mb-2">Pagar con Stripe</button>
        <Link href="/mentorias" className="block text-center text-blue-700 mt-4 underline">Volver a planes</Link>
      </div>
    </main>
  );
}
