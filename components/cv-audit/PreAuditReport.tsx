'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaLock, FaUnlock, FaCheck, FaExclamationTriangle, FaRocket } from 'react-icons/fa'

interface PreAuditResult {
  analysisId: string
  score: number
  atsScore: number
  problems: Array<{
    category: string
    severity: 'high' | 'medium' | 'low'
    description: string
    impact: string
  }>
  improvements: Array<{
    category: string
    before: string
    after: string
    explanation: string
    impact: string
  }>
  strengths: string[]
  recommendations: string[]
  isPreview: boolean
}

interface PreAuditReportProps {
  result: PreAuditResult
  onUnlock: () => void
}

export default function PreAuditReport({ result, onUnlock }: PreAuditReportProps) {
  const [unlocking, setUnlocking] = useState(false);

  const traducciones = {
    overallScore: 'Puntaje General',
    atsScore: 'Puntaje ATS',
    categoryScores: 'Puntaje por Categoría',
    atsOptimization: 'Optimización ATS',
    technicalSkills: 'Habilidades Técnicas',
    experience: 'Experiencia',
    impact: 'Impacto',
    structure: 'Estructura',
    profile: 'Perfil',
    education: 'Educación',
    strengths: 'Fortalezas',
    problems: 'Problemas',
    issue: 'Problema',
    severity: 'Severidad',
    location: 'Ubicación',
    improvements: 'Mejoras',
    recommendations: 'Recomendaciones'
  };

  function traducir(obj: any): any {
    if (Array.isArray(obj)) return obj.map(traducir);
    if (obj && typeof obj === 'object') {
      const nuevo: any = {};
      for (const k in obj) {
        const clave = traducciones[k] || k;
        nuevo[clave] = traducir(obj[k]);
      }
      return nuevo;
    }
    return obj;
  }

  const handleUnlock = async () => {
    setUnlocking(true);
    await onUnlock();
    setUnlocking(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Auditoría de CV Completada!</h1>
        <p className="text-gray-600">Analizamos tu CV contra 50+ criterios profesionales para roles IT</p>
      </motion.div>

      {/* Score Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(result.score)} mb-2`}>{result.score}/100</div>
            <div className="text-gray-600">Score General</div>
          </div>
          <div className="text-center">
            <div className={`text-5xl font-bold ${getScoreColor(result.atsScore)} mb-2`}>{result.atsScore}/100</div>
            <div className="text-gray-600">Score ATS</div>
          </div>
        </div>
      </motion.div>
      {/* Critical Problems */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaExclamationTriangle className="text-red-500" />Errores Críticos Detectados</h2>
        <div className="space-y-4">
          {result.problems.length === 0 ? <div className="text-gray-500">No se detectaron errores críticos.</div> : result.problems.map((problem, index) => (
            <div key={index} className="border-l-4 border-red-500 pl-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-semibold ${getSeverityColor(problem.severity)}`}>{problem.severity.toUpperCase()}</span>
                <span className="text-gray-600">• {problem.category}</span>
              </div>
              <p className="text-gray-800 mb-2">{problem.description}</p>
              <p className="text-sm text-gray-600 italic">{problem.impact}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Strengths */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaRocket className="text-green-500" />Fortalezas Detectadas</h2>
        {result.strengths.length === 0 ? <div className="text-gray-500">No se detectaron fortalezas.</div> : <ul className="list-disc pl-6 text-gray-800">{result.strengths.map((strength, idx) => (<li key={idx}>{strength}</li>))}</ul>}
      </motion.div>

      {/* Recommendations: mostrar JSON si existe */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaCheck className="text-blue-500" />Recomendaciones Generales</h2>
        <div className="bg-gray-100 rounded p-4 text-sm text-gray-800 whitespace-pre-wrap">
          {result.recommendations.length === 0 ? <div className="text-gray-500">No se detectaron recomendaciones.</div> : result.recommendations.map((rec, idx) => {
            try {
              const json = JSON.parse(rec);
              const jsonTraducido = traducir(json);
              return <pre key={idx}>{JSON.stringify(jsonTraducido, null, 2)}</pre>;
            } catch {
              return <div key={idx}>{rec}</div>;
            }
          })}
        </div>
      </motion.div>

      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Desbloquea tu Auditoría Completa!
        </h3>
        <p className="text-gray-600 mb-6">
          Obtén consejos detallados, keywords específicas y un plan de mejora personalizado
          para aumentar tu score en un 30-50%.
        </p>

        <div className="bg-white rounded-lg p-4 mb-6 inline-block">
          <div className="text-sm text-gray-600">Una sola vez • Acceso inmediato</div>
        </div>

        <button
          onClick={handleUnlock}
          disabled={unlocking}
          className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 flex items-center gap-2 mx-auto disabled:opacity-50"
        >
          {unlocking ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Procesando...
            </>
          ) : (
            <>
              <FaUnlock />
              Desbloquear mi Auditoría Completa
            </>
          )}
        </button>

        <p className="text-sm text-gray-500 mt-4">
          ✅ Pago seguro con Stripe • ✅ Resultados inmediatos • ✅ Sin suscripción
        </p>
      </div>
    </div>
  );
}