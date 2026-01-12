/**
 * Zoom Integration Library
 * 
 * Este módulo maneja la integración con Zoom para generar links de reunión únicos.
 * 
 * Para usar Zoom en producción, necesitas:
 * 1. Crear una Server-to-Server OAuth App en https://marketplace.zoom.us/
 * 2. Obtener Account ID, Client ID, Client Secret
 * 3. Configurar las variables de entorno:
 *    - ZOOM_ACCOUNT_ID
 *    - ZOOM_CLIENT_ID
 *    - ZOOM_CLIENT_SECRET
 * 
 * Alternativa: También soporta Google Meet (con Google Calendar API)
 */

interface ZoomMeeting {
  id: string
  meetingId: string
  password: string
  joinUrl: string
  startUrl: string
  topic: string
  startTime: string
  duration: number
}

interface ZoomAccessToken {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface GoogleMeetEvent {
  id: string
  htmlLink: string
  hangoutLink: string
  summary: string
  start: { dateTime: string }
  end: { dateTime: string }
}

export type MeetingProvider = 'zoom' | 'google-meet' | 'mock'

interface CreateMeetingParams {
  topic: string
  startTime: Date
  duration: number // en minutos
  hostEmail: string
  attendeeEmail: string
  attendeeName?: string
  provider?: MeetingProvider
}

interface MeetingDetails {
  provider: MeetingProvider
  meetingId: string
  password?: string
  joinUrl: string
  startUrl?: string
  hostEmail: string
  topic: string
  startTime: Date
  duration: number
}

/**
 * Obtiene un access token de Zoom usando Server-to-Server OAuth
 */
async function getZoomAccessToken(): Promise<string> {
  const accountId = process.env.ZOOM_ACCOUNT_ID
  const clientId = process.env.ZOOM_CLIENT_ID
  const clientSecret = process.env.ZOOM_CLIENT_SECRET

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Zoom credentials not configured. Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get Zoom access token: ${error}`)
  }

  const data: ZoomAccessToken = await response.json()
  return data.access_token
}

/**
 * Crea una reunión de Zoom
 */
async function createZoomMeeting(params: CreateMeetingParams): Promise<MeetingDetails> {
  const accessToken = await getZoomAccessToken()

  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      topic: params.topic,
      type: 2, // Scheduled meeting
      start_time: params.startTime.toISOString(),
      duration: params.duration,
      timezone: 'America/Mexico_City', // Ajusta según tu zona horaria
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        audio: 'both',
        auto_recording: 'none',
        waiting_room: false,
        meeting_authentication: false
      }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to create Zoom meeting: ${error}`)
  }

  const meeting: ZoomMeeting = await response.json()

  return {
    provider: 'zoom',
    meetingId: meeting.id,
    password: meeting.password,
    joinUrl: meeting.joinUrl,
    startUrl: meeting.startUrl,
    hostEmail: params.hostEmail,
    topic: params.topic,
    startTime: params.startTime,
    duration: params.duration
  }
}

/**
 * Crea un evento de Google Meet (requiere Google Calendar API configurada)
 */
async function createGoogleMeetMeeting(params: CreateMeetingParams): Promise<MeetingDetails> {
  // Nota: Requiere configurar Google Calendar API y OAuth2
  // Para simplicidad, retornamos un mock. En producción, usa google-auth-library
  throw new Error('Google Meet integration not implemented yet. Use Zoom or mock provider.')
}

/**
 * Crea un meeting mock para desarrollo/testing
 */
function createMockMeeting(params: CreateMeetingParams): MeetingDetails {
  const mockId = `mock-${Date.now()}-${Math.random().toString(36).substring(7)}`
  
  return {
    provider: 'mock',
    meetingId: mockId,
    password: '123456',
    joinUrl: `https://zoom.us/j/${mockId}?pwd=mock`,
    startUrl: `https://zoom.us/s/${mockId}?zak=mock`,
    hostEmail: params.hostEmail,
    topic: params.topic,
    startTime: params.startTime,
    duration: params.duration
  }
}

/**
 * Crea una reunión según el proveedor configurado
 */
export async function createMeeting(params: CreateMeetingParams): Promise<MeetingDetails> {
  const provider = params.provider || process.env.MEETING_PROVIDER || 'mock'

  console.log(`Creating ${provider} meeting for: ${params.topic}`)

  try {
    switch (provider) {
      case 'zoom':
        return await createZoomMeeting(params)
      
      case 'google-meet':
        return await createGoogleMeetMeeting(params)
      
      case 'mock':
      default:
        return createMockMeeting(params)
    }
  } catch (error) {
    console.error(`Failed to create ${provider} meeting:`, error)
    // Fallback a mock si falla
    console.log('Falling back to mock meeting')
    return createMockMeeting(params)
  }
}

/**
 * Cancela una reunión de Zoom
 */
export async function cancelZoomMeeting(meetingId: string): Promise<void> {
  try {
    const accessToken = await getZoomAccessToken()

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const error = await response.text()
      console.error(`Failed to cancel Zoom meeting ${meetingId}:`, error)
    }
  } catch (error) {
    console.error(`Error canceling Zoom meeting ${meetingId}:`, error)
  }
}

/**
 * Obtiene detalles de una reunión existente
 */
export async function getZoomMeetingDetails(meetingId: string): Promise<ZoomMeeting | null> {
  try {
    const accessToken = await getZoomAccessToken()

    const response = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching Zoom meeting ${meetingId}:`, error)
    return null
  }
}

/**
 * Genera un link de calendario ICS para agregar a Google Calendar, Outlook, etc.
 */
export function generateCalendarLink(meeting: MeetingDetails): string {
  const startTime = meeting.startTime.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const endTime = new Date(meeting.startTime.getTime() + meeting.duration * 60000)
    .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const description = `Join meeting: ${meeting.joinUrl}${
    meeting.password ? `\\nPassword: ${meeting.password}` : ''
  }`

  // Google Calendar link
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(meeting.topic)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(meeting.joinUrl)}`

  return googleCalendarUrl
}

/**
 * Formatea los detalles de la reunión para email
 */
export function formatMeetingDetailsForEmail(meeting: MeetingDetails): string {
  return `
📅 Meeting Details

Topic: ${meeting.topic}
Date: ${meeting.startTime.toLocaleString('es', { 
  dateStyle: 'full', 
  timeStyle: 'short' 
})}
Duration: ${meeting.duration} minutes

🔗 Join Link: ${meeting.joinUrl}
${meeting.password ? `🔐 Password: ${meeting.password}` : ''}

📆 Add to Calendar: ${generateCalendarLink(meeting)}

See you there! 🚀
  `.trim()
}

// Export types
export type { CreateMeetingParams, MeetingDetails, ZoomMeeting, GoogleMeetEvent }
