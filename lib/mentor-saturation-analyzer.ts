/**
 * Mentor Saturation Analyzer
 * 
 * Calcula la saturación de capacidad de mentores y predice cuándo se necesita
 * contratar más mentores basándose en el crecimiento de demanda.
 * 
 * Fórmulas:
 * - Capacidad Total = Σ(mentores activos × horas disponibles × sesiones por hora)
 * - Demanda Actual = Total de sesiones reservadas en período
 * - Utilización = (Demanda / Capacidad) × 100
 * - Proyección = Demanda actual × (1 + tasa de crecimiento) ^ semanas
 */

import { mentorshipDb, getAllMentors } from '@/lib/database'

interface MentorCapacity {
  mentorId: string
  mentorName: string
  weeklyHours: number // Horas disponibles por semana
  sessionsPerHour: number // Sesiones que puede atender por hora (6 para 10min sessions)
  weeklyCapacity: number // Total de sesiones por semana
}

interface DemandMetrics {
  currentWeekSessions: number
  lastWeekSessions: number
  twoWeeksAgoSessions: number
  threeWeeksAgoSessions: number
  growthRate: number // Tasa de crecimiento semanal (%)
  averageWeeklySessions: number
}

interface SaturationAnalysis {
  timestamp: Date
  
  // Capacidad
  totalMentors: number
  activeMentors: number
  totalWeeklyCapacity: number
  
  // Demanda
  currentWeekDemand: number
  averageWeeklyDemand: number
  growthRate: number
  
  // Saturación
  utilizationRate: number // %
  availableCapacity: number
  
  // Proyecciones (1-4 semanas)
  projections: {
    weeks: number
    projectedDemand: number
    projectedUtilization: number
    capacityShortfall: number
  }[]
  
  // Recomendaciones
  needsHiring: boolean
  recommendedHires: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  reasoning: string[]
  
  // Detalles por mentor
  mentorCapacities: MentorCapacity[]
}

/**
 * Calcula la capacidad semanal de un mentor
 */
function calculateMentorCapacity(mentor: any): MentorCapacity {
  // Asumimos que cada mentor tiene disponibilidad en su perfil
  // Si no está especificado, usamos valores por defecto
  const weeklyHours = mentor.weeklyHours || 10 // 10 horas por semana por defecto
  const sessionsPerHour = 6 // 10 min por sesión = 6 sesiones por hora
  
  return {
    mentorId: mentor.id,
    mentorName: mentor.name,
    weeklyHours,
    sessionsPerHour,
    weeklyCapacity: weeklyHours * sessionsPerHour
  }
}

/**
 * Obtiene las sesiones de una semana específica
 */
function getSessionsInWeek(weekOffset: number = 0): number {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay() - (weekOffset * 7))
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  
  const allSessions = mentorshipDb.getAll()
  
  return allSessions.filter(session => {
    const sessionDate = new Date(session.scheduledAt)
    return sessionDate >= startOfWeek && sessionDate < endOfWeek && 
           (session.status === 'scheduled' || session.status === 'completed')
  }).length
}

/**
 * Calcula métricas de demanda
 */
function calculateDemandMetrics(): DemandMetrics {
  const currentWeek = getSessionsInWeek(0)
  const lastWeek = getSessionsInWeek(1)
  const twoWeeksAgo = getSessionsInWeek(2)
  const threeWeeksAgo = getSessionsInWeek(3)
  
  // Tasa de crecimiento semanal promedio
  const weeks = [currentWeek, lastWeek, twoWeeksAgo, threeWeeksAgo].filter(w => w > 0)
  const average = weeks.reduce((a, b) => a + b, 0) / weeks.length
  
  // Calcular tasa de crecimiento entre última semana y actual
  let growthRate = 0
  if (lastWeek > 0) {
    growthRate = ((currentWeek - lastWeek) / lastWeek) * 100
  }
  
  return {
    currentWeekSessions: currentWeek,
    lastWeekSessions: lastWeek,
    twoWeeksAgoSessions: twoWeeksAgo,
    threeWeeksAgoSessions: threeWeeksAgo,
    growthRate,
    averageWeeklySessions: average
  }
}

