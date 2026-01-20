const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

async function getEmailTemplate(id) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email-templates`);
    const templates = await res.json();
    return templates[id];
  } catch {
    return null;
  }
}

function fillTemplate(html, vars) {
  let out = html;
  for (const [key, val] of Object.entries(vars)) {
    out = out.replace(new RegExp(`\\[${key}\\]`, 'gi'), val);
  }
  return out;
}

async function sendMentoriaWelcomeEmail({ to, password, dashboardUrl }) {
  const template = await getEmailTemplate('mentoriaWelcome');
  const subject = template?.subject || '¡Bienvenido a SkillsForIT Mentoría! 🎉';
  let html = template?.html || `<h2>¡Gracias por tu compra!</h2><p>Tu acceso al dashboard de mentoría ya está listo.</p>`;
  html = fillTemplate(html, { USUARIO: to, CONTRASENA: password, DASHBOARD_URL: dashboardUrl });
  return sendMail({ to, subject, html });
}

async function sendProductDeliveryEmail({ to, productName, downloadUrl }) {
  const template = await getEmailTemplate('productDelivery');
  const subject = template?.subject.replace('[PRODUCTO]', productName) || `¡Tu acceso a ${productName} está listo!`;
  let html = template?.html || `<h2>¡Gracias por tu compra!</h2><p>Puedes descargar tu producto aquí: <a href='${downloadUrl}'>${downloadUrl}</a></p>`;
  html = fillTemplate(html, { PRODUCTO: productName, LINK: downloadUrl });
  return sendMail({ to, subject, html });
}

async function sendCVAnalysisConfirmation({ to, analysisId }) {
  const template = await getEmailTemplate('cvAnalysisConfirmation');
  const subject = template?.subject || '¡Pago recibido! Tu análisis de CV está en proceso';
  let html = template?.html || `<h2>¡Gracias por confiar en SkillsForIT!</h2><p>Tu pago fue recibido correctamente. Estamos procesando tu análisis de CV (ID: ${analysisId}).</p>`;
  html = fillTemplate(html, { ANALYSIS_ID: analysisId });
  return sendMail({ to, subject, html });
}

async function sendCVAnalysisResult({ to, analysisId, resultUrl }) {
  const template = await getEmailTemplate('cvAnalysisResult');
  const subject = template?.subject || '¡Tu análisis de CV está listo!';
  let html = template?.html || `<h2>¡Análisis completado!</h2><p>Puedes ver tu resultado aquí: <a href='${resultUrl}'>${resultUrl}</a></p>`;
  html = fillTemplate(html, { ANALYSIS_ID: analysisId, LINK: resultUrl });
  return sendMail({ to, subject, html });
}

async function sendMentorshipSessionConfirmation({ to, mentorName, sessionDate, sessionUrl }) {
  const template = await getEmailTemplate('mentorshipSessionConfirmation');
  const subject = template?.subject || '¡Sesión de mentoría confirmada!';
  let html = template?.html || `<h2>¡Tu sesión está agendada!</h2><p>Mentor: <b>${mentorName}</b><br/>Fecha y hora: <b>${sessionDate}</b></p>`;
  html = fillTemplate(html, { MENTOR: mentorName, FECHA: sessionDate, LINK: sessionUrl });
  return sendMail({ to, subject, html });
}

async function sendCartRecoveryEmail({ to, recoveryUrl, productName }) {
  const template = await getEmailTemplate('cartRecovery');
  const subject = template?.subject.replace('[PRODUCTO]', productName) || `¿Aún quieres ${productName}?`;
  let html = template?.html || `<h2>¡No pierdas tu oportunidad!</h2><p>Puedes retomar tu compra aquí: <a href='${recoveryUrl}'>${recoveryUrl}</a></p>`;
  html = fillTemplate(html, { PRODUCTO: productName, LINK: recoveryUrl });
  return sendMail({ to, subject, html });
}

async function sendMail({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'SkillsForIT <no-reply@skillsforit.com>',
      to,
      subject,
      html,
    });
    console.log(`[EMAIL ENVIADO] Para: ${to} | Asunto: ${subject} | ID: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[EMAIL ERROR] Para: ${to} | Asunto: ${subject} | Error:`, err);
    throw err;
  }
}

async function sendSessionReminderEmail({ to, mentorName, sessionDate, sessionUrl, userName }) {
  const template = await getEmailTemplate('sessionReminder');
  const subject = template?.subject
    .replace('[MENTOR]', mentorName)
    .replace('[FECHA]', sessionDate)
    .replace('[NOMBRE]', userName) || `Recordatorio: sesión mentoría con ${mentorName} el ${sessionDate}`;
  let html = template?.html || `<h2>¡No olvides tu sesión!</h2><p>Mentor: <b>${mentorName}</b><br/>Fecha y hora: <b>${sessionDate}</b><br/>Usuario: <b>${userName}</b><br/>Enlace: <a href='${sessionUrl}'>${sessionUrl}</a></p>`;
  html = fillTemplate(html, { MENTOR: mentorName, FECHA: sessionDate, LINK: sessionUrl, NOMBRE: userName });
  return sendMail({ to, subject, html });
}

async function sendUpsellOfferEmail({ to, userName, productName, discount, offerUrl }) {
  const template = await getEmailTemplate('upsellOffer');
  const subject = template?.subject
    .replace('[NOMBRE]', userName) || `¡Oferta especial para ti, ${userName}!`;
  let html = template?.html || `<h2>¡Aprovecha esta oportunidad!</h2><p>Producto recomendado: <b>${productName}</b><br/>Descuento: <b>${discount}</b><br/>Enlace: <a href='${offerUrl}'>${offerUrl}</a></p>`;
  html = fillTemplate(html, { NOMBRE: userName, PRODUCTO: productName, DESCUENTO: discount, LINK: offerUrl });
  return sendMail({ to, subject, html });
}

async function sendFeedbackRequestEmail({ to, userName, productName, mentorName, feedbackUrl }) {
  const template = await getEmailTemplate('feedbackRequest');
  const subject = template?.subject
    .replace('[NOMBRE]', userName) || `¿Cómo fue tu experiencia, ${userName}?`;
  let html = template?.html || `<h2>¡Queremos tu opinión!</h2><p>Por favor, cuéntanos cómo fue tu experiencia con ${productName || mentorName}.<br/>Enlace para feedback: <a href='${feedbackUrl}'>${feedbackUrl}</a></p>`;
  html = fillTemplate(html, { NOMBRE: userName, PRODUCTO: productName, MENTOR: mentorName, LINK: feedbackUrl });
  return sendMail({ to, subject, html });
}

module.exports = {
  sendMentoriaWelcomeEmail,
  sendProductDeliveryEmail,
  sendCVAnalysisConfirmation,
  sendCVAnalysisResult,
  sendMentorshipSessionConfirmation,
  sendCartRecoveryEmail,
  sendSessionReminderEmail,
  sendUpsellOfferEmail,
  sendFeedbackRequestEmail
};
