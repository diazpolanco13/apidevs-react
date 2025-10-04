import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TRADINGVIEW_API = 'http://185.218.124.241:5001';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * 🎯 MAPEO DE PRODUCTOS STRIPE → INDICADORES TRADINGVIEW
 * 
 * Actualiza este mapeo cuando agregues nuevos productos/indicadores
 */
const PRODUCT_TO_INDICATORS_MAP: Record<string, string[]> = {
  // Planes de suscripción → Todos los indicadores
  'plan_mensual': ['PUB;af43255c0c144618842478be41c7ec18'], // Position Size
  'plan_semestral': ['PUB;af43255c0c144618842478be41c7ec18'],
  'plan_anual': ['PUB;af43255c0c144618842478be41c7ec18'],
  'plan_lifetime': ['PUB;af43255c0c144618842478be41c7ec18'],
  
  // Indicadores individuales
  'position_size': ['PUB;af43255c0c144618842478be41c7ec18'],
  'rsi_bands': ['PUB;7c7e236c6da54dc4af78a87b788f126a'],
  'rsi_scanner': ['PUB;ebd861d70a9f478bb06fe60c5d8f469c'],
  
  // Por defecto, cualquier compra da acceso a Position Size
  'default': ['PUB;af43255c0c144618842478be41c7ec18']
};

/**
 * 🎯 MAPEO DE DURACIÓN POR TIPO DE PRECIO
 */
const PRICE_DURATION_MAP: Record<string, string> = {
  'month': '30D',
  'year': '1Y',
  'one_time': '1L', // Compras únicas = Lifetime
  'lifetime': '1L'
};

interface GrantAccessResult {
  success: boolean;
  userId?: string;
  tradingviewUsername?: string;
  indicatorsGranted?: number;
  errors?: string[];
  reason?: string;
}

/**
 * 🚀 FUNCIÓN PRINCIPAL: Conceder acceso automático después de una compra
 * 
 * Esta función se llama desde los webhooks de Stripe cuando:
 * - checkout.session.completed
 * - payment_intent.succeeded  
 * - invoice.payment_succeeded
 * 
 * @param customerEmail - Email del cliente de Stripe
 * @param productIds - IDs de productos comprados (o nombres/metadata)
 * @param priceId - ID del precio de Stripe (para determinar duración)
 * @param purchaseId - ID de la compra en Supabase (para auditoría)
 * @param source - Origen de la compra ('checkout', 'subscription', 'invoice')
 */
