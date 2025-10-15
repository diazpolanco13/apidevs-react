/**
 * Sistema de construcción dinámica de prompts para el chatbot APIDevs
 * Elimina el hardcoding y usa configuración de la base de datos
 */

export interface UserProfile {
  full_name: string;
  email: string;
  tradingview_username: string;
  customer_tier: string;
  subscription_status: string;
  subscription_tier: string;
  has_active_subscription: boolean;
  total_indicators: number;
  is_admin: boolean;
  is_legacy_user: boolean;
  legacy_discount_percentage: number;
  customer_since: string | null;
  wordpress_created_at: string | null;
  first_purchase_date: string | null;
}

export interface AdminAccessData {
  user: string;
  email: string;
  total_indicators: number;
  free_indicators: number;
  premium_indicators: number;
  indicators_list: string[];
}

export interface AIConfiguration {
  system_prompt?: string | null; // System prompt personalizado desde admin
  custom_greeting?: string | null; // Greeting personalizado desde admin
  platform_info?: {
    name: string;
    description: string;
    features: string[];
  };
  pricing_config?: {
    plans: {
      [key: string]: {
        name: string;
        price: number;
        currency: string;
        billing?: string;
        discount?: string;
        features: string[];
      };
    };
  };
  user_type_configs?: {
    [key: string]: any;
    visitor?: any;
    registered_no_purchase?: any;
    pro_active?: any;
    lifetime?: any;
    legacy?: any;
  };
  response_templates?: any;
  behavior_rules?: any;
  admin_instructions?: any;
}

/**
 * Determina el tipo de usuario basándose en su perfil
 */
export function getUserType(userProfile: UserProfile | null): string {
  if (!userProfile) return 'visitor';
  
  if (userProfile.is_legacy_user && userProfile.legacy_discount_percentage > 0) {
    return 'legacy';
  }
  
  if (userProfile.subscription_tier === 'pro' && userProfile.has_active_subscription) {
    return 'pro_active';
  }
  
  if (userProfile.has_active_subscription) {
    // Lifetime o plan especial
    return 'lifetime';
  }
  
  if (userProfile.email && userProfile.email !== 'No disponible') {
    // Tiene cuenta pero no compras
    return 'registered_no_purchase';
  }
  
  return 'visitor';
}

/**
 * Formatea el mensaje de saludo reemplazando variables
 */
export function formatGreeting(template: string, userProfile: UserProfile | null): string {
  if (!userProfile) return template;
  
  let formatted = template;
  
  // Reemplazar variables
  formatted = formatted.replace(/{user_name}/g, userProfile.full_name || 'Usuario');
  formatted = formatted.replace(/{total_indicators}/g, userProfile.total_indicators.toString());
  formatted = formatted.replace(/{legacy_discount_percentage}/g, userProfile.legacy_discount_percentage.toString());
  
  // Formatear fecha customer_since
  if (userProfile.customer_since) {
    const date = new Date(userProfile.customer_since);
    const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    formatted = formatted.replace(/{customer_since}/g, `${date.toLocaleDateString('es-ES')} (${days} días)`);
  } else if (userProfile.wordpress_created_at) {
    const date = new Date(userProfile.wordpress_created_at);
    const days = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    formatted = formatted.replace(/{customer_since}/g, `${date.toLocaleDateString('es-ES')} (${days} días)`);
  } else {
    formatted = formatted.replace(/{customer_since}/g, 'fecha no disponible');
  }
  
  return formatted;
}

/**
 * Genera la sección de información de la plataforma
 */
function buildPlatformInfo(config: AIConfiguration): string {
  const platform = config.platform_info || {
    name: "APIDevs Trading Platform",
    description: "Plataforma de indicadores de TradingView",
    features: []
  };
  
  let section = `INFORMACIÓN SOBRE ${platform.name.toUpperCase()}:\n`;
  section += `- ${platform.description}\n`;
  
  if (platform.features && platform.features.length > 0) {
    section += platform.features.map(f => `- ${f}`).join('\n');
  }
  
  return section;
}

/**
 * Genera la sección de precios
 */
function buildPricingInfo(config: AIConfiguration): string {
  const pricing = config.pricing_config;
  
  if (!pricing || !pricing.plans) {
    return `- Planes: FREE (gratis), PRO Mensual ($39/mes), PRO Anual ($390/año), Lifetime ($999)`;
  }
  
  const planList = Object.values(pricing.plans).map(plan => {
    const priceStr = plan.currency === 'USD' 
      ? `$${plan.price}`
      : plan.currency === 'EUR'
      ? `€${plan.price}`
      : `£${plan.price}`;
    
    const billingStr = plan.billing
      ? plan.billing === 'monthly' 
        ? '/mes'
        : plan.billing === 'yearly'
        ? '/año'
        : ' (pago único)'
      : '';
    
    return `${plan.name} (${priceStr}${billingStr})`;
  }).join(', ');
  
  return `- Planes disponibles: ${planList}`;
}

