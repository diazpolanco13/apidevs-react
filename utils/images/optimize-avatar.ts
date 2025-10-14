import sharp from 'sharp';

/**
 * Optimiza una imagen de perfil descargada desde TradingView
 * - Redimensiona a 256x256 (suficiente para avatares)
 * - Convierte a WebP (mejor compresión que JPEG/PNG)
 * - Comprime con calidad 85 (excelente balance calidad/tamaño)
 *
 * @param imageBuffer - Buffer de la imagen original
 * @returns Buffer de la imagen optimizada en WebP
 */
export async function optimizeAvatar(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const optimized = await sharp(imageBuffer)
      .resize(256, 256, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toBuffer();

    console.log(`✅ Imagen optimizada: ${imageBuffer.length} bytes → ${optimized.length} bytes (${Math.round((1 - optimized.length / imageBuffer.length) * 100)}% reducción)`);

    return optimized;
  } catch (error) {
    console.error('❌ Error optimizando imagen:', error);
    throw new Error('No se pudo optimizar la imagen');
  }
}

/**
 * Descarga una imagen desde una URL y la optimiza
 *
 * @param imageUrl - URL de la imagen de TradingView
 * @returns Buffer de la imagen optimizada
 */
export async function downloadAndOptimizeAvatar(imageUrl: string): Promise<Buffer> {
  try {
    console.log(`📥 Descargando imagen desde: ${imageUrl}`);

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    console.log(`📦 Imagen descargada: ${imageBuffer.length} bytes`);

    return await optimizeAvatar(imageBuffer);
  } catch (error) {
    console.error('❌ Error descargando imagen:', error);
    throw new Error('No se pudo descargar la imagen de TradingView');
  }
}
