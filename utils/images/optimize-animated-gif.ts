import sharp from 'sharp';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

/**
 * Optimiza un GIF animado convirtiéndolo a WebP animado
 * Mantiene la animación pero reduce significativamente el tamaño
 * 
 * @param inputPath - Ruta del GIF original
 * @param outputPath - Ruta donde guardar el WebP optimizado (opcional)
 * @param options - Opciones de optimización
 * @returns Ruta del archivo optimizado
 */
export async function optimizeAnimatedGif(
  inputPath: string,
  outputPath?: string,
  options?: {
    quality?: number;      // Calidad 1-100 (default: 75 para mejor compresión)
    maxWidth?: number;     // Ancho máximo (default: 400 para reducir peso)
    maxHeight?: number;    // Alto máximo (default: mantiene original)
    effort?: number;       // Esfuerzo de compresión 0-6 (default: 4, más alto = más lento pero mejor)
    colors?: number;       // Reducir paleta de colores (default: 128)
  }
): Promise<string> {
  try {
    const {
      quality = 75,
      maxWidth = 400,  // Por defecto reducir a 400px para GIFs pesados
      maxHeight,
      effort = 4,
      colors = 128
    } = options || {};

    console.log(`\n🎬 Optimizando GIF animado: ${path.basename(inputPath)}`);
    
    // Leer el archivo original
    const inputBuffer = await readFile(inputPath);
    const originalSize = inputBuffer.length;
    
    console.log(`📦 Tamaño original: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

    // Obtener metadata del GIF
    const metadata = await sharp(inputBuffer, { animated: true }).metadata();
    console.log(`📐 Dimensiones: ${metadata.width}x${metadata.height}`);
    console.log(`🎞️  Páginas/frames: ${metadata.pages || 1}`);

    // Determinar ruta de salida
    const outputFilePath = outputPath || inputPath.replace(/\.gif$/i, '.webp');

    // Crear pipeline de Sharp con soporte para animación
    let pipeline = sharp(inputBuffer, { animated: true });

    // Redimensionar si se especifica
    if (maxWidth || maxHeight) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      });
      console.log(`📏 Redimensionando a máximo ${maxWidth || 'auto'}x${maxHeight || 'auto'}`);
    }

    // Convertir a WebP animado con optimización agresiva
    const optimizedBuffer = await pipeline
      .webp({
        quality,
        effort: 6,      // Máxima compresión
        loop: 0,        // Loop infinito
        smartSubsample: true, // Optimización adicional
        nearLossless: false,  // Permitir pérdida para mejor compresión
        alphaQuality: quality - 10 // Comprimir canal alpha
      } as any) // Sharp animated WebP tiene opciones no documentadas en tipos
      .toBuffer();

    // Guardar archivo optimizado
    await writeFile(outputFilePath, optimizedBuffer);

    const optimizedSize = optimizedBuffer.length;
    const reduction = ((1 - optimizedSize / originalSize) * 100).toFixed(1);

    console.log(`✅ Optimizado exitosamente!`);
    console.log(`📦 Tamaño nuevo: ${(optimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📉 Reducción: ${reduction}% (${((originalSize - optimizedSize) / 1024 / 1024).toFixed(2)} MB ahorrados)`);
    console.log(`💾 Guardado en: ${outputFilePath}\n`);

    return outputFilePath;
  } catch (error: any) {
    console.error(`❌ Error optimizando GIF animado:`, error.message);
    throw error;
  }
}

/**
 * Procesa múltiples GIFs en batch
 */
export async function optimizeMultipleGifs(
  files: Array<{ input: string; output?: string; options?: any }>,
  onProgress?: (current: number, total: number, filename: string) => void
): Promise<Array<{ input: string; output: string; success: boolean; error?: string }>> {
  const results = [];
  
  console.log(`🚀 Iniciando optimización de ${files.length} archivos...\n`);

  for (let i = 0; i < files.length; i++) {
    const { input, output, options } = files[i];
    const filename = path.basename(input);

    if (onProgress) {
      onProgress(i + 1, files.length, filename);
    }

    try {
      const outputPath = await optimizeAnimatedGif(input, output, options);
      results.push({
        input,
        output: outputPath,
        success: true
      });
    } catch (error: any) {
      console.error(`❌ Error procesando ${filename}:`, error.message);
      results.push({
        input,
        output: '',
        success: false,
        error: error.message
      });
    }

    // Pequeña pausa entre archivos
    if (i < files.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

