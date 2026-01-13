import { sendEmail } from './email'
import { db, notesDb, sessionsDb, usersDb } from './database'

// Email Templates
const MENTOR_FEEDBACK_TEMPLATE = (userName: string, mentorName: string, sessionTitle: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
    .highlight { background: #f0f9ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💬 Nuevo Feedback de tu Mentor</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${userName}</strong>,</p>

      <div class="highlight">
        <p><strong>${mentorName}</strong> ha dejado nuevas notas y tareas para ti en tu sesión <strong>"${sessionTitle}"</strong>.</p>
      </div>

      <p>Revisa tu <strong>Hoja de Ruta</strong> para ver las tareas específicas que tu mentor te ha asignado. Completar estas tareas te ayudará a mejorar tu Career Score y avanzar en tu camino profesional.</p>

      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user/dashboard" class="button">
        Ver Mi Progreso 📈
      </a>

      <p>¡Sigue adelante! Cada paso cuenta para llegar al 100%.</p>

      <p>Saludos,<br>El equipo de SkillsForIT</p>
    </div>
    <div class="footer">
      <p>Este es un email automático. Si tienes preguntas, contáctanos en support@skillsforit.com</p>
    </div>
  </div>
</body>
</html>
`

const SESSION_REMINDER_TEMPLATE = (userName: string, sessionTitle: string, mentorName: string, sessionTime: string, joinUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; font-size: 16px; }
    .urgent { background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .footer { background: #f8fafc; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Tu Sesión Comienza Pronto</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${userName}</strong>,</p>

      <div class="urgent">
        <p><strong>Tu sesión de mentoría comienza en 15 minutos.</strong></p>
        <p><strong>Sesión:</strong> ${sessionTitle}</p>
        <p><strong>Mentor:</strong> ${mentorName}</p>
        <p><strong>Horario:</strong> ${sessionTime}</p>
      </div>

      <p>Prepárate para una sesión productiva. Asegúrate de tener buena conexión a internet y un espacio tranquilo.</p>

      <a href="${joinUrl}" class="button">
        Unirme a la Sesión 🎥
      </a>

      <p>Si no puedes asistir, por favor avisa a tu mentor con anticipación.</p>

      <p>¡Éxito en tu sesión!</p>

      <p>Saludos,<br>El equipo de SkillsForIT</p>
    </div>
    <div class="footer">
      <p>Este es un email automático. Si tienes preguntas, contáctanos en support@skillsforit.com</p>
    </div>
  </div>
</body>
</html>
`

const CAREER_SCORE_UPDATE_TEMPLATE = (userName: string, oldScore: number, newScore: number, improvement: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
    .content { padding: 40px 30px; }
    .score-box { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 12px; margin: 20px 0; }
    .score-number { font-size: 48px; font-weight: bold; margin: 10px 0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 ¡Tu Career Score Subió!</h1>
    </div>
    <div class="content">
      <p>Hola <strong>${userName}</strong>,</p>

      <div class="score-box">
        <p>Tu Career Score subió de <strong>${oldScore}%</strong> a <strong>${newScore}%</strong></p>
        <div class="score-number">${newScore}%</div>
        <p>¡${improvement}!</p>
      </div>

      <p>Esto significa que estás avanzando en tu camino profesional. ${newScore >= 80 ? '¡Estás cerca del 100%!' : 'Sigue completando tus tareas para llegar al objetivo.'}</p>

      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user/dashboard" class="button">
        Ver Mi Progreso 📊
      </a>

      <p>¡Felicitaciones por tu progreso!</p>

      <p>Saludos,<br>El equipo de SkillsForIT</p>
    </div>
    <div class="footer">
      <p>Este es un email automático. Si tienes preguntas, contáctanos en support@skillsforit.com</p>
    </div>
  </div>
</body>
</html>
`

// Notification functions
export const sendMentorFeedbackNotification = async (sessionId: string) => {
  try {
    const session = sessionsDb.findById(sessionId)
    if (!session) return { success: false, error: 'Session not found' }

    const mentor = db.findById(session.mentorId)
    const mentee = usersDb.findByEmail(session.menteeEmail)

    if (!mentor || !mentee) return { success: false, error: 'Mentor or mentee not found' }

    const html = MENTOR_FEEDBACK_TEMPLATE(
      mentee.name,
      mentor.name,
      'Sesión de Mentoría',
    )

    return await sendEmail({
      to: mentee.email,
      subject: `💬 Nuevo feedback de ${mentor.name} - SkillsForIT`,
      html
    })
  } catch (error) {
    console.error('Error sending mentor feedback notification:', error)
    return { success: false, error }
  }
}

export const sendSessionReminderNotification = async (sessionId: string) => {
  try {
    const session = sessionsDb.findById(sessionId)
    if (!session) return { success: false, error: 'Session not found' }

    const mentor = db.findById(session.mentorId)
    const mentee = usersDb.findByEmail(session.menteeEmail)

    if (!mentor || !mentee) return { success: false, error: 'Mentor or mentee not found' }

    const sessionTime = new Date(session.scheduledAt).toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Send to mentee
    const menteeHtml = SESSION_REMINDER_TEMPLATE(
      mentee.name,
      'Sesión de Mentoría',
      mentor.name,
      sessionTime,
      session.meetingLink || '#'
    )

    await sendEmail({
      to: mentee.email,
      subject: `⏰ Tu sesión comienza en 15 minutos - SkillsForIT`,
      html: menteeHtml
    })

    // Send to mentor
    const mentorHtml = SESSION_REMINDER_TEMPLATE(
      mentor.name,
      'Sesión de Mentoría',
      `Alumno: ${mentee.name}`,
      sessionTime,
      session.meetingLink || '#'
    )

    return await sendEmail({
      to: mentor.email,
      subject: `⏰ Sesión con ${mentee.name} en 15 minutos - SkillsForIT`,
      html: mentorHtml
    })
  } catch (error) {
    console.error('Error sending session reminder notification:', error)
    return { success: false, error }
  }
}

export const sendCareerScoreUpdateNotification = async (
  userEmail: string,
  userName: string,
  oldScore: number,
  newScore: number
) => {
  try {
    const improvement = newScore > oldScore ? 'Gran progreso' : 'Sigue avanzando'
    const html = CAREER_SCORE_UPDATE_TEMPLATE(userName, oldScore, newScore, improvement)

    return await sendEmail({
      to: userEmail,
      subject: `🎉 ¡Tu Career Score subió a ${newScore}%! - SkillsForIT`,
      html
    })
  } catch (error) {
    console.error('Error sending career score notification:', error)
    return { success: false, error }
  }
}

// Queue system for notifications (simple in-memory for MVP)
const notificationQueue: Array<{
  type: 'mentor_feedback' | 'session_reminder' | 'career_score_update'
  sessionId?: string
  userEmail?: string
  userName?: string
  oldScore?: number
  newScore?: number
  scheduledFor: Date
}> = []

// Scheduled reminders storage (in-memory for MVP)
const scheduledReminders: Array<{
  sessionId: string
  reminderTime: Date
  processed: boolean
}> = []

export const queueNotification = (notification: typeof notificationQueue[0]) => {
  notificationQueue.push(notification)
  console.log(`Notification queued: ${notification.type} for ${notification.scheduledFor.toISOString()}`)
}

export const scheduleSessionReminder = (sessionId: string, reminderTime: Date) => {
  scheduledReminders.push({
    sessionId,
    reminderTime,
    processed: false
  })
  console.log(`Session reminder scheduled for session ${sessionId} at ${reminderTime.toISOString()}`)
}

export const processNotificationQueue = async () => {
  const now = new Date()

  // Process scheduled reminders
  const dueReminders = scheduledReminders.filter(r => !r.processed && r.reminderTime <= now)
  for (const reminder of dueReminders) {
    try {
      console.log(`Processing scheduled reminder for session ${reminder.sessionId}`)
      await sendSessionReminderNotification(reminder.sessionId)
      reminder.processed = true
    } catch (error) {
      console.error('Error processing scheduled reminder:', error)
    }
  }

  // Process regular notification queue
  const dueNotifications = notificationQueue.filter(n => n.scheduledFor <= now)

  for (const notification of dueNotifications) {
    try {
      switch (notification.type) {
        case 'mentor_feedback':
          if (notification.sessionId) {
            await sendMentorFeedbackNotification(notification.sessionId)
          }
          break
        case 'session_reminder':
          if (notification.sessionId) {
            await sendSessionReminderNotification(notification.sessionId)
          }
          break
        case 'career_score_update':
          if (notification.userEmail && notification.userName && notification.oldScore !== undefined && notification.newScore !== undefined) {
            await sendCareerScoreUpdateNotification(
              notification.userEmail,
              notification.userName,
              notification.oldScore,
              notification.newScore
            )
          }
          break
      }
    } catch (error) {
      console.error('Error processing notification:', error)
    }
  }

  // Remove processed notifications
  notificationQueue.splice(0, dueNotifications.length)

  // Clean up processed reminders (keep only recent ones for debugging)
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const recentReminders = scheduledReminders.filter(r => r.processed && r.reminderTime > oneDayAgo)
  scheduledReminders.splice(0, scheduledReminders.length - recentReminders.length)
}

// Cron job simulation - call this function every minute
export const startNotificationProcessor = () => {
  console.log('Starting notification processor...')

  // Process immediately
  processNotificationQueue()

  // Process every minute
  setInterval(async () => {
    try {
      await processNotificationQueue()
    } catch (error) {
      console.error('Error in notification processor:', error)
    }
  }, 60 * 1000) // Every minute

  console.log('Notification processor started successfully')
}