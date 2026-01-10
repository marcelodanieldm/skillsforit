import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SkillsForIT - Optimiza tu CV Tech con IA | USD 7',
  description: 'Transforma tu CV de IT en minutos con análisis de IA. Destaca tus skills técnicas y consigue más entrevistas. Solo USD 7.',
  keywords: 'CV IT, curriculum desarrollador, optimizar CV tech, análisis CV IA, CV programador',
  openGraph: {
    title: 'SkillsForIT - Optimiza tu CV Tech con IA',
    description: 'Transforma tu CV de IT en minutos. Solo USD 7.',
    type: 'website',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
