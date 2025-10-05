import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const TRADINGVIEW_API = 'http://185.218.124.241:5001';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * 🎯 MAPEO DE PRODUCTOS STRIPE → TIER DE ACCESO
 * 
 * Define qué tipo de acceso da cada producto:
 * - 'all': Todos los indicadores (free + premium)
 * - 'premium': Solo indicadores premium
 * - 'free': Solo indicadores free
 * - 'specific': Indicadores específicos (lista de pine_ids)
 */
const PRODUCT_ACCESS_MAP: Record<string, { 
  type: 'all' | 'premium' | 'free' | 'specific',
  pine_ids?: string[]
}> = {
  // Plan FREE → Solo indicadores gratuitos (access_tier='free')
  'apidevs_indicator_-_free_plan': { type: 'free' },
  'free_plan': { type: 'free' },
  'free': { type: 'free' },
  
  // Planes PRO → Acceso a TODOS los indicadores
  'plan_mensual': { type: 'all' },
  'plan_semestral': { type: 'all' },
  'plan_anual': { type: 'all' },
  'apidevs_indicator_-_pro': { type: 'all' },
  
  // Plan Lifetime → Acceso a TODOS los indicadores
  'plan_lifetime': { type: 'all' },
  'apidevs_trading_indicators': { type: 'all' }, // Producto genérico PRO
  
  // Si agregas productos específicos para indicadores individuales
  // 'producto_indicador_x': { type: 'specific', pine_ids: ['PUB;xxxxx'] },
  
  // Por defecto, si no coincide con nada, dar acceso a todos (planes PRO)
  'default': { type: 'all' }
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

    // 2. Determinar qué tipo de acceso corresponde al producto
    const accessConfig = getAccessConfigForProducts(productIds);
    console.log(`   🎯 Tipo de acceso: ${accessConfig.type}`);

    // 3. Obtener indicadores dinámicamente desde Supabase
    const pineIds = await getIndicatorsForAccess(accessConfig);
    
    if (pineIds.length === 0) {
      console.log(`   ⚠️ No se encontraron indicadores activos en la plataforma`);
      return {
        success: false,
        userId: user.id,
        tradingviewUsername: user.tradingview_username,
        reason: 'No hay indicadores activos en la plataforma'
      };
    }

    console.log(`   📦 ${pineIds.length} indicadores a conceder (dinámicos desde DB):`);
    console.log(`      ${pineIds.join(', ')}`);

    // 4. Determinar duración del acceso
    const duration = await getDurationFromPrice(priceId);
    console.log(`   ⏰ Duración: ${duration}`);

    // 5. Conceder acceso en TradingView usando BULK API (más eficiente)
    const TRADINGVIEW_API_KEY = '92a1e4a8c74e1871c658301f3e8ae31c31ed6bfd68629059617fac621932e1ea';
    
    console.log(`   📡 Llamando a API TradingView BULK...`);
    console.log(`      Endpoint: ${TRADINGVIEW_API}/api/access/bulk`);
    console.log(`      Users: [${user.tradingview_username}]`);
    console.log(`      Pine IDs: ${pineIds.length} indicadores`);
    console.log(`      Duration: ${duration}`);
    
    const tvResponse = await fetch(
      `${TRADINGVIEW_API}/api/access/bulk`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': TRADINGVIEW_API_KEY
        },
        body: JSON.stringify({
          users: [user.tradingview_username], // Array de usuarios (bulk)
          pine_ids: pineIds,
          duration: duration,
          options: {
            preValidateUsers: false,  // Para mejor performance
            onProgress: false         // Sin callbacks de progreso
          }
        })
      }
    );

    const tvResult = await tvResponse.json();
    console.log(`   📡 Respuesta TradingView BULK:`, JSON.stringify(tvResult, null, 2));

    if (!tvResponse.ok) {
      console.error(`   ❌ Error HTTP en TradingView:`, tvResult);
      return {
        success: false,
        userId: user.id,
        tradingviewUsername: user.tradingview_username,
        reason: `Error en TradingView: ${tvResult.error || tvResult.message || 'Unknown'}`
      };
    }

    // El API bulk retorna un objeto con metadata + resultados por usuario
    // Formato: { success: N, failed: N, successRate: %, results: { username: [...] } }
    const userResults = tvResult.results?.[user.tradingview_username] || [];
    
    if (!Array.isArray(userResults)) {
      console.error(`   ❌ Formato inesperado de respuesta:`, tvResult);
      return {
        success: false,
        userId: user.id,
        tradingviewUsername: user.tradingview_username,
        reason: `Formato inesperado de respuesta de TradingView`
      };
    }
    
    console.log(`   ✅ ${userResults.length} resultados recibidos para ${user.tradingview_username}`);
    console.log(`   📊 Success Rate: ${tvResult.successRate || 'N/A'}%`);

    // 5. Obtener indicadores de Supabase para registrar accesos
    const { data: dbIndicators } = await supabase
      .from('indicators')
      .select('id, pine_id, name');

    // 6. Registrar cada acceso en indicator_access
    let successCount = 0;
    const errors: string[] = [];

    for (const tvIndicator of userResults) {
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
      const grantedAt = new Date().toISOString();

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
        granted_at: grantedAt,
        expires_at: expiresAt, // ✅ Fecha EXACTA de TradingView
        duration_type: duration,
        access_source: 'purchase', // ✅ Marca que fue por compra
        granted_by: null, // Sistema automático
        tradingview_response: tvIndicator, // ✅ Guardar respuesta completa
        error_message: null
      };

      let savedAccessId: string | null = null;

      if (existingAccess) {
        // Actualizar acceso existente (renovación)
        const { data: updated } = await supabase
          .from('indicator_access')
          .update(accessData)
          .eq('id', existingAccess.id)
          .select('id')
          .single();
        
        savedAccessId = updated?.id || existingAccess.id;
      } else {
        // Crear nuevo acceso
        const { data: created } = await supabase
          .from('indicator_access')
          .insert(accessData)
          .select('id')
          .single();
        
        savedAccessId = created?.id || null;
      }

      // 🔍 NUEVO: Registrar en indicator_access_log para auditoría
      const logEntry = {
        user_id: user.id,
        indicator_id: indicator.id,
        tradingview_username: user.tradingview_username,
        operation_type: existingAccess ? 'renew' : 'grant',
        access_source: 'purchase', // ✅ Identifica que viene de compra Stripe
        status: 'active',
        granted_at: grantedAt,
        expires_at: expiresAt,
        duration_type: duration,
        tradingview_response: tvIndicator,
        performed_by: null, // Sistema automático
        indicator_access_id: savedAccessId,
        notes: `Auto-grant vía Stripe (${source}) - Purchase ID: ${purchaseId || 'N/A'}`
      };

      await supabase
        .from('indicator_access_log')
        .insert(logEntry);

      successCount++;
      console.log(`   ✅ ${indicator.name}: expires_at = ${expiresAt || 'LIFETIME'} [LOG REGISTRADO]`);
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
 * 🗺️ Determina la configuración de acceso para los productos comprados
 */
