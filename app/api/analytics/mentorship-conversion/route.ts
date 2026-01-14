import { NextRequest, NextResponse } from 'next/server'
import { mentorshipDb, revenueDb } from '@/lib/database'
import { SessionCreditsManager } from '@/lib/session-credits'

interface MentorshipConversionByCountry {
  country: string
  totalUsers: number
  usersWithMentorship: number
  conversionRate: number
  averageSessionsPerUser: number
  totalRevenue: number
  averageRevenuePerUser: number
  recommendedPrice: number
  priceAdjustmentFactor: number
}

interface CountryMetrics {
  country: string
  users: Set<string>
  mentorshipUsers: Set<string>
  sessionCount: number
  revenue: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // días
    const minUsers = parseInt(searchParams.get('minUsers') || '5') // mínimo de usuarios para considerar

    const periodDays = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - periodDays)

    // 1. Obtener todas las sesiones y créditos
    const allSessions = mentorshipDb.findAll()
    const allCredits = SessionCreditsManager.getAllCredits()
    const allRevenue = revenueDb.findAll()

    // 2. Agrupar datos por país
    const countryMetrics = new Map<string, CountryMetrics>()

    // Procesar usuarios con créditos (todos los que se suscribieron)
    for (const credit of allCredits) {
      const userId = credit.userId
      const country = credit.email.includes('@') 
        ? guessCountryFromEmail(credit.email) 
        : 'Unknown'

      if (!countryMetrics.has(country)) {
        countryMetrics.set(country, {
          country,
          users: new Set(),
          mentorshipUsers: new Set(),
          sessionCount: 0,
          revenue: 0
        })
      }

      const metrics = countryMetrics.get(country)!
      metrics.users.add(userId)
    }

    // Procesar sesiones de mentoría
    for (const session of allSessions) {
      const sessionDate = new Date(session.scheduledAt)
      
      if (sessionDate >= startDate) {
        // Extraer país del usuario
        const country = session.userCountry || guessCountryFromEmail(session.menteeEmail)

        if (countryMetrics.has(country)) {
          const metrics = countryMetrics.get(country)!
          metrics.mentorshipUsers.add(session.menteeEmail)
          metrics.sessionCount++
        }
      }
    }

    // Procesar revenue de mentorías
    for (const rev of allRevenue) {
      if (rev.type === 'mentorship' && new Date(rev.createdAt) >= startDate) {
        const country = rev.country || 'Unknown'
        
        if (countryMetrics.has(country)) {
          countryMetrics.get(country)!.revenue += rev.amount
        }
      }
    }

    // 3. Calcular conversion rate y métricas por país
    const conversionData: MentorshipConversionByCountry[] = []
    const basePriceUSD = 29 // Precio base mensual de suscripción

    for (const [country, metrics] of countryMetrics.entries()) {
      const totalUsers = metrics.users.size
      
      // Filtrar países con pocos usuarios
      if (totalUsers < minUsers) continue

      const usersWithMentorship = metrics.mentorshipUsers.size
      const conversionRate = totalUsers > 0 
        ? (usersWithMentorship / totalUsers) * 100 
        : 0

      const averageSessionsPerUser = usersWithMentorship > 0
        ? metrics.sessionCount / usersWithMentorship
        : 0

      const averageRevenuePerUser = totalUsers > 0
        ? metrics.revenue / totalUsers
        : 0

      // Calcular precio recomendado basado en:
      // - Conversion rate (más conversión = precio puede ser mayor)
      // - Revenue per user (mayor revenue = mantener o subir precio)
      // - Sessions per user (más uso = más valor percibido)

      let priceAdjustmentFactor = 1.0

      // Factor por conversion rate
      if (conversionRate > 70) {
        priceAdjustmentFactor += 0.15 // +15% si conversión muy alta
      } else if (conversionRate > 50) {
        priceAdjustmentFactor += 0.10 // +10% si conversión alta
      } else if (conversionRate < 20) {
        priceAdjustmentFactor -= 0.20 // -20% si conversión baja
      } else if (conversionRate < 35) {
        priceAdjustmentFactor -= 0.10 // -10% si conversión media-baja
      }

      // Factor por uso (sessions per user)
      if (averageSessionsPerUser > 3.5) {
        priceAdjustmentFactor += 0.10 // +10% si uso muy alto
      } else if (averageSessionsPerUser < 1.5) {
        priceAdjustmentFactor -= 0.15 // -15% si uso bajo
      }

      // Ajuste por país (PPP - Purchasing Power Parity)
      const countryPPPFactor = getCountryPPPFactor(country)
      priceAdjustmentFactor *= countryPPPFactor

      const recommendedPrice = Math.round(basePriceUSD * priceAdjustmentFactor)

      conversionData.push({
        country,
        totalUsers,
        usersWithMentorship,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageSessionsPerUser: Math.round(averageSessionsPerUser * 100) / 100,
        totalRevenue: metrics.revenue,
        averageRevenuePerUser: Math.round(averageRevenuePerUser * 100) / 100,
        recommendedPrice,
        priceAdjustmentFactor: Math.round(priceAdjustmentFactor * 100) / 100
      })
    }

    // 4. Ordenar por conversion rate descendente
    conversionData.sort((a, b) => b.conversionRate - a.conversionRate)

    // 5. Calcular insights
    const insights = generateInsights(conversionData, basePriceUSD)

    return NextResponse.json({
      success: true,
      period: periodDays,
      basePriceUSD,
      data: conversionData,
      insights,
      summary: {
        totalCountries: conversionData.length,
        averageConversionRate: conversionData.reduce((sum, d) => sum + d.conversionRate, 0) / conversionData.length,
        highestConversion: conversionData[0],
        lowestConversion: conversionData[conversionData.length - 1]
      }
    })

  } catch (error: any) {
    console.error('Error calculating mentorship conversion:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Helper functions

function guessCountryFromEmail(email: string): string {
  // Extraer dominio
  const domain = email.split('@')[1]?.toLowerCase()
  
  if (!domain) return 'Unknown'

  // Mapeo de dominios a países
  const domainCountryMap: Record<string, string> = {
    'gmail.com': 'Global',
    'yahoo.com': 'Global',
    'outlook.com': 'Global',
    'hotmail.com': 'Global',
    'yahoo.es': 'Spain',
    'hotmail.es': 'Spain',
    'gmail.es': 'Spain',
    'yahoo.com.mx': 'Mexico',
    'hotmail.com.mx': 'Mexico',
    'yahoo.com.ar': 'Argentina',
    'hotmail.com.ar': 'Argentina',
    'yahoo.com.br': 'Brazil',
    'hotmail.com.br': 'Brazil',
    'yahoo.co.uk': 'UK',
    'hotmail.co.uk': 'UK'
  }

  return domainCountryMap[domain] || 'Unknown'
}

function getCountryPPPFactor(country: string): number {
  // Purchasing Power Parity adjustment factors
  // Basado en costo de vida relativo (USA = 1.0)
  const pppFactors: Record<string, number> = {
    'USA': 1.0,
    'Canada': 0.95,
    'UK': 0.98,
    'Germany': 0.92,
    'France': 0.90,
    'Spain': 0.75,
    'Portugal': 0.65,
    'Italy': 0.85,
    'Netherlands': 0.95,
    'Sweden': 1.05,
    'Norway': 1.15,
    'Switzerland': 1.20,
    'Australia': 0.98,
    'Mexico': 0.50,
    'Argentina': 0.45,
    'Brazil': 0.55,
    'Chile': 0.60,
    'Colombia': 0.45,
    'Peru': 0.40,
    'India': 0.30,
    'Philippines': 0.35,
    'Indonesia': 0.35,
    'Vietnam': 0.30,
    'Global': 0.85, // Para dominios genéricos
    'Unknown': 0.85
  }

  return pppFactors[country] || 0.85
}

function generateInsights(data: MentorshipConversionByCountry[], basePrice: number): string[] {
  const insights: string[] = []

  if (data.length === 0) {
    return ['No hay suficientes datos para generar insights']
  }

  // Insight 1: Mejor mercado
  const bestMarket = data[0]
  insights.push(
    `🏆 **Mejor Mercado**: ${bestMarket.country} con ${bestMarket.conversionRate}% de conversión ` +
    `y ${bestMarket.averageSessionsPerUser} sesiones por usuario. Precio recomendado: $${bestMarket.recommendedPrice}/mes.`
  )

  // Insight 2: Oportunidad de crecimiento
  const lowConversionHighUsers = data.find(d => d.conversionRate < 35 && d.totalUsers > 10)
  if (lowConversionHighUsers) {
    insights.push(
      `📈 **Oportunidad**: ${lowConversionHighUsers.country} tiene ${lowConversionHighUsers.totalUsers} usuarios ` +
      `pero solo ${lowConversionHighUsers.conversionRate}% convierte. Considera reducir precio a ` +
      `$${lowConversionHighUsers.recommendedPrice}/mes para aumentar conversión.`
    )
  }

  // Insight 3: Mercados premium
  const premiumMarkets = data.filter(d => d.recommendedPrice > basePrice * 1.1)
  if (premiumMarkets.length > 0) {
    insights.push(
      `💎 **Mercados Premium**: ${premiumMarkets.map(m => m.country).join(', ')} pueden soportar ` +
      `precios más altos (${basePrice * 1.1}+ USD) debido a alta conversión y engagement.`
    )
  }

  // Insight 4: Mercados sensibles al precio
  const priceSensitiveMarkets = data.filter(d => d.recommendedPrice < basePrice * 0.8)
  if (priceSensitiveMarkets.length > 0) {
    insights.push(
      `💰 **Mercados Sensibles**: ${priceSensitiveMarkets.map(m => m.country).join(', ')} requieren ` +
      `ajuste de precio a la baja ($${Math.round(basePrice * 0.7)}-${Math.round(basePrice * 0.8)}) ` +
      `para mejorar conversión.`
    )
  }

  // Insight 5: Engagement global
  const avgSessions = data.reduce((sum, d) => sum + d.averageSessionsPerUser, 0) / data.length
  insights.push(
    `📊 **Engagement Global**: Los usuarios usan en promedio ${Math.round(avgSessions * 100) / 100} ` +
    `de sus 4 créditos mensuales (${Math.round(avgSessions / 4 * 100)}% de uso).`
  )

  return insights
}
