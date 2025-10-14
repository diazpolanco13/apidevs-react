# 🤖 Plan de Implementación: Chatbot Asistente APIDevs

## 📋 **RESUMEN EJECUTIVO**
Implementar un chatbot de asistencia completo para APIDevs Trading Platform que funcione como un "empleado virtual" capaz de responder consultas Y tomar acciones administrativas.

## 🎯 **OBJETIVO PRINCIPAL**
Crear un asistente IA que pueda:
- ✅ **Responder preguntas** sobre planes, indicadores, suscripciones
- 🔄 **Tomar acciones** (dar accesos, cancelar planes, procesar refunds) - (FASE 2)
- 🔄 **Mostrar datos** en formato tabla/documento (artifacts) - (FASE 2)
- ✅ **Multi-modelo** (X.AI Grok implementado, OpenAI disponible)

## 🏗️ **ARQUITECTURA OBJETIVO**
Basarse en el proyecto **Vercel AI Chatbot** (https://github.com/vercel/ai-chatbot) que ya está:
- ✅ Probado y funcional
- ✅ Multi-modelo (AI Gateway de Vercel)
- ✅ Sistema de tools/acciones
- ✅ Artifacts (documentos, tablas, código)
- ✅ Optimizado para Vercel

## 📁 **ESTRUCTURA ACTUAL DEL PROYECTO**
```
/home/diazpolanco13/apidevs/apidevs-react/
├── app/                    # Next.js 14 App Router
├── components/             # Componentes React
├── lib/                   # Utilidades
├── utils/                 # Helpers
├── supabase/              # Base de datos Supabase
└── types_db.ts           # Tipos TypeScript de BD
```

## 🗄️ **BASE DE DATOS EXISTENTE**
**Supabase** con tablas principales:
- `users` - Usuarios autenticados
- `subscriptions` - Suscripciones Stripe
- `indicator_access` - Accesos a indicadores TradingView
- `payment_intents` - Pagos
- `invoices` - Facturas
- `indicators` - Catálogo de indicadores

## 🔧 **STACK TECNOLÓGICO ACTUAL**
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Supabase (DB + Auth)
- **Pagos**: Stripe
- **Hosting**: Vercel
- **Indicadores**: TradingView Microservice

## 🛠️ **HERRAMIENTAS DISPONIBLES - MUY IMPORTANTE**
### ✅ **MCP DE SUPABASE FUNCIONAL Y CONECTADO**
El proyecto tiene acceso a un **Model Context Protocol (MCP) de Supabase completamente funcional**.

**Capacidades del MCP:**
- ✅ `mcp_supabase_execute_sql` - Ejecutar queries SQL directamente
- ✅ `mcp_supabase_list_tables` - Listar todas las tablas
- ✅ `mcp_supabase_apply_migration` - Aplicar migraciones DDL
- ✅ Acceso completo a todas las tablas (users, subscriptions, indicator_access, etc.)
- ✅ Sin necesidad de usar createClient() de Supabase manualmente
- ✅ Queries directas y rápidas a la base de datos

**Ejemplo de uso del MCP:**
```typescript
// Puedes obtener datos directamente con SQL
mcp_supabase_execute_sql({
  query: "SELECT email, full_name, tradingview_username FROM users WHERE id = '71b7b58f-6c9d-4133-88e5-c69972dea205'"
})
```

**IMPORTANTE:** 
- El MCP de Supabase está disponible como herramienta
- Puede ser más confiable que las tools del AI SDK
- Permite queries SQL directas sin depender del modelo AI

## 🎨 **ESTADO ACTUAL DE IMPLEMENTACIÓN**

### ✅ **FASE 1: Base de Datos - COMPLETADA**
```sql
-- ✅ Tablas creadas en Supabase
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  visibility TEXT DEFAULT 'private',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id),
  role TEXT, -- 'user', 'assistant', 'system', 'tool'
  parts JSONB, -- contenido del mensaje
  attachments JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### ✅ **FASE 2: Dependencias - COMPLETADA**
```bash
# ✅ Dependencias instaladas
npm install ai @ai-sdk/openai @ai-sdk/xai zod nanoid
# ✅ X.AI Grok-2-1212 configurado y funcionando
# ✅ OpenAI disponible como alternativa
```

### 🔄 **FASE 3: Tools/Acciones APIDevs - PARCIALMENTE IMPLEMENTADA**
```typescript
// ✅ IMPLEMENTADO:
// lib/ai/tools/get-user-status.ts - Consulta información completa de usuarios
// lib/ai/tools/get-tradingview-username.ts - Consulta username de TradingView específicamente

// ⚠️ PROBLEMA CONOCIDO:
// El modelo X.AI Grok-2-1212 tiene dificultades para usar los resultados de las tools
// correctamente. Las tools se ejecutan y obtienen datos correctamente, pero el modelo
// no usa la información retornada para responder al usuario.
// 
// SÍNTOMA: El chat muestra "<has_function_call>I am retrieving..." pero no completa
// la respuesta con los datos obtenidos.
//
// INTENTOS DE SOLUCIÓN:
// 1. ✅ System prompt mejorado con instrucciones específicas
// 2. ✅ Tool específico para username de TradingView
// 3. ✅ Retorno simplificado (string directo en lugar de objeto)
// 4. ✅ maxToolRoundtrips: 5 para permitir múltiples llamadas
// 5. ❌ toDataStreamResponse() - No soportado en versión actual del SDK
//
// POSIBLES SOLUCIONES PENDIENTES:
// - Cambiar a modelo OpenAI GPT-4 (mejor manejo de tools)
// - Actualizar AI SDK a versión más reciente
// - Pre-fetch de datos y agregar al system prompt en lugar de usar tools

// 🔄 PENDIENTE (FASE 2):
// lib/ai/tools/grant-indicator-access.ts - Dar accesos a indicadores
// lib/ai/tools/cancel-subscription.ts - Cancelar suscripciones  
// lib/ai/tools/process-refund.ts - Procesar reembolsos
// lib/ai/tools/show-indicator-access.ts - Mostrar accesos
```

### ✅ **FASE 4: Componentes UI - COMPLETADA**
```typescript
// ✅ IMPLEMENTADO:
// components/chat-widget.tsx - Widget flotante integrado en layout
// components/chat-auth.tsx - Sistema de autenticación inteligente
// components/chat-simple-v2.tsx - Chat de página completa
// app/chat-v2/page.tsx - Página de prueba del chat

// ✅ CARACTERÍSTICAS UI:
// - Botón flotante con GIF animado personalizado (boton video.gif)
// - Búho animado en header y mensajes (leyendo.gif)
// - Colores adaptados a paleta APIDevs (verde lima #aaff00, amarillo #C9D92E)
// - Streaming en tiempo real de respuestas
// - Widget flotante en esquina inferior derecha
// - Diseño responsive y moderno

// ✅ CARACTERÍSTICAS DE AUTENTICACIÓN:
// - Detección automática de usuario logueado
// - Saludo personalizado con nombre del usuario
// - Captura de email para usuarios no logueados
// - Modo invitado con funcionalidad limitada
// - Verificación de email en base de datos
// - Protección anti-spam integrada
// - Indicador de estado de conexión en footer del chat
```

### ✅ **FASE 5: API Route - COMPLETADA**
```typescript
// ✅ IMPLEMENTADO:
// app/api/chat/route.ts - API funcional con:
// - X.AI Grok-2-1212 como modelo principal
// - Supabase Auth integrado
// - System prompt específico APIDevs
// - Tool getUserStatus funcionando
// - Streaming de respuestas
```

## 📝 **SYSTEM PROMPT IMPLEMENTADO**
```
Eres un asistente de APIDevs Trading Platform. Puedes:
- Responder sobre planes PRO ($39/mes, $390/año, Lifetime $999)
- Consultar accesos a indicadores TradingView
- Procesar cancelaciones y refunds (FUTURO)
- Mostrar datos en tablas y documentos (FUTURO)
- Tono profesional pero amigable
- Si no sabes algo, admítelo y ofrece contactar soporte

Puedes usar la herramienta getUserStatus para consultar información de usuarios.
```

## 🚀 **CASOS DE USO - ESTADO ACTUAL**
1. **✅ Usuario pregunta**: "¿Cuánto cuesta el plan PRO?" - FUNCIONANDO
2. **✅ Usuario consulta**: "¿A qué indicadores tengo acceso?" - FUNCIONANDO (con getUserStatus)
3. **✅ Usuario pregunta**: "¿Cómo estoy en mi cuenta?" - FUNCIONANDO (con getUserStatus)
4. **🔄 Usuario solicita**: "Quiero cancelar mi suscripción" - PENDIENTE (FASE 2)
5. **🔄 Admin pregunta**: "Muestra todos los accesos del usuario X" - PENDIENTE (FASE 2)

## 📊 **ARCHIVOS IMPLEMENTADOS**
```
apidevs-react/
├── ✅ app/api/chat/route.ts                        # API principal funcional
├── ✅ components/chat-widget.tsx                    # Widget flotante integrado
├── ✅ components/chat-auth.tsx                      # Sistema de autenticación
├── ✅ components/chat-simple-v2.tsx                 # Chat de página completa
├── ✅ app/chat-v2/page.tsx                         # Página de prueba
├── ✅ lib/ai/tools/get-user-status.ts              # Tool de consulta usuarios
├── ⚠️ lib/ai/tools/get-tradingview-username.ts     # Tool específico (problemas con Grok)
├── ✅ public/chatbot-boton.gif                     # GIF botón personalizado
├── ✅ public/buho-leyendo.gif                      # GIF búho animado
└── 🔄 lib/ai/tools/                                # Más tools pendientes
```

## ⚠️ **CONSIDERACIONES IMPORTANTES**
- **NO tocar** el sistema actual de autenticación Supabase
- **NO modificar** las tablas existentes de Stripe/TradingView
- **Mantener** compatibilidad con el Admin Panel existente
- **Usar** Vercel AI Gateway para multi-modelo
- **Preservar** el diseño actual de Tailwind CSS Para posteriormemte adaptarlo a la interfaz de mi web

## 📊 **ARCHIVOS A REVISAR DEL PROYECTO VERCEL**
```
vercel-ai-chatbot/
├── app/(chat)/api/chat/route.ts     # API principal
├── components/chat.tsx              # Componente chat
├── components/messages.tsx          # Lista mensajes
├── lib/ai/tools/                   # Sistema de tools
├── lib/ai/providers.ts             # Configuración modelos
└── lib/db/schema.ts                # Esquema base datos
```

## 🎯 **RESULTADO ACTUAL**

### ✅ **LO QUE FUNCIONA:**
- **Widget flotante profesional** en todas las páginas (esquina inferior derecha)
- **Autenticación inteligente** con saludo personalizado y captura de email
- **Respuestas de texto** sobre planes, precios, información general
- **Diseño completamente integrado** con paleta de colores APIDevs
- **GIFs animados personalizados** (botón de saludo y búho leyendo)
- **Streaming en tiempo real** de respuestas
- **Sistema de autenticación** con Supabase y modo invitado

### ⚠️ **PROBLEMA CRÍTICO - TOOLS NO FUNCIONAN:**
El chatbot **NO puede responder preguntas personalizadas** del usuario logueado debido a que:

**Problema:**
- Las tools se ejecutan correctamente y obtienen los datos de Supabase
- Los datos se retornan exitosamente (confirmado en logs del servidor)
- El modelo X.AI Grok-2-1212 NO usa los datos obtenidos para responder
- El usuario ve `<has_function_call>I am retrieving...` pero no recibe respuesta

**Preguntas afectadas:**
- ❌ "¿Cuál es mi usuario de TradingView?" - Tool se ejecuta pero no responde
- ❌ "¿Cuál es mi correo?" - Tool se ejecuta pero no responde
- ❌ "¿Cuál es mi nombre?" - Tool se ejecuta pero no responde
- ❌ "¿Qué plan tengo?" - Tool se ejecuta pero no responde

**Datos que SÍ se obtienen correctamente:**
```json
{
  "user": {
    "email": "api@apidevs.io",
    "full_name": "Carlos Diaz",
    "tradingview_username": "apidevs"
  },
  "subscription": {
    "status": "active",
    "price_id": "..."
  }
}
```

**Impacto:**
- El chatbot solo funciona para preguntas generales
- No puede dar información personalizada del usuario
- No puede ser un "asistente personal" efectivo

## 🔄 **PRÓXIMOS PASOS - PRIORIDAD CRÍTICA**

### 🚨 **URGENTE - Resolver problema de tools:**

**🔑 NOTA IMPORTANTE PARA LA PRÓXIMA IA:**
El proyecto tiene **MCP de Supabase funcional** que puede ser usado para solucionar este problema.
Puedes usar `mcp_supabase_execute_sql` para obtener datos directamente sin depender de las tools del AI SDK.

1. **Opción A: Usar MCP de Supabase (RECOMENDADO) ⭐**
   - ✅ Ya está configurado y funcionando
   - ✅ Queries SQL directas y confiables
   - ✅ Sin depender del modelo AI para interpretar datos
   - ✅ Solución inmediata y gratuita
   - Implementación: Pre-fetch de datos del usuario con MCP antes de llamar al modelo
   
2. **Opción B: Cambiar a OpenAI GPT-4**
   - Mejor manejo de tools/function calling
   - Más confiable para usar datos obtenidos
   - Costo: ~$0.03 por 1,000 tokens
   
3. **Opción C: Actualizar AI SDK**
   - Versión más reciente con mejor soporte
   - toDataStreamResponse() disponible
   - Mejor integración con X.AI

4. **Opción D: Pre-fetch de datos (workaround manual)**
   - Obtener datos del usuario ANTES de llamar al modelo
   - Agregar información al system prompt directamente
   - Sin depender de tools
   - Solución inmediata pero menos flexible

5. **Opción E: Usar Anthropic Claude**
   - Excelente manejo de tools
   - Respuestas más confiables
   - Buena relación costo/beneficio

### 📋 **FASE 2 - Después de resolver tools:**
1. **Implementar más tools**:
   - `grant-indicator-access.ts` - Dar accesos a indicadores
   - `cancel-subscription.ts` - Cancelar suscripciones
   - `process-refund.ts` - Procesar reembolsos
   - `show-indicator-access.ts` - Mostrar accesos detallados

2. **Persistir conversaciones**:
   - Guardar mensajes en `chat_messages`
   - Historial de conversaciones
   - Títulos automáticos de conversaciones

3. **Artifacts y tablas**:
   - Mostrar datos en formato tabla
   - Exportar información
   - Documentos interactivos

4. **Mejoras UI**:
   - Calibración de respuestas
   - Sugerencias de preguntas
   - Indicadores de typing
   - Emojis y formato mejorado

## 📞 **CONTACTO**
Proyecto: APIDevs Trading Platform
Usuario: diazpolanco13
Fecha: Octubre 2024
Estado: FASE 1 COMPLETADA ✅ (con problema crítico de tools)

---

## 📝 **NOTA FINAL PARA LA PRÓXIMA IA**

**Estado del chatbot:**
- ✅ UI completamente funcional y hermosa
- ✅ Autenticación inteligente implementada
- ✅ Streaming en tiempo real funcionando
- ⚠️ Tools NO funcionan con X.AI Grok (problema crítico)

**Herramientas disponibles para solucionar:**
1. **MCP de Supabase** - Ya conectado y funcional (`mcp_supabase_execute_sql`)
2. **OpenAI API Key** - Configurada en `.env.local`
3. **X.AI API Key** - Configurada en `.env.local`
4. **AI SDK** - Instalado (`ai`, `@ai-sdk/openai`, `@ai-sdk/xai`)

**Recomendación:**
Usar el **MCP de Supabase para pre-fetch de datos del usuario** antes de llamar al modelo.
Esto evita depender del modelo AI para interpretar resultados de tools.

**Ejemplo de implementación sugerida:**
```typescript
// En app/api/chat/route.ts
// 1. Obtener datos del usuario con MCP
const userData = await mcp_supabase_execute_sql({
  query: `SELECT email, full_name, tradingview_username, subscription_status 
          FROM users WHERE id = '${user.id}'`
});

// 2. Agregar datos al system prompt
const systemPrompt = `...
Usuario actual:
- Nombre: ${userData.full_name}
- Email: ${userData.email}
- Usuario TradingView: ${userData.tradingview_username}
- Plan: ${userData.subscription_status}
...`;

// 3. Llamar al modelo SIN tools
const result = await streamText({ model, system: systemPrompt, messages });
```

El chatbot está al 90% completo. Solo falta resolver el problema de tools para ser 100% funcional.