/**
 * Genera la sección de datos del usuario
 */
function buildUserData(userProfile: UserProfile | null): string {
  if (!userProfile) {
    return `DATOS DEL USUARIO ACTUAL:\n- Usuario no autenticado (visitante)\n`;
  }
  
  let section = `DATOS DEL USUARIO ACTUAL:\n`;
  section += `- Nombre: ${userProfile.full_name}\n`;
  section += `- Email: ${userProfile.email}\n`;
  section += `- Usuario TradingView: ${userProfile.tradingview_username}\n`;
  section += `- Plan actual: ${userProfile.subscription_tier} (${userProfile.subscription_status})\n`;
  section += `- Suscripción activa: ${userProfile.has_active_subscription ? 'Sí' : 'No'}\n`;
  section += `- Nivel de cliente: ${userProfile.customer_tier}\n`;
  section += `- Indicadores disponibles: ${userProfile.total_indicators}\n`;
  section += `- Es administrador: ${userProfile.is_admin ? 'Sí' : 'No'}\n`;
  
  return section;
}

/**
 * Genera la sección de información legacy
 */
function buildLegacyInfo(userProfile: UserProfile | null): string {
  if (!userProfile || !userProfile.is_legacy_user) {
    return '';
  }
  
  let section = `\n🚀 INFORMACIÓN LEGACY (CLIENTES DE WORDPRESS):\n`;
  section += `- Es cliente legacy: SÍ\n`;
  section += `- Porcentaje de descuento legacy: ${userProfile.legacy_discount_percentage}%\n`;
  
  if (userProfile.wordpress_created_at) {
    section += `- Fecha de registro original: ${new Date(userProfile.wordpress_created_at).toLocaleDateString('es-ES')}\n`;
  }
  
  if (userProfile.first_purchase_date) {
    section += `- Primera compra: ${new Date(userProfile.first_purchase_date).toLocaleDateString('es-ES')}\n`;
  }
  
  return section;
}

/**
 * Genera la sección de datos administrativos pre-fetched
 */
function buildAdminAccessData(adminAccessData: AdminAccessData | null): string {
  if (!adminAccessData) {
    return '';
  }
  
  let section = `\nDATOS DE ACCESOS ADMINISTRATIVOS CONSULTADOS:\n`;
  section += `- Usuario consultado: ${adminAccessData.user} (${adminAccessData.email})\n`;
  section += `- Total de indicadores activos: ${adminAccessData.total_indicators}\n`;
  section += `- Indicadores gratuitos: ${adminAccessData.free_indicators}\n`;
  section += `- Indicadores premium: ${adminAccessData.premium_indicators}\n`;
  section += `- Lista de indicadores: ${adminAccessData.indicators_list.join(', ')}\n`;
  section += `- IMPORTANTE: Si te preguntan sobre accesos de usuario, usa esta información directamente\n`;
  
  return section;
}

/**
 * Genera la sección de rol y comportamiento según tipo de usuario
 */
function buildRoleSection(userType: string, config: AIConfiguration): string {
  const userTypeConfig = config.user_type_configs?.[userType];
  
  if (!userTypeConfig) {
    return `\nTU ROL:\n- Responde preguntas sobre planes, precios, indicadores\n- Tono profesional pero amigable\n`;
  }
  
  let section = `\nTU ROL Y COMPORTAMIENTO:\n`;
  section += `- Tipo de usuario: ${userTypeConfig.label}\n`;
  section += `- Tono de conversación: ${userTypeConfig.tone}\n`;
  
  if (userTypeConfig.capabilities && userTypeConfig.capabilities.length > 0) {
    section += `- Capacidades habilitadas: ${userTypeConfig.capabilities.join(', ')}\n`;
  }
  
  if (userTypeConfig.restrictions && userTypeConfig.restrictions.length > 0) {
    section += `- Restricciones: ${userTypeConfig.restrictions.join(', ')}\n`;
  }
  
  if (userTypeConfig.call_to_action) {
    section += `- Call to Action sugerido: "${userTypeConfig.call_to_action}"\n`;
  }
  
  return section;
}

/**
 * Genera ejemplos de respuesta con precios dinámicos
 */
