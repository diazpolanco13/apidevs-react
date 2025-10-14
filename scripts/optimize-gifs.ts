/**
 * Script para optimizar los GIFs animados del proyecto
 * Convierte GIF → WebP animado manteniendo la animación
 * 
 * Uso:
 *   npm run optimize-gifs
 */

import path from 'path';
import { optimizeMultipleGifs } from '../utils/images/optimize-animated-gif';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Archivos a optimizar
const FILES_TO_OPTIMIZE = [
  {
    input: path.join(PUBLIC_DIR, 'chatbot-boton.gif'),
    output: path.join(PUBLIC_DIR, 'chatbot-boton.webp'),
    options: {
      quality: 70,      // Calidad más agresiva para GIFs pesados
      maxWidth: 350,    // Reducir ancho a 350px (suficiente para UI)
      maxHeight: 350,   // Mantener proporción cuadrada
      effort: 6         // Máxima compresión
    }
  },
  {
    input: path.join(PUBLIC_DIR, 'buho-leyendo.gif'),
    output: path.join(PUBLIC_DIR, 'buho-leyendo.webp'),
    options: {
      quality: 70,
      maxWidth: 350,
      maxHeight: 350,
      effort: 6
    }
  }
];

async function main() {
  console.log('🎬 Optimizador de GIFs Animados\n');
  console.log('='.repeat(60));
  console.log('Convierte GIF → WebP animado (mantiene animación)');
  console.log('Reducción esperada: 70-90%');
  console.log('='.repeat(60) + '\n');

  // Optimizar todos los archivos
  const results = await optimizeMultipleGifs(
    FILES_TO_OPTIMIZE,
    (current, total, filename) => {
      console.log(`[${current}/${total}] Procesando: ${filename}`);
    }
  );

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE OPTIMIZACIÓN');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`\n✅ Exitosos: ${successful.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n📦 Archivos optimizados:');
    successful.forEach(({ input, output }) => {
      console.log(`   • ${path.basename(input)} → ${path.basename(output)}`);
    });
  }

  if (failed.length > 0) {
    console.log(`\n❌ Fallidos: ${failed.length}`);
    failed.forEach(({ input, error }) => {
      console.log(`   • ${path.basename(input)}: ${error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 PRÓXIMOS PASOS:');
  console.log('='.repeat(60));
  console.log(`
1. Los archivos .webp ya están listos en /public
2. Los GIF originales se mantienen como fallback
3. Actualiza tu código para usar los .webp:

   ANTES:
   <img src="/chatbot-boton.gif" alt="..." />
   
   DESPUÉS:
   <img src="/chatbot-boton.webp" alt="..." />
   
   O con fallback automático:
   <picture>
     <source srcSet="/chatbot-boton.webp" type="image/webp" />
     <img src="/chatbot-boton.gif" alt="..." />
   </picture>

4. Los navegadores modernos usarán WebP (más ligero)
5. Navegadores antiguos usarán GIF (fallback)
`);
  
  console.log('='.repeat(60) + '\n');

  if (failed.length > 0) {
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('✨ Optimización completada exitosamente!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });

