import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TRADINGVIEW_API = 'http://185.218.124.241:5001';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface LegacyUser {
  indicators: string;
  tv_username: string;
  access_start_date: string;
  is_active: string;
  estado: string;
  email: string;
  access_end_date: string;
}

interface SyncResult {
  tv_username: string;
  email: string;
  status: 'success' | 'failed' | 'skipped';
  reason?: string;
  tv_expiration?: string;
  indicators_synced?: number;
}

// Mapeo de indicadores del CSV a pine_ids
const INDICATOR_MAPPING: Record<string, string[]> = {
  'TL_Strategy': ['PUB;7c7e236c6da54dc4af78a87b788f126a'], // RSI Bands
  'Plan Inteligente': ['PUB;af43255c0c144618842478be41c7ec18'], // Position Size
  'Plan anual': ['PUB;af43255c0c144618842478be41c7ec18'],
  'Plan mensual': ['PUB;af43255c0c144618842478be41c7ec18'],
  'Plan semestral': ['PUB;af43255c0c144618842478be41c7ec18'],
  'Plan Comunidad': ['PUB;af43255c0c144618842478be41c7ec18'],
  'Plan PRO+': ['PUB;af43255c0c144618842478be41c7ec18'],
  'POSITION SIZE': ['PUB;af43255c0c144618842478be41c7ec18'],
  'RSI BANDS': ['PUB;7c7e236c6da54dc4af78a87b788f126a'],
  'ADX DEFINITIVE': ['PUB;ebd861d70a9f478bb06fe60c5d8f469c'] // RSI Scanner
};

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

async function getTradingViewAccess(username: string): Promise<any> {
  try {
    const response = await fetch(
      `${TRADINGVIEW_API}/api/access/${username}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Error consultando TradingView para ${username}:`, error);
    return null;
  }
}

async function findRegisteredUser(email: string, tv_username: string) {
  // ✅ CRÍTICO: Solo sincronizar si el usuario YA se registró en la nueva plataforma
  // Y además completó el onboarding (tiene tradingview_username configurado)
  
  const { data: user } = await supabase
    .from('users')
    .select('id, email, tradingview_username')
    .eq('email', email)
    .maybeSingle();

  // Solo retornar si:
  // 1. El usuario existe en la tabla users (se registró)
  // 2. Tiene tradingview_username configurado (completó onboarding)
  // 3. El username coincide con el del CSV (validación extra)
  if (user && user.tradingview_username === tv_username) {
    return { id: user.id, table: 'users' };
  }

  // Si no cumple las condiciones, no sincronizar
  return null;
}

async function syncUserAccess(user: LegacyUser): Promise<SyncResult> {
  const { tv_username, email, indicators, access_end_date } = user;

  console.log(`\n🔄 Verificando: ${tv_username} (${email})`);

  // 1. ✅ CRÍTICO: Solo sincronizar si el usuario YA completó onboarding
  const userRecord = await findRegisteredUser(email, tv_username);
  
  if (!userRecord) {
    return {
      tv_username,
      email,
      status: 'skipped',
      reason: 'Usuario no registrado o no completó onboarding'
    };
  }

  console.log(`   ✅ Usuario registrado y con onboarding completo`);

  // 2. Consultar acceso actual en TradingView
  const tvAccess = await getTradingViewAccess(tv_username);

  if (!tvAccess || !Array.isArray(tvAccess)) {
    return {
      tv_username,
      email,
      status: 'failed',
      reason: 'No se pudo consultar TradingView'
    };
  }

  console.log(`   📡 TradingView retornó ${tvAccess.length} indicadores`);

  // 3. Obtener indicadores de Supabase
  const { data: dbIndicators } = await supabase
    .from('indicators')
    .select('id, pine_id, name');

  if (!dbIndicators) {
    return {
      tv_username,
      email,
      status: 'failed',
      reason: 'No se pudieron obtener indicadores de Supabase'
    };
  }

  // 4. Sincronizar cada indicador
  let syncedCount = 0;

  for (const tvIndicator of tvAccess) {
    const { pine_id, expiration, hasAccess, status } = tvIndicator;

    if (!hasAccess || status !== 'Success') {
      continue;
    }

    // Buscar indicador en Supabase
    const indicator = dbIndicators.find(ind => ind.pine_id === pine_id);
    
    if (!indicator) {
      console.log(`   ⚠️ Indicador ${pine_id} no existe en Supabase`);
      continue;
    }

    // ✅ CRÍTICO: Usar la fecha de expiración QUE TRADINGVIEW RETORNA
    const expiresAt = expiration || null;

    // Verificar si ya existe el acceso
    const { data: existingAccess } = await supabase
      .from('indicator_access')
      .select('id')
      .eq('user_id', userRecord.id)
      .eq('indicator_id', indicator.id)
      .maybeSingle();

    const accessData = {
      user_id: userRecord.id,
      indicator_id: indicator.id,
      tradingview_username: tv_username,
      status: 'active',
      granted_at: new Date().toISOString(),
      expires_at: expiresAt, // ✅ Fecha EXACTA de TradingView
      duration_type: expiresAt ? '1Y' : '1L', // Inferir duración
      access_source: 'legacy_sync',
      granted_by: null, // Sistema
      tradingview_response: tvIndicator // ✅ Guardar respuesta completa
    };

    if (existingAccess) {
      // Actualizar
      await supabase
        .from('indicator_access')
        .update(accessData)
        .eq('id', existingAccess.id);
    } else {
      // Insertar
      await supabase
        .from('indicator_access')
        .insert(accessData);
    }

    syncedCount++;
    console.log(`   ✅ ${indicator.name}: expires_at = ${expiresAt || 'LIFETIME'}`);
  }

  return {
    tv_username,
    email,
    status: 'success',
    indicators_synced: syncedCount,
    tv_expiration: tvAccess[0]?.expiration || 'LIFETIME'
  };
}

