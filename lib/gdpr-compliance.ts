/**
 * GDPR/LGPD Compliance Library
 * 
 * Este módulo implementa funcionalidades para cumplir con:
 * - GDPR (Reglamento General de Protección de Datos - UE)
 * - LGPD (Lei Geral de Proteção de Dados - Brasil)
 * - CCPA (California Consumer Privacy Act - USA)
 * 
 * Características:
 * - Borrado lógico (soft delete) con retención de 30 días
 * - Exportación de datos de usuario (derecho de portabilidad)
 * - Registro de auditoría de operaciones sensibles
 * - Gestión de consentimientos
 * - Anonimización de datos
 */

import { db, mentorshipDb, getAllMentors } from './database'

// ============================================================================
// INTERFACES
// ============================================================================

export interface SoftDeletable {
  deletedAt?: Date | null
  deletionReason?: string
  deletedBy?: string // userId del admin que borró, o 'user' si fue auto-servicio
  isDeleted: boolean
}

export interface ConsentRecord {
  id: string
  userId: string
  userEmail: string
  type: 'cookies' | 'analytics' | 'marketing' | 'ai_training' | 'data_processing'
  granted: boolean
  grantedAt: Date
  revokedAt?: Date
  ipAddress?: string
  userAgent?: string
}

export interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: 'export_data' | 'delete_account' | 'consent_granted' | 'consent_revoked' | 'data_accessed'
  details: string
  ipAddress?: string
  timestamp: Date
}

export interface DataExportRequest {
  id: string
  userId: string
  userEmail: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  requestedAt: Date
  completedAt?: Date
  downloadUrl?: string
  expiresAt?: Date
}

export interface DeletionRequest {
  id: string
  userId: string
  userEmail: string
  reason?: string
  status: 'pending' | 'scheduled' | 'completed'
  requestedAt: Date
  scheduledFor: Date // 30 días después de la solicitud
  completedAt?: Date
  canRestore: boolean
}

// ============================================================================
// IN-MEMORY STORAGE (Replace with real database)
// ============================================================================

const consentsDB: Map<string, ConsentRecord> = new Map()
const auditLogsDB: Map<string, AuditLog> = new Map()
const exportRequestsDB: Map<string, DataExportRequest> = new Map()
const deletionRequestsDB: Map<string, DeletionRequest> = new Map()

// ============================================================================
// CONSENT MANAGER
// ============================================================================

export class ConsentManager {
  /**
   * Registra un consentimiento del usuario
   */
  static grantConsent(params: {
    userId: string
    userEmail: string
    type: ConsentRecord['type']
    ipAddress?: string
    userAgent?: string
  }): ConsentRecord {
    // Revocar consentimientos anteriores del mismo tipo
    this.revokeConsent(params.userId, params.type)

    const consent: ConsentRecord = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId: params.userId,
      userEmail: params.userEmail,
      type: params.type,
      granted: true,
      grantedAt: new Date(),
      ipAddress: params.ipAddress,
      userAgent: params.userAgent
    }

    consentsDB.set(consent.id, consent)

    // Log de auditoría
    AuditLogger.log({
      userId: params.userId,
      userEmail: params.userEmail,
      action: 'consent_granted',
      details: `Consent granted for ${params.type}`,
      ipAddress: params.ipAddress
    })

    return consent
  }

  /**
   * Revoca un consentimiento del usuario
   */
  static revokeConsent(userId: string, type: ConsentRecord['type']): void {
    const existingConsents = Array.from(consentsDB.values()).filter(
      c => c.userId === userId && c.type === type && !c.revokedAt
    )

    existingConsents.forEach(consent => {
      consent.revokedAt = new Date()
      consent.granted = false
      consentsDB.set(consent.id, consent)
    })

    if (existingConsents.length > 0) {
      AuditLogger.log({
        userId,
        userEmail: existingConsents[0].userEmail,
        action: 'consent_revoked',
        details: `Consent revoked for ${type}`
      })
    }
  }

  /**
   * Verifica si el usuario tiene un consentimiento activo
   */
  static hasConsent(userId: string, type: ConsentRecord['type']): boolean {
    const activeConsent = Array.from(consentsDB.values()).find(
      c => c.userId === userId && c.type === type && c.granted && !c.revokedAt
    )
    return !!activeConsent
  }

  /**
   * Obtiene todos los consentimientos de un usuario
   */
  static getUserConsents(userId: string): ConsentRecord[] {
    return Array.from(consentsDB.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime())
  }

  /**
   * Obtiene el historial de consentimientos (incluyendo revocados)
   */
  static getConsentHistory(userId: string, type?: ConsentRecord['type']): ConsentRecord[] {
    let consents = Array.from(consentsDB.values()).filter(c => c.userId === userId)
    
    if (type) {
      consents = consents.filter(c => c.type === type)
    }

    return consents.sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime())
  }
}

