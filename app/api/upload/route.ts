import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/database'

// Disable body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const country = formData.get('country') as string
    const profession = formData.get('profession') as string

    if (!file || !name || !email || !country || !profession) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const analysisId = uuidv4()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${analysisId}.${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create analysis record in database
    const analysis = db.create({
      id: analysisId,
      email,
      name,
      country,
      profession,
      cvFileName: file.name,
      cvFilePath: `/uploads/${fileName}`,
      paymentStatus: 'pending',
      analysisStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      message: 'CV subido exitosamente',
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error al subir el archivo', details: error.message },
      { status: 500 }
    )
  }
}
