import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large. Max 50MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `soft-skills-guide/${timestamp}-${sanitizedName}`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('assets')
      .getPublicUrl(fileName)

    // Store metadata in database
    await supabase.from('digital_assets').insert({
      file_name: file.name,
      file_path: fileName,
      file_type: type,
      file_size: file.size,
      public_url: urlData.publicUrl,
      uploaded_by: 'CEO', // TODO: Get from auth session
      created_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: file.name,
      fileSize: file.size
    })

  } catch (error) {
    console.error('Error uploading asset:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
