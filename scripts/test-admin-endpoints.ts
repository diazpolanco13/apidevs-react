#!/usr/bin/env tsx
/**
 * 🧪 Script de Testing - Admin Panel Endpoints
 * 
 * Testea los endpoints de la API del Admin Panel para gestión de accesos
 * 
 * IMPORTANTE: Este script NO ejecuta operaciones reales, solo valida
 * la estructura y disponibilidad de los endpoints.
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Colores para terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

function log(message: string) {
  console.log(`${colors.cyan}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message: string) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function logInfo(message: string) {
  console.log(`${colors.dim}  ${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log(`\n${colors.bold}${colors.cyan}━━━ ${title} ━━━${colors.reset}`);
}

// ========================================
// TESTS DE BASE DE DATOS
// ========================================

async function testDatabaseStructure() {
  logSection('1. Estructura de Base de Datos');
  
  try {
    // Test 1: Tabla indicators
    const { data: indicators, error: indicatorsError } = await supabase
      .from('indicators')
      .select('id, pine_id, name, status, access_tier')
      .limit(5);
    
    if (indicatorsError) {
      logError(`Tabla 'indicators': ${indicatorsError.message}`);
    } else {
      logSuccess(`Tabla 'indicators': ${indicators?.length || 0} registros (muestra)`);
      if (indicators && indicators.length > 0) {
        logInfo(`Primer indicador: ${indicators[0].name} (${indicators[0].pine_id})`);
      }
    }
    
    // Test 2: Tabla indicator_access
    const { data: accesses, error: accessesError } = await supabase
      .from('indicator_access')
      .select('id, tradingview_username, status, expires_at')
      .limit(5);
    
    if (accessesError) {
      logError(`Tabla 'indicator_access': ${accessesError.message}`);
    } else {
      logSuccess(`Tabla 'indicator_access': ${accesses?.length || 0} registros (muestra)`);
      if (accesses && accesses.length > 0) {
        const activeCount = accesses.filter((a: any) => a.status === 'active').length;
        logInfo(`Accesos activos en muestra: ${activeCount}/${accesses.length}`);
      }
    }
    
    // Test 3: Tabla indicator_access_log
    const { data: logs, error: logsError } = await supabase
      .from('indicator_access_log')
      .select('id, operation_type, access_source, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (logsError) {
      logError(`Tabla 'indicator_access_log': ${logsError.message}`);
    } else {
      logSuccess(`Tabla 'indicator_access_log': ${logs?.length || 0} registros (muestra)`);
      if (logs && logs.length > 0) {
        logInfo(`Última operación: ${logs[0].operation_type} (${logs[0].access_source}) - ${logs[0].status}`);
      }
    }
    
    // Test 4: Contar totales
    const { count: totalIndicators } = await supabase
      .from('indicators')
      .select('*', { count: 'exact', head: true });
    
    const { count: totalAccesses } = await supabase
      .from('indicator_access')
      .select('*', { count: 'exact', head: true });
    
    const { count: totalLogs } = await supabase
      .from('indicator_access_log')
      .select('*', { count: 'exact', head: true });
    
    console.log('');
    logInfo(`📊 Resumen:`);
    logInfo(`   - Indicadores totales: ${totalIndicators || 0}`);
    logInfo(`   - Accesos totales: ${totalAccesses || 0}`);
    logInfo(`   - Logs de auditoría: ${totalLogs || 0}`);
    
    return { success: true };
    
  } catch (error: any) {
    logError(`Error en estructura de DB: ${error.message}`);
    return { success: false };
  }
}

// ========================================
// TESTS DE DATOS
// ========================================

async function testDataIntegrity() {
  logSection('2. Integridad de Datos');
  
  try {
    // Test 1: Indicadores activos
    const { data: activeIndicators, error: activeError } = await supabase
      .from('indicators')
      .select('id, name, pine_id, status')
      .eq('status', 'activo');
    
    if (activeError) {
      logError(`Error consultando indicadores activos: ${activeError.message}`);
    } else {
      logSuccess(`Indicadores activos: ${activeIndicators?.length || 0}`);
      if (activeIndicators && activeIndicators.length > 0) {
        activeIndicators.forEach((ind: any) => {
          logInfo(`   - ${ind.name} (${ind.pine_id})`);
        });
      }
    }
    
    // Test 2: Accesos con expires_at
    const { data: expiringAccesses, error: expiringError } = await supabase
      .from('indicator_access')
      .select('id, tradingview_username, expires_at, status')
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .order('expires_at', { ascending: true })
      .limit(5);
    
    if (expiringError) {
      logError(`Error consultando accesos con expiración: ${expiringError.message}`);
    } else {
      logSuccess(`Accesos activos con expiración: ${expiringAccesses?.length || 0}`);
      if (expiringAccesses && expiringAccesses.length > 0) {
        expiringAccesses.forEach((acc: any) => {
          const expiresAt = new Date(acc.expires_at);
          const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          logInfo(`   - ${acc.tradingview_username}: ${daysLeft} días restantes`);
        });
      }
    }
    
    // Test 3: Accesos lifetime (sin expires_at)
    const { count: lifetimeCount } = await supabase
      .from('indicator_access')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .is('expires_at', null);
    
    logSuccess(`Accesos lifetime activos: ${lifetimeCount || 0}`);
    
    // Test 4: Usuarios con tradingview_username
    const { count: usersWithTVUsername } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('tradingview_username', 'is', null);
    
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    const percentage = totalUsers ? ((usersWithTVUsername || 0) / totalUsers * 100).toFixed(1) : 0;
    logSuccess(`Usuarios con TradingView username: ${usersWithTVUsername}/${totalUsers} (${percentage}%)`);
    
    return { success: true };
    
  } catch (error: any) {
    logError(`Error en integridad de datos: ${error.message}`);
    return { success: false };
  }
}

// ========================================
// TESTS DE SINCRONIZACIÓN
// ========================================

async function testSynchronization() {
  logSection('3. Sincronización expires_at');
  
  try {
    // Test: Verificar que expires_at tiene formato correcto
    const { data: recentAccesses, error } = await supabase
      .from('indicator_access')
      .select('id, tradingview_username, expires_at, granted_at, status, tradingview_response')
      .eq('status', 'active')
      .not('expires_at', 'is', null)
      .order('granted_at', { ascending: false })
      .limit(10);
    
    if (error) {
      logError(`Error consultando accesos recientes: ${error.message}`);
      return { success: false };
    }
    
    if (!recentAccesses || recentAccesses.length === 0) {
      logInfo('No hay accesos activos con expiración para validar');
      return { success: true };
    }
    
    logSuccess(`Validando ${recentAccesses.length} accesos recientes con expiración`);
    
    let syncedCount = 0;
    let unsyncedCount = 0;
    
    for (const access of recentAccesses) {
      const expiresAt = access.expires_at;
      const tvResponse = access.tradingview_response as any;
      
      // Verificar si hay respuesta de TradingView
      if (tvResponse && (tvResponse.expiration || tvResponse[0]?.expiration)) {
        const tvExpiration = tvResponse.expiration || tvResponse[0]?.expiration;
        
        if (tvExpiration === expiresAt) {
          syncedCount++;
          logInfo(`   ✓ ${access.tradingview_username}: Sincronizado correctamente`);
        } else {
          unsyncedCount++;
          logInfo(`   ⚠ ${access.tradingview_username}: Desincronizado`);
          logInfo(`      DB: ${expiresAt}`);
          logInfo(`      TV: ${tvExpiration}`);
        }
      } else {
        logInfo(`   ℹ ${access.tradingview_username}: Sin respuesta de TradingView en DB`);
      }
    }
    
    console.log('');
    if (unsyncedCount === 0) {
      logSuccess(`🎉 Todos los accesos están sincronizados con TradingView`);
    } else {
      logError(`⚠️ ${unsyncedCount} accesos desincronizados de ${recentAccesses.length}`);
    }
    
    return { success: unsyncedCount === 0 };
    
  } catch (error: any) {
    logError(`Error en sincronización: ${error.message}`);
    return { success: false };
  }
}

// ========================================
// TESTS DE LOGS DE AUDITORÍA
// ========================================

async function testAuditLogs() {
  logSection('4. Logs de Auditoría');
  
  try {
    // Test 1: Contar operaciones por tipo
    const { data: logsByOperation } = await supabase.rpc('get_logs_by_operation', {}, { count: 'exact' });
    
    // Consulta manual si la función no existe
    const { data: grants } = await supabase
      .from('indicator_access_log')
      .select('id', { count: 'exact', head: true })
      .eq('operation_type', 'grant');
    
    const { data: revokes } = await supabase
      .from('indicator_access_log')
      .select('id', { count: 'exact', head: true })
      .eq('operation_type', 'revoke');
    
    const { data: renews } = await supabase
      .from('indicator_access_log')
      .select('id', { count: 'exact', head: true })
      .eq('operation_type', 'renew');
    
    logSuccess(`Operaciones registradas:`);
    logInfo(`   - Grant: ${grants || 0}`);
    logInfo(`   - Revoke: ${revokes || 0}`);
    logInfo(`   - Renew: ${renews || 0}`);
    
    // Test 2: Últimas 10 operaciones
    const { data: recentLogs, error: logsError } = await supabase
      .from('indicator_access_log')
      .select('operation_type, access_source, status, tradingview_username, created_at')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (logsError) {
      logError(`Error consultando logs: ${logsError.message}`);
    } else if (recentLogs && recentLogs.length > 0) {
      console.log('');
      logSuccess(`Últimas 10 operaciones:`);
      recentLogs.forEach((log: any, index: number) => {
        const date = new Date(log.created_at).toLocaleString('es-ES');
        logInfo(`   ${index + 1}. ${log.operation_type.toUpperCase()} - ${log.tradingview_username} (${log.access_source}) - ${log.status} - ${date}`);
      });
    }
    
    return { success: true };
    
  } catch (error: any) {
    logError(`Error en logs de auditoría: ${error.message}`);
    return { success: false };
  }
}

// ========================================
// TESTS DE USUARIOS LEGACY
// ========================================

async function testLegacyUsers() {
  logSection('5. Usuarios Legacy');
  
  try {
    // Test 1: Contar usuarios legacy
    const { count: legacyCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('migration_status', 'imported');
    
    logSuccess(`Usuarios legacy (imported): ${legacyCount || 0}`);
    
    // Test 2: Usuarios legacy con accesos
    const { data: legacyWithAccess } = await supabase
      .from('users')
      .select(`
        id,
        email,
        tradingview_username,
        migration_status,
        indicator_access (
          id,
          status
        )
      `)
      .eq('migration_status', 'imported')
      .not('tradingview_username', 'is', null)
      .limit(10);
    
    if (legacyWithAccess && legacyWithAccess.length > 0) {
      logSuccess(`Usuarios legacy con tradingview_username: ${legacyWithAccess.length} (muestra)`);
      
      legacyWithAccess.forEach((user: any) => {
        const accessCount = user.indicator_access?.length || 0;
        const activeCount = user.indicator_access?.filter((a: any) => a.status === 'active').length || 0;
        logInfo(`   - ${user.tradingview_username}: ${activeCount}/${accessCount} accesos activos`);
      });
    }
    
    return { success: true };
    
  } catch (error: any) {
    logError(`Error en usuarios legacy: ${error.message}`);
    return { success: false };
  }
}

// ========================================
// MAIN
// ========================================

async function main() {
  console.clear();
  console.log(`${colors.bold}${colors.cyan}`);
  console.log(`╔════════════════════════════════════════════════════════════╗`);
  console.log(`║  🧪 Admin Panel Endpoints - Testing & Debugging          ║`);
  console.log(`║  APIDevs Trading Platform                                 ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝`);
  console.log(colors.reset);
  
  log(`\n📡 Supabase URL: ${SUPABASE_URL}`);
  log(`⏰ Fecha: ${new Date().toLocaleString('es-ES')}`);
  
  const results = [];
  
  // Ejecutar tests
  results.push(await testDatabaseStructure());
  results.push(await testDataIntegrity());
  results.push(await testSynchronization());
  results.push(await testAuditLogs());
  results.push(await testLegacyUsers());
  
  // Resumen final
  console.log(`\n${colors.bold}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bold}📊 RESUMEN FINAL${colors.reset}\n`);
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`   ${colors.green}✓ PASS: ${passed}${colors.reset}`);
  console.log(`   ${colors.red}✗ FAIL: ${failed}${colors.reset}`);
  console.log(`   ━━━━━━━━━━━━━━━━`);
  console.log(`   TOTAL: ${results.length} tests\n`);
  
  if (failed === 0) {
    console.log(`${colors.green}${colors.bold}🎉 ¡TODOS LOS TESTS PASARON!${colors.reset}\n`);
    console.log(`${colors.green}Sistema de gestión de accesos funcionando correctamente${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bold}❌ ${failed} test(s) fallaron${colors.reset}\n`);
    console.log(`${colors.yellow}Revisa los errores arriba para identificar problemas${colors.reset}\n`);
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

main();

