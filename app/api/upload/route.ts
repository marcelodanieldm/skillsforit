import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { db } from '@/lib/database'
import { createClient } from '@supabase/supabase-js'
// Inicializa Supabase Storage
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}


export async function POST(request: NextRequest) {
  console.log("[UPLOAD] Handler invoked");
  console.log("[UPLOAD] SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("[UPLOAD] SERVICE ROLE KEY present:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  try {
    const formData = await request.formData();
    console.log("[UPLOAD] FormData received", formData);
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const country = formData.get('country') as string;
    const profession = formData.get('profession') as string;


    if (!file || !name || !email || !country || !profession) {
      console.log("[UPLOAD] Missing required fields", { file, name, email, country, profession });
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Validar tipo de archivo PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      console.log("[UPLOAD] Invalid file type", { fileType: file.type, fileName: file.name });
      return NextResponse.json(
        { error: 'Solo se permiten archivos PDF' },
        { status: 400 }
      );
    }

    // Subir archivo a Supabase Storage
    const supabase = getSupabase();
    const analysisId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${analysisId}.${fileExtension}`;
    const storagePath = `cv-uploads/${fileName}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log("[UPLOAD] Ready to upload", { fileName, fileType: file.type, size: buffer.length });

    // Usa un bucket llamado 'cv-uploads' (debe existir en Supabase Storage)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cv-uploads')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('[UPLOAD] Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: 'Error al subir archivo a Supabase Storage', details: uploadError.message },
        { status: 500 }
      );
    }

    // Obtén la URL pública del archivo
    const { data: publicUrlData } = supabase.storage.from('cv-uploads').getPublicUrl(fileName);
    const publicUrl = publicUrlData?.publicUrl || '';
    console.log("[UPLOAD] File uploaded. Public URL:", publicUrl);

    // Create analysis record in database
    const analysis = db.create({
      id: analysisId,
      email,
      name,
      country,
      profession,
      cvFileName: file.name,
      cvFilePath: publicUrl,
      paymentStatus: 'pending',
      analysisStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("[UPLOAD] Analysis record created", analysis);

    return NextResponse.json({
      success: true,
      analysisId: analysis.id,
      message: 'CV subido exitosamente',
      fileUrl: publicUrl
    });
  } catch (error: any) {
    console.error('[UPLOAD] Upload error:', error);
    return NextResponse.json(
      { error: 'Error al subir el archivo', details: error.message },
      { status: 500 }
    );
  }
}
