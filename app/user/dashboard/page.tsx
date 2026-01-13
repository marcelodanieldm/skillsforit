'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FaBook, FaCalendar, FaCheckCircle, FaCloudUploadAlt, FaTasks, FaUserGraduate } from 'react-icons/fa'
import { recommendNext } from '@/lib/recommender'

type CareerScore = { cvScore: number; softSkillsScore: number; interviewReadiness: number; total: number }
type RoadmapItem = { id: string; title: string; completed: boolean; source: 'mentor' | 'ai'; sessionId?: string; createdAt?: string }
type RoadmapResponse = { email: string; careerScore: CareerScore; aiAudits: { id: string; reportUrl?: string; score?: number; createdAt: string }[]; checklist: RoadmapItem[] }

export default function UserDashboardPage() {
  const [data, setData] = useState<RoadmapResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch('/api/user/roadmap', { headers: { Authorization: 'Bearer token_user_001' } })
        if (!res.ok) throw new Error('No se pudo cargar tu roadmap')
        const json = await res.json()
        setData(json)
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const refetch = async () => {
    try {
      const res = await fetch('/api/user/roadmap', { headers: { Authorization: 'Bearer token_user_001' } })
      if (!res.ok) throw new Error('No se pudo cargar tu roadmap')
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const onToggle = async (id: string, next: boolean) => {
    // Optimistic update
    setData(prev => prev ? ({
      ...prev,
      checklist: prev.checklist.map(i => i.id === id ? { ...i, completed: next } : i)
    }) : prev)
    try {
      await fetch('/api/user/roadmap/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token_user_001' },
        body: JSON.stringify({ id, completed: next })
      })
      // Re-sync to update Career Score
      await refetch()
    } catch (e) {
      // rollback on error
      setData(prev => prev ? ({
        ...prev,
        checklist: prev.checklist.map(i => i.id === id ? { ...i, completed: !next } : i)
      }) : prev)
    }
  }

  const suggestions = useMemo(() => {
    const completed = (data?.checklist || []).filter(i => i.completed).map(i => i.title)
    return recommendNext(completed)
  }, [data])

  const skeleton = (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
      <div className="grid md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  )

  const ProgressBar = ({ value }: { value: number }) => (
    <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-green-500 to-blue-600" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">Mi Progreso</h1>

        {/* Career Score */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="font-bold text-slate-900 dark:text-white">Career Score</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Objetivo: llegar a 100%</div>
          </div>
          {loading || !data ? (
            <div className="animate-pulse h-4 bg-slate-200 dark:bg-slate-700 rounded" />
          ) : (
            <>
              <ProgressBar value={data.careerScore.total} />
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>CV Score: <span className="font-semibold">{data.careerScore.cvScore}%</span></div>
                <div>Soft Skills: <span className="font-semibold">{data.careerScore.softSkillsScore}%</span></div>
                <div>Interview Ready: <span className="font-semibold">{data.careerScore.interviewReadiness}%</span></div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200">
            {error}
          </div>
        )}

        {loading ? skeleton : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mi Auditoría IA */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaCloudUploadAlt className="text-blue-500" />
                <h2 className="text-xl font-bold">Mi Auditoría IA</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">Re-subí tu CV si tenés créditos y revisá tus reportes anteriores.</p>
              <div className="space-y-2">
                {data?.aiAudits?.slice(0, 3).map(r => (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-300">Reporte del {new Date(r.createdAt).toLocaleDateString()}</span>
                    <a href={r.reportUrl || '#'} className="text-blue-600 hover:underline">Ver</a>
                  </div>
                ))}
              </div>
              <a href="/upload" className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">Re-subir CV</a>
            </motion.div>

            {/* Biblioteca de Activos */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaBook className="text-purple-500" />
                <h2 className="text-xl font-bold">Biblioteca de Activos</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">Acceso a la Guía de Soft Skills y materiales que tu mentor te asignó.</p>
              <ul className="list-disc ml-6 text-sm text-slate-700 dark:text-slate-300">
                <li><a href="/soft-skills-guide" className="text-purple-600 hover:underline">Guía de Soft Skills</a></li>
                <li>Material extra: Plantillas de CV, scripts de entrevista</li>
              </ul>
            </motion.div>

            {/* Hoja de Ruta */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaTasks className="text-emerald-500" />
                <h2 className="text-xl font-bold">Hoja de Ruta (Action Items)</h2>
              </div>
              <ul className="space-y-3">
                {data?.checklist?.slice(0, 6).map(item => (
                  <li key={item.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={e => onToggle(item.id, e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span className="text-slate-800 dark:text-slate-200">{item.title}</span>
                  </li>
                ))}
                {(!data || data.checklist.length === 0) && (
                  <li className="text-slate-500 dark:text-slate-400">Aún no tenés tareas asignadas.</li>
                )}
              </ul>
            </motion.div>

            {/* Agendamiento y Sesiones */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaCalendarAlt className="text-orange-500" />
                <h2 className="text-xl font-bold">Agendamiento y Sesiones</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-3">Elegí horarios y accedé a la sala de video cuando sea el momento.</p>
              <div className="space-y-3">
                <div className="flex gap-3 text-sm">
                  <a href="/mentors" className="px-3 py-2 bg-orange-600 text-white rounded-lg">Reservar mentoría</a>
                  <a href="/mentor/dashboard" className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg">Ver mis sesiones</a>
                </div>
                <div className="grid grid-cols-7 gap-2 text-xs">
                  {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map((d,i)=> (
                    <div key={i} className="text-center text-slate-500 dark:text-slate-400">{d}</div>
                  ))}
                  {[...Array(7)].map((_,i)=> (
                    <div key={i} className="h-16 rounded-lg border border-slate-200 dark:border-slate-700 p-1">
                      <div className="h-full flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400">09:00</span>
                        <span className="text-[10px] text-slate-400">13:00</span>
                        <span className="text-[10px] text-slate-400">18:00</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Sugerencias de la Guía */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <FaCheckCircle className="text-emerald-500" />
                <h2 className="text-xl font-bold">Sugerencias de la Guía</h2>
              </div>
              {suggestions.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">Completá algunos Action Items para recibir recomendaciones personalizadas.</p>
              ) : (
                <ul className="list-disc ml-6 text-slate-700 dark:text-slate-300">
                  {suggestions.map((s, i) => (
                    <li key={i} className="mb-2">
                      <span className="font-semibold">{s.title}</span>
                      <span className="ml-2 text-slate-500">— {s.reason}</span>
                      {s.link && <a href={s.link} className="ml-3 text-purple-600 hover:underline">Abrir</a>}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        )}

        <div className="mt-8 text-xs text-slate-500 flex items-center gap-2">
          <FaUserGraduate />
          Interfaz diseñada para reducir ansiedad y centralizar tu estrategia de carrera.
        </div>
      </div>
    </div>
  )
}
