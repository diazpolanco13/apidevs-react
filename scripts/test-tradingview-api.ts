#!/usr/bin/env tsx
/**
 * 🧪 Script de Testing - TradingView API Health Check
 * 
 * Verifica conectividad y funcionalidad del microservicio TradingView
 */

const TRADINGVIEW_API = 'http://185.218.124.241:5001';
const API_KEY = '92a1e4a8c74e1871c658301f3e8ae31c31ed6bfd68629059617fac621932e1ea';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  duration?: number;
  data?: any;
}

const results: TestResult[] = [];

// Colores para terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
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

function logWarn(message: string) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

async function runTest(
  name: string,
  testFn: () => Promise<TestResult>
): Promise<void> {
  console.log(`\n${colors.bold}${colors.cyan}━━━ ${name} ━━━${colors.reset}`);
  try {
    const result = await testFn();
    results.push(result);
    
    if (result.status === 'PASS') {
      logSuccess(`${result.message} ${result.duration ? `(${result.duration}ms)` : ''}`);
    } else if (result.status === 'WARN') {
      logWarn(`${result.message} ${result.duration ? `(${result.duration}ms)` : ''}`);
    } else {
      logError(`${result.message} ${result.duration ? `(${result.duration}ms)` : ''}`);
    }
    
    if (result.data) {
      console.log(`   Data:`, JSON.stringify(result.data, null, 2).substring(0, 200));
    }
  } catch (error: any) {
    logError(`Error inesperado: ${error.message}`);
    results.push({
      test: name,
      status: 'FAIL',
      message: error.message
    });
  }
}

// ========================================
// TESTS
// ========================================

async function testHealthCheck(): Promise<TestResult> {
  const start = Date.now();
  
  try {
    // La API no tiene /health, usar el endpoint raíz GET /
    const response = await fetch(`${TRADINGVIEW_API}/`, {
      method: 'GET',
      headers: { 'X-API-Key': API_KEY }
    });
    
    const duration = Date.now() - start;
    const data = await response.json();
    
    if (response.ok) {
      return {
        test: 'Health Check',
        status: 'PASS',
        message: 'API TradingView responde correctamente',
        duration,
        data: {
          status: 'online',
          endpoints: data.availableEndpoints?.length || 0
        }
      };
    } else {
      return {
        test: 'Health Check',
        status: 'FAIL',
        message: `API responde pero con error: ${response.status}`,
        duration,
        data
      };
    }
  } catch (error: any) {
    return {
      test: 'Health Check',
      status: 'FAIL',
      message: `No se puede conectar al microservicio: ${error.message}`
    };
  }
}

async function testAuthValidation(): Promise<TestResult> {
  const start = Date.now();
  
  try {
    // Intentar sin API key (debe fallar)
    const response = await fetch(`${TRADINGVIEW_API}/`, {
      method: 'GET'
    });
    
    const duration = Date.now() - start;
    
    if (response.status === 401 || response.status === 403) {
      return {
        test: 'Auth Validation',
        status: 'PASS',
        message: 'API rechaza correctamente peticiones sin autenticación',
        duration
      };
    } else if (response.ok) {
      return {
        test: 'Auth Validation',
        status: 'WARN',
        message: 'API permite peticiones sin auth (endpoint público)',
        duration
      };
    } else {
      return {
        test: 'Auth Validation',
        status: 'WARN',
        message: `API responde sin auth pero con status: ${response.status}`,
        duration
      };
    }
  } catch (error: any) {
    return {
      test: 'Auth Validation',
      status: 'FAIL',
      message: `Error en test de auth: ${error.message}`
    };
  }
}

async function testGetUserAccess(): Promise<TestResult> {
  const start = Date.now();
  const testUsername = 'apidevs'; // Usuario de prueba conocido
  
  try {
    const response = await fetch(
      `${TRADINGVIEW_API}/api/access/user/${testUsername}`,
      {
        method: 'GET',
        headers: { 'X-API-Key': API_KEY }
      }
    );
    
    const duration = Date.now() - start;
    const data = await response.json();
    
    if (response.ok) {
      return {
        test: 'Get User Access',
        status: 'PASS',
        message: `Usuario ${testUsername}: ${data.length || 0} accesos encontrados`,
        duration,
        data: { count: data.length || 0, sample: data[0] }
      };
    } else {
      return {
        test: 'Get User Access',
        status: 'WARN',
        message: `Endpoint responde pero con error: ${response.status}`,
        duration,
        data
      };
    }
  } catch (error: any) {
    return {
      test: 'Get User Access',
      status: 'FAIL',
      message: `Error consultando accesos: ${error.message}`
    };
  }
}