// ============================================================================
// AUDIT LOGGER
// ============================================================================

export class AuditLogger {
  /**
   * Registra una acción en el log de auditoría
   */
  static log(params: {
    userId: string
    userEmail: string
    action: AuditLog['action']
    details: string
    ipAddress?: string
  }): AuditLog {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.action,
      details: params.details,
      ipAddress: params.ipAddress,
      timestamp: new Date()
    }

    auditLogsDB.set(log.id, log)
    console.log(`[AUDIT] ${log.action} - ${log.userEmail} - ${log.details}`)

    return log
  }

  /**
   * Obtiene logs de auditoría de un usuario
   */
  static getUserLogs(userId: string): AuditLog[] {
    return Array.from(auditLogsDB.values())
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  /**
   * Obtiene todos los logs de auditoría (admin only)
   */
  static getAllLogs(limit?: number): AuditLog[] {
    const logs = Array.from(auditLogsDB.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    
    return limit ? logs.slice(0, limit) : logs
  }

  /**
   * Obtiene logs por acción específica
   */
  static getLogsByAction(action: AuditLog['action'], limit?: number): AuditLog[] {
    const logs = Array.from(auditLogsDB.values())
      .filter(log => log.action === action)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    
    return limit ? logs.slice(0, limit) : logs
  }
}

// ============================================================================
// DATA EXPORTER
// ============================================================================

export class DataExporter {
  /**
   * Crea una solicitud de exportación de datos
   */
  static async requestExport(userId: string, userEmail: string): Promise<DataExportRequest> {
    const request: DataExportRequest = {
      id: `export_${Date.now()}_${userId.substring(0, 8)}`,
      userId,
      userEmail,
      status: 'pending',
      requestedAt: new Date()
    }

    exportRequestsDB.set(request.id, request)

    // Log de auditoría
    AuditLogger.log({
      userId,
      userEmail,
      action: 'export_data',
      details: 'Data export requested'
    })

    // Procesar exportación en background
    this.processExport(request.id)

    return request
  }

  /**
   * Procesa la exportación de datos
   */
  private static async processExport(requestId: string): Promise<void> {
    const request = exportRequestsDB.get(requestId)
    if (!request) return

    try {
      request.status = 'processing'
      exportRequestsDB.set(requestId, request)

      // Recopilar todos los datos del usuario
      const userData = await this.collectUserData(request.userId, request.userEmail)

      // En producción, guardar en S3 o similar
      // Por ahora, simular con JSON en memoria
      const dataJson = JSON.stringify(userData, null, 2)
      request.downloadUrl = `data:application/json;base64,${Buffer.from(dataJson).toString('base64')}`
      request.status = 'completed'
      request.completedAt = new Date()
      request.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días

      exportRequestsDB.set(requestId, request)

      console.log(`✅ Data export completed for user ${request.userEmail}`)
    } catch (error) {
      request.status = 'failed'
      exportRequestsDB.set(requestId, request)
      console.error(`❌ Data export failed for user ${request.userEmail}:`, error)
    }
  }

  /**
   * Recopila todos los datos del usuario
   */
  private static async collectUserData(userId: string, userEmail: string) {
    // CV Analyses
    const cvAnalyses = db.findByEmail(userEmail)

    // Mentorship Sessions
    const mentorshipSessions = mentorshipDb.findByMentee(userEmail)

    // Consents
    const consents = ConsentManager.getUserConsents(userId)

    // Audit Logs
    const auditLogs = AuditLogger.getUserLogs(userId)

    return {
      exportMetadata: {
        userId,
        userEmail,
        exportDate: new Date().toISOString(),
        dataVersion: '1.0',
        gdprCompliant: true
      },
      personalData: {
        email: userEmail,
        userId
      },
      cvAnalyses: cvAnalyses.map(cv => ({
        id: cv.id,
        fileName: cv.cvFileName,
        profession: cv.profession,
        country: cv.country,
        analysisDate: cv.createdAt,
        score: cv.analysisResult?.score,
        atsScore: cv.analysisResult?.atsScore
      })),
      mentorshipSessions: mentorshipSessions.map(session => ({
        id: session.id,
        mentorId: session.mentorId,
        scheduledAt: session.scheduledAt,
        duration: session.duration,
        status: session.status,
        notes: session.notes?.map(note => ({
          content: note.content,
          topics: note.topics,
          actionItems: note.actionItems,
          nextSteps: note.nextSteps,
          createdAt: note.createdAt
        }))
      })),
      consents: consents.map(c => ({
        type: c.type,
        granted: c.granted,
        grantedAt: c.grantedAt,
        revokedAt: c.revokedAt
      })),
      auditLogs: auditLogs.map(log => ({
        action: log.action,
        details: log.details,
        timestamp: log.timestamp
      }))
    }
  }

  /**
   * Obtiene el estado de una solicitud de exportación
   */
  static getExportRequest(requestId: string): DataExportRequest | undefined {
    return exportRequestsDB.get(requestId)
  }

  /**
   * Obtiene todas las solicitudes de exportación de un usuario
   */
  static getUserExportRequests(userId: string): DataExportRequest[] {
    return Array.from(exportRequestsDB.values())
      .filter(req => req.userId === userId)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime())
  }
}

