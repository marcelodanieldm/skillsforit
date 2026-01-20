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
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">¡Auditoría de CV Completada!</h1>
        <p className="text-gray-600">Analizamos tu CV contra 50+ criterios profesionales para roles IT</p>
      </motion.div>

      {/* Score General Grande */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
        <div className={`text-7xl font-extrabold ${getScoreColor(result.score)} mb-2`}>{result.score}/100</div>
        <div className="text-gray-600 text-lg">Puntaje General</div>
      </motion.div>

      {/* Semáforo de Errores (sin solución) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaExclamationTriangle className="text-red-500" />Errores Detectados</h2>
        <div className="space-y-4">
          {result.problems.length === 0 ? <div className="text-gray-500">No se detectaron errores.</div> : result.problems.map((problem, index) => (
            <div key={index} className="border-l-4 border-red-500 pl-4 flex items-center gap-3">
              <span className={`font-semibold ${getSeverityColor(problem.severity)}`}>{problem.severity === 'high' ? '🔴' : problem.severity === 'medium' ? '🟠' : '🟢'}</span>
              <span className="text-gray-800 font-medium">{problem.description}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Bloqueado: Consejos Específicos (blur) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaLock className="text-gray-400" />Consejos Específicos</h2>
        <div className="filter blur-sm select-none pointer-events-none opacity-60 bg-gray-100 rounded p-4 text-gray-700">
          {result.improvements && result.improvements.length > 0 ? (
            <ul className="list-disc pl-6">
              {result.improvements.slice(0, 3).map((imp, idx) => (
                <li key={idx}>{imp.explanation}</li>
              ))}
            </ul>
          ) : (
            <div>No hay consejos disponibles.</div>
          )}
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2 text-gray-400"><FaLock /> <span className="font-semibold">Bloqueado</span></div>
      </motion.div>

      {/* Bloqueado: Keyword Gap (candado) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><FaLock className="text-gray-400" />Keyword Gap</h2>
        <div className="flex flex-col items-center gap-2 filter blur-sm select-none pointer-events-none opacity-60">
          <ul className="list-disc pl-6">
            {result.recommendations && result.recommendations.length > 0 ? (
              result.recommendations.slice(0, 5).map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))
            ) : (
              <li>No hay keywords detectadas.</li>
            )}
          </ul>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2 text-gray-400"><FaLock /> <span className="font-semibold">Bloqueado</span></div>
      </motion.div>

      {/* CTA para desbloquear */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          ¿Quieres ver cómo mejorar tu CV?
        </h3>
        <p className="text-gray-600 mb-6">
          Desbloquea consejos detallados, keywords específicas y un plan de mejora personalizado.
        </p>
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
              Desbloquear Auditoría Completa
            </>
          )}
        </button>
      </div>
    </div>
  );
}