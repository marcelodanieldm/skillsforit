// Sistema de Créditos de Sesión para Mentoría
// 4 créditos mensuales por usuario con status de pago activo

interface UserCredits {
  userId: string
  email: string
  monthlyCredits: number
  creditsUsed: number
  creditsRemaining: number
  paymentStatus: 'active' | 'inactive' | 'pending' | 'cancelled'
  subscriptionStart: Date
  lastRenewal: Date
  nextRenewal: Date
}

interface CreditTransaction {
  id: string
  userId: string
  type: 'earned' | 'used' | 'refunded' | 'expired'
  amount: number
  reason: string
  sessionId?: string
  createdAt: Date
}

// In-memory database
const userCreditsDb = new Map<string, UserCredits>()
const creditTransactionsDb: CreditTransaction[] = []

// Constantes del sistema
const MONTHLY_CREDITS = 4
const SUBSCRIPTION_PRICE = 29 // USD per month
const CREDIT_VALIDITY_DAYS = 30

export class SessionCreditsManager {
  
  /**
   * Inicializa créditos para un nuevo usuario
   */
  static initializeCredits(userId: string, email: string): UserCredits {
    const now = new Date()
    const nextMonth = new Date(now)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    const credits: UserCredits = {
      userId,
      email,
      monthlyCredits: MONTHLY_CREDITS,
      creditsUsed: 0,
      creditsRemaining: MONTHLY_CREDITS,
      paymentStatus: 'pending', // Cambiar a 'active' tras pago
      subscriptionStart: now,
      lastRenewal: now,
      nextRenewal: nextMonth
    }

    userCreditsDb.set(userId, credits)
    
    // Registrar transacción
    this.addTransaction({
      id: `txn_${Date.now()}_${userId}`,
      userId,
      type: 'earned',
      amount: MONTHLY_CREDITS,
      reason: 'Créditos iniciales de suscripción',
      createdAt: now
    })

    return credits
  }

  /**
   * Obtener créditos de un usuario
   */
  static getCredits(userId: string): UserCredits | null {
    return userCreditsDb.get(userId) || null
  }

  /**
   * Verificar si el usuario puede reservar una sesión
   */
  static canBookSession(userId: string): { 
    canBook: boolean
    reason?: string
    credits?: UserCredits
  } {
    const credits = this.getCredits(userId)

    if (!credits) {
      return {
        canBook: false,
        reason: 'Usuario no encontrado. Por favor, suscríbete primero.'
      }
    }

    // Verificar status de pago
    if (credits.paymentStatus !== 'active') {
      return {
        canBook: false,
        reason: `Tu suscripción está ${credits.paymentStatus}. Por favor, actualiza tu método de pago.`,
        credits
      }
    }

    // Verificar créditos disponibles
    if (credits.creditsRemaining <= 0) {
      const daysUntilRenewal = Math.ceil(
        (credits.nextRenewal.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      return {
        canBook: false,
        reason: `No tienes créditos disponibles. Tus créditos se renovarán en ${daysUntilRenewal} días.`,
        credits
      }
    }

    // Verificar si necesita renovación
    if (new Date() >= credits.nextRenewal) {
      this.renewCredits(userId)
    }

    return {
      canBook: true,
      credits
    }
  }

  /**
   * Usar un crédito al reservar sesión
   */
  static useCredit(userId: string, sessionId: string): {
    success: boolean
    message: string
    credits?: UserCredits
  } {
    const validation = this.canBookSession(userId)
    
    if (!validation.canBook) {
      return {
        success: false,
        message: validation.reason || 'No se puede usar crédito'
      }
    }

    const credits = validation.credits!
    credits.creditsUsed += 1
    credits.creditsRemaining -= 1
    userCreditsDb.set(userId, credits)

    // Registrar transacción
    this.addTransaction({
      id: `txn_${Date.now()}_${userId}`,
      userId,
      type: 'used',
      amount: 1,
      reason: 'Sesión de mentoría reservada',
      sessionId,
      createdAt: new Date()
    })

    return {
      success: true,
      message: `Crédito usado exitosamente. Te quedan ${credits.creditsRemaining} créditos.`,
      credits
    }
  }

  /**
   * Reembolsar crédito (por cancelación)
   */
  static refundCredit(userId: string, sessionId: string, reason: string): {
    success: boolean
    message: string
    credits?: UserCredits
  } {
    const credits = this.getCredits(userId)

    if (!credits) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      }
    }

    credits.creditsUsed = Math.max(0, credits.creditsUsed - 1)
    credits.creditsRemaining = Math.min(MONTHLY_CREDITS, credits.creditsRemaining + 1)
    userCreditsDb.set(userId, credits)

    // Registrar transacción
    this.addTransaction({
      id: `txn_${Date.now()}_${userId}`,
      userId,
      type: 'refunded',
      amount: 1,
      reason,
      sessionId,
      createdAt: new Date()
    })

    return {
      success: true,
      message: `Crédito reembolsado. Ahora tienes ${credits.creditsRemaining} créditos disponibles.`,
      credits
    }
  }

