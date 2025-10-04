import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env' });

const TRADINGVIEW_API = 'http://185.218.124.241:5001';

interface LegacyUser {
  indicators: string;
  tv_username: string;
  access_start_date: string;
  is_active: string;
  estado: string;
  email: string;
  access_end_date: string;
}

interface RevokeResult {
  tv_username: string;
  email: string;
  status: 'success' | 'failed' | 'skipped';
  reason?: string;
  indicators_revoked?: number;
  tv_response?: any;
}

// Indicadores a revocar (todos los que tienes en Supabase)
const PINE_IDS = [
  'PUB;af43255c0c144618842478be41c7ec18', // Position Size
  'PUB;7c7e236c6da54dc4af78a87b788f126a', // RSI Bands
  'PUB;ebd861d70a9f478bb06fe60c5d8f469c'  // RSI Scanner
];

async function parseCSV(filePath: string): Promise<LegacyUser[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const users: LegacyUser[] = [];

  // Saltar header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 7) {
      users.push({
        indicators: parts[0]?.trim() || '',
        tv_username: parts[1]?.trim() || '',
        access_start_date: parts[2]?.trim() || '',
        is_active: parts[3]?.trim() || '0',
        estado: parts[4]?.trim() || '',
        email: parts[5]?.trim() || '',
        access_end_date: parts[6]?.trim() || ''
      });
    }
  }

  return users.filter(u => u.tv_username && u.is_active === '1');
}

async function revokeAccessFromUser(user: LegacyUser): Promise<RevokeResult> {
  const { tv_username, email } = user;

  console.log(`\n🚫 Revocando acceso: ${tv_username} (${email})`);

  try {
    // Llamar al endpoint individual DELETE de TradingView
    const response = await fetch(
      `${TRADINGVIEW_API}/api/access/${tv_username}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pine_ids: PINE_IDS
        })
      }
    );

    const tvResult = await response.json();

    if (!response.ok) {
      return {
        tv_username,
        email,
        status: 'failed',
        reason: tvResult.error || 'Error en TradingView API',
        tv_response: tvResult
      };
    }

    // Contar éxitos
    let successCount = 0;
    if (Array.isArray(tvResult)) {
      successCount = tvResult.filter(r => r.status === 'Success').length;
    }

    console.log(`   ✅ ${successCount}/${PINE_IDS.length} indicadores revocados`);

    return {
      tv_username,
      email,
      status: 'success',
      indicators_revoked: successCount,
      tv_response: tvResult
    };

  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    return {
      tv_username,
      email,
      status: 'failed',
      reason: error.message || 'Error de conexión'
    };
  }
}

async function main() {
  console.log('🚫 REVOCACIÓN MASIVA DE ACCESOS LEGACY EN TRADINGVIEW\n');
  console.log('📋 OBJETIVO:');
  console.log('   🚫 Revocar TODOS los accesos de usuarios legacy');
  console.log('   📧 Forzar re-registro en la nueva plataforma');
  console.log('   🔐 Activar flujo de onboarding obligatorio\n');
  console.log('⚠️  ADVERTENCIA: Esta acción NO se puede deshacer fácilmente');
  console.log('   Asegúrate de que la plataforma esté LISTA para producción\n');
  console.log('═══════════════════════════════════════\n');

  const csvPath = path.join(process.cwd(), 'data', 'usuarios_unicos_sin_duplicados.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Archivo CSV no encontrado:', csvPath);
    process.exit(1);
  }

  // Leer usuarios del CSV
  const users = await parseCSV(csvPath);
  console.log(`📂 ${users.length} usuarios activos encontrados en CSV\n`);

  // Preguntar confirmación DOBLE
  console.log(`🚫 INDICADORES A REVOCAR:`);
  PINE_IDS.forEach(id => console.log(`   - ${id}`));
  console.log(`\n⏱️  Tiempo estimado: ~${Math.ceil(users.length * 0.5)} segundos`);
  console.log(`\n⚠️  ⚠️  ⚠️  CONFIRMACIÓN REQUERIDA  ⚠️  ⚠️  ⚠️`);
  console.log(`\n¿Estás ABSOLUTAMENTE SEGURO de revocar acceso a ${users.length} usuarios?`);
  console.log(`\nPresiona Ctrl+C para cancelar, o espera 10 segundos para continuar...\n`);

  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('🚀 Iniciando revocación masiva...\n');

  // Revocar acceso a cada usuario
  const results: RevokeResult[] = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    console.log(`[${i + 1}/${users.length}]`);
    
    const result = await revokeAccessFromUser(user);
    results.push(result);

    // Pausa para no saturar la API (500ms entre requests)
    if (i < users.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Generar reporte
  console.log('\n\n📊 REPORTE DE REVOCACIÓN MASIVA');
  console.log('═══════════════════════════════════════\n');

  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');

  console.log(`✅ Exitosos: ${successful.length}`);
  console.log(`❌ Fallidos: ${failed.length}`);
  console.log(`📊 Total: ${results.length}\n`);

  if (successful.length > 0) {
    const totalIndicators = successful.reduce((sum, r) => sum + (r.indicators_revoked || 0), 0);
    console.log(`🚫 Total indicadores revocados: ${totalIndicators}\n`);
  }

  if (failed.length > 0) {
    console.log('\n❌ USUARIOS FALLIDOS:');
    failed.forEach(r => {
      console.log(`   - ${r.tv_username} (${r.email}): ${r.reason}`);
    });
  }

  // Guardar reporte en archivo
  const reportPath = path.join(process.cwd(), 'data', 'bulk-revoke-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Reporte completo guardado en: ${reportPath}`);

  console.log('\n🎉 ¡Revocación masiva completada!');
  console.log(`\n📋 PRÓXIMOS PASOS:`);
  console.log(`   1. 📧 Enviar email masivo a los ${successful.length} usuarios`);
  console.log(`   2. 🔗 Incluir link de registro en la nueva plataforma`);
  console.log(`   3. 🎁 Ofrecer incentivo por re-registro (descuento, bonos, etc.)`);
  console.log(`   4. ✅ Cuando completen onboarding, sus accesos se reactivarán automáticamente\n`);
}

main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