// ============================================================================
// ACCOUNT DELETER
// ============================================================================

export class AccountDeleter {
  /**
   * Crea una solicitud de borrado de cuenta (con período de gracia de 30 días)
   */
  static async requestDeletion(
    userId: string, 
    userEmail: string, 
    reason?: string
  ): Promise<DeletionRequest> {
    const scheduledFor = new Date()
    scheduledFor.setDate(scheduledFor.getDate() + 30) // 30 días de gracia

    const request: DeletionRequest = {
      id: `deletion_${Date.now()}_${userId.substring(0, 8)}`,
      userId,
      userEmail,
      reason,
      status: 'scheduled',
      requestedAt: new Date(),
      scheduledFor,
      canRestore: true
    }

    deletionRequestsDB.set(request.id, request)

    // Soft delete inmediato (pero recuperable)
    await this.softDelete(userId, userEmail, reason || 'User requested deletion')

    // Log de auditoría
    AuditLogger.log({
      userId,
      userEmail,
      action: 'delete_account',
      details: `Account deletion scheduled for ${scheduledFor.toISOString()}. Reason: ${reason || 'Not specified'}`
    })

    console.log(`⏳ Account deletion scheduled for ${userEmail} on ${scheduledFor.toISOString()}`)

    return request
  }

  /**
   * Borrado lógico (soft delete) de datos del usuario
   */
  private static async softDelete(userId: string, userEmail: string, reason: string): Promise<void> {
    const deletedAtTimestamp = new Date()

    // Soft delete CV analyses
    const cvAnalyses = db.findByEmail(userEmail)
    cvAnalyses.forEach(cv => {
      db.update(cv.id, {
        // @ts-ignore - agregando campos de soft delete
        deletedAt: deletedAtTimestamp,
        deletionReason: reason,
        deletedBy: 'user',
        isDeleted: true
      })
    })

    // Soft delete mentorship sessions
    const sessions = mentorshipDb.findByMentee(userEmail)
    sessions.forEach(session => {
      // En producción, actualizar en database
      // Por ahora, marcar en memoria
      const sessionAny = session as any
      sessionAny.deletedAt = deletedAtTimestamp
      sessionAny.deletionReason = reason
      sessionAny.deletedBy = 'user'
      sessionAny.isDeleted = true
    })

    console.log(`🗑️ Soft deleted ${cvAnalyses.length} CV analyses and ${sessions.length} sessions for ${userEmail}`)
  }

