import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkIndicators() {
  console.log('🔍 Verificando indicadores activos...\n');
  
  const { data: indicators, error } = await supabase
    .from('indicators')
    .select('id, name, pine_id, access_tier, status')
    .eq('status', 'activo')
    .order('access_tier', { ascending: true });
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`📊 Total de indicadores activos: ${indicators?.length || 0}\n`);
  
  const free = indicators?.filter(i => i.access_tier === 'free') || [];
  const premium = indicators?.filter(i => i.access_tier === 'premium') || [];
  
  console.log(`🎁 FREE: ${free.length}`);
  free.forEach(i => console.log(`   - ${i.name} (${i.pine_id})`));
  
  console.log(`\n💎 PREMIUM: ${premium.length}`);
  premium.forEach(i => console.log(`   - ${i.name} (${i.pine_id})`));
  
  console.log(`\n✅ Total esperado para planes PRO (all): ${indicators?.length || 0}`);
}

checkIndicators();

