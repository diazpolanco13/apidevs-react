import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function createTestUser() {
  console.log('🔧 Creando usuario de prueba: pro-mensual@test.com\n');
  
  const userId = crypto.randomUUID();
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: userId,
      email: 'pro-mensual@test.com',
      full_name: 'Usuario Test Mensual',
      tradingview_username: 'apidevs', // Usar el username real que funciona
      customer_tier: 'free',
      is_legacy_user: false,
      total_lifetime_spent: 0,
      purchase_count: 0,
      customer_since: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    if (error.code === '23505') {
      console.log('⚠️  Usuario ya existe, obteniendo datos...');
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'pro-mensual@test.com')
        .single();
      
      if (fetchError) {
        console.error('❌ Error:', fetchError);
        return;
      }
      
      console.log('\n✅ Usuario existente:');
      console.log('   ID:', existingUser.id);
      console.log('   Email:', existingUser.email);
      console.log('   TradingView:', existingUser.tradingview_username);
      console.log('\n📝 USER_ID para usar en testing:');
      console.log(`   ${existingUser.id}`);
      return;
    }
    
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('✅ Usuario creado exitosamente:');
  console.log('   ID:', data.id);
  console.log('   Email:', data.email);
  console.log('   TradingView:', data.tradingview_username);
  console.log('\n📝 USER_ID para usar en testing:');
  console.log(`   ${data.id}`);
}

createTestUser();

