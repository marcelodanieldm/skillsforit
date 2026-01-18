import React, { useEffect } from 'react';
import Link from 'next/link';

export default function MentoriasSuccess() {
  useEffect(() => {
    // Confetti effect (simple)
    import('canvas-confetti').then((confetti) => {
      confetti.default({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.7 },
      });
    });
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-fuchsia-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold text-fuchsia-700 mb-4">¡Felicitaciones!</h1>
        <p className="text-lg text-gray-700 mb-6">Tu pago fue exitoso y tu mentoría está confirmada.<br />Revisa tu email para acceder a tu Dashboard y reservar tus sesiones.</p>
        <img src="/assets/mentoria-success.svg" alt="Mentoría éxito" className="mx-auto mb-6 max-h-48" />
        <Link href="/user/dashboard" className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg font-bold text-lg hover:bg-blue-700 transition">Ir a mi Dashboard</Link>
      </div>
    </main>
  );
}
