/**
 * Script de prueba para validar el auto-revocamiento de accesos premium
 * cuando se cancela una suscripción en Stripe
 */

import dotenv from 'dotenv';
import { revokeIndicatorAccessOnCancellation } from '../utils/tradingview/auto-revoke-access';

// Cargar variables de entorno
dotenv.config({ path: '.env' });

async function testAutoRevoke() {
  console.log('🧪 ========== TEST AUTO-REVOKE ==========');
  console.log('📅 Fecha:', new Date().toISOString());
  console.log('=========================================\n');

  // Usuario de prueba (debe existir en la base de datos)
  const testEmail = 'api@apidevs.io'; // Usuario admin que sabemos que existe
  const testSubscriptionId = 'sub_test_12345'; // ID ficticio para testing

  try {
    console.log('🎯 Iniciando test de auto-revocamiento...');
    console.log('📧 Email de prueba:', testEmail);
    console.log('🔖 Subscription ID:', testSubscriptionId);
    console.log('');

    const result = await revokeIndicatorAccessOnCancellation(
      testEmail,
      testSubscriptionId,
      'subscription_deleted'
    );

    console.log('\n📊 RESULTADO DEL TEST:');
    console.log('✅ Success:', result.success);
    console.log('📝 Reason:', result.reason);
    console.log('👤 User ID:', result.userId || 'N/A');
    console.log('🎮 TradingView Username:', result.tradingviewUsername || 'N/A');
    console.log('🚫 Accesos Revocados:', result.accessesRevoked || 0);
    
    if (result.indicatorsAffected && result.indicatorsAffected.length > 0) {
      console.log('📊 Indicadores Afectados:');
      result.indicatorsAffected.forEach((indicator, index) => {
        console.log(`   ${index + 1}. ${indicator}`);
      });
    }

    if (result.tradingViewResponse) {
      console.log('📡 TradingView Response:', JSON.stringify(result.tradingViewResponse, null, 2));
    }

    console.log('\n🎉 Test completado exitosamente!');
    
  } catch (error: any) {
    console.error('\n❌ Error en test:', error?.message || error);
    console.error('Stack:', error?.stack);
  }

  console.log('\n=========================================');
  console.log('🏁 Test finalizado');
  console.log('=========================================');
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  testAutoRevoke()
    .then(() => {
      console.log('\n✅ Script ejecutado correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Error ejecutando script:', error);
      process.exit(1);
    });
}

export { testAutoRevoke };
