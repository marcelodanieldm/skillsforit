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

  // Si el reporte está desbloqueado, mostrar el upsell estratégico al final
  const isUnlocked = !result.isPreview;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* ...existing code... */}

      {/* CTA para desbloquear o upsell mentoría */}
      {isUnlocked ? (
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 text-center border-2 border-green-200">
          <h3 className="text-2xl font-bold text-green-800 mb-4">
            ¡Tu score ahora puede subir a <span className="text-blue-700">90/100</span>!
          </h3>
          <p className="text-gray-700 mb-6">
            Un mentor puede revisar estos cambios contigo en una sesión de <b>10 min</b>.<br />
            <span className="text-blue-700 font-semibold">¿Listo para llevar tu CV al siguiente nivel?</span>
          </p>
          <a
            href="/mentorias"
            className="inline-block bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg text-lg"
          >
            Agendar Mentoría
          </a>
        </div>
      ) : (
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
      )}
    </div>
  );
}