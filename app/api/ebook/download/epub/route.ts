import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import fs from 'fs'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    // Verify token
    const { data: tokenData, error: tokenError } = await supabase
      .from('download_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Check if token is expired
    if (new Date() > new Date(tokenData.expires_at)) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 401 })
    }

    // Check download limit
    if (tokenData.downloads_used >= tokenData.max_downloads) {
      return NextResponse.json({ error: 'Límite de descargas alcanzado' }, { status: 429 })
    }

    // Increment download counter
    await supabase
      .from('download_tokens')
      .update({
        downloads_used: tokenData.downloads_used + 1,
        last_download_at: new Date().toISOString()
      })
      .eq('token', token)

    // Get file path
    const fileName = 'soft-skills-guide.epub'
    const filePath = path.join(process.cwd(), 'assets', 'ebooks', fileName)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // For demo purposes, return a placeholder response
      // In production, this would serve the actual file
      return new NextResponse(
        `Este es un archivo EPUB de placeholder para la Guía de Soft Skills IT.\n\nEn producción, aquí se serviría el archivo real.`,
        {
          headers: {
            'Content-Type': 'application/epub+zip',
            'Content-Disposition': `attachment; filename="${fileName}"`,
          },
        }
      )
    }

    // Read and serve actual file
    const fileBuffer = fs.readFileSync(filePath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'private, no-cache',
      },
    })

  } catch (error: any) {
    console.error('[EbookDownload] Error:', error)
    return NextResponse.json(
      { error: 'Error al procesar la descarga' },
      { status: 500 }
    )
  }
}