/**
 * Proyecta la demanda futura
 */
function projectDemand(
  currentDemand: number, 
  growthRate: number, 
  weeks: number
): number {
  // Convertir growth rate de % a decimal
  const growthMultiplier = 1 + (growthRate / 100)
  
  // Fórmula de crecimiento compuesto: D = D₀ × (1 + r)^t
  return Math.round(currentDemand * Math.pow(growthMultiplier, weeks))
}

/**
 * Determina la urgencia de contratar
 */
function determineUrgency(utilizationRate: number): 'low' | 'medium' | 'high' | 'critical' {
  if (utilizationRate >= 95) return 'critical'
  if (utilizationRate >= 85) return 'high'
  if (utilizationRate >= 75) return 'medium'
  return 'low'
}

/**
 * Calcula cuántos mentores se necesitan contratar
 */
function calculateRecommendedHires(
  capacityShortfall: number,
  averageMentorCapacity: number
): number {
  if (capacityShortfall <= 0) return 0
  
  // Redondear hacia arriba para cubrir el déficit
  return Math.ceil(capacityShortfall / averageMentorCapacity)
}

/**
 * Genera el análisis completo de saturación
 */
export function analyzeMentorSaturation(): SaturationAnalysis {
  // 1. Obtener mentores y calcular capacidad
  const allMentors = getAllMentors()
  const activeMentors = allMentors.filter(m => m.availability && m.availability.length > 0)
  
  const mentorCapacities = activeMentors.map(calculateMentorCapacity)
  const totalWeeklyCapacity = mentorCapacities.reduce((sum, m) => sum + m.weeklyCapacity, 0)
  const averageMentorCapacity = totalWeeklyCapacity / Math.max(activeMentors.length, 1)
  
  // 2. Calcular demanda
  const demandMetrics = calculateDemandMetrics()
  
  // 3. Calcular utilización actual
  const utilizationRate = (demandMetrics.currentWeekSessions / totalWeeklyCapacity) * 100
  const availableCapacity = totalWeeklyCapacity - demandMetrics.currentWeekSessions
  
  // 4. Proyecciones (1-4 semanas)
  const projections = [1, 2, 3, 4].map(weeks => {
    const projectedDemand = projectDemand(
      demandMetrics.currentWeekSessions,
      demandMetrics.growthRate,
      weeks
    )
    const projectedUtilization = (projectedDemand / totalWeeklyCapacity) * 100
    const capacityShortfall = Math.max(0, projectedDemand - totalWeeklyCapacity)
    
    return {
      weeks,
      projectedDemand,
      projectedUtilization,
      capacityShortfall
    }
  })
  
  // 5. Determinar si se necesita contratar
  const futureUtilization = projections[1].projectedUtilization // 2 semanas
  const needsHiring = futureUtilization > 80
  const urgency = determineUrgency(futureUtilization)
  
  // Calcular recomendación basada en proyección de 4 semanas
  const fourWeekShortfall = projections[3].capacityShortfall
  const recommendedHires = calculateRecommendedHires(fourWeekShortfall, averageMentorCapacity)
  
  // 6. Generar razonamiento
  const reasoning: string[] = []
  
  if (utilizationRate > 80) {
    reasoning.push(`⚠️ Utilización actual: ${utilizationRate.toFixed(1)}% (objetivo: <80%)`)
  }
  
  if (demandMetrics.growthRate > 10) {
    reasoning.push(`📈 Crecimiento semanal: +${demandMetrics.growthRate.toFixed(1)}%`)
  }
  
  if (projections[1].projectedUtilization > 90) {
    reasoning.push(`🚨 En 2 semanas: ${projections[1].projectedUtilization.toFixed(1)}% de utilización`)
  }
  
  if (recommendedHires > 0) {
    reasoning.push(`👥 Contratar ${recommendedHires} mentor(es) en las próximas 2 semanas`)
  } else if (utilizationRate < 50) {
    reasoning.push(`✅ Capacidad sobrada: ${availableCapacity} sesiones disponibles`)
  }
  
  if (activeMentors.length < 3) {
    reasoning.push(`⚠️ Solo ${activeMentors.length} mentores activos. Mínimo recomendado: 3`)
  }
  
  return {
    timestamp: new Date(),
    totalMentors: allMentors.length,
    activeMentors: activeMentors.length,
    totalWeeklyCapacity,
    currentWeekDemand: demandMetrics.currentWeekSessions,
    averageWeeklyDemand: demandMetrics.averageWeeklySessions,
    growthRate: demandMetrics.growthRate,
    utilizationRate,
    availableCapacity,
    projections,
    needsHiring,
    recommendedHires,
    urgency,
    reasoning,
    mentorCapacities
  }
}

