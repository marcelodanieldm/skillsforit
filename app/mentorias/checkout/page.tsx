"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function MentoriasCheckout() {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const plan = searchParams?.get('plan') || 'aceleracion';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStripeCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/mentor/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setError('No se pudo iniciar el pago.');
      }
    } catch (err) {
      setError('Error al conectar con Stripe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-gray-50 rounded-xl shadow-lg p-8 border-2 border-blue-100">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Completa tu mentoría</h1>
        <p className="mb-6 text-gray-700">Selecciona tus upsells y paga con Stripe para comenzar tu proceso de mentoría personalizada.</p>
        {/* Simulación de upsells */}
        <div className="mb-6">
          <label className="flex items-center mb-2">
            <input type="checkbox" className="mr-2" disabled />
            <span>Analizador de CV <span className="text-blue-700 font-bold">+ $5</span></span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" disabled />
            <span>Simulador de Entrevista <span className="text-fuchsia-700 font-bold">+ $2</span></span>
          </label>
        </div>
        <button
          className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 transition mb-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleStripeCheckout}
          disabled={loading}
        >
          {loading ? 'Procesando...' : 'Pagar con Stripe'}
        </button>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <Link href="/mentorias" className="block text-center text-blue-700 mt-4 underline">Volver a planes</Link>
      </div>
    </main>
  );
}
