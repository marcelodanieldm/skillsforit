import { sendMentoriaWelcomeEmail, sendProductDeliveryEmail, sendCVAnalysisConfirmation, sendCVAnalysisResult, sendMentorshipSessionConfirmation, sendCartRecoveryEmail, sendSessionReminderEmail, sendUpsellOfferEmail, sendFeedbackRequestEmail } from '@/lib/send-email';
export async function POST(request: NextRequest, context) {
  if (context?.params?.test) {
    // Endpoint de prueba: /api/email-templates/test
    const { id, data } = await request.json();
    try {
      if (id === 'mentoriaWelcome') await sendMentoriaWelcomeEmail(data);
      else if (id === 'productDelivery') await sendProductDeliveryEmail(data);
      else if (id === 'cvAnalysisConfirmation') await sendCVAnalysisConfirmation(data);
      else if (id === 'cvAnalysisResult') await sendCVAnalysisResult(data);
      else if (id === 'mentorshipSessionConfirmation') await sendMentorshipSessionConfirmation(data);
      else if (id === 'cartRecovery') await sendCartRecoveryEmail(data);
      else if (id === 'sessionReminder') await sendSessionReminderEmail(data);
      else if (id === 'upsellOffer') await sendUpsellOfferEmail(data);
      else if (id === 'feedbackRequest') await sendFeedbackRequestEmail(data);
      return NextResponse.json({ success: true });
    } catch (err) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }
  // ...existing POST logic...
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const defaultTemplates = {
  mentoriaWelcome: {
    subject: '¡Bienvenido a SkillsForIT Mentoría! 🎉',
    html: `<h2>¡Gracias por tu compra!</h2><p>Tu acceso al dashboard de mentoría ya está listo.</p>`
  },
  productDelivery: {
    subject: '¡Tu acceso a [PRODUCTO] está listo!',
    html: `<h2>¡Gracias por tu compra, [NOMBRE]!</h2><p>Puedes descargar tu producto aquí: <a href='[LINK]'>[LINK]</a></p>`
  },
  cvAnalysisConfirmation: {
    subject: '¡Pago recibido! Tu análisis de CV está en proceso',
    html: `<h2>¡Gracias por confiar en SkillsForIT, [NOMBRE]!</h2><p>Tu pago fue recibido correctamente. Estamos procesando tu análisis de CV.</p>`
  },
  cvAnalysisResult: {
    subject: '¡Tu análisis de CV está listo!',
    html: `<h2>¡Análisis completado!</h2><p>Puedes ver tu resultado aquí: <a href='[LINK]'>[LINK]</a></p>`
  },
  mentorshipSessionConfirmation: {
    subject: '¡Sesión de mentoría confirmada!',
    html: `<h2>¡Tu sesión está agendada!</h2><p>Mentor: <b>[MENTOR]</b><br/>Fecha y hora: <b>[FECHA]</b><br/>Usuario: <b>[NOMBRE]</b></p>`
  },
  cartRecovery: {
    subject: '¿Aún quieres [PRODUCTO], [NOMBRE]?',
    html: `<h2>¡No pierdas tu oportunidad!</h2><p>Puedes retomar tu compra aquí: <a href='[LINK]'>[LINK]</a></p>`
  },
  sessionReminder: {
    subject: 'Recordatorio: sesión mentoría con [MENTOR] el [FECHA]',
    html: `<h2>¡No olvides tu sesión!</h2><p>Mentor: <b>[MENTOR]</b><br/>Fecha y hora: <b>[FECHA]</b><br/>Usuario: <b>[NOMBRE]</b><br/>Enlace: <a href='[LINK]'>[LINK]</a></p>`
  },
  upsellOffer: {
    subject: '¡Oferta especial para ti, [NOMBRE]!',
    html: `<h2>¡Aprovecha esta oportunidad!</h2><p>Producto recomendado: <b>[PRODUCTO]</b><br/>Descuento: <b>[DESCUENTO]</b><br/>Enlace: <a href='[LINK]'>[LINK]</a></p>`
  },
  feedbackRequest: {
    subject: '¿Cómo fue tu experiencia, [NOMBRE]?',
    html: `<h2>¡Queremos tu opinión!</h2><p>Por favor, cuéntanos cómo fue tu experiencia con [PRODUCTO] o [MENTOR].<br/>Enlace para feedback: <a href='[LINK]'>[LINK]</a></p>`
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
