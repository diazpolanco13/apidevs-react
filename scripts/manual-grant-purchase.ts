#!/usr/bin/env tsx
/**
 * 🔧 Script Manual: Conceder Accesos de Compra Faltante
 * 
 * Este script concede manualmente los accesos de indicadores para compras
 * donde el webhook de Stripe no ejecutó el auto-grant correctamente.
 * 
 * USO:
 *   npx tsx scripts/manual-grant-purchase.ts <purchase_id_or_email>
 * 
 * EJEMPLOS:
 *   npx tsx scripts/manual-grant-purchase.ts 7bde75c0-29dd-43af-bcdf-4fb2f0404d2a
 *   npx tsx scripts/manual-grant-purchase.ts onboarding@apidevs.io
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TRADINGVIEW_API = 'http://185.218.124.241:5001';
const TRADINGVIEW_API_KEY = '92a1e4a8c74e1871c658301f3e8ae31c31ed6bfd68629059617fac621932e1ea';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Colores para terminal
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
};

async function grantAccessForPurchase(purchaseIdOrEmail: string) {
  console.log(`\n${c.bold}${c.cyan}╔═══════════════════════════════════════════════════════════╗${c.reset}`);
  console.log(`${c.bold}${c.cyan}║  🔧 Manual Grant - Conceder Accesos de Compra Faltante  ║${c.reset}`);
  console.log(`${c.bold}${c.cyan}╚═══════════════════════════════════════════════════════════╝${c.reset}\n`);

  // 1. Buscar la compra
  console.log(`${c.cyan}📦 Buscando compra...${c.reset}`);
  
  let query = supabase
    .from('purchases')
    .select('*');
  
  // Buscar por ID o email
  if (purchaseIdOrEmail.includes('@')) {
    query = query.eq('customer_email', purchaseIdOrEmail);
  } else {
    query = query.eq('id', purchaseIdOrEmail);
  }
  
  const { data: purchase, error: purchaseError } = await query
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (purchaseError || !purchase) {
    console.error(`${c.red}❌ Compra no encontrada: ${purchaseError?.message}${c.reset}`);
    process.exit(1);
  }

  console.log(`${c.green}✅ Compra encontrada:${c.reset}`);
  console.log(`${c.dim}   ID: ${purchase.id}${c.reset}`);
  console.log(`${c.dim}   Email: ${purchase.customer_email}${c.reset}`);
  console.log(`${c.dim}   Total: $${(purchase.order_total_cents / 100).toFixed(2)} ${purchase.currency}${c.reset}`);
  console.log(`${c.dim}   Fecha: ${new Date(purchase.order_date).toLocaleString('es-ES')}${c.reset}`);
  console.log(`${c.dim}   Estado: ${purchase.payment_status}${c.reset}`);

  // 2. Buscar usuario
  console.log(`\n${c.cyan}👤 Buscando usuario...${c.reset}`);
  
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, email, tradingview_username')
    .eq('email', purchase.customer_email)
    .maybeSingle();

  if (userError || !user) {
    console.error(`${c.red}❌ Usuario no encontrado en Supabase: ${purchase.customer_email}${c.reset}`);
    console.log(`${c.yellow}💡 El usuario debe registrarse en la plataforma primero.${c.reset}`);
    process.exit(1);
  }

  console.log(`${c.green}✅ Usuario encontrado:${c.reset}`);
  console.log(`${c.dim}   ID: ${user.id}${c.reset}`);
  console.log(`${c.dim}   Email: ${user.email}${c.reset}`);
  console.log(`${c.dim}   TradingView: ${user.tradingview_username}${c.reset}`);

  if (!user.tradingview_username) {
    console.error(`${c.red}❌ Usuario sin tradingview_username configurado${c.reset}`);
    console.log(`${c.yellow}💡 El usuario debe completar su onboarding primero.${c.reset}`);
    process.exit(1);
  }

  // 3. Obtener indicadores activos
  console.log(`\n${c.cyan}📊 Obteniendo indicadores activos...${c.reset}`);
  
  const { data: indicators, error: indicatorsError } = await supabase
    .from('indicators')
    .select('id, pine_id, name, access_tier')
    .eq('status', 'activo')
    .order('access_tier', { ascending: false }); // Premium primero

  if (indicatorsError || !indicators || indicators.length === 0) {
    console.error(`${c.red}❌ No se encontraron indicadores activos${c.reset}`);
    process.exit(1);
  }

  console.log(`${c.green}✅ ${indicators.length} indicadores activos encontrados:${c.reset}`);
  indicators.forEach((ind, idx) => {
    const tier = ind.access_tier === 'premium' ? '💎' : '🎁';
    console.log(`${c.dim}   ${idx + 1}. ${tier} ${ind.name}${c.reset}`);
  });

  // 4. Verificar si ya tiene accesos
  console.log(`\n${c.cyan}🔍 Verificando accesos existentes...${c.reset}`);
  
  const { data: existingAccesses } = await supabase
    .from('indicator_access')
    .select('indicator_id')
    .eq('user_id', user.id);

  const existingIndicatorIds = new Set((existingAccesses || []).map(a => a.indicator_id));
  
  if (existingIndicatorIds.size > 0) {
    console.log(`${c.yellow}⚠️  Usuario ya tiene ${existingIndicatorIds.size} accesos existentes${c.reset}`);
  } else {
    console.log(`${c.dim}   Sin accesos previos${c.reset}`);
  }

  // 5. Conceder accesos en TradingView (usando endpoint individual)
  console.log(`\n${c.cyan}🚀 Concediendo accesos en TradingView...${c.reset}`);
  console.log(`${c.dim}   Endpoint: ${TRADINGVIEW_API}/api/access (individual)${c.reset}`);
  console.log(`${c.dim}   Usuario: ${user.tradingview_username}${c.reset}`);
  console.log(`${c.dim}   Duración: 1Y (1 año)${c.reset}\n`);

  const pineIds = indicators.map(ind => ind.pine_id);
  const userResults: any[] = [];

  try {
    // Conceder acceso a cada indicador individualmente (sin API key)
    for (const pineId of pineIds) {
      const indicator = indicators.find(ind => ind.pine_id === pineId);
      console.log(`${c.dim}   → Procesando: ${indicator?.name}...${c.reset}`);
      
      try {
        const tvResponse = await fetch(`${TRADINGVIEW_API}/api/access/${user.tradingview_username}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pine_ids: [pineId],
            duration: '1Y'
          })
        });

        const tvResult = await tvResponse.json();
        
        if (tvResponse.ok) {
          // TradingView retorna un array de resultados
          const result = Array.isArray(tvResult) ? tvResult[0] : tvResult;
          
          userResults.push({
            pine_id: pineId,
            status: 'Success',
            expiration: result?.expiration || null,  // ✅ Usar la fecha que TradingView retorna
            message: result?.message
          });
        } else {
          userResults.push({
            pine_id: pineId,
            status: 'Failed',
            error: tvResult.error || tvResult.message || 'Unknown error'
          });
        }
        
        // Delay para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        userResults.push({
          pine_id: pineId,
          status: 'Failed',
          error: error.message
        });
      }
    }

    console.log(`${c.green}✅ Procesamiento completado:${c.reset}`);
    const tvSuccessCount = userResults.filter(r => r.status === 'Success').length;
    console.log(`${c.dim}   Exitosos: ${tvSuccessCount}/${userResults.length}${c.reset}\n`);

    // 6. Registrar accesos en Supabase
    console.log(`${c.cyan}💾 Registrando accesos en Supabase...${c.reset}\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const tvIndicator of userResults) {
      const indicator = indicators.find(ind => ind.pine_id === tvIndicator.pine_id);
      
      if (!indicator) {
        console.log(`${c.yellow}   ⚠️  ${tvIndicator.pine_id}: No encontrado en DB${c.reset}`);
        continue;
      }

      if (tvIndicator.status !== 'Success') {
        console.log(`${c.red}   ✗ ${indicator.name}: ${tvIndicator.error || 'Failed'}${c.reset}`);
        errorCount++;
        continue;
      }

      // Verificar si ya existe
      const alreadyExists = existingIndicatorIds.has(indicator.id);
      
      const accessData = {
        user_id: user.id,
        indicator_id: indicator.id,
        tradingview_username: user.tradingview_username,
        status: 'active',
        granted_at: new Date().toISOString(),
        expires_at: tvIndicator.expiration || null,
        duration_type: '1Y',
        access_source: 'purchase',
        granted_by: null,
        tradingview_response: tvIndicator,
        error_message: null,
        notes: `Manual grant for purchase ${purchase.id}`
      };

      if (alreadyExists) {
        // UPDATE
        const { error } = await supabase
          .from('indicator_access')
          .update(accessData)
          .eq('user_id', user.id)
          .eq('indicator_id', indicator.id);

        if (error) {
          console.log(`${c.red}   ✗ ${indicator.name}: Error UPDATE - ${error.message}${c.reset}`);
          errorCount++;
        } else {
          console.log(`${c.cyan}   ↻ ${indicator.name}: Actualizado${c.reset}`);
          skipCount++;
        }
      } else {
        // INSERT
        const { error } = await supabase
          .from('indicator_access')
          .insert(accessData);

        if (error) {
          console.log(`${c.red}   ✗ ${indicator.name}: Error INSERT - ${error.message}${c.reset}`);
          errorCount++;
        } else {
          console.log(`${c.green}   ✓ ${indicator.name}: Concedido${c.reset}`);
          successCount++;
        }
      }

      // Registrar en log de auditoría
      const { error: logError } = await supabase
        .from('indicator_access_log')
        .insert({
          user_id: accessData.user_id,
          indicator_id: accessData.indicator_id,
          tradingview_username: accessData.tradingview_username,
          operation_type: 'grant',
          access_source: accessData.access_source,
          status: accessData.status,
          granted_at: accessData.granted_at,
          expires_at: accessData.expires_at,
          duration_type: accessData.duration_type,
          tradingview_response: accessData.tradingview_response,
          error_message: accessData.error_message,
          performed_by: null,
          notes: accessData.notes,
          metadata: {
            manual_grant: true,
            purchase_id: purchase.id,
            script_executed: new Date().toISOString()
          }
        });
      
      if (logError) {
        console.log(`${c.yellow}   ⚠️  ${indicator.name}: Log no registrado - ${logError.message}${c.reset}`);
      }
    }

    // 7. Resumen
    console.log(`\n${c.bold}${c.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
    console.log(`${c.bold}📊 RESUMEN${c.reset}\n`);
    console.log(`   ${c.green}✓ Concedidos (nuevos): ${successCount}${c.reset}`);
    console.log(`   ${c.cyan}↻ Actualizados: ${skipCount}${c.reset}`);
    console.log(`   ${c.red}✗ Errores: ${errorCount}${c.reset}`);
    console.log(`   ━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   📊 Total: ${successCount + skipCount + errorCount}\n`);

    if (successCount > 0 || skipCount > 0) {
      console.log(`${c.green}${c.bold}🎉 Accesos concedidos exitosamente${c.reset}`);
      console.log(`${c.dim}   Usuario: ${user.tradingview_username}${c.reset}`);
      console.log(`${c.dim}   Compra: ${purchase.order_number}${c.reset}\n`);
      console.log(`${c.cyan}💡 El usuario puede ver sus indicadores en TradingView ahora.${c.reset}\n`);
    } else {
      console.log(`${c.red}❌ No se pudo conceder ningún acceso${c.reset}\n`);
    }

  } catch (error: any) {
    console.error(`\n${c.red}❌ Error ejecutando auto-grant:${c.reset}`);
    console.error(`${c.red}   ${error.message}${c.reset}\n`);
    process.exit(1);
  }
}

// MAIN
const arg = process.argv[2];

if (!arg) {
  console.log(`${c.yellow}Uso: npx tsx scripts/manual-grant-purchase.ts <purchase_id_or_email>${c.reset}`);
  console.log(`${c.dim}Ejemplo: npx tsx scripts/manual-grant-purchase.ts onboarding@apidevs.io${c.reset}\n`);
  process.exit(1);
}

grantAccessForPurchase(arg);

