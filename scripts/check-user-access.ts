#!/usr/bin/env tsx
/**
 * 🔍 CHECK USER ACCESS IN TRADINGVIEW
 * 
 * Verifica el estado real de acceso de un usuario en TradingView
 * comparándolo con los registros en Supabase
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TRADINGVIEW_API = process.env.TRADINGVIEW_API_URL || 'http://185.218.124.241:5001';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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

async function checkUserAccess(email: string) {
  console.log(`\n${c.bright}${c.cyan}╔════════════════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bright}${c.cyan}║     🔍 VERIFICACIÓN DE ACCESO TRADINGVIEW             ║${c.reset}`);
  console.log(`${c.bright}${c.cyan}╚════════════════════════════════════════════════════════╝${c.reset}\n`);

  // 1. Buscar usuario en Supabase
  console.log(`${c.blue}📧 Buscando usuario: ${email}${c.reset}`);
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, tradingview_username')
    .eq('email', email)
    .single();

  if (userError || !user) {
    console.log(`${c.red}❌ Usuario no encontrado en Supabase${c.reset}`);
    return;
  }

  console.log(`${c.green}✓ Usuario encontrado:${c.reset}`);
  console.log(`   ID: ${user.id}`);
  console.log(`   TradingView: @${user.tradingview_username}\n`);

  // 2. Obtener accesos activos en Supabase
  console.log(`${c.blue}📊 Consultando accesos en Supabase...${c.reset}`);
  const { data: accesses, error: accessError } = await supabase
    .from('indicator_access')
    .select(`
      *,
      indicators (name, pine_id, access_tier)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('granted_at', { ascending: false });

  if (accessError) {
    console.log(`${c.red}❌ Error consultando accesos: ${accessError.message}${c.reset}`);
    return;
  }

  console.log(`${c.green}✓ Accesos activos en DB: ${accesses?.length || 0}${c.reset}\n`);

  if (accesses && accesses.length > 0) {
    console.log(`${c.bright}Detalle de accesos en Supabase:${c.reset}`);
    accesses.forEach((access: any, idx: number) => {
      const indicator = access.indicators;
      console.log(`\n${c.cyan}${idx + 1}. ${indicator.name}${c.reset}`);
      console.log(`   Pine ID: ${indicator.pine_id}`);
      console.log(`   Tier: ${indicator.access_tier}`);
      console.log(`   Duración: ${access.duration_type}`);
      console.log(`   Fuente: ${access.access_source}`);
      console.log(`   Concedido: ${new Date(access.granted_at).toLocaleString()}`);
      console.log(`   Expira: ${access.expires_at ? new Date(access.expires_at).toLocaleString() : 'NUNCA'}`);
      console.log(`   Estado: ${access.status}`);
    });
  }

  // 3. Verificar en TradingView API
  console.log(`\n${c.blue}🔍 Verificando acceso real en TradingView...${c.reset}`);
  
  try {
    const supabasePineIds = accesses?.map((a: any) => a.indicators.pine_id) || [];
    
    // El endpoint requiere pine_ids como query parameter JSON
    const pineIdsParam = encodeURIComponent(JSON.stringify(supabasePineIds));
    const url = `${TRADINGVIEW_API}/api/access/${user.tradingview_username}?pine_ids=${pineIdsParam}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.log(`${c.red}❌ Error en API TradingView: ${response.status}${c.reset}`);
      const errorText = await response.text();
      console.log(`   Response: ${errorText}`);
      return;
    }

    const tvData = await response.json();
    console.log(`${c.green}✓ Respuesta de TradingView:${c.reset}`);
    console.log(JSON.stringify(tvData, null, 2));

    // 4. Comparar Supabase vs TradingView
    console.log(`\n${c.bright}${c.magenta}═══════════════════════════════════════${c.reset}`);
    console.log(`${c.bright}${c.magenta}   📊 COMPARACIÓN DB vs TRADINGVIEW${c.reset}`);
    console.log(`${c.bright}${c.magenta}═══════════════════════════════════════${c.reset}\n`);

    // Extraer pine_ids con acceso en TradingView
    // El API puede retornar array directamente o dentro de 'results'
    const tvResults = Array.isArray(tvData) ? tvData : (tvData.results || []);
    const tvPineIds = tvResults
      .filter((r: any) => r.hasAccess === true || r.has_access === true)
      .map((r: any) => r.pine_id) || [];

    console.log(`${c.cyan}En Supabase (${supabasePineIds.length}):${c.reset}`, supabasePineIds);
    console.log(`${c.cyan}Con acceso en TradingView (${tvPineIds.length}):${c.reset}`, tvPineIds);

    const missingInTV = supabasePineIds.filter((id: string) => !tvPineIds.includes(id));
    const extraInTV = tvPineIds.filter((id: string) => !supabasePineIds.includes(id));

    if (missingInTV.length > 0) {
      console.log(`\n${c.red}❌ Faltantes en TradingView (${missingInTV.length}):${c.reset}`, missingInTV);
      console.log(`\n${c.yellow}Detalle de los que faltan:${c.reset}`);
      missingInTV.forEach((pineId: string) => {
        const access = accesses?.find((a: any) => a.indicators.pine_id === pineId);
        console.log(`   - ${access?.indicators.name} (${pineId})`);
      });
    } else {
      console.log(`\n${c.green}✅ Todos los indicadores de Supabase están en TradingView${c.reset}`);
    }

    if (extraInTV.length > 0) {
      console.log(`${c.yellow}⚠️  Extras en TradingView (${extraInTV.length}):${c.reset}`, extraInTV);
    }

  } catch (error: any) {
    console.log(`${c.red}❌ Error consultando TradingView API:${c.reset}`, error.message);
  }

  console.log(`\n${c.bright}${c.cyan}════════════════════════════════════════════════════════${c.reset}\n`);
}

// Ejecutar
const email = process.argv[2];
if (!email) {
  console.log(`${c.red}❌ Uso: npx tsx scripts/check-user-access.ts <email>${c.reset}`);
  process.exit(1);
}

checkUserAccess(email).catch(console.error);