function buildResponseExamples(config: AIConfiguration, userProfile: UserProfile | null): string {
  const pricing = config.pricing_config?.plans;
  const userType = getUserType(userProfile);
  const userTypeConfig = config.user_type_configs?.[userType];
  
  if (!pricing) {
    return '';
  }
  
  let section = `\nEJEMPLOS DE RESPUESTAS SOBRE PRECIOS:\n`;
  
  // Si es legacy y debe mostrar descuentos
  if (userProfile?.is_legacy_user && userTypeConfig?.show_discounts && userTypeConfig?.calculate_discount) {
    const discount = userProfile.legacy_discount_percentage / 100;
    const proPrice = pricing.pro_monthly?.price || 39;
    const discountedPrice = (proPrice * (1 - discount)).toFixed(2);
    
    section += `\nUsuario: "¿Cuánto cuesta el plan PRO?"\n`;
    section += `Tú: "Como cliente legacy con ${userProfile.legacy_discount_percentage}% de descuento, el plan PRO mensual que normalmente cuesta $${proPrice}, para ti sería de $${discountedPrice} al mes."\n`;
  } else if (userTypeConfig?.show_pricing) {
    // Usuario normal con precios estándar
    Object.entries(pricing).forEach(([key, plan]) => {
      if (key === 'free') return; // Skip FREE
      
      const priceStr = plan.currency === 'USD' ? '$' : plan.currency === 'EUR' ? '€' : '£';
      const billingStr = plan.billing === 'monthly' ? '/mes' : plan.billing === 'yearly' ? '/año' : ' (pago único)';
      
      section += `\n"${plan.name}": ${priceStr}${plan.price}${billingStr}`;
      if (plan.discount) {
        section += ` (${plan.discount})`;
      }
    });
  }
  
  return section;
}

/**
 * Función principal: Construye el system prompt completo
 */
export function buildSystemPrompt(
  aiConfig: AIConfiguration,
  userProfile: UserProfile | null,
  adminAccessData: AdminAccessData | null = null
): string {
  const userType = getUserType(userProfile);
  const userTypeConfig = aiConfig.user_type_configs?.[userType];
  
  let prompt = '';
  
  // 🔥 PRIORIDAD 1: Si hay un system_prompt personalizado desde el admin, usarlo COMPLETO
  if (aiConfig.system_prompt && aiConfig.system_prompt.trim().length > 0) {
    prompt += aiConfig.system_prompt.trim();
    prompt += '\n\n';
    prompt += '--- INFORMACIÓN DE CONTEXTO ---\n\n';
  } else {
    // 1. Introducción (solo si NO hay system_prompt personalizado)
    prompt += `Eres el asistente virtual de ${aiConfig.platform_info?.name || 'APIDevs Trading Platform'}.\n\n`;
  }
  
  // 2. Información de la plataforma
  prompt += buildPlatformInfo(aiConfig);
  prompt += '\n';
  prompt += buildPricingInfo(aiConfig);
  prompt += '\n\n';
  
  // 3. Datos del usuario
  prompt += buildUserData(userProfile);
  
  // 4. Información legacy (si aplica)
  if (userProfile?.is_legacy_user) {
    prompt += buildLegacyInfo(userProfile);
  }
  
  // 5. Datos administrativos pre-fetched (si existen)
  if (adminAccessData) {
    prompt += buildAdminAccessData(adminAccessData);
  }
  
  // 6. Rol y comportamiento según tipo de usuario
  prompt += buildRoleSection(userType, aiConfig);
  
  // 7. Ejemplos de respuestas
  prompt += buildResponseExamples(aiConfig, userProfile);
  
  // 8. Instrucciones especiales para admin
  if (userProfile?.is_admin && aiConfig.admin_instructions) {
    prompt += `\n\n👑 INSTRUCCIONES ESPECIALES DE ADMINISTRADOR:\n`;
    prompt += `- Acceso total habilitado\n`;
    prompt += `- Sin restricciones de consultas\n`;
    prompt += `- Puedes consultar datos de cualquier usuario\n`;
  }
  
  // 9. Instrucciones críticas para el uso de tools
  prompt += `\n\n🚨 INSTRUCCIONES CRÍTICAS:\n`;
  prompt += `- Si ves "DATOS DE ACCESOS ADMINISTRATIVOS CONSULTADOS" arriba, SIGNIFICA que ya tenemos los datos listos\n`;
  prompt += `- NO digas "déjame consultar" - los datos YA ESTÁN AHÍ\n`;
  prompt += `- MUESTRA inmediatamente la información que aparece en las secciones anteriores\n`;
  prompt += `- Usa EXACTAMENTE los datos proporcionados en el contexto\n`;
  
  return prompt;
}

