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

// In-memory storage (replace with real database)
const database: Map<string, CVAnalysis> = new Map()

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
