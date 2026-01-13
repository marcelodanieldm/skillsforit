import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// GET /api/user/products
// Obtiene todos los productos comprados por el usuario actual
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Obtener e-books con acceso activo
    const { data: ebooks, error: ebooksError } = await supabase
      .from('product_access')
      .select('*')
      .eq('user_id', userId)
      .is('revoked_at', null)
      .order('created_at', { ascending: false })

    if (ebooksError) {
      console.error('Error fetching ebooks:', ebooksError)
    }

    // 2. Obtener créditos de CV audit
    const { data: cvAudit, error: cvAuditError } = await supabase
      .from('user_assets')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'cv_audit_credit')
      .is('revoked_at', null)
      .order('created_at', { ascending: false })
      .limit(1)

    if (cvAuditError) {
      console.error('Error fetching CV audit credits:', cvAuditError)
    }

    // 3. Obtener suscripciones de mentoría activas
    const { data: mentorships, error: mentorshipsError } = await supabase
      .from('mentorship_subscriptions')
      .select(`
        *,
        mentors (
          id,
          name,
          email,
          specialty,
          bio,
          availability
        )
      `)
      .eq('user_id', userId)
      .in('status', ['active', 'scheduled'])
      .order('created_at', { ascending: false })

    if (mentorshipsError) {
      console.error('Error fetching mentorships:', mentorshipsError)
    }

    // 4. Construir respuesta con todos los productos
    const products = {
      ebooks: ebooks?.map(ebook => ({
        id: ebook.id,
        productId: ebook.product_id,
        productName: ebook.product_name,
        downloadUrl: ebook.download_url,
        downloadCount: ebook.download_count,
        expiresAt: ebook.expires_at,
        purchasedAt: ebook.created_at,
        type: 'ebook' as const
      })) || [],
      
      cvAudit: cvAudit?.[0] ? {
        id: cvAudit[0].id,
        balance: cvAudit[0].balance,
        used: cvAudit[0].balance === 0,
        purchasedAt: cvAudit[0].created_at,
        type: 'cv_audit' as const
      } : null,
      
      mentorships: mentorships?.map(mentorship => ({
        id: mentorship.id,
        mentorId: mentorship.mentor_id,
        mentor: mentorship.mentors ? {
          name: mentorship.mentors.name,
          email: mentorship.mentors.email,
          specialty: mentorship.mentors.specialty,
          bio: mentorship.mentors.bio,
          availability: mentorship.mentors.availability
        } : null,
        sessionsTotal: mentorship.sessions_total,
        sessionsLeft: mentorship.sessions_left,
        status: mentorship.status,
        nextSessionAt: mentorship.next_session_at,
        expiresAt: mentorship.expires_at,
        purchasedAt: mentorship.created_at,
        type: 'mentorship' as const
      })) || []
    }

    // 5. Calcular estadísticas
    const stats = {
      totalProducts: products.ebooks.length + 
                     (products.cvAudit ? 1 : 0) + 
                     products.mentorships.length,
      ebooksCount: products.ebooks.length,
      cvAuditAvailable: products.cvAudit?.balance || 0,
      mentorshipSessionsLeft: products.mentorships.reduce(
        (sum, m) => sum + m.sessionsLeft, 
        0
      ),
      activeMentorships: products.mentorships.filter(
        m => m.status === 'active'
      ).length
    }

    return NextResponse.json({
      success: true,
      data: {
        userId,
        products,
        stats
      }
    })

  } catch (error) {
    console.error('Error in /api/user/products:', error)
    return NextResponse.json(
      { 
        error: 'Error al obtener productos del usuario',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
