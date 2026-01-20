// Plantillas de email para SkillsForIT

module.exports = {
  // 1. Bienvenida Mentoría
  mentoriaWelcome: ({ to, password, dashboardUrl }) => ({
    subject: '¡Bienvenido a SkillsForIT Mentoría! 🎉',
    html: `
      <h2>¡Gracias por tu compra!</h2>
      <p>Tu acceso al dashboard de mentoría ya está listo.</p>
      <ul>
        <li><b>Usuario:</b> ${to}</li>
        <li><b>Contraseña temporal:</b> ${password}</li>
      </ul>
      <p>Puedes cambiar tu contraseña desde el dashboard.</p>
      <p>Accede aquí: <a href="${dashboardUrl}">${dashboardUrl}</a></p>
      <p>Si no ves este email, revisa tu carpeta de spam.</p>
      <hr />
      <p>Instrucciones para reservar sesiones están dentro del dashboard.</p>
    `
  }),

  // 2. Entrega de producto digital (Soft Skills Guide, etc.)
  productDelivery: ({ to, productName, downloadUrl }) => ({
    subject: `¡Tu acceso a ${productName} está listo!`,
    html: `
      <h2>¡Gracias por tu compra!</h2>
      <p>Puedes descargar tu producto aquí:</p>
      <a href="${downloadUrl}">${downloadUrl}</a>
      <p>Si tienes problemas para acceder, responde a este email.</p>
      <hr />
      <p>¡Disfruta tu recurso!</p>
    `
  }),

  // 3. Confirmación de pago y análisis de CV
  cvAnalysisConfirmation: ({ to, analysisId }) => ({
    subject: '¡Pago recibido! Tu análisis de CV está en proceso',
    html: `
      <h2>¡Gracias por confiar en SkillsForIT!</h2>
      <p>Tu pago fue recibido correctamente. Estamos procesando tu análisis de CV (ID: ${analysisId}).</p>
      <p>Te avisaremos por este medio cuando el resultado esté listo.</p>
    `
  }),
  cvAnalysisResult: ({ to, analysisId, resultUrl }) => ({
    subject: '¡Tu análisis de CV está listo!',
    html: `
      <h2>¡Análisis completado!</h2>
      <p>Puedes ver tu resultado aquí:</p>
      <a href="${resultUrl}">${resultUrl}</a>
      <p>Gracias por usar SkillsForIT.</p>
    `
  }),

  // 4. Confirmación de pago de mentoría/sesión
  mentorshipSessionConfirmation: ({ to, mentorName, sessionDate, sessionUrl }) => ({
    subject: '¡Sesión de mentoría confirmada!',
    html: `
      <h2>¡Tu sesión está agendada!</h2>
      <p>Mentor: <b>${mentorName}</b></p>
      <p>Fecha y hora: <b>${sessionDate}</b></p>
      <p>Enlace de acceso: <a href="${sessionUrl}">${sessionUrl}</a></p>
      <p>Si tienes dudas, responde a este email.</p>
    `
  }),

  // 5. Recuperación de carrito abandonado
  cartRecovery: ({ to, recoveryUrl, productName }) => ({
    subject: `¿Aún quieres ${productName}?`,
    html: `
      <h2>¡No pierdas tu oportunidad!</h2>
      <p>Puedes retomar tu compra aquí:</p>
      <a href="${recoveryUrl}">${recoveryUrl}</a>
      <p>Si tienes preguntas, estamos para ayudarte.</p>
    `
  })
}
