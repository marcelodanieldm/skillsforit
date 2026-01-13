'use client'

import { FaStar, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'

interface CVViewerProps {
  cvReport: {
    id: string
    analysis_result: any
    overall_score: number
  }
}

export default function CVViewer({ cvReport }: CVViewerProps) {
  const { analysis_result, overall_score } = cvReport

  // Parsear resultado de análisis si es string
  const parsedResult = typeof analysis_result === 'string' 
    ? JSON.parse(analysis_result) 
    : analysis_result

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-4">
      {/* Score General */}
      <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold">Score General</h3>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={i < Math.round(overall_score / 20) ? 'text-yellow-400' : 'text-slate-600'}
              />
            ))}
          </div>
        </div>
        <div className={`text-4xl font-bold ${getScoreColor(overall_score)}`}>
          {overall_score}/100
        </div>
      </div>

      {/* Fortalezas */}
      {parsedResult?.strengths && parsedResult.strengths.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4 border border-green-500/30">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaCheckCircle className="text-green-400" />
            Fortalezas
          </h3>
          <ul className="space-y-2">
            {parsedResult.strengths.slice(0, 3).map((strength: string, idx: number) => (
              <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Áreas de Mejora */}
      {parsedResult?.weaknesses && parsedResult.weaknesses.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4 border border-yellow-500/30">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-400" />
            Áreas de Mejora
          </h3>
          <ul className="space-y-2">
            {parsedResult.weaknesses.slice(0, 3).map((weakness: string, idx: number) => (
              <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                <span className="text-yellow-400 mt-1">•</span>
                <span>{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recomendaciones de la IA */}
      {parsedResult?.recommendations && parsedResult.recommendations.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-4 border border-blue-500/30">
          <h3 className="text-white font-semibold mb-3">Recomendaciones IA</h3>
          <ul className="space-y-2">
            {parsedResult.recommendations.slice(0, 3).map((rec: string, idx: number) => (
              <li key={idx} className="text-slate-300 text-sm flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
