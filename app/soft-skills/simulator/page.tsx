import HybridSoftSkillsSimulator from '@/components/HybridSoftSkillsSimulator'

export const metadata = {
  title: 'Simulador Híbrido de Entrevista - Texto o Voz | SkillsForIT',
  description: 'Responde con texto o voz: 3 preguntas STAR para descubrir cómo te comunicas mejor. Análisis comparativo con IA en 3 minutos.'
}

/**
 * Hybrid Soft Skills Simulator Landing Page
 * 
 * Sprint 41: Simulador híbrido (texto + voz)
 * 
 * Flujo:
 * 1. Chat interactivo con opción de escribir O grabar
 * 2. Usuario puede alternar entre texto y voz en cada pregunta
 * 3. Análisis diferenciado: gramática/vocabulario (texto) vs tono/muletillas (voz)
 * 4. Radar chart + comparativa: comunicación escrita vs verbal
 * 5. Mensaje motivador si solo usa texto
 * 6. Lead capture + reporte personalizado
 * 7. Upsell de E-book con CTA específico según debilidad detectada
 * 
 * Métricas clave:
 * - Input Split: 60% voz / 40% texto (target)
 * - Completion Rate: >85% (permitir texto aumenta completación)
 * - Text-to-Ebook Conversion: >10%
 */
export default function SoftSkillsSimulatorPage() {
  return <HybridSoftSkillsSimulator />
}
