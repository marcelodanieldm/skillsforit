// Script para probar el envío de email de bienvenida con SendGrid
require('dotenv').config({ path: './.env.local' });
console.log('SENDGRID_API_KEY:', process.env.SENDGRID_API_KEY);
const { sendMentoriaWelcomeEmail } = require('../app/lib/send-email');

(async () => {
  try {
    const to = process.env.TEST_EMAIL || 'tu-email@dominio.com';
    const password = 'testPassword123';
    const dashboardUrl = 'https://skillsforit.vercel.app/dashboard';
    const result = await sendMentoriaWelcomeEmail({ to, password, dashboardUrl });
    console.log('Email enviado:', result);
  } catch (err) {
    console.error('Error enviando email:', err);
  }
})();
