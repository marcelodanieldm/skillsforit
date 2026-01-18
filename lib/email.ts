'use server'

import * as sgMail from '@sendgrid/mail'

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  attachments?: Array<{
    filename: string
    path: string
  }>
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    // Use SendGrid if API key is available, fallback to nodemailer
    if (process.env.SENDGRID_API_KEY) {
      const msg = {
        to: options.to,
        from: {
          email: process.env.EMAIL_FROM || 'noreply@skillsforit.com',
          name: 'SkillsForIT'
        },
        subject: options.subject,
        html: options.html,
      }

      const result = await sgMail.send(msg)
      console.log('Email sent via SendGrid:', result[0]?.headers?.['x-message-id'])
      return { success: true, messageId: result[0]?.headers?.['x-message-id'] }
    } else {
      // Fallback to nodemailer (existing implementation)
      const nodemailer = await import('nodemailer')
      const transporter = nodemailer.default.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      const info = await transporter.sendMail({
        from: `"SkillsForIT" <${process.env.EMAIL_USER}>`,
        ...options,
      })

      console.log('Email sent via nodemailer:', info.messageId)
      return { success: true, messageId: info.messageId }
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Puedes pasar password temporal como argumento opcional
export const sendAnalysisReport = async (
  email: string,
  name: string,
  reportPath: string,
  tempPassword?: string
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #a21caf 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .highlight { background: #e0f2fe; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .premium { background: #fffbe6; padding: 15px; border-left: 4px solid #fbbf24; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 ¡Tu Informe de Soft Skills está listo!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          <p>¡Felicitaciones por completar tu simulador de entrevistas! Adjuntamos tu informe personalizado con el análisis de tus respuestas, fortalezas y áreas de mejora para destacar en procesos IT.</p>
          <div class="highlight">
            <strong>¿Qué encontrarás en tu informe?</strong>
            <ul>
              <li>Gráfica radar de tus competencias blandas</li>
              <li>Red Flags y recomendaciones personalizadas</li>
              <li>Ejemplos de respuestas ideales (si adquiriste premium)</li>
              <li>Consejos para entrevistas en Google, Amazon y más</li>
            </ul>
          </div>

          <div style="background:#f1f5f9;padding:18px 20px;border-radius:8px;margin:24px 0 18px 0;">
            <strong>🔑 Tus credenciales de acceso a SkillsForIT:</strong><br>
            <span style="display:block;margin-top:8px;">Usuario: <b>${email}</b></span>
            <span style="display:block;">Contraseña temporal: <b>${tempPassword ? tempPassword : 'La que elegiste al registrarte'}</b></span>
            <span style="display:block;margin-top:8px;font-size:13px;color:#64748b;">Puedes cambiar tu contraseña desde el dashboard en cualquier momento.</span>
          </div>
          <p><strong>📎 El archivo PDF está adjunto a este email.</strong></p>
          <div class="premium">
            <strong>¿Quieres mejorar aún más?</strong><br>
            Desbloquea <b>Respuestas Perfectas</b> y accede a ejemplos premium de cómo responder cada pregunta como un candidato top. <a href="${process.env.NEXT_PUBLIC_APP_URL}/soft-skills-simulator" style="color:#a21caf;text-decoration:underline;">Haz clic aquí para ver la oferta</a>.
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/user/dashboard" class="button">Ir a mi Dashboard</a>
          <p>¿Dudas o feedback? Responde este email y te ayudamos a potenciar tu perfil.</p>
          <p>¡Éxitos en tu próxima entrevista!</p>
          <p>Abrazo,<br><strong>El equipo de SkillsForIT</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 SkillsForIT - Tu aliado en el mercado IT</p>
          <p>Este email contiene tu informe de soft skills. Guárdalo para futuras referencias.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: '🚀 Tu Informe de Soft Skills está listo',
    html,
    attachments: [
      {
        filename: 'SoftSkills-Report.pdf',
        path: reportPath,
      },
    ],
  })
}
