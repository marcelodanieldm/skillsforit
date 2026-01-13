'use client'

import { motion } from 'framer-motion'
import { FaRobot, FaCheck, FaTimes, FaArrowRight } from 'react-icons/fa'

interface OrderBumpProps {
  onChoice: (include: boolean) => void
  currentTotal: number
}

export default function OrderBump({ onChoice, currentTotal }: OrderBumpProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-full text-green-800 text-sm font-medium mb-4">
          <FaRobot />
          Oferta Especial por Tiempo Limitado
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Aprovecha esta oportunidad única!
        </h1>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <FaRobot className="text-white text-xl" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ¿Quieres auditar tu CV con nuestra IA por solo +7 USD?
            </h3>
            <p className="text-gray-700 mb-4">
              Obtén feedback inmediato para pasar los filtros ATS. Nuestra IA analiza tu CV
              y te da recomendaciones específicas para aumentar tus posibilidades de entrevista.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheck className="text-green-500" />
                  <span className="font-medium text-gray-900">Análisis ATS Score</span>
                </div>
                <p className="text-sm text-gray-600">Compatibilidad con sistemas de reclutamiento</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheck className="text-green-500" />
                  <span className="font-medium text-gray-900">Keywords Optimization</span>
                </div>
                <p className="text-sm text-gray-600">Palabras clave que buscan los recruiters</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheck className="text-green-500" />
                  <span className="font-medium text-gray-900">Estructura y Formato</span>
                </div>
                <p className="text-sm text-gray-600">Mejores prácticas de formato profesional</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <FaCheck className="text-green-500" />
                  <span className="font-medium text-gray-900">Reporte Detallado</span>
                </div>
                <p className="text-sm text-gray-600">PDF con recomendaciones específicas</p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-orange-800">
                <span className="font-bold">Precio normal: USD 15</span>
                <span className="text-lg">→</span>
                <span className="font-bold text-green-600">Solo USD 7 adicionales</span>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                Ahorras USD 8 aprovechando esta oferta especial
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onChoice(false)}
          className="flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-4 px-6 rounded-lg transition-colors duration-300"
        >
          <FaTimes />
          No, gracias
          <span className="text-sm">(Continuar con USD {currentTotal})</span>
        </button>

        <button
          onClick={() => onChoice(true)}
          className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
        >
          <FaCheck />
          ¡Sí! Añadir CV Audit
          <span className="text-sm">(Total: USD {currentTotal + 7})</span>
          <FaArrowRight />
        </button>
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        💡 Esta oferta solo está disponible en este momento de compra
      </div>
    </div>
  )
}