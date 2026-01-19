"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';


function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('canvas-confetti').then((confetti) => {
      confetti.default({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.7 },
      });
    });
    if (sessionId) {
      fetch(`/api/mentor/success?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setSession(data.session);
          }
        })
        .catch(() => setError('No se pudo obtener la información del pago.'))
        .finally(() => setLoading(false));
    } else {
      setError('No se proporcionó session_id.');
      setLoading(false);
    }
  }, [sessionId]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-fuchsia-50 p-4">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold text-fuchsia-700 mb-4">¡Felicitaciones!</h1>
        {loading ? (
          <p className="text-lg text-gray-700 mb-6">Cargando información de tu pago...</p>
        ) : error ? (
          <p className="text-lg text-red-600 mb-6">{error}</p>
        ) : (
          <>
            <p className="text-lg text-gray-700 mb-6">Tu pago fue exitoso y tu mentoría está confirmada.<br />Revisa tu email para acceder a tu Dashboard y reservar tus sesiones.</p>
            <div className="mb-4 text-left text-sm text-gray-500">
              <div><strong>ID de pago:</strong> {session?.id}</div>
              <div><strong>Email:</strong> {session?.customer_details?.email}</div>
              <div><strong>Monto:</strong> ${(session?.amount_total / 100).toFixed(2)} USD</div>
              <div><strong>Estado:</strong> {session?.payment_status}</div>
            </div>
          </>
        )}
        <img src="/assets/mentoria-success.svg" alt="Mentoría éxito" className="mx-auto mb-6 max-h-48" />
        <Link href="/user/dashboard" className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg font-bold text-lg hover:bg-blue-700 transition">Ir a mi Dashboard</Link>
      </div>
    </main>
  );
}

export default function MentoriasSuccess() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  );
}
