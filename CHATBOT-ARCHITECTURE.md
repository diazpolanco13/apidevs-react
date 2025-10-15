# 🤖 Arquitectura del Chatbot APIDevs - Documentación Técnica

## 📋 **ÍNDICE**
1. [Visión General](#visión-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componentes UI](#componentes-ui)
4. [API y Backend](#api-y-backend)
5. [Sistema de Tools](#sistema-de-tools)
6. [Flujo de Datos](#flujo-de-datos)
7. [Autenticación](#autenticación)
8. [Integración con Supabase](#integración-con-supabase)
9. [Modelos AI](#modelos-ai)
10. [Problema Conocido](#problema-conocido)

---

## 🎯 **VISIÓN GENERAL**

El chatbot de APIDevs es un **asistente virtual inteligente** integrado en toda la plataforma que puede:
- Responder preguntas generales sobre planes, precios e indicadores
- Consultar información personalizada del usuario (en desarrollo)
- Proporcionar soporte en tiempo real con streaming de respuestas

**Estado Actual:** ✅ 90% completo - Widget flotante funcional con streaming, autenticación inteligente y respuestas generales implementadas.

---

## 🏗️ **ARQUITECTURA DEL SISTEMA**

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO (Navegador)                      │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│               COMPONENTES UI (React Client)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ChatWidget   │  │  ChatAuth    │  │ChatSimpleV2  │      │
│  │ (Flotante)   │  │(Autenticación│  │(Página Full) │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
└─────────────────────────────┬───────────────────────────────┘
                              │ POST /api/chat
                              │ { messages: [...] }
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  API ROUTE (Next.js)                        │
│                 app/api/chat/route.ts                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Verificar autenticación (Supabase Auth)          │  │
│  │  2. Construir system prompt con contexto APIDevs     │  │
│  │  3. Llamar modelo AI (X.AI Grok-2-1212)             │  │
│  │  4. Procesar tools si es necesario                   │  │
│  │  5. Stream respuesta al cliente                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────┬───────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│    MODELO AI (X.AI)       │  │    TOOLS (lib/ai/tools)   │
│   Grok-2-1212             │  │  - getUserStatus          │
│   OpenAI (alternativa)    │  │  - getTradingViewUsername │
│                           │  │  - (más pendientes)       │
└───────────────────────────┘  └──────────┬────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────┐
                              │   SUPABASE DATABASE       │
                              │  - users                  │
                              │  - subscriptions          │
                              │  - indicator_access       │
                              │  - chat_conversations     │
                              │  - chat_messages          │
                              └───────────────────────────┘
```

---

## 🎨 **COMPONENTES UI**

### 1. **ChatWidget** (`components/chat-widget.tsx`)
**Componente principal del chatbot flotante.**

**Responsabilidades:**
- Renderizar botón flotante con GIF animado
- Mostrar/ocultar ventana del chat
- Gestionar estado de mensajes (user/assistant)
- Implementar streaming de respuestas en tiempo real
- Integrar sistema de autenticación
- Mostrar indicadores visuales (loading, typing)

**Props:** Ninguna (se integra directamente en el layout)

**Estado principal:**
```typescript
const [isOpen, setIsOpen] = useState(false);           // Chat abierto/cerrado
const [messages, setMessages] = useState<Message[]>([]); // Historial
const [input, setInput] = useState("");                 // Input del usuario
const [isLoading, setIsLoading] = useState(false);     // Estado loading
const [userData, setUserData] = useState<UserData | null>(null); // Usuario logueado
const [guestEmail, setGuestEmail] = useState<string>(""); // Email invitado
const [showAuth, setShowAuth] = useState(false);       // Mostrar auth form
```

**Características UI:**
- ✅ Botón flotante en esquina inferior derecha
- ✅ GIF animado personalizado (`chatbot-boton.gif`)
- ✅ Búho animado en header (`buho-leyendo.gif`)
- ✅ Tooltip al hacer hover
- ✅ Badge de notificación animado
- ✅ Colores adaptados a paleta APIDevs (#aaff00, #C9D92E)
- ✅ Diseño responsive
- ✅ Animaciones suaves

**Flujo de interacción:**
```
Usuario abre chat → Verifica auth → Muestra auth form o welcome message
Usuario escribe → Envía mensaje → POST /api/chat → Stream respuesta
Usuario cierra chat → Reset state → Listo para próxima sesión
```

---

### 2. **ChatAuth** (`components/chat-auth.tsx`)
**Sistema de autenticación inteligente del chat.**

**Responsabilidades:**
- Capturar email de usuarios no logueados
- Verificar si email existe en base de datos
- Validar formato de email (Zod)
- Proporcionar opción de modo invitado
- Callbacks para usuario autenticado o invitado

**Props:**
```typescript
interface ChatAuthProps {
  onAuthSuccess: (userData: { id: string; email: string; full_name: string }) => void;
  onGuestContinue: (email: string) => void;
}
```

**Flujo de autenticación:**
```
1. Usuario no logueado abre chat
2. ChatAuth detecta falta de autenticación
3. Muestra formulario de captura de email
4. Usuario ingresa email → Validación Zod
5. Consulta Supabase: ¿Email existe?
   ├─ SÍ → Sugiere login
   └─ NO → Permite continuar como invitado
6. Callback onGuestContinue(email) o mensaje de login
```

**Protección anti-spam:**
- Validación de formato de email con Zod
- Verificación de existencia en BD
- Rate limiting (futuro)

---

### 3. **ChatSimpleV2** (`components/chat-simple-v2.tsx`)
**Versión de página completa del chat para testing.**

**Diferencias con ChatWidget:**
- Ocupa toda la pantalla (no flotante)
- Sin animaciones de botón
- Enfocado en debugging
- Logs de streaming visibles

**Uso:**
```typescript
// Accesible en /chat-v2
<ChatSimpleV2 />
```

---

## 🔌 **API Y BACKEND**

### **API Route Principal** (`app/api/chat/route.ts`)

**Endpoint:** `POST /api/chat`

**Request Body:**
```typescript
{
  messages: [
    { id: string, role: "user" | "assistant", content: string }
  ]
}
```

**Response:** `text/event-stream` (Server-Sent Events)

**Flujo de procesamiento:**

```typescript
export async function POST(request: Request) {
  // 1. Parse request
  const { messages } = await request.json();

  // 2. Verificar autenticación
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return new Response("No autorizado", { status: 401 });
  }

  // 3. Construir system prompt
  const systemPrompt = `
    Eres el asistente virtual de APIDevs Trading Platform.
    
    INFORMACIÓN SOBRE APIDEVS:
    - Planes: FREE, PRO Mensual ($39/mes), PRO Anual ($390/año), Lifetime ($999)
    - Indicadores premium y free para TradingView
    - Pagos con Stripe
    
    TU ROL:
    - Responder sobre planes, precios, indicadores
    - Ayuda con consultas de estado de usuario
    - Tono profesional pero amigable
    
    TOOLS DISPONIBLES:
    - getUserStatus: Info completa del usuario
    - getTradingViewUsername: Username específico
  `;

  // 4. Llamar modelo AI con tools
  const result = await streamText({
    model: xai('grok-2-1212'),
    system: systemPrompt,
    messages,
    tools: {
      getUserStatus,
      getTradingViewUsername,
    },
  });

  // 5. Stream respuesta
  return result.toTextStreamResponse();
}
```

**Configuración:**
```typescript
export const maxDuration = 60; // Timeout de 60 segundos
```

**Headers de respuesta:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

---

## 🛠️ **SISTEMA DE TOOLS**

### **¿Qué son las Tools?**
Las tools son **funciones que el modelo AI puede ejecutar** para obtener información en tiempo real de la base de datos.

### **Tool 1: getUserStatus** (`lib/ai/tools/get-user-status.ts`)

**Descripción:** Obtiene información completa del usuario autenticado.

**Esquema de entrada:**
```typescript
inputSchema: z.object({}) // No requiere parámetros
```

**Esquema de salida:**
```typescript
{
  success: boolean;
  user: {
    id: string;
    email: string;
    full_name: string;
    tradingview_username: string | null;
    created_at: string;
  };
  subscription: {
    status: string;
    price_id: string;
    current_period_end: string;
    // ...
  } | null;
  indicatorAccess: Array<{
    indicator_id: string;
    active: boolean;
    expires_at: string | null;
    // ...
  }>;
  summary: {
    hasActiveSubscription: boolean;
    totalIndicators: number;
    subscriptionStatus: string;
    subscriptionTier: string;
  };
}
```

**Queries realizadas:**
1. `auth.getUser()` - Usuario autenticado
2. `users.select('*').eq('id', user.id).single()` - Datos del usuario
3. `subscriptions.select('*').eq('user_id', user.id).eq('status', 'active').single()` - Suscripción activa
4. `indicator_access.select('*, indicators(name, description)').eq('user_id', user.id).eq('active', true)` - Accesos

**Uso por el modelo:**
```
Usuario: "¿Qué plan tengo?"
AI ejecuta: getUserStatus()
AI recibe: { subscription: { status: "active", ... }, ... }
AI responde: "Tienes un plan PRO activo..."
```

---

### **Tool 2: getTradingViewUsername** (`lib/ai/tools/get-tradingview-username.ts`)

**Descripción:** Tool simplificado para obtener solo el username de TradingView.

**Esquema de entrada:**
```typescript
inputSchema: z.object({}) // No requiere parámetros
```

**Esquema de salida:**
```typescript
string // Mensaje directo: "Tu usuario de TradingView es: apidevs"
```

**Por qué existe esta tool:**
Intento de simplificar la respuesta del modelo retornando un string directo en lugar de un objeto complejo. Sin embargo, **el problema persiste** (ver sección [Problema Conocido](#problema-conocido)).

**Query realizada:**
```typescript
const { data: userData } = await supabase
  .from('users')
  .select('tradingview_username, full_name, email')
  .eq('id', user.id)
  .single();

return `Tu usuario de TradingView es: ${userData.tradingview_username || 'No configurado'}`;
```

---

### **Tools Pendientes (FASE 2):**

```typescript
// lib/ai/tools/grant-indicator-access.ts
// Descripción: Dar acceso a indicadores a un usuario
// Input: { userId: string, indicatorId: string, expiresAt?: string }
// Output: { success: boolean, message: string }

// lib/ai/tools/cancel-subscription.ts
// Descripción: Cancelar suscripción de un usuario
// Input: { userId: string, reason?: string }
// Output: { success: boolean, canceledAt: string }

// lib/ai/tools/process-refund.ts
// Descripción: Procesar reembolso de un pago
// Input: { paymentIntentId: string, amount?: number }
// Output: { success: boolean, refundId: string }

// lib/ai/tools/show-indicator-access.ts
// Descripción: Mostrar todos los accesos a indicadores de un usuario
// Input: { userId: string }
// Output: { accesses: Array<IndicatorAccess> }
```

---

## 🔄 **FLUJO DE DATOS**

### **Flujo completo de una consulta:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUARIO ESCRIBE MENSAJE                                  │
│    "¿Cuál es mi usuario de TradingView?"                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. CHATWIDGET CAPTURA INPUT                                 │
│    - Agrega mensaje a state local                           │
│    - Envía POST /api/chat con historial completo            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. API ROUTE PROCESA REQUEST                                │
│    - Verifica autenticación Supabase                        │
│    - Construye system prompt                                │
│    - Prepara herramientas (tools)                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. MODELO AI (GROK) ANALIZA MENSAJE                         │
│    - Lee system prompt + historial                          │
│    - Identifica necesidad de usar tool                      │
│    - Decide ejecutar getTradingViewUsername()               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. TOOL EJECUTA QUERY SUPABASE                              │
│    SELECT tradingview_username FROM users WHERE id = ...    │
│    Retorna: "Tu usuario de TradingView es: apidevs"        │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. MODELO AI RECIBE RESULTADO                               │
│    ⚠️ PROBLEMA: No usa el resultado correctamente           │
│    Muestra: "<has_function_call>I am retrieving..."        │
│    Esperado: "Tu usuario de TradingView es: apidevs"       │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. STREAMING DE RESPUESTA                                   │
│    - AI SDK genera chunks de texto                          │
│    - Enviados vía Server-Sent Events                        │
│    - ChatWidget los muestra en tiempo real                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 **AUTENTICACIÓN**

### **Sistema de autenticación en el chat:**

```typescript
// 1. Verificar estado de autenticación al abrir chat
useEffect(() => {
  if (isOpen && !authChecked) {
    checkAuthStatus();
  }
}, [isOpen, authChecked]);

// 2. Función de verificación
const checkAuthStatus = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Usuario logueado → Obtener datos completos
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setUserData(userData);
    addWelcomeMessage(userData); // Saludo personalizado
  } else {
    // Usuario no logueado → Mostrar formulario
    setShowAuth(true);
  }

  setAuthChecked(true);
};
```

### **Mensajes de bienvenida personalizados:**

**Usuario logueado:**
```
¡Hola Carlos Diaz! 👋

Soy tu asistente de APIDevs y puedo ayudarte con:
• Información sobre tu cuenta y suscripción
• Consultas sobre indicadores y planes
• Soporte técnico

¿En qué puedo ayudarte hoy?
```

**Usuario invitado (con email):**
```
¡Hola! 👋

Soy tu asistente de APIDevs. Puedo ayudarte con información 
general sobre nuestros planes e indicadores.

Email registrado: guest@example.com

¿En qué puedo ayudarte?
```

**Usuario invitado (sin email):**
```
¡Hola! Soy tu asistente de APIDevs.

Puedo ayudarte con:
• Planes y precios
• Indicadores disponibles
• Información de tu cuenta
• Soporte general
```

---

## 💾 **INTEGRACIÓN CON SUPABASE**

### **Tablas utilizadas:**

**1. `users` (Consulta)**
```sql
SELECT 
  id, 
  email, 
  full_name, 
  tradingview_username, 
  subscription_status, 
  subscription_tier,
  created_at
FROM users
WHERE id = 'user-uuid';
```

**2. `subscriptions` (Consulta)**
```sql
SELECT * 
FROM subscriptions
WHERE user_id = 'user-uuid' 
  AND status = 'active'
LIMIT 1;
```

**3. `indicator_access` (Consulta)**
```sql
SELECT 
  ia.*,
  i.name,
  i.description
FROM indicator_access ia
LEFT JOIN indicators i ON ia.indicator_id = i.id
WHERE ia.user_id = 'user-uuid' 
  AND ia.active = true;
```

**4. `chat_conversations` (Futuro - FASE 2)**
```sql
-- Tabla para guardar conversaciones
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  visibility TEXT DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);
```

**5. `chat_messages` (Futuro - FASE 2)**
```sql
-- Tabla para guardar mensajes
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id),
  role TEXT, -- 'user', 'assistant', 'system', 'tool'
  parts JSONB, -- contenido del mensaje
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Métodos de Supabase utilizados:**

```typescript
// Cliente de Supabase (server-side)
import { createClient } from "@/utils/supabase/server";

// Obtener usuario autenticado
const { data: { user } } = await supabase.auth.getUser();

// Query simple
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single();

// Query con JOIN
const { data, error } = await supabase
  .from('indicator_access')
  .select(`
    *,
    indicators (
      name,
      description
    )
  `)
  .eq('user_id', user.id)
  .eq('active', true);
```

---

## 🤖 **MODELOS AI**

### **Modelo Principal: X.AI Grok-2-1212**

**Configuración:**
```typescript
import { xai } from "@ai-sdk/xai";

const result = await streamText({
  model: xai('grok-2-1212'),
  system: systemPrompt,
  messages,
  tools: { getUserStatus, getTradingViewUsername },
});
```

**Características:**
- ✅ Respuestas rápidas (1-2 segundos)
- ✅ Buen manejo de contexto
- ✅ Tono natural y amigable
- ⚠️ **PROBLEMA:** No usa correctamente los resultados de tools

**Ventajas:**
- Costo más bajo que OpenAI
- Buen rendimiento general
- API estable

**Desventajas:**
- **Problema crítico con tools** (no usa resultados)
- Documentación limitada

---

### **Modelo Alternativo: OpenAI GPT-4**

**Configuración (disponible pero no en uso):**
```typescript
import { openai } from "@ai-sdk/openai";

const result = await streamText({
  model: openai('gpt-4o-mini'),
  system: systemPrompt,
  messages,
  tools: { getUserStatus, getTradingViewUsername },
});
```

**Por qué no está en uso:**
- Costo más alto (~$0.03 por 1,000 tokens)
- Usuario prefiere X.AI por precio
- Se mantiene como alternativa para resolver problema de tools

**Ventajas sobre X.AI:**
- ✅ Mejor manejo de tools/function calling
- ✅ Documentación completa
- ✅ Mayor confiabilidad

---

## ⚠️ **PROBLEMA CONOCIDO**

### **Tools no funcionan con X.AI Grok-2-1212**

**Descripción del problema:**
Las tools se ejecutan correctamente y obtienen datos de Supabase, pero **el modelo AI no usa los resultados para responder al usuario**.

**Síntoma:**
```
Usuario: "¿Cuál es mi usuario de TradingView?"
Chat muestra: "<has_function_call>I am retrieving your TradingView username."
Esperado: "Tu usuario de TradingView es: apidevs"
```

**Datos confirmados en logs del servidor:**
```javascript
// ✅ Tool se ejecuta correctamente
getUserStatus: Resultado final: {
  user: {
    email: 'api@apidevs.io',
    full_name: 'Carlos Diaz',
    tradingview_username: 'apidevs'
  },
  subscription: { status: 'active', ... }
}

// ❌ Pero el modelo NO usa estos datos para responder
```

**Preguntas afectadas:**
- ❌ "¿Cuál es mi usuario de TradingView?"
- ❌ "¿Cuál es mi correo?"
- ❌ "¿Qué plan tengo?"
- ❌ "¿A qué indicadores tengo acceso?"

**Lo que SÍ funciona:**
- ✅ Preguntas generales: "¿Cuánto cuesta el plan PRO?"
- ✅ Información sobre indicadores: "¿Qué incluye el plan Lifetime?"
- ✅ Soporte general: "¿Cómo me registro?"

---

### **Intentos de solución realizados:**

**1. ✅ Mejorar system prompt:**
```typescript
const systemPrompt = `...
IMPORTANTE - USA LAS HERRAMIENTAS SIEMPRE QUE:
- Pregunten sobre su usuario de TradingView → USA getTradingViewUsername
- Pregunten sobre su suscripción → USA getUserStatus
...`;
```
**Resultado:** No funcionó

**2. ✅ Tool específico simplificado:**
Creado `getTradingViewUsername` que retorna string directo en lugar de objeto.
```typescript
return `Tu usuario de TradingView es: ${username}`;
```
**Resultado:** No funcionó

**3. ✅ Instrucciones explícitas al modelo:**
```typescript
INSTRUCCIÓN CRÍTICA:
Cuando uses getTradingViewUsername, el tool te retornará DIRECTAMENTE el mensaje completo.
Solo tienes que repetir/mostrar exactamente lo que el tool te responde.
```
**Resultado:** No funcionó

**4. ❌ maxToolRoundtrips:**
```typescript
maxToolRoundtrips: 5 // Permitir múltiples llamadas
```
**Resultado:** Removido (no es válido en esta versión del SDK)

**5. ❌ toDataStreamResponse():**
```typescript
return result.toDataStreamResponse();
```
**Resultado:** Error - método no existe en esta versión del SDK

---

### **Soluciones propuestas (no implementadas):**

**Opción A: Usar MCP de Supabase (RECOMENDADO) ⭐**
```typescript
// Pre-fetch de datos ANTES de llamar al modelo
const userData = await mcp_supabase_execute_sql({
  query: `SELECT email, full_name, tradingview_username 
          FROM users WHERE id = '${user.id}'`
});

// Agregar datos al system prompt
const systemPrompt = `...
Usuario actual:
- Nombre: ${userData.full_name}
- Email: ${userData.email}
- Usuario TradingView: ${userData.tradingview_username}
...`;

// Llamar modelo SIN tools
const result = await streamText({ model, system: systemPrompt, messages });
```

**Ventajas:**
- ✅ Solución inmediata
- ✅ No depende del modelo AI
- ✅ Usa MCP ya configurado
- ✅ Gratuito

**Opción B: Cambiar a OpenAI GPT-4**
```typescript
import { openai } from "@ai-sdk/openai";

const result = await streamText({
  model: openai('gpt-4o-mini'), // Mejor manejo de tools
  system: systemPrompt,
  messages,
  tools: { getUserStatus, getTradingViewUsername },
});
```

**Ventajas:**
- ✅ Mejor soporte de tools
- ✅ Documentación completa

**Desventajas:**
- ❌ Costo más alto

**Opción C: Actualizar AI SDK**
```bash
npm update ai @ai-sdk/xai @ai-sdk/openai
```

**Opción D: Usar Anthropic Claude**
```typescript
import { anthropic } from "@ai-sdk/anthropic";

const result = await streamText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  system: systemPrompt,
  messages,
  tools: { getUserStatus, getTradingViewUsername },
});
```

---

## 📦 **DEPENDENCIAS**

```json
{
  "dependencies": {
    "ai": "^3.x.x",           // Vercel AI SDK
    "@ai-sdk/openai": "^0.x.x", // OpenAI provider
    "@ai-sdk/xai": "^0.x.x",    // X.AI provider
    "zod": "^3.x.x",           // Validación de schemas
    "nanoid": "^5.x.x"         // IDs únicos
  }
}
```

**Variables de entorno requeridas:**
```bash
# .env.local
OPENAI_API_KEY=sk-...                    # API Key de OpenAI
XAI_API_KEY=xai-...                      # API Key de X.AI
NEXT_PUBLIC_SUPABASE_URL=https://...     # URL de Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...     # Anon key de Supabase
SUPABASE_SERVICE_ROLE_KEY=eyJ...         # Service role de Supabase
```

---

## 🚀 **CÓMO EXTENDER EL CHATBOT**

### **1. Agregar una nueva tool:**

```typescript
// lib/ai/tools/my-new-tool.ts
import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";

export const myNewTool = tool({
  description: "Descripción clara de lo que hace la tool",
  inputSchema: z.object({
    param1: z.string().describe("Descripción del parámetro"),
    param2: z.number().optional(),
  }),
  execute: async ({ param1, param2 }) => {
    try {
      const supabase = await createClient();
      
      // Tu lógica aquí
      const { data } = await supabase
        .from('mi_tabla')
        .select('*')
        .eq('columna', param1);
      
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        error: "Mensaje de error",
        details: error.message,
      };
    }
  },
});
```

**Registrar la tool:**
```typescript
// app/api/chat/route.ts
import { myNewTool } from "@/lib/ai/tools/my-new-tool";

const result = await streamText({
  model: xai('grok-2-1212'),
  system: systemPrompt,
  messages,
  tools: {
    getUserStatus,
    getTradingViewUsername,
    myNewTool, // ← Agregar aquí
  },
});
```

---

### **2. Implementar persistencia de conversaciones:**

```typescript
// Guardar mensaje en base de datos
async function saveMessage(conversationId: string, message: Message) {
  const supabase = await createClient();
  
  await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      role: message.role,
      parts: { text: message.content },
      created_at: new Date().toISOString(),
    });
}

// Cargar historial
async function loadConversation(conversationId: string) {
  const supabase = await createClient();
  
  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  return data.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.parts.text,
  }));
}
```

---

### **3. Agregar artifacts (tablas, documentos):**

**Consultar proyecto base de Vercel:**
```bash
# Ver implementación de artifacts
cat /home/diazpolanco13/apidevs/ai-chatbot/artifacts/*
```

**Patrón básico:**
```typescript
// En el system prompt, instruir al modelo sobre artifacts
const systemPrompt = `...
Puedes crear artifacts para mostrar:
- Tablas de datos
- Documentos formateados
- Código
- Gráficos

Usa el formato especial para artifacts cuando sea apropiado.
`;
```

---

## 📚 **RECURSOS ADICIONALES**

### **Proyecto base de Vercel:**
```bash
/home/diazpolanco13/apidevs/ai-chatbot/
```

### **Documentación útil:**
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [X.AI API Docs](https://docs.x.ai/)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

### **Archivos clave para consultar:**
```bash
# API route del proyecto base
cat /home/diazpolanco13/apidevs/ai-chatbot/app/\(chat\)/api/chat/route.ts

# Tools del proyecto base
ls -la /home/diazpolanco13/apidevs/ai-chatbot/lib/ai/tools/

# Componentes UI del proyecto base
ls -la /home/diazpolanco13/apidevs/ai-chatbot/components/
```

---

## 📊 **ESTADO ACTUAL Y PRÓXIMOS PASOS**

### **Estado Actual: ✅ 90% Completo**

**Lo que funciona:**
- ✅ Widget flotante integrado y hermoso
- ✅ Autenticación inteligente
- ✅ Streaming en tiempo real
- ✅ Respuestas generales perfectas
- ✅ Diseño adaptado a APIDevs

**Lo que falta:**
- ⚠️ Resolver problema de tools con información personalizada
- 🔄 Implementar más tools (FASE 2)
- 🔄 Persistencia de conversaciones (FASE 2)
- 🔄 Sistema de artifacts (FASE 2)

### **Próximo paso crítico:**
**Implementar Opción A (MCP de Supabase)** para resolver el problema de tools y alcanzar el 100% de funcionalidad.

---

**Fecha:** Octubre 2024  
**Versión:** 1.0  
**Estado:** En desarrollo (90% completo)

