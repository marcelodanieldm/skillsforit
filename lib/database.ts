// Simple in-memory database for MVP
// In production, replace with PostgreSQL, MongoDB, or similar

export interface CVAnalysis {
  id: string
  email: string
  name: string
  country: string
  profession: string
  cvFileName: string
  cvFilePath: string
  stripeSessionId?: string
  paymentStatus: 'pending' | 'completed' | 'failed'
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed'
  analysisResult?: AnalysisResult
  reportUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface AnalysisResult {
  score: number
  atsScore: number
  problems: Problem[]
  improvements: Improvement[]
  strengths: string[]
  recommendations: string[]
}

export interface Problem {
  category: string
  severity: 'high' | 'medium' | 'low'
  description: string
  impact: string
}

export interface Improvement {
  category: string
  before: string
  after: string
  explanation: string
  impact: string
}

// Mentorship System Models
export interface Mentor {
  id: string
  userId: string
  name: string
  email: string
  bio: string
  expertise: string[] // e.g., ['Frontend', 'React', 'Career Growth']
  photoUrl?: string
  linkedinUrl?: string
  hourlyRate: number // Price per 10-min session
  totalSessions: number
  rating: number
  reviewCount: number
  availability: MentorAvailability[]
}

export interface MentorAvailability {
  dayOfWeek: number // 0-6 (Sunday to Saturday)
  startTime: string // e.g., "09:00"
  endTime: string // e.g., "17:00"
  timezone: string // e.g., "America/New_York"
}

export interface MentorshipSession {
  id: string
  mentorId: string
  menteeEmail: string
  menteeName?: string
  scheduledAt: Date
  duration: number // minutes (default 10)
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  meetingLink: string // Zoom/Google Meet link
  stripeSessionId?: string
  paymentStatus?: 'pending' | 'completed' | 'refunded'
  notes?: SessionNote[]
}

export interface SessionNote {
  id: string
  sessionId: string
  mentorId: string
  content: string
  topics: string[]
  actionItems: string[]
export interface SessionNote {
  id: string
  sessionId: string
  mentorId: string
  content: string
  topics: string[]
  actionItems: string[]
  nextSteps: string[]
  createdAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: 'mentee' | 'mentor'
  createdAt: Date
}

// In-memory storage (replace with real database)
const database: Map<string, CVAnalysis> = new Map()
const mentorsDB: Map<string, Mentor> = new Map()
const sessionsDB: Map<string, MentorshipSession> = new Map()
const notesDB: Map<string, SessionNote> = new Map()
const usersDB: Map<string, User> = new Map()

export const db = {
  create: (analysis: CVAnalysis) => {
    database.set(analysis.id, analysis)
    return analysis
  },

  findById: (id: string) => {
    return database.get(id)
  },

  findByEmail: (email: string) => {
    return Array.from(database.values()).filter(a => a.email === email)
  },

  findByStripeSessionId: (sessionId: string) => {
    return Array.from(database.values()).find(a => a.stripeSessionId === sessionId)
  },

  update: (id: string, data: Partial<CVAnalysis>) => {
    const existing = database.get(id)
    if (!existing) return null
    
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date()
    }
    database.set(id, updated)
    return updated
  },

  delete: (id: string) => {
    return database.delete(id)
  },

  all: () => {
    return Array.from(database.values())
  }
}

// Mentors Database Operations
export const mentorsDb = {
  create: (mentor: Mentor) => {
    mentorsDB.set(mentor.id, mentor)
    return mentor
  },

  findById: (id: string) => {
    return mentorsDB.get(id)
  },

  findByEmail: (email: string) => {
    return Array.from(mentorsDB.values()).find(m => m.email === email)
  },

  findAll: (filters?: { expertise?: string }) => {
    let mentors = Array.from(mentorsDB.values())
    
    if (filters?.expertise) {
      mentors = mentors.filter(m => m.expertise.includes(filters.expertise!))
    }
    
    return mentors.sort((a, b) => b.rating - a.rating)
  },

  update: (id: string, data: Partial<Mentor>) => {
    const existing = mentorsDB.get(id)
    if (!existing) return null
    
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date()
    }
    mentorsDB.set(id, updated)
    return updated
  },

  delete: (id: string) => {
    return mentorsDB.delete(id)
  }
}

// Sessions Database Operations
export const sessionsDb = {
  create: (session: MentorshipSession) => {
    sessionsDB.set(session.id, session)
    return session
  },

  findById: (id: string) => {
    return sessionsDB.get(id)
  },

  findByMentor: (mentorId: string, status?: MentorshipSession['status']) => {
    let sessions = Array.from(sessionsDB.values()).filter(s => s.mentorId === mentorId)
    
    if (status) {
      sessions = sessions.filter(s => s.status === status)
    }
    
    return sessions.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
  },

  findByMentee: (menteeEmail: string) => {
    return Array.from(sessionsDB.values())
      .filter(s => s.menteeEmail === menteeEmail)
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
  },

  findPreviousSession: (mentorId: string, menteeEmail: string, beforeDate: Date) => {
    const sessions = Array.from(sessionsDB.values())
      .filter(s => 
        s.mentorId === mentorId && 
        s.menteeEmail === menteeEmail &&
        s.status === 'completed' &&
        s.scheduledAt < beforeDate
      )
      .sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime())
    
    return sessions[0] // Most recent previous session
  },

  update: (id: string, data: Partial<MentorshipSession>) => {
    const existing = sessionsDB.get(id)
    if (!existing) return null
    
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date()
    }
    sessionsDB.set(id, updated)
    return updated
  },

  delete: (id: string) => {
    return sessionsDB.delete(id)
  }
}

// Notes Database Operations
export const notesDb = {
  create: (note: SessionNote) => {
    notesDB.set(note.id, note)
    return note
  },

  findById: (id: string) => {
    return notesDB.get(id)
  },

  findBySession: (sessionId: string) => {
    return Array.from(notesDB.values())
      .filter(n => n.sessionId === sessionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  },

  update: (id: string, data: Partial<SessionNote>) => {
    const existing = notesDB.get(id)
    if (!existing) return null
    
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date()
    }
    notesDB.set(id, updated)
    return updated
  },

  delete: (id: string) => {
    return notesDB.delete(id)
  }
}

// Users Database Operations
export const usersDb = {
  create: (user: User) => {
    usersDB.set(user.id, user)
    return user
  },

  findByEmail: (email: string) => {
    return Array.from(usersDB.values()).find(u => u.email === email)
  },

  findById: (id: string) => {
    return usersDB.get(id)
  }
}
