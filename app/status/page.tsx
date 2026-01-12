import StatusPage from '@/components/StatusPage'

export const metadata = {
  title: 'System Status | SkillsForIT',
  description: 'Real-time status of all SkillsForIT services including AI providers and database'
}

/**
 * Status Page Route
 * 
 * Muestra el estado de salud del sistema en tiempo real:
 * - LLM Providers (OpenAI, Anthropic, Google)
 * - Database (Supabase)
 * - Sistema general
 * 
 * Auto-refresh cada 30 segundos
 * 
 * Sprint 21: Disaster Recovery Plan
 */
export default function StatusRoute() {
  return <StatusPage />
}
