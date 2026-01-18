
import React, { useEffect, useState } from 'react';
interface NotificacionMentoria {
  tipo: 'cancelada' | 'completada';
  mensaje: string;
  fecha: string;
}
import MentoriaCalendar from './MentoriaCalendar';
  const [mentorAvailability, setMentorAvailability] = useState<any[]>([]);
  const [mentorName, setMentorName] = useState<string>('');
  const [mentorTimezone, setMentorTimezone] = useState<string>('');

interface Subscription {
  plan: 'aceleracion' | 'transformacion';
  sessionsTotal: number;
  sessionsUsed: number;
}

export default function UserMentorias() {
    const [notificaciones, setNotificaciones] = useState<NotificacionMentoria[]>([]);
  const [reservedDates, setReservedDates] = useState<Date[]>([]);
  const [sessionsUsed, setSessionsUsed] = useState<number>(0);
  const [sessionsTotal, setSessionsTotal] = useState<number>(4);
  const [loading, setLoading] = useState(true);
  const userId = typeof window !== 'undefined' ? localStorage.getItem('user_id') || 'demo_user' : 'demo_user';

  // Cargar reservas y datos de suscripción
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Obtener datos de suscripción
      const subRes = await fetch(`/api/mentorias/suscripcion?userId=${userId}`);
      const subData = await subRes.json();
      if (subData.sessionsTotal) {
        setSessionsTotal(subData.sessionsTotal);
        setSessionsUsed(subData.sessionsUsed);
      }
      // Obtener reservas
      const res = await fetch(`/api/mentorias/reservas?userId=${userId}`);
      const data = await res.json();
      setReservedDates((data.reserved || []).map((d: string) => new Date(d)));
      // Obtener disponibilidad del mentor asignado
      const dispRes = await fetch(`/api/mentorias/disponibilidad-mentor?userId=${userId}`);
      const dispData = await dispRes.json();
      setMentorAvailability(dispData.availability || []);
      setMentorName(dispData.mentorName || '');
      setMentorTimezone(dispData.timezone || '');
      setLoading(false);
    };
    fetchData();
    // Cargar notificaciones de localStorage
    const notifRaw = localStorage.getItem('mentorias_notificaciones');
    if (notifRaw) {
      try {
        setNotificaciones(JSON.parse(notifRaw));
      } catch {
        setNotificaciones([]);
      }
    }
  }, [userId]);

  // Escuchar eventos de notificación (simulación: polling cada 5s)
  useEffect(() => {
    const interval = setInterval(() => {
      const notifRaw = localStorage.getItem('mentorias_notificaciones');
      if (notifRaw) {
        try {
          setNotificaciones(JSON.parse(notifRaw));
        } catch {
          setNotificaciones([]);
        }
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReserve = async (date: Date) => {
    const res = await fetch('/api/mentorias/reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, date }),
    });
    const data = await res.json();
    if (data.success) {
      setReservedDates((data.reserved || []).map((d: string) => new Date(d)));
      setSessionsUsed((data.reserved || []).length);
    } else {
      alert(data.error || 'No se pudo reservar la sesión.');
    }
  };

  const handleCancel = async (date: Date) => {
    const res = await fetch('/api/mentorias/reservas', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, date }),
    });
    const data = await res.json();
    if (data.success) {
      setReservedDates((data.reserved || []).map((d: string) => new Date(d)));
      setSessionsUsed((data.reserved || []).length);
    } else {
      alert(data.error || 'No se pudo cancelar la sesión.');
    }
  };

  return (
    <section className="my-8">
      <h2 className="text-2xl font-bold mb-4 text-fuchsia-700">Mis Mentorías</h2>
      {/* Notificaciones de mentoría */}
      {notificaciones.length > 0 && (
        <div className="mb-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="font-semibold text-yellow-800 mb-2">Notificaciones recientes</div>
            <ul className="space-y-1">
              {notificaciones.slice(-3).reverse().map((n, i) => (
                <li key={i} className="text-yellow-900 text-sm flex items-center gap-2">
                  {n.tipo === 'cancelada' ? (
                    <span className="inline-block w-2 h-2 bg-red-400 rounded-full"></span>
                  ) : (
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                  )}
                  <span>{n.mensaje}</span>
                  <span className="ml-auto text-xs text-gray-400">{new Date(n.fecha).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {loading ? (
        <div className="text-gray-500">Cargando mentorías...</div>
      ) : (
        <>
          <div className="mb-4 text-blue-700 text-lg font-semibold">
            Mentor asignado: {mentorName} <span className="text-xs text-gray-500">({mentorTimezone})</span>
          </div>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-700">{sessionsTotal - sessionsUsed}</div>
              <div className="text-blue-900 font-semibold">Sesiones por reservar</div>
            </div>
            <div className="bg-fuchsia-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-fuchsia-700">{sessionsUsed}</div>
              <div className="text-fuchsia-900 font-semibold">Sesiones reservadas</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-lg font-bold text-gray-700 mb-1">Fechas reservadas</div>
              {reservedDates.length === 0 ? (
                <div className="text-gray-400">Aún no reservaste</div>
              ) : (
                <ul className="text-gray-700 text-sm space-y-1">
                  {reservedDates.map(date => (
                    <li key={date.toISOString()}>{date.toLocaleDateString()}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <MentoriaCalendar
            sessionsTotal={sessionsTotal}
            sessionsUsed={sessionsUsed}
            reservedDates={reservedDates}
            onReserve={handleReserve}
            onCancel={handleCancel}
            mentorAvailability={mentorAvailability}
            mentorTimezone={mentorTimezone}
          />
        </>
      )}
      <div className="mt-6 flex justify-end">
        <button className="bg-fuchsia-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-fuchsia-700 transition">Renovar Plan</button>
      </div>
    </section>
  );
}
