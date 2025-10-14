import { createClient } from '@/utils/supabase/server';
import { downloadAndOptimizeAvatar } from './optimize-avatar';

/**
 * Sube un avatar optimizado a Supabase Storage
 *
 * @param userId - ID del usuario (para nombrar el archivo)
 * @param optimizedBuffer - Buffer de la imagen optimizada
 * @returns URL pública de la imagen en Supabase Storage
 */
async function uploadToStorage(
  userId: string,
  optimizedBuffer: Buffer
): Promise<string> {
  const supabase = await createClient();

  const fileName = `${userId}.webp`;
  const filePath = `avatars/${fileName}`;

  // Subir a Supabase Storage
  const { data, error } = await supabase.storage
    .from('user-avatars')
    .upload(filePath, optimizedBuffer, {
      contentType: 'image/webp',
      upsert: true // Sobrescribir si ya existe
    });

  if (error) {
    console.error('❌ Error subiendo a Supabase Storage:', error);
    throw new Error(`Error subiendo imagen: ${error.message}`);
  }

  // Obtener URL pública
  const { data: publicUrlData } = supabase.storage
    .from('user-avatars')
    .getPublicUrl(filePath);

  console.log(`✅ Imagen subida a Supabase: ${publicUrlData.publicUrl}`);

  return publicUrlData.publicUrl;
}

/**
 * Procesa y sube un avatar desde TradingView a Supabase Storage
 *
 * Este es el punto de entrada principal que:
 * 1. Descarga la imagen desde TradingView
 * 2. La optimiza (resize + WebP)
 * 3. La sube a Supabase Storage
 * 4. Retorna la URL pública optimizada
 *
 * @param userId - ID del usuario
 * @param tradingViewImageUrl - URL original de la imagen en TradingView
 * @returns URL pública de la imagen optimizada en Supabase
 */
export async function processAndUploadAvatar(
  userId: string,
  tradingViewImageUrl: string
): Promise<string> {
  try {
    console.log(`🚀 Iniciando procesamiento de avatar para usuario ${userId}`);

    // 1. Descargar y optimizar
    const optimizedBuffer = await downloadAndOptimizeAvatar(tradingViewImageUrl);

    // 2. Subir a Supabase Storage
    const supabaseUrl = await uploadToStorage(userId, optimizedBuffer);

    console.log(`✅ Avatar procesado exitosamente: ${supabaseUrl}`);

    return supabaseUrl;
  } catch (error) {
    console.error('❌ Error procesando avatar:', error);
    // En caso de error, devolver URL original de TradingView como fallback
    console.log('⚠️ Usando URL original de TradingView como fallback');
    return tradingViewImageUrl;
  }
}

/**
 * Elimina el avatar anterior de un usuario de Supabase Storage
 * (útil cuando actualiza su perfil de TradingView)
 *
 * @param userId - ID del usuario
 */
export async function deleteOldAvatar(userId: string): Promise<void> {
  try {
    const supabase = await createClient();
    const fileName = `${userId}.webp`;
    const filePath = `avatars/${fileName}`;

    const { error } = await supabase.storage
      .from('user-avatars')
      .remove([filePath]);

    if (error) {
      console.warn('⚠️ Error eliminando avatar anterior:', error.message);
    } else {
      console.log(`🗑️ Avatar anterior eliminado: ${filePath}`);
    }
  } catch (error) {
    console.warn('⚠️ Error en deleteOldAvatar:', error);
  }
}
