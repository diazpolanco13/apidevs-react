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

interface GrantResult {
  tv_username: string;
  email: string;
  status: 'success' | 'failed' | 'skipped';
  reason?: string;
  indicators_granted?: number;
  tv_response?: any;
}

// Indicadores a conceder (todos los que tienes en Supabase)
const PINE_IDS = [
  'PUB;af43255c0c144618842478be41c7ec18', // Position Size
  'PUB;7c7e236c6da54dc4af78a87b788f126a', // RSI Bands (si existe)
  'PUB;ebd861d70a9f478bb06fe60c5d8f469c'  // RSI Scanner (si existe)
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

function inferDuration(user: LegacyUser): string {
  const { estado, access_end_date, indicators } = user;

  // Si dice "Acceso permanente" -> Lifetime
  if (estado && estado.toLowerCase().includes('permanente')) {
    return '1L';
  }

  // Si tiene fecha de expiración futura, calcular duración
  if (access_end_date) {
    const endDate = new Date(access_end_date);
    const now = new Date();
    const diffMonths = (endDate.getFullYear() - now.getFullYear()) * 12 + 
                       (endDate.getMonth() - now.getMonth());

    if (diffMonths >= 12) return '1Y';
    if (diffMonths >= 6) return '1Y'; // Dar 1 año como beneficio
    if (diffMonths >= 1) return '30D';
    return '7D'; // Si expira pronto, dar 7 días para que se registren
  }

  // Por defecto, dar acceso de 1 año (son clientes legacy)
  return '1Y';
}

async function grantAccessToUser(user: LegacyUser): Promise<GrantResult> {
  const { tv_username, email } = user;
  const duration = inferDuration(user);

  console.log(`\n🎯 Concediendo acceso: ${tv_username} (${email})`);
  console.log(`   📅 Duración: ${duration}`);

  try {
    // Llamar al endpoint individual de TradingView
    const response = await fetch(
      `${TRADINGVIEW_API}/api/access/${tv_username}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pine_ids: PINE_IDS,
          duration: duration
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

    console.log(`   ✅ ${successCount}/${PINE_IDS.length} indicadores concedidos`);

    // Mostrar fechas de expiración retornadas por TradingView
    if (Array.isArray(tvResult)) {
      tvResult.forEach(r => {
        if (r.status === 'Success') {
          console.log(`      - ${r.pine_id}: expires ${r.expiration || 'LIFETIME'}`);
        }
      });
    }

    return {
      tv_username,
      email,
      status: 'success',
      indicators_granted: successCount,
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
  console.log('🚀 ACCESO MASIVO A USUARIOS LEGACY DE TRADINGVIEW\n');
  console.log('📋 OBJETIVO:');
  console.log('   ✅ Probar sistema de accesos masivos en desarrollo');
  console.log('   ✅ Validar sincronización de fechas con TradingView');
  console.log('   ✅ Dar acceso temporal a 150 usuarios legacy\n');
  console.log('⚠️  NOTA: Este script NO registra usuarios en Supabase');
  console.log('   Los usuarios deberán registrarse cuando la plataforma esté lista\n');
  console.log('═══════════════════════════════════════\n');

  const csvPath = path.join(process.cwd(), 'data', 'usuarios_unicos_sin_duplicados.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Archivo CSV no encontrado:', csvPath);
    process.exit(1);
  }

  // Leer usuarios del CSV
  const users = await parseCSV(csvPath);
  console.log(`📂 ${users.length} usuarios activos encontrados en CSV\n`);

  // Preguntar confirmación
  console.log(`🎯 INDICADORES A CONCEDER:`);
  PINE_IDS.forEach(id => console.log(`   - ${id}`));
  console.log(`\n⏱️  Tiempo estimado: ~${Math.ceil(users.length * 0.5)} segundos`);
  console.log(`\n⚠️  Presiona Ctrl+C para cancelar, o espera 5 segundos para continuar...\n`);

  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('🚀 Iniciando concesión masiva...\n');

  // Conceder acceso a cada usuario
  const results: GrantResult[] = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    console.log(`[${i + 1}/${users.length}]`);
    
    const result = await grantAccessToUser(user);
    results.push(result);

    // Pausa para no saturar la API (500ms entre requests)
    if (i < users.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Generar reporte
  console.log('\n\n📊 REPORTE DE CONCESIÓN MASIVA');
  console.log('═══════════════════════════════════════\n');

  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');

  console.log(`✅ Exitosos: ${successful.length}`);
  console.log(`❌ Fallidos: ${failed.length}`);
  console.log(`📊 Total: ${results.length}\n`);

  if (successful.length > 0) {
    const totalIndicators = successful.reduce((sum, r) => sum + (r.indicators_granted || 0), 0);
    console.log(`🎯 Total indicadores concedidos: ${totalIndicators}\n`);
  }

  if (failed.length > 0) {
    console.log('\n❌ USUARIOS FALLIDOS:');
    failed.forEach(r => {
      console.log(`   - ${r.tv_username} (${r.email}): ${r.reason}`);
    });
  }

  // Guardar reporte en archivo
  const reportPath = path.join(process.cwd(), 'data', 'bulk-grant-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Reporte completo guardado en: ${reportPath}`);

  console.log('\n🎉 ¡Concesión masiva completada!');
  console.log(`\n📋 PRÓXIMOS PASOS:`);
  console.log(`   1. Verificar accesos en TradingView manualmente`);
  console.log(`   2. Probar sistema de gestión de accesos en Admin Panel`);
  console.log(`   3. Cuando la plataforma esté lista, usar script de revocación masiva\n`);
}

main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

