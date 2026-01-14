import SoftSkillsSimulator from '@/components/SoftSkillsSimulator'

export const metadata = {
  title: 'Simulador de Entrevista - ¿Superarías Google o Amazon? | SkillsForIT',
  description: 'Responde 3 preguntas STAR y descubre si tus soft skills te están bloqueando en entrevistas técnicas. Análisis con IA en 2 minutos.'
}

/**
 * Soft Skills Simulator Landing Page
 * 
 * Sprint 37: Top-of-funnel lead magnet
 * 
 * Flujo:
 * 1. Landing con CTA "Iniciar Simulación Gratis"
 * 2. Chat interactivo con 3 preguntas STAR
 * 3. Análisis con IA (STAR method, communication style, red flags)
 * 4. Radar chart con resultados preliminares
 * 5. Email gate para desbloquear análisis completo
 * 6. Redirección a página de resultados + oferta de ebook
 */
export default function SoftSkillsSimulatorPage() {
  return <SoftSkillsSimulator />
}