async function main() {
  console.log('🚀 Sincronización de accesos legacy con TradingView\n');
  console.log('📋 REGLAS DE SINCRONIZACIÓN:');
  console.log('   ✅ Solo sincronizar usuarios que YA se registraron');
  console.log('   ✅ Solo sincronizar usuarios que completaron onboarding');
  console.log('   ✅ Solo sincronizar si tradingview_username coincide');
  console.log('   ❌ NO afectar el flujo de onboarding obligatorio\n');
  console.log('═══════════════════════════════════════\n');

  const csvPath = path.join(process.cwd(), 'data', 'usuarios_unicos_sin_duplicados.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('❌ Archivo CSV no encontrado:', csvPath);
    process.exit(1);
  }

  // Leer usuarios del CSV
  const users = await parseCSV(csvPath);
  console.log(`📂 ${users.length} usuarios activos encontrados en CSV (legacy)\n`);

  // Sincronizar cada usuario
  const results: SyncResult[] = [];
  
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    console.log(`\n[${i + 1}/${users.length}] Procesando: ${user.tv_username}`);
    
    const result = await syncUserAccess(user);
    results.push(result);

    // Pausa para no saturar la API
    if (i < users.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Generar reporte
  console.log('\n\n📊 REPORTE DE SINCRONIZACIÓN');
  console.log('═══════════════════════════════════════\n');

  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status === 'failed');
  const skipped = results.filter(r => r.status === 'skipped');

  console.log(`✅ Exitosos: ${successful.length}`);
  console.log(`❌ Fallidos: ${failed.length}`);
  console.log(`⚠️ Omitidos: ${skipped.length}`);
  console.log(`📊 Total: ${results.length}\n`);

  if (successful.length > 0) {
    const totalIndicators = successful.reduce((sum, r) => sum + (r.indicators_synced || 0), 0);
    console.log(`🎯 Total indicadores sincronizados: ${totalIndicators}\n`);
  }

  if (failed.length > 0) {
    console.log('\n❌ USUARIOS FALLIDOS:');
    failed.forEach(r => {
      console.log(`   - ${r.tv_username} (${r.email}): ${r.reason}`);
    });
  }

  if (skipped.length > 0) {
    console.log('\n⚠️ USUARIOS OMITIDOS (No registrados o sin onboarding):');
    console.log(`   Total: ${skipped.length} usuarios legacy pendientes de registro\n`);
    console.log('   💡 Estos usuarios deben:');
    console.log('      1. Registrarse en la nueva plataforma');
    console.log('      2. Completar el onboarding obligatorio');
    console.log('      3. Configurar su tradingview_username');
    console.log('      4. Entonces sus accesos se sincronizarán automáticamente\n');
  }

  // Guardar reporte en archivo
  const reportPath = path.join(process.cwd(), 'data', 'sync-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Reporte completo guardado en: ${reportPath}`);

  console.log('\n🎉 ¡Sincronización completada!');
  console.log(`\n📊 RESUMEN:`);
  console.log(`   ✅ ${successful.length} usuarios sincronizados (ya registrados + onboarding completo)`);
  console.log(`   ⏳ ${skipped.length} usuarios pendientes (deben registrarse y completar onboarding)\n`);
}

main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

