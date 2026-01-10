'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SeedAnalyticsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  const generateTestData = async () => {
    setLoading(true)
    setResult(null)

    try {
      // Generate 30 test users across different segments
      const users = []
      const professions = [
        // Junior (0-3 years)
        { name: 'Junior Frontend Developer', segment: 'Junior', years: 1 },
        { name: 'Entry Level Backend Developer', segment: 'Junior', years: 2 },
        { name: 'Graduate Software Engineer', segment: 'Junior', years: 0 },
        { name: 'Intern Data Analyst', segment: 'Junior', years: 1 },
        { name: 'Trainee DevOps Engineer', segment: 'Junior', years: 1 },
        
        // Transition (3-7 years)
        { name: 'Frontend Developer', segment: 'Transition', years: 4 },
        { name: 'Backend Developer', segment: 'Transition', years: 5 },
        { name: 'Full Stack Developer', segment: 'Transition', years: 6 },
        { name: 'Mid-Level Data Scientist', segment: 'Transition', years: 4 },
        { name: 'DevOps Engineer', segment: 'Transition', years: 5 },
        
        // Leadership (7+ years)
        { name: 'Senior Frontend Developer', segment: 'Leadership', years: 10 },
        { name: 'Lead Backend Engineer', segment: 'Leadership', years: 12 },
        { name: 'Principal Software Architect', segment: 'Leadership', years: 15 },
        { name: 'Engineering Manager', segment: 'Leadership', years: 9 },
        { name: 'Director of Engineering', segment: 'Leadership', years: 14 }
      ]

      const countries = ['USA', 'Spain', 'Mexico', 'Argentina', 'Colombia', 'Chile', 'UK', 'Germany']
      const purposes = [
        'Get a better job',
        'Career transition',
        'Salary increase',
        'Leadership role',
        'Remote opportunities'
      ]

      // Create users
      for (let i = 0; i < 30; i++) {
        const prof = professions[i % professions.length]
        const userRes = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `test.user${i}@example.com`,
            name: `Test User ${i}`,
            country: countries[i % countries.length],
            profession: prof.name,
            purpose: purposes[i % purposes.length],
            role: 'it_user',
            metadata: {
              yearsOfExperience: prof.years,
              currentPosition: prof.name,
              desiredPosition: prof.segment === 'Junior' ? 'Mid-Level' : 'Senior/Lead'
            }
          })
        })

        const userData = await userRes.json()
        users.push(userData.user)

        // Simulate user journey with events
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const userId = userData.user.id
        const segment = userData.user.segment

        // Everyone lands on the page
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: 'page_view',
            userId,
            sessionId,
            metadata: {
              page: '/',
              userSegment: segment,
              deviceType: i % 3 === 0 ? 'mobile' : 'desktop'
            }
          })
        })

        // 80% start filling the form
        if (Math.random() < 0.8) {
          await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventType: 'form_start',
              userId,
              sessionId,
              metadata: { userSegment: segment }
            })
          })

          // 70% complete the form
          if (Math.random() < 0.7) {
            await fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                eventType: 'form_complete',
                userId,
                sessionId,
                metadata: {
                  userSegment: segment,
                  profession: prof.name,
                  country: countries[i % countries.length]
                }
              })
            })

            // 60% go to checkout
            if (Math.random() < 0.6) {
              const service = Math.random() < 0.5 ? 'cv_analysis' : 'mentorship'
              
              await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventType: 'start_checkout',
                  userId,
                  sessionId,
                  metadata: {
                    userSegment: segment,
                    service,
                    profession: prof.name
                  }
                })
              })

              // 50% initiate payment
              if (Math.random() < 0.5) {
                await fetch('/api/events', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    eventType: 'payment_initiated',
                    userId,
                    sessionId,
                    metadata: {
                      userSegment: segment,
                      service,
                      amount: service === 'cv_analysis' ? 7 : 15
                    }
                  })
                })

                // 80% of payments succeed
                if (Math.random() < 0.8) {
                  await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      eventType: 'payment_success',
                      userId,
                      sessionId,
                      metadata: {
                        userSegment: segment,
                        service,
                        amount: service === 'cv_analysis' ? 7 : 15
                      }
                    })
                  })
                } else {
                  await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      eventType: 'payment_failed',
                      userId,
                      sessionId,
                      metadata: {
                        userSegment: segment,
                        service,
                        error: 'Payment declined'
                      }
                    })
                  })
                }
              }
            }
          }
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setResult({
        success: true,
        message: `✅ Generated ${users.length} users with complete analytics journey!`,
        stats: {
          users: users.length,
          segments: {
            Junior: users.filter(u => u.segment === 'Junior').length,
            Transition: users.filter(u => u.segment === 'Transition').length,
            Leadership: users.filter(u => u.segment === 'Leadership').length
          }
        }
      })
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📊 Generar Datos de Analytics
        </h1>
        <p className="text-gray-600 mb-8">
          Genera datos de prueba para el sistema de event tracking y user segmentation (Sprint 5)
        </p>

        {!result && !loading && (
          <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg mb-6">
            <p className="text-blue-900 font-semibold mb-2">📝 Qué se va a generar:</p>
            <ul className="text-blue-800 space-y-1 list-disc list-inside">
              <li>30 usuarios distribuidos en 3 segmentos (Junior, Transition, Leadership)</li>
              <li>~120 eventos de comportamiento (page_view, form, checkout, payment)</li>
              <li>Simulación completa del embudo de conversión</li>
              <li>Diferentes tasas de abandono por etapa</li>
              <li>Métricas de conversión por segmento</li>
            </ul>
            <p className="text-blue-900 font-bold mt-4">
              ⏱️ Tiempo estimado: ~30 segundos
            </p>
          </div>
        )}

        <button
          onClick={generateTestData}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg mb-6"
        >
          {loading ? '⏳ Generando datos...' : '🚀 Generar Datos de Analytics'}
        </button>

        {loading && (
          <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              <div>
                <p className="text-yellow-900 font-semibold">Generando datos de prueba...</p>
                <p className="text-yellow-700 text-sm">Por favor espera ~30 segundos</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className={`p-6 rounded-lg ${result.success ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
            {result.success ? (
              <>
                <p className="text-green-800 font-semibold mb-4">
                  {result.message}
                </p>
                
                {result.stats && (
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="font-semibold text-gray-900 mb-2">📊 Estadísticas:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Usuarios</p>
                        <p className="text-2xl font-bold text-gray-900">{result.stats.users}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Segmentos</p>
                        <div className="space-y-1">
                          <p className="text-sm">👶 Junior: {result.stats.segments.Junior}</p>
                          <p className="text-sm">🔄 Transition: {result.stats.segments.Transition}</p>
                          <p className="text-sm">👔 Leadership: {result.stats.segments.Leadership}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => router.push('/analytics')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  📊 Ver Analytics Dashboard
                </button>
              </>
            ) : (
              <p className="text-red-800">
                ❌ Error: {result.error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
