#!/usr/bin/env tsx
/**
 * 🧪 TEST: Verificar fix del Bulk API
 * 
 * Prueba que el endpoint /api/access/bulk ahora retorna hasAccess: true correctamente
 */

import 'dotenv/config';

const TRADINGVIEW_API = process.env.TRADINGVIEW_API_URL || 'http://185.218.124.241:5001';
const TRADINGVIEW_API_KEY = process.env.TRADINGVIEW_API_KEY || '92a1e4a8c74e1871c658301f3e8ae31c31ed6bfd68629059617fac621932e1ea';

// Colores para consola
const c = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

async function testBulkFix(username: string, pineIds: string[]) {
  console.log(`\n${c.bright}${c.cyan}╔════════════════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bright}${c.cyan}║     🧪 TEST: BULK API FIX VERIFICATION                ║${c.reset}`);
  console.log(`${c.bright}${c.cyan}╚════════════════════════════════════════════════════════╝${c.reset}\n`);

  console.log(`${c.blue}📍 API Endpoint: ${TRADINGVIEW_API}/api/access/bulk${c.reset}`);
  console.log(`${c.blue}👤 Usuario: @${username}${c.reset}`);
  console.log(`${c.blue}📊 Indicadores a probar: ${pineIds.length}${c.reset}\n`);

  try {
    console.log(`${c.yellow}⏳ Enviando request...${c.reset}`);
    
    const response = await fetch(`${TRADINGVIEW_API}/api/access/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': TRADINGVIEW_API_KEY
      },
      body: JSON.stringify({
        users: [username],
        pine_ids: pineIds,
        duration: '1Y'
      })
    });

    if (!response.ok) {
      console.log(`${c.red}❌ Error HTTP: ${response.status}${c.reset}`);
      const errorText = await response.text();
      console.log(`${c.red}Response: ${errorText}${c.reset}`);
      return;
    }

    const data = await response.json();
    console.log(`${c.green}✓ Respuesta recibida${c.reset}\n`);

    // Análisis de resultados
    console.log(`${c.bright}${c.magenta}════════════════════════════════════════${c.reset}`);
    console.log(`${c.bright}${c.magenta}   📊 ANÁLISIS DE RESULTADOS${c.reset}`);
    console.log(`${c.bright}${c.magenta}════════════════════════════════════════${c.reset}\n`);

    const results = data.results || [];
    let successCount = 0;
    let hasAccessCount = 0;
    let updatedExpirationCount = 0;

    results.forEach((result: any, idx: number) => {
      console.log(`${c.cyan}${idx + 1}. ${result.pine_id}${c.reset}`);
      
      // Status
      if (result.status === 'Success') {
        console.log(`   ✅ Status: Success`);
        successCount++;
      } else {
        console.log(`   ${c.red}❌ Status: ${result.status}${c.reset}`);
      }

      // hasAccess (CRÍTICO)
      if (result.hasAccess === true) {
        console.log(`   ✅ hasAccess: true ${c.green}(FIX FUNCIONÓ)${c.reset}`);
        hasAccessCount++;
      } else {
        console.log(`   ${c.red}❌ hasAccess: false (FIX NO APLICADO)${c.reset}`);
      }

      // Expirations
      const currentExp = result.currentExpiration ? new Date(result.currentExpiration) : null;
      const newExp = result.expiration ? new Date(result.expiration) : null;
      
      if (currentExp && newExp && currentExp.getTime() === newExp.getTime()) {
        console.log(`   ✅ Expiration actualizada: ${result.currentExpiration}`);
        updatedExpirationCount++;
      } else {
        console.log(`   ${c.yellow}⚠️  Current: ${result.currentExpiration}${c.reset}`);
        console.log(`   ${c.yellow}   New: ${result.expiration}${c.reset}`);
      }

      console.log('');
    });

    // Resumen final
    console.log(`${c.bright}${c.magenta}════════════════════════════════════════${c.reset}`);
    console.log(`${c.bright}${c.magenta}   🎯 RESUMEN${c.reset}`);
    console.log(`${c.bright}${c.magenta}════════════════════════════════════════${c.reset}\n`);

    const totalTests = results.length;
    console.log(`${c.cyan}Total de indicadores probados:${c.reset} ${totalTests}`);
    console.log(`${c.cyan}Status "Success":${c.reset} ${successCount}/${totalTests}`);
    console.log(`${c.cyan}hasAccess: true:${c.reset} ${hasAccessCount}/${totalTests}`);
    console.log(`${c.cyan}Expirations actualizadas:${c.reset} ${updatedExpirationCount}/${totalTests}\n`);

    // Veredicto
    if (successCount === totalTests && hasAccessCount === totalTests) {
      console.log(`${c.bright}${c.green}╔════════════════════════════════════════════════════════╗${c.reset}`);
      console.log(`${c.bright}${c.green}║     ✅ FIX VERIFICADO - TODO FUNCIONA CORRECTAMENTE   ║${c.reset}`);
      console.log(`${c.bright}${c.green}╚════════════════════════════════════════════════════════╝${c.reset}\n`);
    } else if (hasAccessCount === 0) {
      console.log(`${c.bright}${c.red}╔════════════════════════════════════════════════════════╗${c.reset}`);
      console.log(`${c.bright}${c.red}║     ❌ FIX NO APLICADO - REINICIAR MICROSERVICIO      ║${c.reset}`);
      console.log(`${c.bright}${c.red}╚════════════════════════════════════════════════════════╝${c.reset}\n`);
      console.log(`${c.yellow}Ejecuta en el servidor:${c.reset}`);
      console.log(`${c.yellow}  pm2 restart tradingview-api${c.reset}\n`);
    } else {
      console.log(`${c.bright}${c.yellow}╔════════════════════════════════════════════════════════╗${c.reset}`);
      console.log(`${c.bright}${c.yellow}║     ⚠️  FIX PARCIAL - REVISAR LOGS                    ║${c.reset}`);
      console.log(`${c.bright}${c.yellow}╚════════════════════════════════════════════════════════╝${c.reset}\n`);
    }

  } catch (error: any) {
    console.log(`${c.red}❌ Error ejecutando test:${c.reset}`, error.message);
  }

  console.log(`${c.bright}${c.cyan}════════════════════════════════════════════════════════${c.reset}\n`);
}

// Ejecutar
const username = process.argv[2] || 'cmdz';
const pineIds = [
  'PUB;d1ec88482628474f8c4140ec2c32287c',
  'PUB;0e8271bfebe041148432854569b059c3',
  'PUB;af43255c0c144618842478be41c7ec18'
];

console.log(`${c.blue}Usando usuario por defecto: @${username}${c.reset}`);
console.log(`${c.blue}Para probar con otro usuario: npx tsx scripts/test-bulk-fix.ts <username>${c.reset}`);

testBulkFix(username, pineIds).catch(console.error);