export async function grantIndicatorAccessOnPurchase(
  customerEmail: string,
  productIds: string[],
  priceId?: string,
  purchaseId?: string,
  source: 'checkout' | 'subscription' | 'invoice' = 'checkout'
): Promise<GrantAccessResult> {
  
  console.log(`\n🎯 AUTO-GRANT: Iniciando para ${customerEmail}`);
  console.log(`   Productos: ${productIds.join(', ')}`);
  console.log(`   Origen: ${source}`);

  try {
    // 1. Buscar usuario en Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, tradingview_username')
      .eq('email', customerEmail)
      .maybeSingle();

    if (userError || !user) {
      console.log(`   ⚠️ Usuario no encontrado en Supabase: ${customerEmail}`);
      return {
        success: false,
        reason: 'Usuario no registrado en la plataforma'
      };
    }

    if (!user.tradingview_username) {
      console.log(`   ⚠️ Usuario sin tradingview_username: ${customerEmail}`);
      return {
        success: false,
        userId: user.id,
        reason: 'Usuario no completó onboarding (sin tradingview_username)'
      };
    }

    console.log(`   ✅ Usuario encontrado: ${user.tradingview_username}`);

    // 2. Mapear productos → indicadores TradingView
    const pineIds = mapProductsToIndicators(productIds);
    
    if (pineIds.length === 0) {
      console.log(`   ⚠️ No se encontraron indicadores para los productos: ${productIds.join(', ')}`);
      return {
        success: false,
        userId: user.id,
        tradingviewUsername: user.tradingview_username,
        reason: 'No hay indicadores asociados a los productos comprados'
      };
    }

    console.log(`   📦 ${pineIds.length} indicadores a conceder: ${pineIds.join(', ')}`);

    // 3. Determinar duración del acceso
    const duration = await getDurationFromPrice(priceId);
    console.log(`   ⏰ Duración: ${duration}`);

    // 4. Conceder acceso en TradingView
    const tvResponse = await fetch(
      `${TRADINGVIEW_API}/api/access/${user.tradingview_username}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pine_ids: pineIds,
          duration: duration
        })
      }
    );

    const tvResult = await tvResponse.json();
    console.log(`   📡 Respuesta TradingView:`, tvResult);

    if (!tvResponse.ok || !Array.isArray(tvResult)) {
      console.error(`   ❌ Error en TradingView:`, tvResult);
      return {
        success: false,
        userId: user.id,
        tradingviewUsername: user.tradingview_username,
        reason: `Error en TradingView: ${tvResult.error || 'Unknown'}`
      };
    }

    // 5. Obtener indicadores de Supabase para registrar accesos
    const { data: dbIndicators } = await supabase
      .from('indicators')
      .select('id, pine_id, name');

    // 6. Registrar cada acceso en indicator_access
    let successCount = 0;
    const errors: string[] = [];

    for (const tvIndicator of tvResult) {
      if (tvIndicator.status !== 'Success') {
        errors.push(`${tvIndicator.pine_id}: ${tvIndicator.error || 'Failed'}`);
        continue;
      }

      // Buscar indicador en Supabase
      const indicator = dbIndicators?.find(ind => ind.pine_id === tvIndicator.pine_id);
      
      if (!indicator) {
        console.log(`   ⚠️ Indicador ${tvIndicator.pine_id} no existe en Supabase`);
        continue;
      }

      // ✅ CRÍTICO: Usar la fecha de expiración QUE TRADINGVIEW RETORNA
      const expiresAt = tvIndicator.expiration || null;

      // Verificar si ya existe el acceso
      const { data: existingAccess } = await supabase
        .from('indicator_access')
        .select('id')
        .eq('user_id', user.id)
        .eq('indicator_id', indicator.id)
        .maybeSingle();

      const accessData = {
        user_id: user.id,
        indicator_id: indicator.id,
        tradingview_username: user.tradingview_username,
        status: 'active',
        granted_at: new Date().toISOString(),
        expires_at: expiresAt, // ✅ Fecha EXACTA de TradingView
        duration_type: duration,
        access_source: 'purchase', // ✅ Marca que fue por compra
        granted_by: null, // Sistema automático
        tradingview_response: tvIndicator, // ✅ Guardar respuesta completa
        error_message: null
      };

      if (existingAccess) {
        // Actualizar acceso existente (renovación)
        await supabase
          .from('indicator_access')
          .update(accessData)
          .eq('id', existingAccess.id);
      } else {
        // Crear nuevo acceso
        await supabase
          .from('indicator_access')
          .insert(accessData);
      }

      successCount++;
      console.log(`   ✅ ${indicator.name}: expires_at = ${expiresAt || 'LIFETIME'}`);
    }

    console.log(`\n   🎉 AUTO-GRANT COMPLETADO: ${successCount}/${pineIds.length} indicadores concedidos`);

    return {
      success: successCount > 0,
      userId: user.id,
      tradingviewUsername: user.tradingview_username,
      indicatorsGranted: successCount,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error: any) {
    console.error(`   ❌ ERROR en auto-grant:`, error);
    return {
      success: false,
      reason: `Error interno: ${error.message}`
    };
  }
}

/**
 * 🗺️ Mapea productos de Stripe a indicadores de TradingView
 */
function mapProductsToIndicators(productIds: string[]): string[] {
  const pineIds = new Set<string>();

  for (const productId of productIds) {
    // Normalizar el ID del producto (lowercase, sin espacios)
    const normalizedId = productId.toLowerCase().replace(/\s+/g, '_');
    
    // Buscar en el mapeo
    const indicators = PRODUCT_TO_INDICATORS_MAP[normalizedId] || PRODUCT_TO_INDICATORS_MAP['default'];
    
    indicators.forEach(id => pineIds.add(id));
  }

  return Array.from(pineIds);
}

/**
 * ⏰ Determina la duración del acceso basándose en el precio de Stripe
 */
async function getDurationFromPrice(priceId?: string): Promise<string> {
  if (!priceId) {
    return '1Y'; // Por defecto 1 año
  }

  try {
    // Consultar precio en Supabase
    const { data: price } = await supabase
      .from('prices')
      .select('interval, type')
      .eq('id', priceId)
      .maybeSingle();

    if (!price) {
      return '1Y'; // Fallback
    }

    // Si es one-time o no tiene intervalo, es Lifetime
    if (price.type === 'one_time' || !price.interval) {
      return '1L';
    }

    // Mapear intervalo a duración
    return PRICE_DURATION_MAP[price.interval] || '1Y';

  } catch (error) {
    console.error('Error obteniendo duración del precio:', error);
    return '1Y'; // Fallback seguro
  }
}

/**
 * 🔍 Extrae IDs de productos desde diferentes fuentes de Stripe
 */
export function extractProductIds(
  lineItems?: Stripe.LineItem[] | Stripe.InvoiceLineItem[],
  metadata?: Record<string, string>
): string[] {
  const productIds: string[] = [];

  // Extraer de line items
  if (lineItems && lineItems.length > 0) {
    for (const item of lineItems) {
      if ('price' in item && item.price) {
        // De checkout session
        const price = item.price as Stripe.Price;
        if (price.product) {
          const productId = typeof price.product === 'string' 
            ? price.product 
            : price.product.id;
          productIds.push(productId);
        }
      } else if ('plan' in item && item.plan) {
        // De invoice (suscripciones)
        const plan = item.plan as any;
        if (plan.product) {
          productIds.push(plan.product);
        }
      }
    }
  }

  // Extraer de metadata
  if (metadata) {
    if (metadata.product_id) {
      productIds.push(metadata.product_id);
    }
    if (metadata.product_name) {
      productIds.push(metadata.product_name);
    }
  }

  return productIds;
}

