#!/usr/bin/env tsx
/**
 * Script para obtener los datos de un usuario registrado
 * para usar en pruebas de renovaciones con Stripe CLI
 * 
 * Uso:
 *   npx tsx .testing-temp/get-user-data.ts usuario@ejemplo.com
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getUserData(email: string) {
  console.log(`\n🔍 Buscando usuario: ${email}\n`);

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, tradingview_username, created_at')
    .eq('email', email)
    .single();

  if (error || !user) {
    console.log('❌ Usuario no encontrado en Supabase');
    console.log('\n📋 Para crear un usuario de prueba:');
    console.log('   1. Ir a http://localhost:3000/register');
    console.log('   2. Completar registro con un email de prueba');
    console.log('   3. Ingresar username REAL de TradingView durante onboarding');
    console.log('   4. Ejecutar este script de nuevo\n');
    process.exit(1);
  }

  console.log('✅ Usuario encontrado:\n');
  console.log('📧 Email:', user.email);
  console.log('🆔 User ID:', user.id);
  console.log('📺 TradingView:', user.tradingview_username || '❌ NO CONFIGURADO');
  console.log('📅 Registrado:', new Date(user.created_at).toLocaleString());

  if (!user.tradingview_username) {
    console.log('\n⚠️  ADVERTENCIA: Este usuario NO tiene tradingview_username');
    console.log('   El auto-grant NO funcionará sin este campo');
    console.log('   Solución: Usuario debe completar el onboarding');
    process.exit(1);
  }

  console.log('\n📋 Variables para usar en scripts de testing:\n');
  console.log(`USER_EMAIL="${user.email}"`);
  console.log(`USER_ID="${user.id}"`);
  console.log(`TV_USERNAME="${user.tradingview_username}"`);

  console.log('\n✅ Datos listos para testing de renovaciones\n');
}

// Obtener email del argumento
const email = process.argv[2];

if (!email) {
  console.log('\n❌ Error: Debes proporcionar un email');
  console.log('\nUso:');
  console.log('  npx tsx .testing-temp/get-user-data.ts usuario@ejemplo.com\n');
  process.exit(1);
}

getUserData(email);