/**
 * Genera un reporte en texto del análisis
 */
export function generateSaturationReport(analysis: SaturationAnalysis): string {
  const urgencyEmoji = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    critical: '🔴'
  }
  
  return `
📊 REPORTE DE SATURACIÓN DE MENTORES
Generated: ${analysis.timestamp.toLocaleString('es')}

═══════════════════════════════════════════

👥 CAPACIDAD
• Total de mentores: ${analysis.totalMentors}
• Mentores activos: ${analysis.activeMentors}
• Capacidad semanal: ${analysis.totalWeeklyCapacity} sesiones

📈 DEMANDA
• Esta semana: ${analysis.currentWeekDemand} sesiones
• Promedio semanal: ${analysis.averageWeeklyDemand.toFixed(1)} sesiones
• Tasa de crecimiento: ${analysis.growthRate > 0 ? '+' : ''}${analysis.growthRate.toFixed(1)}%

⚡ UTILIZACIÓN
• Actual: ${analysis.utilizationRate.toFixed(1)}%
• Capacidad disponible: ${analysis.availableCapacity} sesiones
• Estado: ${urgencyEmoji[analysis.urgency]} ${analysis.urgency.toUpperCase()}

🔮 PROYECCIONES
${analysis.projections.map(p => `
  ${p.weeks} semana${p.weeks > 1 ? 's' : ''}:
  • Demanda: ${p.projectedDemand} sesiones
  • Utilización: ${p.projectedUtilization.toFixed(1)}%
  • Déficit: ${p.capacityShortfall} sesiones
`).join('')}

💡 RECOMENDACIONES
${analysis.reasoning.map(r => `• ${r}`).join('\n')}

${analysis.needsHiring ? `
🎯 ACCIÓN REQUERIDA
Contratar ${analysis.recommendedHires} mentor(es) adicional(es)
Urgencia: ${urgencyEmoji[analysis.urgency]} ${analysis.urgency.toUpperCase()}
` : `
✅ CAPACIDAD SUFICIENTE
No se requiere contratación en este momento.
`}

═══════════════════════════════════════════
  `.trim()
}

/**
 * Calcula métricas adicionales para el CEO
 */
export function getCEOMetrics(analysis: SaturationAnalysis) {
  return {
    healthScore: Math.max(0, 100 - analysis.utilizationRate), // 100 = perfectamente sano
    weeksUntilCritical: analysis.projections.findIndex(p => p.projectedUtilization > 95) + 1 || null,
    revenueCapacity: analysis.totalWeeklyCapacity * 10, // Asumiendo $10 por sesión
    projectedRevenue: analysis.projections[3].projectedDemand * 10, // 4 semanas
    utilizationTrend: analysis.growthRate > 0 ? 'increasing' : 'stable',
    mentorEfficiency: (analysis.averageWeeklyDemand / analysis.activeMentors).toFixed(1)
  }
}