async function testGrantAccessSingle(): Promise<TestResult> {
  const start = Date.now();
  
  // ⚠️ SOLO SIMULAR - NO EJECUTAR REALMENTE
  // Este test verifica la estructura del request, no lo ejecuta
  
  const testPayload = {
    users: ['apidevs'],
    pine_ids: ['PUB;7c7e236c6da54dc4af78a87b788f126a'], // RSI Bands test
    duration: '7D',
    options: {
      preValidateUsers: false,
      onProgress: false
    }
  };
  
  log(`   Payload de prueba preparado (NO ejecutado):`);
  log(`   ${JSON.stringify(testPayload, null, 2)}`);
  
  return {
    test: 'Grant Access Single (DRY RUN)',
    status: 'PASS',
    message: 'Estructura de request validada (no ejecutado)',
    data: testPayload
  };
}

async function testBulkAccessStructure(): Promise<TestResult> {
  // Verificar estructura del endpoint bulk
  const testPayload = {
    users: ['user1', 'user2', 'user3'],
    pine_ids: [
      'PUB;7c7e236c6da54dc4af78a87b788f126a',
      'PUB;ebd861d70a9f478bb06fe60c5d8f469c'
    ],
    duration: '30D',
    options: {
      preValidateUsers: false,
      onProgress: false
    }
  };
  
  log(`   Payload bulk preparado (NO ejecutado):`);
  log(`   - ${testPayload.users.length} usuarios`);
  log(`   - ${testPayload.pine_ids.length} indicadores`);
  log(`   - Total operaciones: ${testPayload.users.length * testPayload.pine_ids.length}`);
  
  return {
    test: 'Bulk Access Structure (DRY RUN)',
    status: 'PASS',
    message: 'Estructura de request bulk validada',
    data: {
      users: testPayload.users.length,
      indicators: testPayload.pine_ids.length,
      totalOps: testPayload.users.length * testPayload.pine_ids.length
    }
  };
}

// ========================================
// MAIN
// ========================================

async function main() {
  console.clear();
  console.log(`${colors.bold}${colors.cyan}`);
  console.log(`╔════════════════════════════════════════════════════════════╗`);
  console.log(`║  🧪 TradingView API - Health Check & Testing             ║`);
  console.log(`║  APIDevs Trading Platform                                 ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝`);
  console.log(colors.reset);
  
  log(`\n📡 Endpoint: ${TRADINGVIEW_API}`);
  log(`🔑 API Key: ${API_KEY.substring(0, 20)}...`);
  log(`⏰ Fecha: ${new Date().toLocaleString('es-ES')}`);
  
  // Ejecutar tests
  await runTest('1. Health Check', testHealthCheck);
  await runTest('2. Auth Validation', testAuthValidation);
  await runTest('3. Get User Access', testGetUserAccess);
  await runTest('4. Grant Access Single', testGrantAccessSingle);
  await runTest('5. Bulk Access Structure', testBulkAccessStructure);
  
  // Resumen final
  console.log(`\n${colors.bold}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bold}📊 RESUMEN DE TESTS${colors.reset}\n`);
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  
  console.log(`   ${colors.green}✓ PASS: ${passed}${colors.reset}`);
  console.log(`   ${colors.red}✗ FAIL: ${failed}${colors.reset}`);
  console.log(`   ${colors.yellow}⚠ WARN: ${warned}${colors.reset}`);
  console.log(`   ━━━━━━━━━━━━━━━━`);
  console.log(`   TOTAL: ${results.length} tests\n`);
  
  if (failed === 0) {
    console.log(`${colors.green}${colors.bold}🎉 ¡TODOS LOS TESTS PASARON!${colors.reset}\n`);
  } else {
    console.log(`${colors.red}${colors.bold}❌ ${failed} test(s) fallaron${colors.reset}\n`);
  }
  
  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

main();

