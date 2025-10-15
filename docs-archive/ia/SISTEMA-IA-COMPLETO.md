# 🤖 Sistema de IA APIDevs - Documentación Completa

**Versión:** 2.0  
**Fecha:** 15 de Octubre de 2025  
**Estado:** ✅ Sistema 100% Operativo y Parametrizable

---

## 📋 ÍNDICE

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Base de Datos](#3-base-de-datos)
4. [Componentes Frontend](#4-componentes-frontend)
5. [Sistema Backend (API Routes)](#5-sistema-backend-api-routes)
6. [Sistema de Modelos AI](#6-sistema-de-modelos-ai)
7. [Sistema de Prompts Dinámicos](#7-sistema-de-prompts-dinámicos)
8. [Panel de Administración](#8-panel-de-administración)
9. [Sistema de Tools](#9-sistema-de-tools)
10. [Flujos de Datos](#10-flujos-de-datos)
11. [Integración con Sistema de Accesos](#11-integración-con-sistema-de-accesos)
12. [Sistema de Descuentos Legacy](#12-sistema-de-descuentos-legacy)
13. [Autenticación y Seguridad](#13-autenticación-y-seguridad)
14. [Estado Actual y Funcionalidades](#14-estado-actual-y-funcionalidades)
15. [Problemas Resueltos](#15-problemas-resueltos)
16. [Casos de Uso](#16-casos-de-uso)
17. [Configuración y Deployment](#17-configuración-y-deployment)
18. [Próximas Funcionalidades](#18-próximas-funcionalidades)

---

## 1. VISIÓN GENERAL DEL SISTEMA

### 1.1 Descripción

El Sistema de IA de APIDevs es un **asistente virtual inteligente completamente parametrizable** que proporciona:

- ✅ **Respuestas personalizadas** según el tipo de usuario
- ✅ **Información en tiempo real** sobre planes, precios e indicadores
- ✅ **Consultas administrativas** para gestión de usuarios
- ✅ **Streaming de respuestas** en tiempo real
- ✅ **Multi-modelo** (400+ modelos vía OpenRouter)
- ✅ **100% parametrizable** desde panel admin (sin hardcoding)

### 1.2 Capacidades Actuales

**Para Usuarios:**
- Consultas sobre planes y precios
- Información de indicadores TradingView
- Estado de suscripción personalizado
- Accesos activos y fechas de expiración
- Soporte técnico general

**Para Administradores:**
- Consultar accesos de cualquier usuario
- Ver información detallada de indicadores
- Gestión de configuración completa del chatbot
- Monitoreo de uso y estadísticas

**Características Técnicas:**
- Widget flotante integrado en toda la plataforma
- Sistema de autenticación inteligente (usuarios + invitados)
- Rate limiting (10 msg/min, admin exento)
- Pre-fetch de datos para consultas personales
- System prompts dinámicos según tipo de usuario

### 1.3 Tecnologías Utilizadas

```typescript
// Stack Principal
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

// IA y Modelos
- Vercel AI SDK (v3.x)
- OpenRouter (400+ modelos)
- X.AI (Grok-3, Grok-2-1212)

// Backend
- Supabase (Database + Auth)
- Server-Sent Events (SSE)
- Edge Functions

// Validación
- Zod (schemas)
```

---

## 2. ARQUITECTURA TÉCNICA

### 2.1 Diagrama de Arquitectura Completa

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO (Browser)                        │
│                                                                   │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐   │
│  │  Widget Float  │  │  Chat Full     │  │  Admin Panel    │   │
│  │  (Todas pág.)  │  │  (/chat-v2)    │  │  (/admin/ia-c.) │   │
│  └───────┬────────┘  └───────┬────────┘  └────────┬────────┘   │
│          │                    │                     │             │
│          └────────────────────┴─────────────────────┘             │
│                               │                                   │
└───────────────────────────────┼───────────────────────────────────┘
                                │
                    POST /api/chat { messages: [...] }
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│                  API ROUTE (app/api/chat/route.ts)                │
│                                                                   │
│  1. 🔐 Autenticación                                              │
│     ├─ Supabase Auth (usuarios registrados)                      │
│     └─ Guest mode (invitados con email)                          │
│                                                                   │
│  2. 🚦 Rate Limiting                                              │
│     ├─ 10 mensajes/minuto (usuarios normales)                   │
│     ├─ Admin exento (api@apidevs.io)                            │
│     └─ IP-based para invitados                                   │
│                                                                   │
│  3. 📊 Cargar Configuración AI (ai_configuration table)          │
│     ├─ Model provider (xai, openrouter)                         │
│     ├─ Model específico                                          │
│     ├─ System prompt personalizado                               │
│     ├─ Platform info & pricing                                   │
│     └─ User type configs                                         │
│                                                                   │
│  4. 🔍 Pre-fetch de Datos (si aplica)                            │
│     ├─ Detecta consultas sobre PROPIOS indicadores              │
│     ├─ Query a Supabase: user + subscription + indicators       │
│     └─ Inyecta datos en system prompt                           │
│                                                                   │
│  5. 🧠 Construir System Prompt Dinámico                          │
│     ├─ buildSystemPrompt(aiConfig, userProfile, adminData)      │
│     ├─ Personalización por tipo de usuario                       │
│     ├─ Variables reemplazadas dinámicamente                      │
│     └─ Contexto completo (precios, accesos, legacy)             │
│                                                                   │
│  6. 🤖 Llamar Modelo AI                                           │
│     ├─ getAIModel(modelConfig)                                   │
│     ├─ streamText() con system prompt dinámico                   │
│     └─ Tools disponibles (getUserAccessDetails)                  │
│                                                                   │
│  7. 📡 Stream Response                                            │
│     └─ toTextStreamResponse() → Server-Sent Events              │
│                                                                   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                │                               │
                ▼                               ▼
┌───────────────────────────┐   ┌───────────────────────────────┐
│   AI MODEL PROVIDERS      │   │   SUPABASE DATABASE           │
│                           │   │                               │
│  OpenRouter (400+ models) │   │  ├─ users                     │
│  ├─ Claude 3.5 Sonnet     │   │  ├─ subscriptions             │
│  ├─ GPT-4o / GPT-4o Mini  │   │  ├─ indicator_access          │
│  ├─ Gemini 2.0 Flash      │   │  ├─ legacy_users              │
│  ├─ Llama 3.3 70B         │   │  ├─ indicators                │
│  └─ DeepSeek Chat         │   │  ├─ ai_configuration          │
│                           │   │  ├─ chat_conversations        │
│  X.AI                     │   │  └─ chat_messages             │
│  ├─ Grok-3                │   │                               │
│  └─ Grok-2-1212           │   └───────────────────────────────┘
│                           │
└───────────────────────────┘
                │
                │ Streaming Response
                ▼
┌───────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                          │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ReadableStream Reader                                    │ │
│  │  ├─ Chunk 1: "Hola Carlos..."                            │ │
│  │  ├─ Chunk 2: "Tienes acceso a..."                        │ │
│  │  └─ Chunk N: "...6 indicadores activos."                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  - Renderizado en tiempo real                                 │
│  - Auto-scroll inteligente                                    │
│  - Textarea auto-expandible                                   │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Request Completo

```
1. Usuario escribe mensaje → Chat Widget captura input
2. Submit → POST /api/chat con historial de mensajes
3. API valida autenticación (Supabase o Guest)
4. Rate limiting check (10 msg/min, admin exento)
5. Carga ai_configuration desde BD
6. Determina tipo de usuario (visitor, registered, pro, lifetime, legacy)
7. Pre-fetch de datos si detecta consulta personal
8. Construye system prompt dinámico (buildSystemPrompt)
9. Llama al modelo AI con streaming
10. Stream de respuesta vía SSE
11. Frontend renderiza chunks en tiempo real
12. Usuario ve respuesta completa
```

---

## 3. BASE DE DATOS

### 3.1 Tabla: `ai_configuration`

**Descripción:** Almacena TODA la configuración del chatbot (100% parametrizable).

```sql
CREATE TABLE ai_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Configuración del Modelo
  model_provider TEXT DEFAULT 'openrouter',
  model_name TEXT DEFAULT 'anthropic/claude-3.5-sonnet',
  temperature NUMERIC DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  streaming_enabled BOOLEAN DEFAULT true,
  
  -- System Prompt y Greeting
  system_prompt TEXT,
  custom_greeting TEXT,
  response_style TEXT DEFAULT 'professional',
  include_emojis BOOLEAN DEFAULT true,
  show_typing_indicator BOOLEAN DEFAULT true,
  
  -- Configuración Parametrizable (JSONB)
  platform_info JSONB,           -- Nombre, descripción, features
  pricing_config JSONB,          -- FREE, PRO, Lifetime plans
  user_type_configs JSONB,       -- visitor, registered, pro, lifetime, legacy
  response_templates JSONB,      -- Templates de respuestas
  behavior_rules JSONB,          -- Reglas de comportamiento
  admin_instructions JSONB,      -- Instrucciones para admin
  
  -- Tools Configuration
  enabled_tools TEXT[] DEFAULT ARRAY['getUserAccessDetails'],
  available_tools JSONB,
  
  -- Advanced Settings
  rate_limit_enabled BOOLEAN DEFAULT true,
  max_messages_per_minute INTEGER DEFAULT 10,
  context_memory_enabled BOOLEAN DEFAULT true,
  max_conversation_history INTEGER DEFAULT 50,
  
  -- Logging
  logging_enabled BOOLEAN DEFAULT true,
  log_level TEXT DEFAULT 'info',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Estructura de `platform_info` (JSONB)

```json
{
  "name": "APIDevs Trading Platform",
  "description": "Plataforma de indicadores premium de TradingView",
  "features": [
    "Indicadores premium y gratuitos para TradingView",
    "Soporte técnico especializado",
    "Actualizaciones constantes",
    "Integración completa con Stripe",
    "Gestión de accesos automática"
  ]
}
```

#### Estructura de `pricing_config` (JSONB)

```json
{
  "plans": {
    "free": {
      "name": "FREE",
      "price": 0,
      "currency": "USD",
      "billing": "free",
      "features": [
        "Acceso a indicadores gratuitos",
        "Comunidad básica",
        "Actualizaciones de indicadores free"
      ]
    },
    "pro_monthly": {
      "name": "PRO Mensual",
      "price": 39,
      "currency": "USD",
      "billing": "monthly",
      "features": [
        "Todos los indicadores premium",
        "Soporte prioritario",
        "Actualizaciones inmediatas",
        "Discord VIP"
      ]
    },
    "pro_yearly": {
      "name": "PRO Anual",
      "price": 390,
      "currency": "USD",
      "billing": "yearly",
      "discount": "2 meses gratis",
      "features": [
        "Todos los beneficios del plan mensual",
        "Ahorro de 2 meses al año",
        "Acceso anticipado a nuevos indicadores"
      ]
    },
    "lifetime": {
      "name": "Lifetime",
      "price": 999,
      "currency": "USD",
      "billing": "one_time",
      "features": [
        "Acceso de por vida a TODO",
        "Todos los indicadores futuros incluidos",
        "Soporte VIP prioritario",
        "Badge exclusivo de Lifetime Member",
        "Discord VIP con canal privado"
      ]
    }
  }
}
```

#### Estructura de `user_type_configs` (JSONB)

```json
{
  "visitor": {
    "greeting_template": "¡Hola! 👋\n\nBienvenido a APIDevs...",
    "capabilities": ["info_general", "pricing", "features"],
    "restrictions": ["no_personal_data", "no_premium_indicators"],
    "tone": "informativo y motivador",
    "call_to_action": "Regístrate gratis para acceder a indicadores",
    "show_pricing": true,
    "show_discounts": false
  },
  "registered_no_purchase": {
    "greeting_template": "¡Hola {user_name}! 👋\n\nBienvenido de vuelta...",
    "capabilities": ["info_general", "pricing", "account_info", "free_indicators"],
    "restrictions": ["no_premium_indicators"],
    "tone": "amigable y motivador",
    "call_to_action": "Upgrade a PRO para acceder a indicadores premium",
    "show_pricing": true,
    "show_discounts": true
  },
  "pro_active": {
    "greeting_template": "¡Hola {user_name}! ⭐\n\nBienvenido, miembro PRO...",
    "capabilities": ["info_general", "pricing", "account_info", "premium_indicators", "priority_support"],
    "restrictions": [],
    "tone": "profesional y técnico",
    "call_to_action": "Considera Lifetime para acceso permanente",
    "show_pricing": false,
    "show_upgrade_lifetime": true,
    "priority_support": true
  },
  "lifetime": {
    "greeting_template": "¡Hola {user_name}! 💎\n\nBienvenido, Lifetime Member...",
    "capabilities": ["info_general", "account_info", "premium_indicators", "vip_support", "exclusive_features"],
    "restrictions": [],
    "tone": "premium y exclusivo",
    "call_to_action": null,
    "show_pricing": false,
    "priority_support": true,
    "vip_treatment": true
  },
  "legacy": {
    "greeting_template": "¡Hola {user_name}! 🏆\n\nBienvenido, valioso cliente legacy...",
    "capabilities": ["info_general", "pricing", "account_info", "legacy_benefits"],
    "restrictions": [],
    "tone": "reconocimiento y gratitud",
    "call_to_action": "Aprovecha tu {legacy_discount_percentage}% de descuento",
    "show_pricing": true,
    "show_discounts": true,
    "calculate_discount": true,
    "emphasize_loyalty": true
  }
}
```

### 3.2 Tabla: `chat_conversations`

```sql
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  visibility TEXT DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

### 3.3 Tabla: `chat_messages`

```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id),
  role TEXT, -- 'user', 'assistant', 'system', 'tool'
  parts JSONB, -- contenido del mensaje
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 Tablas Relacionadas al Sistema de Accesos

```sql
-- Usuarios
users (id, email, full_name, tradingview_username, customer_tier, 
       is_legacy_user, legacy_discount_percentage, total_lifetime_spent)

-- Legacy Users (WordPress)
legacy_users (id, email, customer_tier, legacy_discount_percentage)

-- Suscripciones Stripe
subscriptions (id, user_id, status, price_id, current_period_end)

-- Accesos a Indicadores
indicator_access (id, user_id, indicator_id, tradingview_username, 
                  status, granted_at, expires_at, duration_type)

-- Catálogo de Indicadores
indicators (id, name, description, category, tier, status, tradingview_url)
```

---

## 4. COMPONENTES FRONTEND

### 4.1 ChatWidget (`components/chat-widget.tsx`)

**Descripción:** Widget flotante principal del chatbot.

**Características:**
- ✅ Botón flotante esquina inferior derecha
- ✅ GIF animado personalizado (`chatbot-boton.gif`)
- ✅ Modal de chat responsive
- ✅ Búho animado en header (`buho-leyendo.gif`)
- ✅ Textarea auto-expandible (1-5 líneas)
- ✅ Atajos de teclado (Enter envía, Shift+Enter nueva línea)
- ✅ Auto-scroll inteligente
- ✅ Streaming en tiempo real
- ✅ Sistema de autenticación integrado

**Estado Principal:**
```typescript
const [isOpen, setIsOpen] = useState(false);
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [userData, setUserData] = useState<UserData | null>(null);
const [showAuth, setShowAuth] = useState(false);
const [authChecked, setAuthChecked] = useState(false);
```

**Funciones Clave:**
```typescript
// Verificar autenticación al abrir
const checkAuthStatus = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // Cargar datos completos del usuario
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setUserData(userData);
    addWelcomeMessage(userData);
  } else {
    setShowAuth(true);
  }
};

// Enviar mensaje con streaming
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!input.trim() || isLoading) return;

  const userMessage: Message = {
    id: nanoid(),
    role: 'user',
    content: input
  };

  setMessages(prev => [...prev, userMessage]);
  setInput('');
  setIsLoading(true);

  // Streaming response
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [...messages, userMessage]
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let assistantMessage: Message = {
    id: nanoid(),
    role: 'assistant',
    content: ''
  };

  setMessages(prev => [...prev, assistantMessage]);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    assistantMessage.content += chunk;
    
    setMessages(prev => 
      prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: assistantMessage.content }
          : msg
      )
    );
  }

  setIsLoading(false);
};
```

### 4.2 ChatAuth (`components/chat-auth.tsx`)

**Descripción:** Sistema de autenticación inteligente.

**Características:**
- ✅ Captura email de usuarios no logueados
- ✅ Verifica email en base de datos
- ✅ Validación con Zod
- ✅ Modo invitado disponible
- ✅ Sugiere login si email existe

### 4.3 ChatSimpleV2 (`components/chat-simple-v2.tsx`)

**Descripción:** Versión fullpage del chat para testing.

**Diferencias con ChatWidget:**
- Ocupa toda la pantalla
- Sin animaciones de botón flotante
- Más enfocado en debugging
- Logs de streaming visibles

---

## 5. SISTEMA BACKEND (API ROUTES)

### 5.1 Endpoint Principal: `POST /api/chat`

**Archivo:** `app/api/chat/route.ts` (593 líneas)

**Flujo Completo:**

```typescript
export async function POST(request: Request) {
  try {
    // 1. PARSE REQUEST
    const { messages } = await request.json();
    console.log(`📨 Recibidos ${messages.length} mensajes`);

    // 2. AUTENTICACIÓN
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    const isGuest = !user || authError;
    const isAdmin = user?.email === 'api@apidevs.io';

    // 3. RATE LIMITING (admin exento)
    if (!isAdmin) {
      const identifier = isGuest 
        ? `guest-${request.headers.get('x-forwarded-for')}` 
        : user.email;
      
      const now = Date.now();
      const windowMs = 60000; // 1 minuto
      const maxRequests = 10;

      if (!rateLimitMap.has(identifier)) {
        rateLimitMap.set(identifier, []);
      }

      const userRequests = rateLimitMap.get(identifier)!;
      const recentRequests = userRequests.filter(time => now - time < windowMs);

      if (recentRequests.length >= maxRequests) {
        return new Response('Rate limit exceeded', { status: 429 });
      }

      recentRequests.push(now);
      rateLimitMap.set(identifier, recentRequests);
    }

    // 4. CARGAR CONFIGURACIÓN AI DESDE BD
    const { data: aiConfig } = await supabase
      .from('ai_configuration')
      .select('*')
      .eq('is_active', true)
      .single();

    if (!aiConfig) {
      console.error('❌ No AI configuration found');
      return new Response('AI configuration not found', { status: 500 });
    }

    // 5. CONSTRUIR USER PROFILE
    let userProfile = {
      full_name: isGuest ? "Invitado" : user?.user_metadata?.full_name || "Usuario",
      email: user?.email || "invitado@temporal.com",
      subscription_status: 'free',
      subscription_tier: 'free',
      is_admin: isAdmin,
      is_guest: isGuest,
      // ... más campos
    };

    // 6. CARGAR DATOS DEL USUARIO (si está logueado)
    if (!isGuest && user) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userData) {
        userProfile = {
          ...userProfile,
          ...userData,
          is_legacy_user: userData.is_legacy_user || false,
          legacy_discount_percentage: userData.legacy_discount_percentage || 0,
          customer_tier: userData.customer_tier || 'free',
        };
      }

      // Cargar suscripción activa
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (subscription) {
        userProfile.subscription_status = subscription.status;
        userProfile.subscription_tier = subscription.price_id;
      }
    }

    // 7. PRE-FETCH DE DATOS (consultas personales)
    let adminAccessData: AdminAccessData | null = null;
    
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const isQueryingOwnIndicators = 
      !isGuest &&
      (lastUserMessage.includes('mis indicadores') ||
       lastUserMessage.includes('qué indicadores tengo') ||
       lastUserMessage.includes('indicadores activos') ||
       lastUserMessage.includes('sabes que indicadores'));

    if (isQueryingOwnIndicators || isAdmin) {
      const { data: indicators } = await supabase
        .from('indicator_access')
        .select(`
          *,
          indicators (
            id,
            name,
            description,
            category,
            tier
          )
        `)
        .eq('user_id', user.id)
        .eq('active', true);

      if (indicators && indicators.length > 0) {
        adminAccessData = {
          user_email: userProfile.email,
          user_name: userProfile.full_name,
          total_indicators: indicators.length,
          indicators: indicators.map(acc => ({
            name: acc.indicators.name,
            category: acc.indicators.category,
            tier: acc.indicators.tier,
            expires_at: acc.expires_at,
            status: acc.status
          }))
        };
      }
    }

    // 8. CONSTRUIR SYSTEM PROMPT DINÁMICO
    const systemPrompt = buildSystemPrompt(
      aiConfiguration,
      userProfile,
      adminAccessData
    );

    console.log(`📝 System prompt generado dinámicamente (${systemPrompt.length} caracteres)`);

    // 9. OBTENER MODELO AI
    const modelConfig = {
      provider: aiConfig.model_provider,
      model: aiConfig.model_name,
      temperature: aiConfig.temperature,
      maxTokens: aiConfig.max_tokens
    };

    const aiModel = getAIModel(modelConfig);

    // 10. PREPARAR TOOLS
    const availableTools = {
      getUserAccessDetails: getUserAccessDetails,
    };

    // 11. LLAMAR MODELO CON STREAMING
    const result = streamText({
      model: aiModel,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      tools: availableTools,
      temperature: aiConfig.temperature || 0.7,
      maxTokens: aiConfig.max_tokens || 2000,
    });

    // 12. RETORNAR STREAM
    return result.toTextStreamResponse();

  } catch (error) {
    console.error('❌ Error en API chat:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export const maxDuration = 60;
```

---

## 6. SISTEMA DE MODELOS AI

### 6.1 Multi-Provider Support

**Archivo:** `lib/ai/providers.ts`

```typescript
import { xai } from '@ai-sdk/xai';
import { createOpenAI } from '@ai-sdk/openai';

export interface ModelConfig {
  provider: 'xai' | 'openrouter';
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export function getAIModel(config: ModelConfig) {
  switch (config.provider) {
    case 'xai':
      return xai(config.model);
    
    case 'openrouter':
      const openrouter = createOpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
      });
      return openrouter(config.model);
    
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}
```

### 6.2 Modelos Disponibles

#### X.AI (Grok)
```typescript
// Rápido y económico (~$5/1M tokens)
- grok-3
- grok-2-1212

// Mejor para: Consultas generales, respuestas rápidas
```

#### OpenRouter (400+ Modelos)
```typescript
// Claude (Anthropic)
- anthropic/claude-3.5-sonnet      // ⭐ Mejor con tools
- anthropic/claude-3-haiku

// OpenAI
- openai/gpt-4o                    // Multimodal
- openai/gpt-4o-mini              // Económico ($0.15/1M)

// Google
- google/gemini-2.0-flash-exp:free // 🆓 GRATIS, 1M contexto

// Meta
- meta-llama/llama-3.3-70b-instruct

// DeepSeek
- deepseek/deepseek-chat           // Muy económico ($0.14/1M)
```

### 6.3 Recomendaciones por Caso de Uso

| Caso de Uso | Modelo Recomendado | Motivo |
|------------|-------------------|--------|
| **Consultas admin con tools** | `anthropic/claude-3.5-sonnet` | Mejor function calling |
| **Desarrollo/Testing** | `google/gemini-2.0-flash-exp:free` | Gratis, 1M contexto |
| **Producción alto tráfico** | `openai/gpt-4o-mini` | Económico, rápido |
| **Consultas generales** | `xai/grok-3` | Rápido, económico |

---

## 7. SISTEMA DE PROMPTS DINÁMICOS

### 7.1 Prompt Builder

**Archivo:** `lib/ai/prompt-builder.ts` (287 líneas)

**Interfaces:**
```typescript
export interface AIConfiguration {
  system_prompt?: string | null;
  custom_greeting?: string | null;
  platform_info?: {
    name: string;
    description: string;
    features: string[];
  };
  pricing_config?: {
    plans: {
      free: PlanConfig;
      pro_monthly: PlanConfig;
      pro_yearly: PlanConfig;
      lifetime: PlanConfig;
    };
  };
  user_type_configs?: {
    visitor: UserTypeConfig;
    registered_no_purchase: UserTypeConfig;
    pro_active: UserTypeConfig;
    lifetime: UserTypeConfig;
    legacy: UserTypeConfig;
  };
  response_templates?: any;
  behavior_rules?: any;
  admin_instructions?: any;
}

export interface UserProfile {
  full_name?: string;
  email?: string;
  subscription_status?: string;
  subscription_tier?: string;
  tradingview_username?: string | null;
  is_legacy_user?: boolean;
  legacy_discount_percentage?: number;
  customer_tier?: string;
  is_admin?: boolean;
  is_guest?: boolean;
  created_at?: string;
  total_indicators?: number;
}

export interface AdminAccessData {
  user_email: string;
  user_name: string;
  total_indicators: number;
  indicators: Array<{
    name: string;
    category: string;
    tier: string;
    expires_at: string | null;
    status: string;
  }>;
}
```

**Función Principal:**
```typescript
export function buildSystemPrompt(
  aiConfig: AIConfiguration,
  userProfile: UserProfile | null,
  adminAccessData: AdminAccessData | null = null
): string {
  let prompt = '';
  
  // 1. SYSTEM PROMPT PERSONALIZADO (prioridad máxima)
  if (aiConfig.system_prompt && aiConfig.system_prompt.trim().length > 0) {
    prompt += aiConfig.system_prompt.trim();
    prompt += '\n\n';
    prompt += '--- INFORMACIÓN DE CONTEXTO ---\n\n';
  } else {
    // Fallback: Introducción genérica
    prompt += `Eres el asistente virtual de ${aiConfig.platform_info?.name || 'APIDevs Trading Platform'}.\n\n`;
  }
  
  // 2. INFORMACIÓN DE LA PLATAFORMA
  if (aiConfig.platform_info) {
    prompt += `INFORMACIÓN SOBRE ${aiConfig.platform_info.name.toUpperCase()}:\n`;
    prompt += `- ${aiConfig.platform_info.description}\n`;
    if (aiConfig.platform_info.features) {
      prompt += `\nCaracterísticas principales:\n`;
      aiConfig.platform_info.features.forEach(feature => {
        prompt += `  • ${feature}\n`;
      });
    }
    prompt += '\n';
  }
  
  // 3. PRECIOS Y PLANES
  if (aiConfig.pricing_config) {
    prompt += `PLANES Y PRECIOS:\n`;
    Object.entries(aiConfig.pricing_config.plans).forEach(([key, plan]) => {
      prompt += `\n${plan.name}:\n`;
      prompt += `- Precio: ${plan.price > 0 ? `$${plan.price}` : 'Gratis'}`;
      if (plan.billing) prompt += ` (${plan.billing})`;
      if (plan.discount) prompt += ` - ${plan.discount}`;
      prompt += '\n';
      if (plan.features) {
        plan.features.forEach(feature => {
          prompt += `  • ${feature}\n`;
        });
      }
    });
    prompt += '\n';
  }
  
  // 4. DATOS DEL USUARIO ACTUAL
  if (userProfile) {
    prompt += `DATOS DEL USUARIO ACTUAL:\n`;
    prompt += `- Tipo: ${userProfile.is_guest ? '👤 Usuario Invitado (NO registrado)' : '✅ Usuario Registrado'}\n`;
    prompt += `- Nombre: ${userProfile.full_name || 'N/A'}\n`;
    prompt += `- Email: ${userProfile.email || 'N/A'}\n`;
    prompt += `- Plan actual: ${userProfile.subscription_tier || 'free'} (${userProfile.subscription_status || 'inactive'})\n`;
    
    if (userProfile.tradingview_username) {
      prompt += `- Usuario TradingView: ${userProfile.tradingview_username}\n`;
    }
    
    if (userProfile.is_admin) {
      prompt += `- 🔑 ROL: ADMIN MASTER (acceso total)\n`;
    }
    
    prompt += '\n';
  }
  
  // 5. INFORMACIÓN LEGACY
  if (userProfile && userProfile.is_legacy_user) {
    const discountPercent = userProfile.legacy_discount_percentage || 0;
    const tier = userProfile.customer_tier || 'free';
    
    prompt += `🚀 INFORMACIÓN LEGACY (CLIENTES DE WORDPRESS):\n`;
    prompt += `- Es cliente legacy: SÍ\n`;
    prompt += `- Porcentaje de descuento legacy: ${discountPercent}%\n`;
    prompt += `- Tier de cliente: ${tier.toUpperCase()}\n`;
    prompt += `\nIMPORTANTE SOBRE LEGACY:\n`;
    prompt += `- Este cliente fue de nuestra plataforma anterior (WordPress)\n`;
    prompt += `- Tiene un descuento permanente del ${discountPercent}% en TODOS los planes\n`;
    prompt += `- Cuando le pregunten por precios, SIEMPRE aplica el descuento\n`;
    prompt += `- Ejemplo: PRO Mensual $39 → Cliente legacy paga $${(39 * (1 - discountPercent/100)).toFixed(2)}\n`;
    prompt += `- NUNCA menciones su historial de compras antiguas\n`;
    prompt += `- SIEMPRE enfatiza su lealtad y valor como cliente legacy\n\n`;
  }
  
  // 6. DATOS ADMINISTRATIVOS PRE-FETCHED
  if (adminAccessData) {
    prompt += `🔍 DATOS DE ACCESOS ADMINISTRATIVOS CONSULTADOS:\n`;
    prompt += `- Usuario consultado: ${adminAccessData.user_name} (${adminAccessData.user_email})\n`;
    prompt += `- Total de indicadores activos: ${adminAccessData.total_indicators}\n\n`;
    
    if (adminAccessData.indicators.length > 0) {
      prompt += `INDICADORES ACTIVOS:\n`;
      adminAccessData.indicators.forEach(ind => {
        prompt += `  • ${ind.name} (${ind.tier.toUpperCase()} - ${ind.category})\n`;
        if (ind.expires_at) {
          prompt += `    Expira: ${new Date(ind.expires_at).toLocaleDateString('es-ES')}\n`;
        } else {
          prompt += `    Acceso: Permanente\n`;
        }
      });
      prompt += '\n';
    }
  }
  
  // 7. ROL Y COMPORTAMIENTO SEGÚN TIPO DE USUARIO
  const userType = getUserType(userProfile);
  const userTypeConfig = aiConfig.user_type_configs?.[userType];
  
  if (userTypeConfig) {
    prompt += `TU ROL Y COMPORTAMIENTO:\n`;
    prompt += `- Tipo de usuario: ${userType}\n`;
    prompt += `- Tono de conversación: ${userTypeConfig.tone || 'profesional'}\n`;
    
    if (userTypeConfig.capabilities) {
      prompt += `\nCapacidades habilitadas:\n`;
      userTypeConfig.capabilities.forEach(cap => {
        prompt += `  ✓ ${cap}\n`;
      });
    }
    
    if (userTypeConfig.restrictions) {
      prompt += `\nRestricciones:\n`;
      userTypeConfig.restrictions.forEach(res => {
        prompt += `  ✗ ${res}\n`;
      });
    }
    
    if (userTypeConfig.call_to_action) {
      prompt += `\nCall to Action sugerido: ${userTypeConfig.call_to_action}\n`;
    }
    
    prompt += '\n';
  }
  
  // 8. EJEMPLOS DE RESPUESTAS SOBRE PRECIOS
  if (aiConfig.pricing_config) {
    prompt += `EJEMPLOS DE RESPUESTAS SOBRE PRECIOS:\n\n`;
    
    if (userProfile?.is_legacy_user) {
      const discount = userProfile.legacy_discount_percentage || 0;
      prompt += `Usuario pregunta: "¿Cuánto cuesta el plan PRO?"\n`;
      prompt += `Tu respuesta: "Como cliente legacy ${userProfile.customer_tier?.toUpperCase()}, `;
      prompt += `tienes un descuento especial del ${discount}% en todos nuestros planes. `;
      prompt += `El plan PRO mensual normalmente cuesta $39, pero para ti sería de $${(39 * (1 - discount/100)).toFixed(2)} al mes."\n\n`;
    } else {
      prompt += `Usuario pregunta: "¿Cuánto cuesta el plan PRO?"\n`;
      prompt += `Tu respuesta: "El plan PRO tiene dos opciones:\n`;
      prompt += `- Mensual: $39/mes\n`;
      prompt += `- Anual: $390/año (ahorras 2 meses gratis)\n`;
      prompt += `Ambos incluyen acceso completo a todos los indicadores premium."\n\n`;
    }
  }
  
  // 9. INSTRUCCIONES CRÍTICAS
  prompt += `🚨 INSTRUCCIONES CRÍTICAS:\n`;
  prompt += `1. Si ves "DATOS DE ACCESOS ADMINISTRATIVOS CONSULTADOS" arriba, los datos YA ESTÁN AHÍ\n`;
  prompt += `2. NO digas "déjame consultar" - los datos están en el contexto\n`;
  prompt += `3. Responde directamente con la información proporcionada\n`;
  prompt += `4. Si es usuario invitado, menciona los beneficios de registrarse\n`;
  prompt += `5. Si es usuario legacy, SIEMPRE aplica su descuento personalizado\n`;
  prompt += `6. Sé conciso pero informativo\n`;
  prompt += `7. Usa emojis apropiados para mejorar la experiencia\n`;
  
  return prompt;
}

// Función auxiliar: Determinar tipo de usuario
export function getUserType(userProfile: UserProfile | null): string {
  if (!userProfile) return 'visitor';
  
  // Prioridad 1: Verificar si es invitado
  if (userProfile.is_guest || userProfile.email === 'invitado@temporal.com') {
    return 'visitor';
  }
  
  // Prioridad 2: Verificar si es legacy
  if (userProfile.is_legacy_user) {
    return 'legacy';
  }
  
  // Prioridad 3: Verificar plan activo
  if (userProfile.subscription_status === 'active') {
    if (userProfile.subscription_tier?.includes('lifetime')) {
      return 'lifetime';
    }
    return 'pro_active';
  }
  
  // Prioridad 4: Usuario registrado sin compra
  return 'registered_no_purchase';
}

// Función auxiliar: Formatear greeting con variables
export function formatGreeting(
  template: string,
  userProfile: UserProfile
): string {
  let greeting = template;
  
  greeting = greeting.replace(/{user_name}/g, userProfile.full_name || 'Usuario');
  greeting = greeting.replace(/{total_indicators}/g, String(userProfile.total_indicators || 0));
  greeting = greeting.replace(/{legacy_discount_percentage}/g, String(userProfile.legacy_discount_percentage || 0));
  
  if (userProfile.created_at) {
    const createdDate = new Date(userProfile.created_at);
    const daysSince = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    const formattedDate = createdDate.toLocaleDateString('es-ES');
    greeting = greeting.replace(/{customer_since}/g, `${formattedDate} (${daysSince} días)`);
  }
  
  return greeting;
}
```

---

## 8. PANEL DE ADMINISTRACIÓN

### 8.1 Estructura del Panel

**Ruta:** `/admin/ia-config`

**Componente Principal:** `components/admin/ia-config/IAMainView.tsx`

**Tabs Principales:**
```typescript
const tabs = [
  {
    id: 'configuracion',
    name: 'Configuración',
    description: 'Configuración general del chatbot',
    icon: Settings,
  },
  {
    id: 'conversaciones',
    name: 'Conversaciones',
    description: 'Historial de chats',
    icon: MessageSquare,
    badge: 'Por Desarrollar',
  },
  {
    id: 'tools',
    name: 'Tools & Acciones',
    description: 'Herramientas disponibles',
    icon: Wrench,
  },
  {
    id: 'estadisticas',
    name: 'Estadísticas',
    description: 'Métricas de uso de la IA',
    icon: BarChart3,
  },
];
```

### 8.2 Tab "Configuración" - Sub-Tabs

**Archivo:** `components/admin/ia-config/ConfiguracionTab.tsx`

```typescript
const subTabs = [
  {
    id: 'modelo',
    name: 'Modelo IA',
    icon: Bot,
    description: 'Provider, modelo, parámetros',
  },
  {
    id: 'prompt',
    name: 'Prompt & Comportamiento',
    icon: FileText,
    description: 'System prompt, greeting, estilo',
  },
  {
    id: 'plataforma',
    name: 'Plataforma & Precios',
    icon: Building2,
    description: 'Info general y planes',
  },
  {
    id: 'usuarios',
    name: 'Tipos de Usuario',
    icon: Users,
    description: 'Configuración por segmento',
  },
  {
    id: 'avanzado',
    name: 'Avanzado',
    icon: SettingsIcon,
    description: 'Tools, rate limit, logs',
  },
];
```

#### Sub-Tab 1: Modelo IA

**Componente:** `ModelConfiguration.tsx`

**Configuración:**
- Selección de provider (X.AI, OpenRouter)
- Selección de modelo específico
- Temperatura (0-1)
- Max tokens (100-8000)
- Streaming enabled

#### Sub-Tab 2: Prompt & Comportamiento

**Componentes:**
- `SystemPromptEditor.tsx` - Editor de system prompt completo
- `GreetingConfiguration.tsx` - Configuración de saludo

**Configuración:**
- System prompt personalizado (textarea grande)
- Custom greeting message
- Estilo de respuesta (professional, friendly, technical)
- Include emojis (toggle)
- Show typing indicator (toggle)

#### Sub-Tab 3: Plataforma & Precios

**Componentes:**
- `PlatformInfoEditor.tsx` - Información general
- `PricingConfigEditor.tsx` - Configuración de planes

**PlatformInfoEditor:**
```typescript
interface PlatformInfo {
  name: string;
  description: string;
  features: string[];
}
```

**PricingConfigEditor:**
```typescript
interface PricingConfig {
  plans: {
    free: PlanConfig;
    pro_monthly: PlanConfig;
    pro_yearly: PlanConfig;
    lifetime: PlanConfig;
  };
}

interface PlanConfig {
  name: string;
  price: number;
  currency: 'USD' | 'EUR' | 'GBP';
  billing: 'free' | 'monthly' | 'yearly' | 'one_time';
  discount?: string;
  features: string[];
}
```

#### Sub-Tab 4: Tipos de Usuario

**Componente:** `UserTypeConfigEditor.tsx` (420 líneas)

**Tipos de Usuario:**
1. 👤 Visitantes (visitor)
2. 📝 Registrados sin compra (registered_no_purchase)
3. ⭐ Plan PRO (pro_active)
4. ♾️ Lifetime (lifetime)
5. 🏆 Legacy (legacy)

**Configuración por Tipo:**
```typescript
interface UserTypeConfig {
  greeting_template: string;         // Con variables: {user_name}, {total_indicators}
  capabilities: string[];            // ["info_general", "pricing", "account_info"]
  restrictions: string[];            // ["no_personal_data", "no_premium_indicators"]
  tone: string;                      // "profesional", "amigable", "técnico"
  call_to_action: string | null;    // CTA personalizado
  show_pricing: boolean;
  show_discounts: boolean;
  calculate_discount?: boolean;      // Solo legacy
  emphasize_loyalty?: boolean;       // Solo legacy
  show_upgrade_lifetime?: boolean;   // Solo pro_active
  priority_support?: boolean;
  vip_treatment?: boolean;           // Solo lifetime
}
```

#### Sub-Tab 5: Avanzado

**Componentes:**
- `ToolsConfiguration.tsx` - Configuración de tools
- `AdvancedSettings.tsx` - Configuración avanzada

**Configuración:**
- Enabled tools (checkboxes)
- Rate limit enabled (toggle)
- Max messages per minute (slider)
- Context memory enabled (toggle)
- Max conversation history (number)
- Logging enabled (toggle)
- Log level (select: debug, info, warn, error)

### 8.3 Tab "Estadísticas"

**Componente:** `EstadisticasTab.tsx`

**Métricas Mostradas:**

#### Balance de OpenRouter
```typescript
interface Balance {
  balance: number;        // Créditos restantes
  usage: number;          // Total usado
  limit: number;          // Límite total
  is_free_tier: boolean;
  rate_limit: {
    requests: number;
    interval: string;
  };
  usage_breakdown: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}
```

**Visualización:**
- Balance principal con gradiente purple/blue
- Estadísticas en cards (disponible, consumido, límite)
- Barra de progreso con colores según uso
- Consumo por periodo (diario, semanal, mensual)
- Proyección mensual con Claude 3 Haiku
- Gráfico de evolución temporal (Chart.js)

#### Gráfico de Uso (Chart.js)

**Componente:** `UsageChart.tsx`

```typescript
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
```

**Características:**
- Línea de tiempo de 30 días
- Gradiente bajo la línea (purple)
- Tooltips personalizados
- Grid horizontal semi-transparente
- Responsive (altura: 220px)

#### Métricas de Conversaciones

**Componente:** `ConversationMetrics.tsx`

**Métricas (placeholders por ahora):**
- Total conversaciones
- Usuarios activos
- Mensajes intercambiados
- Tiempo promedio de respuesta
- Tasa de éxito
- Tasa de error

### 8.4 Guardar Cambios

**Flujo de Guardado:**
```typescript
const handleSave = async () => {
  setSaveStatus('saving');
  
  try {
    const { error } = await supabase
      .from('ai_configuration')
      .update(config)
      .eq('id', config.id);
    
    if (error) throw error;
    
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2000);
  } catch (error) {
    console.error('Error saving:', error);
    setSaveStatus('error');
  }
};
```

**Botón Flotante:**
- Posición: Fixed, bottom-right
- Estados: idle, saving, success, error
- Feedback visual con colores y iconos

---

## 9. SISTEMA DE TOOLS

### 9.1 Tool: getUserAccessDetails

**Archivo:** `lib/ai/tools/access-management-tools.ts`

**Descripción:** Obtiene información detallada de accesos a indicadores de un usuario.

```typescript
import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';

export const getUserAccessDetails = tool({
  description: `Obtiene lista detallada de indicadores activos de un usuario con fechas de expiración.
  
  Útil para administradores que necesitan ver qué accesos tiene un usuario, 
  o para usuarios que quieren consultar sus propios accesos.`,
  
  parameters: z.object({
    userEmail: z.string().email().describe("Email del usuario para consultar sus accesos")
  }),
  
  execute: async ({ userEmail }) => {
    try {
      console.log(`🔍 getUserAccessDetails: Consultando accesos para ${userEmail}`);
      
      const supabase = await createClient();
      
      // 1. Buscar usuario por email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, full_name, tradingview_username, customer_tier')
        .eq('email', userEmail)
        .single();
      
      if (userError || !user) {
        return {
          success: false,
          error: `Usuario no encontrado: ${userEmail}`,
          user_email: userEmail
        };
      }
      
      // 2. Consultar accesos activos
      const { data: accesses, error: accessError } = await supabase
        .from('indicator_access')
        .select(`
          *,
          indicators (
            id,
            name,
            description,
            category,
            tier
          )
        `)
        .eq('user_id', user.id)
        .eq('active', true);
      
      if (accessError) {
        console.error('❌ Error al consultar accesos:', accessError);
        return {
          success: false,
          error: 'Error al consultar accesos en base de datos'
        };
      }
      
      // 3. Formatear respuesta
      const freeIndicators = accesses?.filter(a => a.indicators.tier === 'free') || [];
      const premiumIndicators = accesses?.filter(a => a.indicators.tier === 'premium') || [];
      
      const result = {
        success: true,
        user: {
          email: user.email,
          name: user.full_name,
          tradingview_username: user.tradingview_username,
          tier: user.customer_tier
        },
        stats: {
          total_active: accesses?.length || 0,
          free_indicators: freeIndicators.length,
          premium_indicators: premiumIndicators.length,
          expiring_soon: accesses?.filter(a => {
            if (!a.expires_at) return false;
            const daysUntilExpiry = Math.floor(
              (new Date(a.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            return daysUntilExpiry <= 7 && daysUntilExpiry >= 0;
          }).length || 0
        },
        indicators: accesses?.map(access => ({
          name: access.indicators.name,
          category: access.indicators.category,
          tier: access.indicators.tier,
          status: access.status,
          granted_at: access.granted_at,
          expires_at: access.expires_at,
          duration_type: access.duration_type,
          days_until_expiry: access.expires_at 
            ? Math.floor((new Date(access.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null
        })) || []
      };
      
      console.log('✅ getUserAccessDetails: Resultado completo:', JSON.stringify(result, null, 2));
      
      return result;
      
    } catch (error) {
      console.error('❌ getUserAccessDetails: Error general:', error);
      return {
        success: false,
        error: 'Error interno al consultar accesos'
      };
    }
  }
});
```

### 9.2 Tools Pendientes (FASE 2)

```typescript
// lib/ai/tools/grant-indicator-access.ts
export const grantIndicatorAccess = tool({
  description: "Concede acceso a un indicador específico para un usuario",
  parameters: z.object({
    userEmail: z.string().email(),
    indicatorName: z.string(),
    duration: z.enum(['7D', '30D', '1Y', '1L'])
  }),
  execute: async ({ userEmail, indicatorName, duration }) => {
    // Implementación pendiente
  }
});

// lib/ai/tools/revoke-indicator-access.ts
export const revokeIndicatorAccess = tool({
  description: "Revoca el acceso a un indicador específico de un usuario",
  parameters: z.object({
    userEmail: z.string().email(),
    indicatorName: z.string()
  }),
  execute: async ({ userEmail, indicatorName }) => {
    // Implementación pendiente
  }
});

// lib/ai/tools/search-users.ts
export const searchUsers = tool({
  description: "Busca usuarios por email, nombre o TradingView username",
  parameters: z.object({
    query: z.string(),
    userType: z.enum(['all', 'active', 'legacy', 'recovered']).optional()
  }),
  execute: async ({ query, userType }) => {
    // Implementación pendiente
  }
});
```

---

## 10. FLUJOS DE DATOS

### 10.1 Flujo: Usuario Pregunta Precio

```
1. Usuario escribe: "¿Cuánto cuesta el plan PRO?"
2. ChatWidget captura input → POST /api/chat
3. API verifica autenticación
4. Carga ai_configuration desde BD
5. Construye userProfile
6. Detecta que es usuario legacy con 25% descuento
7. buildSystemPrompt genera prompt con descuento aplicado
8. Llama modelo AI con prompt dinámico
9. AI calcula: $39 * 0.75 = $29.25
10. Respuesta: "Como cliente legacy, tu precio es $29.25/mes"
11. Stream de respuesta vía SSE
12. Frontend renderiza en tiempo real
```

### 10.2 Flujo: Admin Consulta Indicadores de Usuario

```
1. Admin escribe: "¿Qué indicadores tiene free@test.com?"
2. ChatWidget → POST /api/chat
3. API verifica que es admin (api@apidevs.io)
4. Carga ai_configuration
5. PRE-FETCH: Detecta consulta administrativa
6. Query a Supabase: SELECT indicadores WHERE user_email = 'free@test.com'
7. Obtiene: 6 indicadores (2 free, 4 premium)
8. Inyecta datos en adminAccessData
9. buildSystemPrompt incluye datos pre-fetched
10. Llama modelo AI (NO necesita usar tools)
11. AI lee datos del contexto y responde directamente
12. Respuesta: "El usuario tiene 6 indicadores: [lista completa]"
13. Stream de respuesta
14. Frontend renderiza
```

### 10.3 Flujo: Usuario Invitado Consulta

```
1. Usuario NO logueado abre chat
2. ChatWidget detecta: no hay user session
3. Muestra ChatAuth component
4. Usuario ingresa email o selecciona "Continuar como invitado"
5. ChatWidget permite escribir mensaje
6. Usuario escribe: "¿Qué planes tienen?"
7. POST /api/chat con isGuest = true
8. API permite request (rate limiting por IP)
9. Construye userProfile con is_guest: true
10. buildSystemPrompt genera prompt para "visitor"
11. Llama modelo AI con prompt de visitante
12. AI responde info general + CTA de registro
13. Stream de respuesta
14. Frontend renderiza con mensaje motivador
```

---

## 11. INTEGRACIÓN CON SISTEMA DE ACCESOS

### 11.1 Arquitectura del Sistema de Accesos

**Microservicio TradingView:**
```
URL: http://185.218.124.241:5001
API Key: 92a1e4a8c74e1871c658301f3e8ae31c31ed6bfd68629059617fac621932e1ea
```

**Endpoints Disponibles:**
```typescript
// Gestión de usuarios
GET    /api/admin/users/search?q={query}
GET    /api/admin/users/[id]/indicator-access
POST   /api/admin/users/[id]/grant-access
POST   /api/admin/users/[id]/revoke-access
POST   /api/admin/users/[id]/grant-all-free
POST   /api/admin/users/[id]/grant-all-premium

// Operaciones masivas
POST   /api/admin/bulk-operations/execute

// Auditoría
GET    /api/admin/access-audit
POST   /api/admin/access-audit/export
```

### 11.2 Estados de Acceso

```typescript
type AccessStatus =
  | 'pending'    // En espera
  | 'granted'    // Concedido
  | 'active'     // Activo
  | 'expired'    // Expirado
  | 'revoked'    // Revocado
  | 'failed'     // Falló

type AccessSource =
  | 'manual'     // Admin manual
  | 'purchase'   // Compra Stripe
  | 'trial'      // Periodo de prueba
  | 'bulk'       // Operación masiva
  | 'renewal'    // Renovación automática
  | 'promo'      // Promocional
```

### 11.3 Duraciones Disponibles

```typescript
type DurationType =
  | '7D'   // 7 días
  | '30D'  // 30 días (1 mes)
  | '1Y'   // 1 año
  | '1L'   // Lifetime (permanente)
```

---

## 12. SISTEMA DE DESCUENTOS LEGACY

### 12.1 Base de Datos

```sql
-- Tabla legacy_users
legacy_discount_percentage INTEGER DEFAULT 50
customer_tier TEXT -- 'diamond', 'platinum', 'gold', 'silver', 'bronze', 'free'

-- Tabla users (para usuarios migrados)
legacy_discount_percentage INTEGER
is_legacy_user BOOLEAN DEFAULT false
```

### 12.2 Distribución de Descuentos

| Tier | Descuento | Usuarios | Notas |
|------|-----------|----------|-------|
| 💎 **Diamond** | 30% | ~8 | Descuento máximo |
| 🏆 **Platinum** | 20-30% | ~50 | Mixto según antigüedad |
| 🥇 **Gold** | 15-30% | ~100 | Variable |
| 🥈 **Silver** | 10-30% | ~150 | Muy variable |
| 🥉 **Bronze** | 5-15% | ~80 | Descuentos bajos |
| 🆓 **Free** | 0-20% | ~1200 | Mayoritariamente 0% |

### 12.3 Lógica de Aplicación

**Asignación Automática:**
```typescript
if (userProfile.is_legacy_user && userProfile.legacy_discount_percentage === 0) {
  const tierDiscounts = {
    'diamond': 30,
    'platinum': 25,
    'gold': 20,
    'silver': 15,
    'bronze': 10,
    'free': 5
  };
  userProfile.legacy_discount_percentage = tierDiscounts[userProfile.customer_tier] || 5;
}
```

**Cálculo de Precios:**
```typescript
const precioConDescuento = precioOriginal * (1 - discountPercent/100);

// Ejemplo: Usuario Diamond (30% descuento)
// PRO $39 → $39 * 0.70 = $27.30
```

**Mensaje Personalizado:**
```typescript
const tierDisplay = {
  'diamond': '💎 DIAMOND',
  'platinum': '🏆 PLATINUM',
  'gold': '🥇 GOLD',
  'silver': '🥈 SILVER',
  'bronze': '🥉 BRONZE',
  'free': '🆓 FREE'
}[tier.toLowerCase()];

// Saludo:
`¡Hola ${userName}! 👋

Bienvenido a APIDevs como cliente ${tierDisplay}.

⭐ Como uno de nuestros primeros y más valiosos clientes legacy,
tienes un ${discountPercent}% de descuento especial en todos nuestros planes.`
```

---

## 13. AUTENTICACIÓN Y SEGURIDAD

### 13.1 Sistema de Autenticación

**Supabase Auth:**
```typescript
const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();

const isGuest = !user || error;
const isAdmin = user?.email === 'api@apidevs.io';
```

**Niveles de Acceso:**
1. **Invitado (Guest)** - Sin autenticación
2. **Usuario Registrado** - Con cuenta Supabase
3. **Admin Master** - `api@apidevs.io`

### 13.2 Rate Limiting

```typescript
const rateLimitMap = new Map<string, number[]>();

if (!isAdmin) {
  const identifier = isGuest 
    ? `guest-${request.headers.get('x-forwarded-for')}` 
    : user.email;
  
  const windowMs = 60000; // 1 minuto
  const maxRequests = 10;

  const now = Date.now();
  const userRequests = rateLimitMap.get(identifier) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  recentRequests.push(now);
  rateLimitMap.set(identifier, recentRequests);
}
```

**Límites:**
- **Usuarios normales:** 10 mensajes/minuto
- **Admin:** Sin límite
- **Invitados:** 10 mensajes/minuto (por IP)

### 13.3 Validación de Datos

**Zod Schemas:**
```typescript
import { z } from 'zod';

const EmailSchema = z.string().email();
const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string()
});
```

### 13.4 Seguridad de Endpoints Admin

```typescript
// Verificación en TODOS los endpoints admin
const isAdmin = user?.email === 'api@apidevs.io';

if (!isAdmin) {
  return new Response('Unauthorized', { status: 403 });
}
```

---

## 14. ESTADO ACTUAL Y FUNCIONALIDADES

### 14.1 Estado General

**🎯 Sistema: 95% Completo y Operativo**

| Componente | Estado | Porcentaje |
|-----------|--------|------------|
| **Widget Flotante** | ✅ Funcional | 100% |
| **Sistema de IA** | ✅ Funcional | 100% |
| **Pre-fetch de Datos** | ✅ Funcional | 100% |
| **Panel Admin** | ✅ Funcional | 100% |
| **Multi-modelo** | ✅ Funcional | 100% |
| **System Prompts Dinámicos** | ✅ Funcional | 100% |
| **Tools (consulta)** | ✅ Funcional | 100% |
| **Tools (modificación)** | 🔄 Pendiente | 0% |
| **Persistencia conversaciones** | 🔄 Pendiente | 0% |
| **Artifacts** | 🔄 Pendiente | 0% |

### 14.2 Funcionalidades Operativas

#### ✅ Para Usuarios Finales

**Información General (100%):**
- Preguntas sobre planes y precios
- Características de indicadores
- Información sobre TradingView
- Soporte general

**Información Personalizada (100%):**
- Estado de suscripción
- Indicadores activos
- Fechas de expiración
- Usuario TradingView

**Experiencia de Usuario:**
- Streaming en tiempo real
- Textarea auto-expandible
- Auto-scroll inteligente
- Atajos de teclado

#### ✅ Para Administradores

**Consultas (100%):**
- Indicadores de cualquier usuario
- Información detallada de accesos
- Estado de suscripciones
- Datos de usuarios legacy

**Gestión (100%):**
- Panel de configuración completo
- Parametrización sin código
- Estadísticas de uso
- Monitoreo de balance OpenRouter

#### ✅ Características Técnicas

**Backend:**
- Multi-modelo (X.AI + OpenRouter)
- Rate limiting inteligente
- Pre-fetch automático
- System prompts dinámicos
- Tools funcionales

**Frontend:**
- Widget flotante responsive
- Autenticación inteligente
- Modo invitado
- Feedback visual completo

### 14.3 Casos de Uso Probados

| Caso de Uso | Estado | Notas |
|------------|--------|-------|
| Usuario pregunta precio | ✅ | Con descuento legacy aplicado |
| Usuario consulta sus indicadores | ✅ | Pre-fetch funciona perfectamente |
| Admin consulta usuario X | ✅ | Pre-fetch automático |
| Usuario legacy registra | ✅ | Descuento preservado |
| Invitado consulta info general | ✅ | Con CTA de registro |
| Usuario PRO pregunta por upgrade | ✅ | CTA Lifetime mostrado |
| Admin cambia precios | ✅ | Reflejado inmediatamente |
| Admin cambia system prompt | ✅ | Aplicado en siguiente mensaje |

---

## 15. PROBLEMAS RESUELTOS

### 15.1 Problema: System Prompt No Se Usaba

**Fecha:** 15 Oct 2025

**Síntoma:**
Admin editaba system prompt en panel, pero IA no reflejaba cambios.

**Causa:**
`buildSystemPrompt()` no leía el campo `system_prompt` de la BD.

**Solución:**
```typescript
// ANTES (hardcoded)
prompt += `Eres el asistente virtual de ${aiConfig.platform_info?.name}`;

// DESPUÉS (dinámico)
if (aiConfig.system_prompt && aiConfig.system_prompt.trim().length > 0) {
  prompt += aiConfig.system_prompt.trim();
  prompt += '\n\n--- INFORMACIÓN DE CONTEXTO ---\n\n';
}
```

**Estado:** ✅ Resuelto

---

### 15.2 Problema: Tools No Funcionaban con Streaming

**Fecha:** 15 Oct 2025

**Síntoma:**
Tools se ejecutaban correctamente pero la IA no usaba los resultados.

**Causa:**
`toTextStreamResponse()` no incluye tool results en el stream.

**Solución:**
Sistema de **pre-fetch** que obtiene datos ANTES de llamar al modelo:
```typescript
// Detecta consultas personales
const isQueryingOwnIndicators = 
  lastUserMessage.includes('mis indicadores') ||
  lastUserMessage.includes('qué indicadores tengo');

if (isQueryingOwnIndicators) {
  // Query directa a Supabase
  const { data: indicators } = await supabase
    .from('indicator_access')
    .select('*')
    .eq('user_id', user.id);
  
  // Inyecta en system prompt
  adminAccessData = { indicators };
}

// buildSystemPrompt incluye datos pre-fetched
const systemPrompt = buildSystemPrompt(aiConfig, userProfile, adminAccessData);
```

**Estado:** ✅ Resuelto con pre-fetch approach

---

### 15.3 Problema: Chat No Funcionaba para Invitados

**Fecha:** 15 Oct 2025

**Síntoma:**
Error `Auth session missing!` cuando usuario no logueado intentaba usar chat.

**Causa:**
API route requería autenticación obligatoria.

**Solución:**
Modo invitado implementado:
```typescript
const isGuest = !user || authError;

if (isGuest) {
  console.log('👤 Usuario invitado detectado');
  // Rate limiting por IP
  // Perfil guest por defecto
  // System prompt adaptado
}
```

**Estado:** ✅ Resuelto

---

### 15.4 Problema: Botón Dentro de Botón (Hydration Error)

**Fecha:** 15 Oct 2025

**Síntoma:**
Error de hidratación: `<button> cannot be a descendant of <button>`

**Causa:**
Botones Eye/EyeOff dentro del botón principal de accordion en `UserTypeConfigEditor.tsx`.

**Solución:**
Convertir botones internos a `<div>` con role="button":
```typescript
<div
  onClick={(e) => {
    e.stopPropagation();
    setPreviewType(key);
  }}
  className="p-2 rounded-lg cursor-pointer"
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation();
      setPreviewType(key);
    }
  }}
>
  <Eye className="w-4 h-4" />
</div>
```

**Estado:** ✅ Resuelto

---

### 15.5 Problema: Textarea de Una Línea

**Fecha:** 15 Oct 2025

**Síntoma:**
Input de chat limitado a una línea, texto largo salía del viewport.

**Causa:**
Uso de `<input>` en lugar de `<textarea>`.

**Solución:**
Textarea auto-expandible con límite máximo:
```typescript
<textarea
  value={input}
  onChange={(e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }}
  rows={1}
  style={{ minHeight: '40px', maxHeight: '120px' }}
  className="resize-none overflow-y-auto"
/>
```

**Estado:** ✅ Resuelto

---

## 16. CASOS DE USO

### 16.1 Usuario Nuevo Consulta Precios

**Escenario:**
Usuario sin cuenta visita el sitio y abre el chat.

**Flujo:**
1. Usuario abre chat → ChatAuth aparece
2. Ingresa email o continúa como invitado
3. Escribe: "¿Cuánto cuestan los planes?"
4. Sistema:
   - Detecta: `is_guest = true`
   - Tipo de usuario: `visitor`
   - System prompt con info de visitante
5. IA responde:
   - Información de precios completa
   - Beneficios de cada plan
   - CTA: "Regístrate gratis para acceder a indicadores"
6. Usuario recibe respuesta motivadora

---

### 16.2 Usuario Legacy Consulta Descuento

**Escenario:**
Cliente antiguo de WordPress quiere saber su descuento.

**Flujo:**
1. Usuario legacy hace login
2. Chat detecta:
   - `is_legacy_user = true`
   - `customer_tier = 'platinum'`
   - `legacy_discount_percentage = 25`
3. Saludo personalizado:
   ```
   ¡Hola Carlos! 🏆
   
   Bienvenido, valioso cliente legacy PLATINUM.
   
   ⭐ Como uno de nuestros primeros clientes,
   tienes un 25% de descuento especial en todos nuestros planes.
   ```
4. Usuario pregunta: "¿Cuánto me costaría el plan PRO?"
5. Sistema:
   - Detecta usuario legacy
   - Calcula: $39 * 0.75 = $29.25
6. IA responde:
   ```
   Como cliente legacy PLATINUM, tu precio especial es $29.25/mes
   (precio normal: $39/mes - tu descuento: 25%)
   
   ¿Te gustaría que te ayude con el proceso de upgrade?
   ```

---

### 16.3 Usuario PRO Consulta Sus Indicadores

**Escenario:**
Usuario con suscripción activa quiere ver sus accesos.

**Flujo:**
1. Usuario PRO hace login
2. Escribe: "¿Qué indicadores tengo activos?"
3. Sistema:
   - Detecta consulta personal
   - **PRE-FETCH**: Query a Supabase
   - Obtiene 6 indicadores (2 free, 4 premium)
   - Inyecta datos en system prompt
4. IA responde (sin usar tools, datos ya en contexto):
   ```
   Tienes 6 indicadores activos en tu cuenta:
   
   📊 INDICADORES FREE (2):
   • ADX DEF [APIDEVS] - Acceso permanente
   • Watermark [APIDEVs] - Acceso permanente
   
   ⭐ INDICADORES PREMIUM (4):
   • POSITION SIZE [APIDEVs] - Acceso permanente
   • RSI PRO+ Stochastic [APIDEVs] - Acceso permanente
   • RSI SCANNER [APIDEVs] - Acceso permanente
   • RSI PRO+ OVERLAY [APIDEVS] - Acceso permanente
   
   Todos tus indicadores tienen acceso permanente (Lifetime). 
   ¡Estás aprovechando al máximo tu suscripción! 🎉
   ```

---

### 16.4 Admin Consulta Usuario Específico

**Escenario:**
Admin necesita ver accesos de un usuario.

**Flujo:**
1. Admin (api@apidevs.io) hace login
2. Escribe: "¿Qué indicadores tiene free@test.com?"
3. Sistema:
   - Detecta consulta administrativa
   - **PRE-FETCH**: Query a Supabase con email
   - Obtiene datos del usuario consultado
   - Inyecta en adminAccessData
4. IA responde:
   ```
   Usuario: free@test.com
   Nombre: Free Test
   Tier: FREE
   
   Total de indicadores activos: 6
   
   Desglose:
   • Free: 2 indicadores
   • Premium: 4 indicadores
   
   Lista completa:
   [misma lista del caso anterior]
   
   ¿Necesitas modificar algún acceso?
   ```

---

### 16.5 Admin Cambia Configuración

**Escenario:**
Admin quiere cambiar el saludo de usuarios PRO.

**Flujo:**
1. Admin va a `/admin/ia-config`
2. Tab "Configuración" → Sub-tab "Tipos de Usuario"
3. Expande "⭐ Plan PRO"
4. Edita greeting template:
   ```
   ¡Hola {user_name}! ⭐
   
   Bienvenido, miembro PRO exclusivo.
   Tienes acceso a {total_indicators} indicadores premium.
   
   ¿En qué puedo ayudarte hoy?
   ```
5. Click "Guardar Cambios"
6. Sistema:
   - UPDATE en `ai_configuration`
   - Cambios aplicados inmediatamente
7. Próximo usuario PRO verá el nuevo saludo

---

## 17. CONFIGURACIÓN Y DEPLOYMENT

### 17.1 Variables de Entorno

**Archivo:** `.env.local`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://zzieiqxlxfydvexalbsr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI Providers
OPENAI_API_KEY=sk-...
XAI_API_KEY=xai-...
OPENROUTER_API_KEY=sk-or-v1-...

# App
NEXT_PUBLIC_SITE_URL=https://apidevs.io
```

### 17.2 Dependencias NPM

```json
{
  "dependencies": {
    "next": "^14.2.3",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    
    "ai": "^3.x.x",
    "@ai-sdk/openai": "^0.x.x",
    "@ai-sdk/xai": "^0.x.x",
    
    "@supabase/supabase-js": "^2.x.x",
    "@supabase/ssr": "^0.x.x",
    
    "zod": "^3.x.x",
    "nanoid": "^5.x.x",
    
    "chart.js": "^4.x.x",
    "react-chartjs-2": "^5.x.x",
    
    "lucide-react": "^0.x.x",
    "tailwindcss": "^3.x.x"
  }
}
```

### 17.3 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Start producción
npm start

# Type check
npm run type-check
```

### 17.4 Deployment en Vercel

**Configuración automática:**
1. Conectar repositorio GitHub
2. Agregar variables de entorno
3. Deploy automático en cada push a `main`

**Configuración Edge Runtime:**
```typescript
// app/api/chat/route.ts
export const runtime = 'edge';
export const maxDuration = 60;
```

---

## 18. PRÓXIMAS FUNCIONALIDADES

### 18.1 FASE 2.1 - Tools de Modificación

**Prioridad: Alta**

```typescript
// Tools administrativos
- grantIndicatorAccess
- revokeIndicatorAccess
- renewUserAccess
- bulkGrantAccess
```

**Casos de uso:**
```
Admin: "Concede acceso al RSI PRO para carlos@test.com por 30 días"
Admin: "Revoca todos los accesos de maria@test.com"
Admin: "Renueva los accesos expirados de juan@test.com"
```

### 18.2 FASE 2.2 - Persistencia de Conversaciones

**Prioridad: Media**

**Funcionalidades:**
- Guardar conversaciones en `chat_conversations`
- Guardar mensajes en `chat_messages`
- Títulos automáticos generados por IA
- Historial navegable
- Búsqueda en conversaciones

**UI:**
```
Tab "Conversaciones" en /admin/ia-config:
- Lista de todas las conversaciones
- Filtros por usuario, fecha, tipo
- Export a CSV
- Analytics de conversaciones
```

### 18.3 FASE 2.3 - Artifacts

**Prioridad: Media**

**Tipos de artifacts:**
- Tablas de datos
- Documentos formateados
- Gráficos y visualizaciones
- Código snippet

**Ejemplo:**
```
Usuario: "Muéstrame todos los indicadores disponibles en tabla"
IA genera artifact: Tabla interactiva con columnas:
- Nombre
- Categoría
- Tier
- Estado
- Acciones
```

### 18.4 FASE 2.4 - Analytics Avanzados

**Prioridad: Baja**

**Métricas adicionales:**
- Temas más consultados
- Palabras clave frecuentes
- Satisfacción del usuario
- Tiempo promedio de respuesta
- Tasa de conversión (consultas → acciones)
- Análisis de sentimiento

**Dashboards:**
- Gráficos de uso por día/semana/mes
- Comparativas entre modelos AI
- ROI del chatbot

### 18.5 FASE 3 - Integraciones

**Prioridad: Baja**

**Integraciones planificadas:**
- Slack (notificaciones admin)
- Discord (sincronización con canal de soporte)
- Webhook para eventos importantes
- Email automático para seguimientos

---

## 📚 REFERENCIAS Y RECURSOS

### Documentación Oficial

- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [OpenRouter API](https://openrouter.ai/docs)
- [X.AI API](https://docs.x.ai/)
- [Supabase](https://supabase.com/docs)
- [Next.js](https://nextjs.org/docs)

### Archivos del Proyecto

```
apidevs-react/
├── app/
│   ├── api/
│   │   ├── chat/route.ts                    # ⭐ API principal
│   │   └── ai/balance/route.ts              # Balance OpenRouter
│   ├── admin/
│   │   └── ia-config/page.tsx               # Panel admin
│   └── chat-v2/page.tsx                     # Chat fullpage
│
├── components/
│   ├── chat-widget.tsx                      # ⭐ Widget flotante
│   ├── chat-auth.tsx                        # Autenticación
│   ├── chat-simple-v2.tsx                   # Chat testing
│   └── admin/
│       └── ia-config/                       # ⭐ Panel admin
│           ├── IAMainView.tsx               # Vista principal
│           ├── ConfiguracionTab.tsx         # Tab configuración
│           ├── EstadisticasTab.tsx          # Tab estadísticas
│           ├── ModelConfiguration.tsx       # Config modelo
│           ├── SystemPromptEditor.tsx       # Editor prompt
│           ├── PlatformInfoEditor.tsx       # Info plataforma
│           ├── PricingConfigEditor.tsx      # Config precios
│           ├── UserTypeConfigEditor.tsx     # Config usuarios
│           ├── ToolsConfiguration.tsx       # Config tools
│           ├── AdvancedSettings.tsx         # Config avanzada
│           ├── UsageChart.tsx               # Gráfico uso
│           └── ConversationMetrics.tsx      # Métricas chat
│
├── lib/
│   ├── ai/
│   │   ├── providers.ts                     # ⭐ Multi-provider
│   │   ├── prompt-builder.ts                # ⭐ Constructor prompts
│   │   └── tools/
│   │       └── access-management-tools.ts   # ⭐ Tools admin
│   └── utils/
│
├── supabase/
│   └── migrations/
│       └── expand_ai_configuration.sql      # Schema BD
│
├── public/
│   ├── chatbot-boton.gif                    # GIF botón
│   └── buho-leyendo.gif                     # GIF búho
│
└── types_db.ts                              # Tipos TypeScript
```

---

## 🎯 CONCLUSIÓN

El **Sistema de IA de APIDevs** es una plataforma completa, parametrizable y escalable que proporciona:

✅ **Funcionalidad Completa:** Chatbot 100% operativo con información en tiempo real
✅ **Parametrización Total:** Sin hardcoding, todo configurable desde admin panel
✅ **Multi-modelo:** Acceso a 400+ modelos vía OpenRouter + X.AI
✅ **Inteligencia Contextual:** System prompts dinámicos según tipo de usuario
✅ **Pre-fetch Eficiente:** Consultas rápidas sin depender de tools
✅ **Experiencia Premium:** UI moderna con streaming y auto-scroll
✅ **Seguridad:** Rate limiting, autenticación y validación completa
✅ **Escalabilidad:** Arquitectura preparada para crecimiento

**Estado Actual:** ✅ Sistema 95% completo y listo para producción

---

**Autor:** Sistema desarrollado para APIDevs Trading Platform  
**Fecha:** 15 de Octubre de 2025  
**Versión del Documento:** 2.0  
**Última Actualización:** 15 de Octubre de 2025

---


