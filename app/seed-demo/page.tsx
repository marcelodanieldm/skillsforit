'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SeedDemoPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  const handleSeed = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/seed', {
        method: 'POST'
      })
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🌱 Generador de Datos de Prueba
        </h1>
        <p className="text-gray-600 mb-8">
          Haz clic en el botón para generar datos de ejemplo en el dashboard de análisis.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleSeed}
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
          >
            {loading ? '⏳ Generando datos...' : '🚀 Generar Datos de Prueba'}
          </button>

          {result && (
            <div className={`p-6 rounded-lg ${result.error ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
              {result.success ? (
                <>
                  <p className="text-green-800 font-semibold mb-4">
                    ✅ {result.message}
                  </p>
                  <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    📊 Ver Dashboard
                  </button>
                </>
              ) : (
                <p className="text-red-800">
                  ❌ Error: {result.error}
                </p>
              )}
            </div>
          )}

          {!result && !loading && (
            <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
              <p className="text-blue-900 font-semibold mb-2">ℹ️ Qué datos se generarán:</p>
              <ul className="text-blue-800 space-y-1 list-disc list-inside">
                <li>50 análisis de CV (~$350)</li>
                <li>20 sesiones de mentoría (~$650)</li>
                <li>5 mentores activos</li>
                <li>~10 notas de sesiones</li>
              </ul>
              <p className="text-blue-900 font-bold mt-4">
                💰 Ingresos totales: ~$1,000
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
