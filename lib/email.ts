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

export const sendAnalysisReport = async (
  email: string,
  name: string,
  reportPath: string
) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Tu Análisis de CV está listo!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${name}</strong>,</p>
          
          <p>Tu CV ha sido analizado exitosamente por nuestra IA especializada en perfiles IT. El reporte completo está adjunto a este email.</p>
          
          <div class="highlight">
            <strong>📊 Tu reporte incluye:</strong>
            <ul>
              <li>Score ATS y análisis de compatibilidad</li>
              <li>Identificación de 15+ mejoras específicas</li>
              <li>Comparación antes/después de cada sección</li>
              <li>Recomendaciones personalizadas</li>
              <li>Keywords optimizadas para tu profesión</li>
            </ul>
          </div>

          <p><strong>📎 El archivo PDF está adjunto a este email.</strong></p>
          
          <p>También puedes acceder a tu dashboard en cualquier momento:</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
            Ver Dashboard
          </a>

          <p>Si tienes alguna pregunta o necesitas ayuda para implementar las mejoras, no dudes en responder a este email.</p>
          
          <p>¡Mucho éxito en tu búsqueda laboral!</p>
          
          <p>Saludos,<br><strong>El equipo de SkillsForIT</strong></p>
        </div>
        <div class="footer">
          <p>© 2026 SkillsForIT - Tu aliado en el mercado IT</p>
          <p>Este email contiene tu reporte de análisis de CV. Guárdalo para futuras referencias.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: '🚀 Tu Análisis de CV SkillsForIT está listo',
    html,
    attachments: [
      {
        filename: 'CV-Analysis-Report.pdf',
        path: reportPath,
      },
    ],
  })
}
