#!/usr/bin/env tsx
/**
 * Script para obtener datos de usuario para testing
 * Uso: npx tsx .testing-temp/get-user-data.ts pro-mensual@test.com
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getUserData(email: string) {
  console.log(`\n🔍 Buscando usuario: ${email}\n`);

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, full_name, tradingview_username, customer_since')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!user) {
    console.log('⚠️  Usuario no encontrado en la tabla users');
    console.log('\n💡 ¿Necesitas crear el usuario?');
    console.log('   1. Ir a http://localhost:3000/register');
    console.log('   2. Registrarse con este email');
    console.log('   3. Completar onboarding con TradingView username real\n');
    return;
  }

  console.log('✅ Usuario encontrado:\n');
  console.log('📧 Email:', user.email);
  console.log('🆔 User ID:', user.id);
  console.log('👤 Nombre:', user.full_name || 'No especificado');
  console.log('📊 TradingView:', user.tradingview_username || '⚠️  NO CONFIGURADO');
  console.log('📅 Registrado:', user.customer_since ? new Date(user.customer_since).toLocaleDateString('es-ES') : 'N/A');

  if (!user.tradingview_username) {
    console.log('\n⚠️  IMPORTANTE: El usuario NO tiene tradingview_username');
    console.log('   El auto-grant NO funcionará sin este campo.');
    console.log('   Debe completar el onboarding primero.\n');
  } else {
    console.log('\n✅ Usuario listo para testing de auto-grant\n');
    console.log('📋 Datos para scripts de Stripe CLI:\n');
    console.log(`USER_EMAIL="${user.email}"`);
    console.log(`USER_ID="${user.id}"`);
    console.log(`TV_USERNAME="${user.tradingview_username}"`);
    console.log('');
  }
}

const email = process.argv[2];
if (!email) {
  console.error('❌ Uso: npx tsx .testing-temp/get-user-data.ts <email>');
  process.exit(1);
}

getUserData(email);