  /**
   * Restaura una cuenta antes del borrado permanente
   */
  static async restoreAccount(requestId: string): Promise<boolean> {
    const request = deletionRequestsDB.get(requestId)
    
    if (!request || !request.canRestore) {
      return false
    }

    // Restaurar datos
    const { userId, userEmail } = request

    // Restaurar CV analyses
    const cvAnalyses = db.all().filter(cv => 
      cv.email === userEmail && (cv as any).isDeleted
    )
    cvAnalyses.forEach(cv => {
      db.update(cv.id, {
        // @ts-ignore
        deletedAt: null,
        deletionReason: null,
        deletedBy: null,
        isDeleted: false
      })
    })

    // Restaurar sessions
    const sessions = mentorshipDb.getAll().filter(s => 
      s.menteeEmail === userEmail && (s as any).isDeleted
    )
    sessions.forEach(session => {
      const sessionAny = session as any
      sessionAny.deletedAt = null
      sessionAny.deletionReason = null
      sessionAny.deletedBy = null
      sessionAny.isDeleted = false
    })

    // Cancelar solicitud de borrado
    deletionRequestsDB.delete(requestId)

    // Log de auditoría
    AuditLogger.log({
      userId,
      userEmail,
      action: 'data_accessed',
      details: 'Account restored after deletion request'
    })

    console.log(`✅ Account restored for ${userEmail}`)

    return true
  }

  /**
   * Borrado permanente (ejecutado por cron job después de 30 días)
   */
  static async permanentDelete(requestId: string): Promise<boolean> {
    const request = deletionRequestsDB.get(requestId)
    
    if (!request || request.status === 'completed') {
      return false
    }

    const now = new Date()
    if (now < request.scheduledFor) {
      console.log(`⏳ Cannot delete yet. Scheduled for ${request.scheduledFor}`)
      return false
    }

    const { userEmail } = request

    // Borrar permanentemente CV analyses
    const cvAnalyses = db.findByEmail(userEmail)
    cvAnalyses.forEach(cv => {
      db.delete(cv.id)
    })

    // Borrar permanentemente mentorship sessions
    const sessions = mentorshipDb.findByMentee(userEmail)
    sessions.forEach(session => {
      mentorshipDb.delete(session.id)
    })

    // Marcar solicitud como completada
    request.status = 'completed'
    request.completedAt = new Date()
    request.canRestore = false
    deletionRequestsDB.set(requestId, request)

    console.log(`🗑️ PERMANENTLY deleted all data for ${userEmail}`)

    return true
  }

  /**
   * Obtiene solicitudes de borrado pendientes (para cron job)
   */
  static getPendingDeletions(): DeletionRequest[] {
    const now = new Date()
    return Array.from(deletionRequestsDB.values())
      .filter(req => req.status === 'scheduled' && req.scheduledFor <= now)
  }

  /**
   * Obtiene la solicitud de borrado de un usuario
   */
  static getUserDeletionRequest(userId: string): DeletionRequest | undefined {
    return Array.from(deletionRequestsDB.values())
      .find(req => req.userId === userId && req.status !== 'completed')
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Anonimiza un email para retención de datos analíticos
 */
export function anonymizeEmail(email: string): string {
  const [local, domain] = email.split('@')
  const anonymizedLocal = local.substring(0, 2) + '***'
  return `${anonymizedLocal}@${domain}`
}

/**
 * Genera un identificador anónimo único pero consistente
 */
export function generateAnonymousId(userId: string): string {
  // En producción, usar hash criptográfico
  return `anon_${Buffer.from(userId).toString('base64').substring(0, 16)}`
}

/**
 * Verifica si un dato está dentro del período de retención
 */
export function isWithinRetentionPeriod(date: Date, retentionDays: number = 30): boolean {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays <= retentionDays
}
