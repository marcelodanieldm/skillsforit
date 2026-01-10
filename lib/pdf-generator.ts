import { jsPDF } from 'jspdf'
import path from 'path'
import { writeFile, mkdir } from 'fs/promises'
import { AnalysisResult, CVAnalysis } from './database'

export async function generatePDFReport(
  analysis: CVAnalysis,
  analysisResult: AnalysisResult
): Promise<string> {
  const doc = new jsPDF()
  
  // Colors
  const primaryColor = [59, 130, 246] // blue-500
  const accentColor = [147, 51, 234] // purple-600
  const textColor = [30, 41, 59] // slate-800
  const lightGray = [226, 232, 240] // slate-200
  
  let yPos = 20

  // Header
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('Análisis de CV', 105, 20, { align: 'center' })
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Reporte generado por SkillsForIT', 105, 30, { align: 'center' })

  yPos = 50

  // Personal Info
  doc.setTextColor(...textColor)
  doc.setFontSize(10)
  doc.text(`Nombre: ${analysis.name}`, 20, yPos)
  yPos += 6
  doc.text(`Profesión: ${analysis.profession}`, 20, yPos)
  yPos += 6
  doc.text(`País: ${analysis.country}`, 20, yPos)
  yPos += 6
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, yPos)
  yPos += 15

  // Scores Section
  doc.setFillColor(...lightGray)
  doc.rect(15, yPos, 180, 30, 'F')
  yPos += 10
  
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('📊 Puntuaciones', 20, yPos)
  yPos += 8
  
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textColor)
  doc.text(`Score General: ${analysisResult.score}/100`, 20, yPos)
  doc.text(`Score ATS: ${analysisResult.atsScore}/100`, 110, yPos)
  yPos += 20

  // Problems Section
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...accentColor)
  doc.text('⚠️ Problemas Identificados', 20, yPos)
  yPos += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textColor)

  analysisResult.problems.slice(0, 5).forEach((problem, idx) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    const severityIcon = problem.severity === 'high' ? '🔴' : problem.severity === 'medium' ? '🟡' : '🟢'
    doc.text(`${severityIcon} ${problem.category}`, 20, yPos)
    yPos += 6
    const descLines = doc.splitTextToSize(problem.description, 170)
    doc.text(descLines, 25, yPos)
    yPos += descLines.length * 5 + 4
  })

  yPos += 5

  // Improvements Section
  if (yPos > 200) {
    doc.addPage()
    yPos = 20
  }

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('✨ Mejoras Recomendadas', 20, yPos)
  yPos += 8

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textColor)

  analysisResult.improvements.slice(0, 6).forEach((improvement, idx) => {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.text(`${idx + 1}. ${improvement.category}`, 20, yPos)
    yPos += 5

    doc.setFont('helvetica', 'italic')
    doc.setTextColor(100, 100, 100)
    doc.text('Antes:', 20, yPos)
    yPos += 4
    const beforeLines = doc.splitTextToSize(improvement.before, 160)
    doc.text(beforeLines, 25, yPos)
    yPos += beforeLines.length * 4 + 3

    doc.setTextColor(...primaryColor)
    doc.text('Después:', 20, yPos)
    yPos += 4
    doc.setTextColor(...textColor)
    const afterLines = doc.splitTextToSize(improvement.after, 160)
    doc.text(afterLines, 25, yPos)
    yPos += afterLines.length * 4 + 6
  })

  // New page for recommendations
  doc.addPage()
  yPos = 20

  // Recommendations
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...accentColor)
  doc.text('💡 Recomendaciones', 20, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...textColor)

  analysisResult.recommendations.forEach((rec, idx) => {
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }

    const recLines = doc.splitTextToSize(`${idx + 1}. ${rec}`, 170)
    doc.text(recLines, 20, yPos)
    yPos += recLines.length * 5 + 3
  })

  // Footer on last page
  yPos = 280
  doc.setFillColor(...primaryColor)
  doc.rect(0, yPos, 210, 17, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(9)
  doc.text('© 2026 SkillsForIT - Tu aliado en el mercado IT', 105, yPos + 8, { align: 'center' })
  doc.text('www.skillsforit.com', 105, yPos + 13, { align: 'center' })

  // Save PDF
  const reportsDir = path.join(process.cwd(), 'public', 'reports')
  try {
    await mkdir(reportsDir, { recursive: true })
  } catch (error) {
    // Directory might already exist
  }

  const fileName = `report-${analysis.id}.pdf`
  const filePath = path.join(reportsDir, fileName)
  
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  await writeFile(filePath, pdfBuffer)

  return `/reports/${fileName}`
}
