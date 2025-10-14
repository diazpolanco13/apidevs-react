import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { processAndUploadAvatar } from '@/utils/images/upload-avatar';

// Next.js 15: Forzar renderizado dinámico porque usa cookies (Supabase)
export const dynamic = 'force-dynamic';

/**
 * POST /api/avatar/process
 *
 * Procesa un avatar de TradingView:
 * 1. Descarga la imagen desde TradingView
 * 2. La optimiza (256x256, WebP, 85% quality)
 * 3. La sube a Supabase Storage
 * 4. Retorna la URL optimizada
 *
 * Body: { tradingViewImageUrl: string }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar autenticación
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // Obtener URL de TradingView del body
    const body = await req.json();
    const { tradingViewImageUrl } = body;

    if (!tradingViewImageUrl || typeof tradingViewImageUrl !== 'string') {
      return NextResponse.json(
        { error: 'tradingViewImageUrl es requerido' },
        { status: 400 }
      );
    }

    console.log(`🖼️ Procesando avatar para usuario ${user.id}`);
    console.log(`📥 URL TradingView: ${tradingViewImageUrl}`);

    // Procesar y subir avatar
    const optimizedUrl = await processAndUploadAvatar(
      user.id,
      tradingViewImageUrl
    );

    return NextResponse.json({
      success: true,
      optimizedUrl,
      message: 'Avatar procesado y optimizado exitosamente'
    });
  } catch (error: any) {
    console.error('❌ Error procesando avatar:', error);

    return NextResponse.json(
      {
        error: 'Error procesando avatar',
        details: error.message
      },
      { status: 500 }
    );
  }
}
