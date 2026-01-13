export type Recommendation = {
  type: 'ebook_chapter' | 'mentor_profile'
  title: string
  reason: string
  link?: string
}

const ACTION_TO_MODULE: Record<string, { chapter: string; reason: string }> = {
  'Elevator Pitch': { chapter: 'Storytelling Técnico', reason: 'Refuerza tu discurso de valor en entrevistas' },
  'Rehacer sección de experiencia': { chapter: 'Comunicación Asertiva', reason: 'Mejora la claridad y estructura de logros' },
  'Practicar entrevista': { chapter: 'Interview Readiness', reason: 'Simula respuestas con estructura STAR++' },
}

export function recommendNext(itemsCompleted: string[]): Recommendation[] {
  const recs: Recommendation[] = []

  for (const item of itemsCompleted) {
    const map = ACTION_TO_MODULE[item]
    if (map) {
      recs.push({
        type: 'ebook_chapter',
        title: `Lee: ${map.chapter}`,
        reason: map.reason,
        link: '/soft-skills-guide#contenido'
      })
    }
  }

  if (!recs.length) {
    recs.push({
      type: 'mentor_profile',
      title: 'Agenda con un Mentor de Storytelling',
      reason: 'Acelerá tu preparación con práctica guiada',
      link: '/mentors'
    })
  }

  return recs
}
