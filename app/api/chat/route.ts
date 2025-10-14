import { streamText } from "ai";
import { xai } from "@ai-sdk/xai";
import { createClient } from "@/utils/supabase/server";
import { getUserAccessDetails } from "@/lib/ai/tools/access-management-tools";
import { chatLimiter } from "@/lib/rate-limit";

export const maxDuration = 60;
export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
  try {
    // Rate limiting: 10 mensajes por minuto por IP/usuario
    const identifier = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'anonymous';

    const rateLimitResult = chatLimiter.check(10, identifier);

    if (!rateLimitResult.success) {
      return new Response(JSON.stringify({
        error: "Demasiadas solicitudes",
        message: "Has excedido el límite de 10 mensajes por minuto. Por favor, espera un momento.",
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.reset).toISOString(),
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString()
        }
      });
    }

    const { messages } = await request.json();

    // Verificar autenticación
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      console.error('❌ Error de autenticación en chat API:', error);
      return new Response(JSON.stringify({ error: "No autorizado", details: error?.message }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ Usuario autenticado:', user.email);

    // Verificar si es una consulta administrativa no autorizada
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const isAdminQuery = lastMessage.includes('expirar') ||
                        lastMessage.includes('accesos van a') ||
                        lastMessage.includes('próximos') ||
                        (lastMessage.includes('indicadores') && lastMessage.includes('tiene') && lastMessage.includes('@'));

    if (isAdminQuery && user.email !== 'api@apidevs.io') {
      console.warn(`🚫 Usuario no admin intentó consulta administrativa: ${user.email}`);
      return new Response("Esta consulta requiere permisos de administrador. Contacta al soporte si necesitas ayuda.", {
        status: 403
      });
    }

    // 🔄 PRE-FETCH DE DATOS DEL USUARIO USANDO MCP DE SUPABASE
    let userProfile = {
      full_name: "Usuario",
      email: user.email || "No disponible",
      tradingview_username: "No configurado",
      subscription_status: "free",
      subscription_tier: "free",
      has_active_subscription: false,
      total_indicators: 0,
      customer_tier: "free",
      is_admin: user.email === 'api@apidevs.io', // ✅ Detectar automáticamente si es admin

      // 🚀 NUEVOS CAMPOS PARA USUARIOS LEGACY
      is_legacy_user: false,
      legacy_customer: false,
      legacy_discount_percentage: 0,
      legacy_benefits: {},
      legacy_customer_type: 'new',
      legacy_lifetime_spent: 0,
      legacy_purchase_count: 0,
      has_legacy_discount_eligible: false,

      // 📅 FECHAS HISTÓRICAS
      customer_since: null,
      wordpress_created_at: null,
      legacy_imported_at: null,
      first_purchase_date: null,
      wordpress_customer_id: null
    };

    try {
      // Obtener datos del usuario desde la tabla users (usando campos que realmente existen)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          full_name, email, tradingview_username, customer_tier, total_lifetime_spent, purchase_count,
          legacy_customer, is_legacy_user, legacy_discount_percentage, legacy_benefits,
          legacy_customer_type, loyalty_discount_percentage, customer_since, wordpress_created_at,
          legacy_imported_at, first_purchase_date, wordpress_customer_id
        `)
        .eq('id', user.id)
        .single();

      // Si no encontramos datos en users, buscar en legacy_users
      let legacyDiscountPercentage = 0;
      let legacyTier = 'free';
      let legacyCustomerSince = null;
      let legacyFirstPurchase = null;
      let legacyImportedAt = null;
      let wordpressCustomerId = null;

      if (userError && user.email) {
        const { data: legacyData } = await supabase
          .from('legacy_users')
          .select('legacy_discount_percentage, customer_tier, wordpress_created_at, first_purchase_date, migrated_at, wordpress_customer_id')
          .eq('email', user.email.toLowerCase().trim())
          .single();

        if (legacyData) {
          legacyDiscountPercentage = (legacyData as any).legacy_discount_percentage || 0;
          legacyTier = (legacyData as any).customer_tier || 'free';
          legacyCustomerSince = (legacyData as any).wordpress_created_at;
          legacyFirstPurchase = (legacyData as any).first_purchase_date;
          legacyImportedAt = (legacyData as any).migrated_at;
          wordpressCustomerId = (legacyData as any).wordpress_customer_id;
        }
      }

      if (!userError && userData) {
        userProfile.full_name = (userData as any).full_name || "Usuario";
        userProfile.email = (userData as any).email || user.email || "No disponible";
        userProfile.tradingview_username = (userData as any).tradingview_username || "No configurado";
        userProfile.customer_tier = (userData as any).customer_tier || "free";
        userProfile.subscription_tier = (userData as any).customer_tier || "free";

        // 🚀 DETECCIÓN DE USUARIOS LEGACY
        userProfile.is_legacy_user = (userData as any).is_legacy_user || false;
        userProfile.legacy_customer = (userData as any).legacy_customer || false;

        // Asignar descuento basado en tier si es legacy pero no tiene descuento asignado
        let discountPercentage = (userData as any).legacy_discount_percentage || legacyDiscountPercentage || 0;
        if (userProfile.is_legacy_user && discountPercentage === 0) {
          // Asignar descuento automático basado en tier para usuarios legacy
          const tierDiscounts: { [key: string]: number } = {
            'diamond': 30,
            'platinum': 25,
            'gold': 20,
            'silver': 15,
            'bronze': 10,
            'free': 5
          };
          discountPercentage = tierDiscounts[userProfile.customer_tier] || 5;
          console.log(`🔧 Asignando descuento automático ${discountPercentage}% para usuario legacy ${userProfile.customer_tier}`);
        }
        userProfile.legacy_discount_percentage = discountPercentage;
        userProfile.customer_tier = (userData as any).customer_tier || legacyTier || 'free';
        userProfile.legacy_benefits = (userData as any).legacy_benefits || {};
        userProfile.legacy_customer_type = (userData as any).legacy_customer_type || 'new';
        userProfile.legacy_lifetime_spent = (userData as any).total_lifetime_spent || 0;
        userProfile.legacy_purchase_count = (userData as any).purchase_count || 0;

        // 📅 FECHAS HISTÓRICAS - Priorizar users sobre legacy_users
        userProfile.customer_since = (userData as any).customer_since || legacyCustomerSince;
        userProfile.wordpress_created_at = (userData as any).wordpress_created_at || legacyCustomerSince;
        userProfile.legacy_imported_at = (userData as any).legacy_imported_at || legacyImportedAt;
        userProfile.first_purchase_date = (userData as any).first_purchase_date || legacyFirstPurchase;
        userProfile.wordpress_customer_id = (userData as any).wordpress_customer_id || wordpressCustomerId;

        // Determinar si es elegible para descuento legacy
        userProfile.has_legacy_discount_eligible = (
          userProfile.legacy_customer ||
          userProfile.is_legacy_user ||
          userProfile.legacy_discount_percentage > 0
        );
      } else {
        // Si no hay datos en users pero sí en legacy_users, usar esos datos
        if (legacyDiscountPercentage > 0) {
          userProfile.is_legacy_user = true;
          userProfile.legacy_customer = true;
          userProfile.legacy_discount_percentage = legacyDiscountPercentage;
          userProfile.customer_tier = legacyTier;
          userProfile.has_legacy_discount_eligible = true;

          // 📅 Usar fechas de legacy_users
          userProfile.customer_since = legacyCustomerSince;
          userProfile.wordpress_created_at = legacyCustomerSince;
          userProfile.legacy_imported_at = legacyImportedAt;
          userProfile.first_purchase_date = legacyFirstPurchase;
          userProfile.wordpress_customer_id = wordpressCustomerId;
        }
      }

      // Verificar suscripción activa en Stripe
      const { count: activeSubscriptions, error: subError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (!subError) {
        userProfile.has_active_subscription = (activeSubscriptions || 0) > 0;
        userProfile.subscription_status = userProfile.has_active_subscription ? "active" : "inactive";
        // Si tiene suscripción activa, usar "pro" en lugar del customer_tier
        if (userProfile.has_active_subscription) {
          userProfile.subscription_tier = "pro";
        }
      }

      // Contar indicadores activos
      const { count: totalIndicators, error: indError } = await supabase
        .from('indicator_access')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (!indError) {
        userProfile.total_indicators = totalIndicators || 0;
      }

    } catch (error) {
      console.warn('Error obteniendo datos del usuario:', error);
      // Continuamos con datos por defecto si falla
    }

    // Determinar qué tools están disponibles según el rol del usuario
    const availableTools = {};

    // Solo admins pueden usar tools de gestión de accesos
    const isAdmin = user.email === 'api@apidevs.io';
    if (isAdmin) {
      Object.assign(availableTools, {
        getUserAccessDetails
      });
    }

    // PLAN B: Pre-fetch data para consultas administrativas
    let adminAccessData = null;

    // Solo procesar consultas administrativas si el usuario ES admin
    if (isAdmin) {
      try {
        // Buscar si el último mensaje contiene una consulta sobre accesos de usuario
        const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

        // Detectar consultas administrativas con patrones específicos
        let emailMatch = null;

        // Patrón 1: "indicadores tiene [email]"
        const pattern1 = lastMessage.match(/indicadores\s+tiene\s+activos?\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        if (pattern1) {
          emailMatch = pattern1[1];
        }

        // Patrón 2: "accesos de [email]"
        const pattern2 = lastMessage.match(/accesos?\s+de\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        if (pattern2 && !emailMatch) {
          emailMatch = pattern2[1];
        }

        // Patrón 3: "qué tiene [email]"
        const pattern3 = lastMessage.match(/qué\s+tiene\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
        if (pattern3 && !emailMatch) {
          emailMatch = pattern3[1];
        }

        if (emailMatch && emailMatch.includes('@')) {
          console.log(`🔍 Pre-fetch activado: Consultando accesos de ${emailMatch}`);

          // Usar la misma lógica que la tool pero de forma síncrona
          const supabase = await createClient();

          const { data: targetUser } = await supabase
            .from('users')
            .select('id, email, full_name, tradingview_username, customer_tier')
            .eq('email', emailMatch)
            .single();

          if (targetUser && (targetUser as any).tradingview_username) {
            const { data: accesses } = await supabase
              .from('indicator_access')
              .select(`
                status,
                granted_at,
                expires_at,
                duration_type,
                access_source,
                indicators (
                  name,
                  category,
                  access_tier
                )
              `)
              .eq('user_id', (targetUser as any).id)
              .eq('status', 'active')
              .order('granted_at', { ascending: false });

            if (accesses && accesses.length > 0) {
              const typedAccesses = accesses as any[];
              const freeCount = typedAccesses.filter((a: any) => a.indicators?.access_tier === 'free').length;
              const premiumCount = typedAccesses.filter((a: any) => a.indicators?.access_tier === 'premium').length;

              adminAccessData = {
                user: (targetUser as any).full_name || (targetUser as any).email,
                email: (targetUser as any).email,
                total_indicators: typedAccesses.length,
                free_indicators: freeCount,
                premium_indicators: premiumCount,
                indicators_list: typedAccesses.slice(0, 5).map((a: any) => a.indicators?.name).filter(Boolean),
                has_more: typedAccesses.length > 5
              };

              console.log(`✅ Pre-fetch exitoso: ${adminAccessData.total_indicators} indicadores para ${emailMatch}`);
            }
          }
        }
      } catch (error) {
        console.warn('Error en pre-fetch de accesos:', error);
      }
    }

    // System prompt específico para APIDevs con datos del usuario incluidos

    const systemPrompt = `Eres el asistente virtual de APIDevs Trading Platform.

INFORMACIÓN SOBRE APIDEVS:
- Somos una plataforma de indicadores de TradingView
- Tenemos 4 planes: FREE (gratis), PRO Mensual ($39/mes), PRO Anual ($390/año), Lifetime ($999)
- Los usuarios obtienen acceso a indicadores premium y free
- Usamos Stripe para pagos y Supabase para la base de datos

DATOS DEL USUARIO ACTUAL:
- Nombre: ${userProfile.full_name}
- Email: ${userProfile.email}
- Usuario TradingView: ${userProfile.tradingview_username}
- Plan actual: ${userProfile.subscription_tier} (${userProfile.subscription_status})
- Suscripción activa: ${userProfile.has_active_subscription ? 'Sí' : 'No'}
- Nivel de cliente: ${userProfile.customer_tier}
- Indicadores disponibles: ${userProfile.total_indicators}
- Es administrador: ${userProfile.is_admin ? 'Sí' : 'No'}

🚀 INFORMACIÓN LEGACY (CLIENTES DE WORDPRESS):
- Es cliente legacy: ${userProfile.has_legacy_discount_eligible ? 'SÍ' : 'NO'}
- Tipo de cliente legacy: ${userProfile.legacy_customer_type}
- Porcentaje de descuento legacy: ${userProfile.legacy_discount_percentage}%
- Beneficios legacy: ${Object.keys(userProfile.legacy_benefits).length > 0 ? JSON.stringify(userProfile.legacy_benefits) : 'Ninguno'}

📅 INFORMACIÓN HISTÓRICA:
- Fecha de registro original: ${userProfile.wordpress_created_at ? new Date(userProfile.wordpress_created_at).toLocaleDateString('es-ES') : 'No disponible'}
- Primera compra: ${userProfile.first_purchase_date ? new Date(userProfile.first_purchase_date).toLocaleDateString('es-ES') : 'No disponible'}
- Fecha de migración a nueva plataforma: ${userProfile.legacy_imported_at ? new Date(userProfile.legacy_imported_at).toLocaleDateString('es-ES') : 'No disponible'}
- ID de cliente WordPress: ${userProfile.wordpress_customer_id || 'No disponible'}

${adminAccessData ? `DATOS DE ACCESOS ADMINISTRATIVOS CONSULTADOS:
- Usuario consultado: ${adminAccessData.user} (${adminAccessData.email})
- Total de indicadores activos: ${adminAccessData.total_indicators}
- Indicadores gratuitos: ${adminAccessData.free_indicators}
- Indicadores premium: ${adminAccessData.premium_indicators}
- Lista de indicadores: ${adminAccessData.indicators_list.join(', ')}${adminAccessData.has_more ? ' (y más...)' : ''}
- IMPORTANTE: Si te preguntan sobre accesos de usuario, usa esta información directamente` : ''}

TU ROL:
- Responde preguntas sobre planes, precios, indicadores
- Responde preguntas sobre el perfil del usuario usando la información proporcionada arriba
- GESTIONA ACCESOS si el usuario es administrador (ver campo "Es administrador")
- Ayuda con consultas generales sobre trading y TradingView
- Tono profesional pero amigable
- Si no sabes algo específico del usuario, usa los datos proporcionados arriba

🚀 ATENCIÓN ESPECIAL A CLIENTES LEGACY:
- SI el usuario ES cliente legacy (ver "Es cliente legacy: SÍ"), DEBES mencionar automáticamente descuentos especiales
- Ofrece descuentos legacy en TODAS las conversaciones sobre precios/planes
- Sé especialmente amable y agradecido por su lealtad histórica
- Destaca que son "uno de nuestros primeros clientes valiosos"
- NUNCA menciones cuánto han gastado anteriormente - enfócate en su valor como cliente antiguo

EJEMPLOS DE RESPUESTAS PERSONALES:
Usuario: "¿cuál es mi usuario de TradingView?"
Tú: "Tu usuario de TradingView es: ${userProfile.tradingview_username}"

Usuario: "¿cuál es mi email?"
Tú: "Tu email registrado es: ${userProfile.email}"

Usuario: "¿qué plan tengo?"
Tú: "Actualmente tienes el plan ${userProfile.subscription_tier} (${userProfile.subscription_status})"

Usuario: "¿cuántos indicadores tengo?"
Tú: "Tienes acceso a ${userProfile.total_indicators} indicadores"

Usuario: "¿cuánto tiempo tengo con APIDevs?"
Tú: "Eres uno de nuestros primeros clientes desde ${userProfile.wordpress_created_at ? new Date(userProfile.wordpress_created_at).toLocaleDateString('es-ES') + ' (' + Math.floor((new Date().getTime() - new Date(userProfile.wordpress_created_at).getTime()) / (1000 * 60 * 60 * 24)) + ' días)' : 'WordPress'}. Tu lealtad histórica es muy apreciada y por eso tienes un descuento especial del ${userProfile.legacy_discount_percentage}% en todos nuestros planes."

EJEMPLOS DE RESPUESTAS PARA CLIENTES LEGACY:

Usuario: "¿Cuánto cuesta el plan PRO?"
Tú: "¡Hola! Veo que eres uno de nuestros primeros clientes valiosos que nos ha acompañado desde WordPress. Como reconocimiento a tu lealtad histórica, tienes un descuento especial del ${userProfile.legacy_discount_percentage}% en todos nuestros planes. El plan PRO mensual normalmente cuesta $39, pero para ti sería de $${(39 * (1 - userProfile.legacy_discount_percentage / 100)).toFixed(2)} al mes. ¿Te gustaría que te ayude con la suscripción?"

Usuario: "¿Qué planes tienen?"
Tú: "Como cliente legacy con años de experiencia con nosotros, tienes derecho a descuentos exclusivos por tu lealtad. Nuestros planes con tu descuento del ${userProfile.legacy_discount_percentage}% serían: FREE (gratis), PRO Mensual ($${(39 * (1 - userProfile.legacy_discount_percentage / 100)).toFixed(2)}/mes), PRO Anual ($${(390 * (1 - userProfile.legacy_discount_percentage / 100)).toFixed(2)}/año), Lifetime ($${(999 * (1 - userProfile.legacy_discount_percentage / 100)).toFixed(2)}). ¿Cuál te interesa más?"

HERRAMIENTAS ADMINISTRATIVAS DISPONIBLES (SOLO SI "Es administrador: Sí"):
- getUserAccessDetails: Consulta indicadores activos de cualquier usuario

EJEMPLOS DE RESPUESTAS ADMINISTRATIVAS (USA ESTOS FORMATOS EXACTOS):
Usuario: "¿Qué indicadores tiene activos juan@email.com?"
Tú: "Juan tiene 6 indicadores activos: 2 gratuitos y 4 premium. Sus indicadores incluyen RSI PRO+, POSITION SIZE, ADX DEF, Watermark."

Usuario: "¿Cuáles son los accesos de maria@email.com?"
Tú: "Maria tiene 3 indicadores activos: 1 gratuito y 2 premium. Sus indicadores incluyen MACD, RSI, Volume Profile."

Usuario: "¿Cuándo expira el acceso de pedro@email.com al indicador RSI?"
Tú: "El acceso de Pedro al RSI PRO+ expira el 15 de noviembre de 2025"

INSTRUCCIONES PARA USAR RESULTADOS DE TOOLS:
- Cuando uses getUserAccessDetails, resume la información de manera clara y concisa
- Menciona el número total de indicadores y la distribución (gratuitos vs premium)
- Lista los indicadores más importantes por nombre
- Incluye fechas de expiración cuando sean relevantes

INSTRUCCIONES ESPECIALES PARA CONSULTAS ADMINISTRATIVAS:
- Si el usuario pregunta "¿qué indicadores tiene X?" o "¿cuáles son los accesos de X?", RESPONDE INMEDIATAMENTE con la información de "DATOS DE ACCESOS ADMINISTRATIVOS CONSULTADOS"
- NO digas "voy a consultar" - usa directamente los datos proporcionados
- Formato de respuesta: "[Nombre del usuario] tiene [total] indicadores activos: [gratuitos] gratuitos y [premium] premium. Sus indicadores incluyen [lista de nombres]"

IMPORTANTE GENERAL:
- Usa EXACTAMENTE los datos del usuario proporcionados arriba
- Si el usuario pregunta algo sobre su perfil, responde directamente con la información disponible
- Las herramientas administrativas están disponibles automáticamente si "Es administrador: Sí"
- NO preguntes si es administrador - usa la información proporcionada
- Para preguntas técnicas sobre indicadores o planes, explica normalmente
- Mantén un tono amigable y profesional`;

    // Llamar al modelo con tools disponibles - USAR GROK-3
    console.log('🤖 Llamando a Grok-3...');

    try {
      const result = await streamText({
        model: xai('grok-3'), // Cambiar a grok-3 (modelo actual)
        system: systemPrompt,
        messages,
        tools: availableTools,
      });

      console.log('✅ Respuesta de Grok-3 generada');
      return result.toTextStreamResponse();
    } catch (aiError: any) {
      console.error('❌ Error llamando a Grok-3:', aiError);
      return new Response(JSON.stringify({
        error: "Error al generar respuesta",
        details: aiError?.message || String(aiError),
        type: aiError?.name || 'AIError'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error: any) {
    console.error('❌ Error general en chat API:', error);
    return new Response(JSON.stringify({
      error: "Error interno del servidor",
      details: error?.message || String(error),
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
