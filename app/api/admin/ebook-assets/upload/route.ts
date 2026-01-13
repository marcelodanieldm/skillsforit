import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const pdfFile = formData.get('pdf') as File | null
    const epubFile = formData.get('epub') as File | null

    if (!pdfFile && !epubFile) {
      return NextResponse.json(
        { error: 'Al menos un archivo (PDF o EPUB) es requerido' },
        { status: 400 }
      )
    }

    // Create assets directory if it doesn't exist
    const assetsDir = path.join(process.cwd(), 'assets', 'ebooks')
    try {
      await mkdir(assetsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, continue
    }

    const uploadResults = []

    // Upload PDF
    if (pdfFile) {
      const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer())
      const pdfPath = path.join(assetsDir, 'soft-skills-guide.pdf')

      await writeFile(pdfPath, pdfBuffer)

      uploadResults.push({
        type: 'pdf',
        filename: pdfFile.name,
        size: pdfFile.size,
        path: pdfPath
      })
    }

    // Upload EPUB
    if (epubFile) {
      const epubBuffer = Buffer.from(await epubFile.arrayBuffer())
      const epubPath = path.join(assetsDir, 'soft-skills-guide.epub')

      await writeFile(epubPath, epubBuffer)

      uploadResults.push({
        type: 'epub',
        filename: epubFile.name,
        size: epubFile.size,
        path: epubPath
      })
    }

    // Log the upload in database
    const { error: logError } = await supabase
      .from('asset_uploads')
      .insert({
        upload_type: 'ebook_assets',
        files: uploadResults,
        uploaded_by: 'admin', // In production, get from auth
        uploaded_at: new Date().toISOString()
      })

    if (logError) {
      console.error('[EbookAssetUpload] Error logging upload:', logError)
      // Don't fail the request for logging errors
    }

    return NextResponse.json({
      success: true,
      message: 'Assets del e-book subidos exitosamente',
      files: uploadResults
    })

  } catch (error: any) {
    console.error('[EbookAssetUpload] Error:', error)
    return NextResponse.json(
      { error: 'Error al subir los archivos del e-book' },
      { status: 500 }
    )
  }
}

// GET endpoint to check current assets status
export async function GET() {
  try {
    const assetsDir = path.join(process.cwd(), 'assets', 'ebooks')
    const pdfPath = path.join(assetsDir, 'soft-skills-guide.pdf')
    const epubPath = path.join(assetsDir, 'soft-skills-guide.epub')

    const fs = require('fs')

    const assets = {
      pdf: {
        exists: fs.existsSync(pdfPath),
        size: fs.existsSync(pdfPath) ? fs.statSync(pdfPath).size : 0,
        lastModified: fs.existsSync(pdfPath) ? fs.statSync(pdfPath).mtime.toISOString() : null
      },
      epub: {
        exists: fs.existsSync(epubPath),
        size: fs.existsSync(epubPath) ? fs.statSync(epubPath).size : 0,
        lastModified: fs.existsSync(epubPath) ? fs.statSync(epubPath).mtime.toISOString() : null
      }
    }

    return NextResponse.json({
      success: true,
      assets
    })

  } catch (error: any) {
    console.error('[EbookAssetStatus] Error:', error)
    return NextResponse.json(
      { error: 'Error al verificar estado de assets' },
      { status: 500 }
    )
  }
}