import React, { useState } from 'react';

interface CalendarProps {
  sessionsTotal: number;
  sessionsUsed: number;
  reservedDates: Date[];
  onReserve: (date: Date) => void;
  onCancel: (date: Date) => void;
  mentorAvailability?: Array<{ dayOfWeek: number; startTime: string; endTime: string; timezone: string }>;
  mentorTimezone?: string;
}

export default function MentoriaCalendar({
  sessionsTotal,
  sessionsUsed,
  reservedDates,
  onReserve,
  onCancel,
  mentorAvailability = [],
  mentorTimezone = '',
}: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const remaining = sessionsTotal - sessionsUsed;

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-blue-700">Reserva tus sesiones</h2>
      <p className="mb-4 text-gray-600">Sesiones disponibles: <b>{remaining}</b> de {sessionsTotal}</p>
      {mentorAvailability.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-blue-700 mb-1">Disponibilidad del mentor:</h4>
          <ul className="text-sm text-gray-700">
            {mentorAvailability.map((slot, idx) => (
              <li key={idx}>
                {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][slot.dayOfWeek]}: {slot.startTime} - {slot.endTime} ({slot.timezone})
              </li>
            ))}
          </ul>
        </div>
      )}
      <input
        type="date"
        className="border rounded px-3 py-2 mb-2"
        value={selectedDate}
        min={new Date().toISOString().split('T')[0]}
        onChange={e => setSelectedDate(e.target.value)}
        disabled={remaining === 0}
      />
      <button
        className="ml-2 bg-blue-600 text-white px-4 py-2 rounded font-bold disabled:opacity-50"
        onClick={() => {
          if (selectedDate) onReserve(new Date(selectedDate));
        }}
        disabled={!selectedDate || remaining === 0}
      >
        Reservar
      </button>
      <div className="mt-6">
        <h3 className="font-bold mb-2 text-fuchsia-700">Tus fechas reservadas</h3>
        <ul className="space-y-2">
          {reservedDates.length === 0 && <li className="text-gray-500">Aún no reservaste sesiones.</li>}
          {reservedDates.map(date => (
            <li key={date.toISOString()} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
              <span>{date.toLocaleDateString()}</span>
              <button
                className="text-red-600 font-bold hover:underline"
                onClick={() => onCancel(date)}
              >Cancelar</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
