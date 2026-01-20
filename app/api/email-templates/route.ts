import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const defaultTemplates = {
  mentoriaWelcome: {
    subject: '¡Bienvenido a SkillsForIT Mentoría! 🎉',
    html: `<h2>¡Gracias por tu compra!</h2><p>Tu acceso al dashboard de mentoría ya está listo.</p>`
  },
  productDelivery: {
    subject: '¡Tu acceso a [PRODUCTO] está listo!',
    html: `<h2>¡Gracias por tu compra!</h2><p>Puedes descargar tu producto aquí: <a href='[LINK]'>[LINK]</a></p>`
  },
  cvAnalysisConfirmation: {
    subject: '¡Pago recibido! Tu análisis de CV está en proceso',
    html: `<h2>¡Gracias por confiar en SkillsForIT!</h2><p>Tu pago fue recibido correctamente. Estamos procesando tu análisis de CV.</p>`
  },
  cvAnalysisResult: {
    subject: '¡Tu análisis de CV está listo!',
    html: `<h2>¡Análisis completado!</h2><p>Puedes ver tu resultado aquí: <a href='[LINK]'>[LINK]</a></p>`
  },
  mentorshipSessionConfirmation: {
    subject: '¡Sesión de mentoría confirmada!',
    html: `<h2>¡Tu sesión está agendada!</h2><p>Mentor: <b>[MENTOR]</b><br/>Fecha y hora: <b>[FECHA]</b></p>`
  },
  cartRecovery: {
    subject: '¿Aún quieres [PRODUCTO]?',
    html: `<h2>¡No pierdas tu oportunidad!</h2><p>Puedes retomar tu compra aquí: <a href='[LINK]'>[LINK]</a></p>`
  }
};

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('email_templates').select('*');
  if (error) {
    return NextResponse.json(defaultTemplates, { status: 200 });
  }
  const result = { ...defaultTemplates };
  data?.forEach(row => {
    result[row.id] = { subject: row.subject, html: row.html };
  });
  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabase();
  const body = await request.json();
  const updates = Object.entries(body).map(([id, val]) => ({
    id,
    subject: val.subject,
    html: val.html
  }));
  // UPSERT (insert or update)
  const { error } = await supabase.from('email_templates').upsert(updates, { onConflict: 'id' });
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