function getAccessConfigForProducts(productIds: string[]): { 
  type: 'all' | 'premium' | 'free' | 'specific',
  pine_ids?: string[]
} {
  console.log(`   🔍 Buscando configuración de acceso para productos:`, productIds);
  
  // Si no hay productos, usar default
  if (!productIds || productIds.length === 0) {
    console.log(`   ⚠️ No hay productos, usando default: 'all'`);
    return PRODUCT_ACCESS_MAP['default'] || { type: 'all' };
  }

  // Buscar configuración para cada producto
  for (const productId of productIds) {
    // Normalizar el ID del producto (lowercase, sin espacios)
    const normalizedId = productId.toLowerCase().replace(/\s+/g, '_');
    console.log(`   🔄 Producto normalizado: '${productId}' → '${normalizedId}'`);
    
    // Si encuentra configuración específica, usarla
    if (PRODUCT_ACCESS_MAP[normalizedId]) {
      console.log(`   ✅ Coincidencia encontrada! Tipo: '${PRODUCT_ACCESS_MAP[normalizedId].type}'`);
      return PRODUCT_ACCESS_MAP[normalizedId];
    }
  }

  // Si no encuentra nada, usar default
  console.log(`   ⚠️ No se encontró coincidencia, usando default: 'all'`);
  return PRODUCT_ACCESS_MAP['default'] || { type: 'all' };
}

/**
 * 📦 Obtiene los indicadores dinámicamente desde Supabase según el tipo de acceso
 */
async function getIndicatorsForAccess(accessConfig: { 
  type: 'all' | 'premium' | 'free' | 'specific',
  pine_ids?: string[]
}): Promise<string[]> {
  
  console.log(`   📚 Obteniendo indicadores para tipo: '${accessConfig.type}'`);
  
  // Si es acceso específico, retornar directamente
  if (accessConfig.type === 'specific' && accessConfig.pine_ids) {
    console.log(`   ✅ Acceso específico: ${accessConfig.pine_ids.length} indicadores`);
    return accessConfig.pine_ids;
  }

  // Consultar indicadores activos desde Supabase
  let query = supabase
    .from('indicators')
    .select('pine_id, name, access_tier')
    .eq('status', 'activo'); // Solo indicadores activos

  // Filtrar por tier si es necesario
  if (accessConfig.type === 'premium') {
    console.log(`   🔍 Filtrando por access_tier = 'premium'`);
    query = query.eq('access_tier', 'premium');
  } else if (accessConfig.type === 'free') {
    console.log(`   🔍 Filtrando por access_tier = 'free'`);
    query = query.eq('access_tier', 'free');
  } else {
    console.log(`   🔍 Sin filtro de tier (obtener TODOS los indicadores activos)`);
  }
  // Si es 'all', no filtrar por tier

  const { data: indicators, error } = await query;

  if (error || !indicators) {
    console.error('❌ Error obteniendo indicadores:', error);
    return [];
  }

  console.log(`   ✅ ${indicators.length} indicadores obtenidos desde DB:`);
  indicators.forEach(ind => {
    console.log(`      - ${ind.name} [${ind.access_tier}] (${ind.pine_id})`);
  });

  return indicators.map(ind => ind.pine_id);
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