  /**
   * Renovar créditos mensualmente
   */
  static renewCredits(userId: string): UserCredits | null {
    const credits = this.getCredits(userId)

    if (!credits) return null

    // Solo renovar si el pago está activo
    if (credits.paymentStatus !== 'active') {
      console.log(`Skipping renewal for ${userId}: payment not active`)
      return credits
    }

    const now = new Date()
    const nextMonth = new Date(now)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Resetear créditos
    credits.creditsUsed = 0
    credits.creditsRemaining = MONTHLY_CREDITS
    credits.lastRenewal = now
    credits.nextRenewal = nextMonth

    userCreditsDb.set(userId, credits)

    // Registrar transacción
    this.addTransaction({
      id: `txn_${Date.now()}_${userId}`,
      userId,
      type: 'earned',
      amount: MONTHLY_CREDITS,
      reason: 'Renovación mensual automática',
      createdAt: now
    })

    console.log(`Credits renewed for ${userId}: ${MONTHLY_CREDITS} new credits`)

    return credits
  }

  /**
   * Actualizar status de pago tras confirmación de Stripe
   */
  static updatePaymentStatus(
    userId: string, 
    status: 'active' | 'inactive' | 'cancelled'
  ): UserCredits | null {
    const credits = this.getCredits(userId)

    if (!credits) return null

    credits.paymentStatus = status

    // Si se cancela, marcar próxima renovación
    if (status === 'cancelled') {
      credits.paymentStatus = 'cancelled'
    }

    // Si se reactiva, renovar créditos inmediatamente
    if (status === 'active' && credits.creditsRemaining === 0) {
      this.renewCredits(userId)
    }

    userCreditsDb.set(userId, credits)

    return credits
  }

  /**
   * Obtener historial de transacciones de un usuario
   */
  static getTransactionHistory(userId: string, limit: number = 20): CreditTransaction[] {
    return creditTransactionsDb
      .filter(txn => txn.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
  }

  /**
   * Obtener estadísticas de uso de créditos
   */
  static getUserStats(userId: string): {
    totalCreditsEarned: number
    totalCreditsUsed: number
    totalCreditsRefunded: number
    averageUsagePerMonth: number
    currentStreak: number // meses consecutivos usando al menos 1 crédito
  } | null {
    const transactions = this.getTransactionHistory(userId, 1000)

    if (transactions.length === 0) return null

    const earned = transactions.filter(t => t.type === 'earned')
      .reduce((sum, t) => sum + t.amount, 0)
    const used = transactions.filter(t => t.type === 'used')
      .reduce((sum, t) => sum + t.amount, 0)
    const refunded = transactions.filter(t => t.type === 'refunded')
      .reduce((sum, t) => sum + t.amount, 0)

    // Calcular meses activos
    const monthsActive = new Set(
      transactions.map(t => `${t.createdAt.getFullYear()}-${t.createdAt.getMonth()}`)
    ).size

    const averageUsagePerMonth = monthsActive > 0 ? used / monthsActive : 0

    // Calcular racha (simplified)
    const currentStreak = monthsActive

    return {
      totalCreditsEarned: earned,
      totalCreditsUsed: used,
      totalCreditsRefunded: refunded,
      averageUsagePerMonth: Math.round(averageUsagePerMonth * 10) / 10,
      currentStreak
    }
  }

  /**
   * Agregar transacción al historial
   */
  private static addTransaction(transaction: CreditTransaction) {
    creditTransactionsDb.push(transaction)
  }

  /**
   * Job que se ejecuta diariamente para renovar créditos
   */
  static dailyRenewalJob() {
    const now = new Date()
    let renewedCount = 0

    for (const [userId, credits] of userCreditsDb.entries()) {
      if (now >= credits.nextRenewal && credits.paymentStatus === 'active') {
        this.renewCredits(userId)
        renewedCount++
      }
    }

    console.log(`Daily renewal job completed: ${renewedCount} users renewed`)
    return renewedCount
  }

  /**
   * Obtener todos los usuarios con sus créditos (admin)
   */
  static getAllCredits(): UserCredits[] {
    return Array.from(userCreditsDb.values())
  }

  /**
   * Limpiar créditos expirados (admin)
   */
  static cleanupExpiredCredits(): number {
    let cleaned = 0
    const now = new Date()
    const expirationDate = new Date(now)
    expirationDate.setDate(expirationDate.getDate() - CREDIT_VALIDITY_DAYS)

    for (const [userId, credits] of userCreditsDb.entries()) {
      if (credits.paymentStatus === 'inactive' && credits.lastRenewal < expirationDate) {
        userCreditsDb.delete(userId)
        cleaned++
      }
    }

    return cleaned
  }
}

// Interfaces de exportación
export type { UserCredits, CreditTransaction }
export { MONTHLY_CREDITS, SUBSCRIPTION_PRICE, CREDIT_VALIDITY_DAYS }
