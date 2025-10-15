# 🌐 Integración de OpenRouter en APIDevs Chatbot

## 📋 Tabla de Contenidos
1. [¿Qué es OpenRouter?](#qué-es-openrouter)
2. [Ventajas de OpenRouter](#ventajas-de-openrouter)
3. [Configuración](#configuración)
4. [Modelos Disponibles](#modelos-disponibles)
5. [Arquitectura](#arquitectura)
6. [Uso](#uso)
7. [Comparación: X.AI vs OpenRouter](#comparación-xai-vs-openrouter)
8. [Mejores Prácticas](#mejores-prácticas)

---

## 🤔 ¿Qué es OpenRouter?

**OpenRouter** es un agregador de APIs de inteligencia artificial que proporciona acceso unificado a más de **400 modelos de AI** de múltiples proveedores a través de una sola API compatible con OpenAI.

### Proveedores Disponibles:
- 🧠 **Anthropic** (Claude)
- 🤖 **OpenAI** (GPT-4, GPT-3.5)
- 🌟 **Google** (Gemini)
- 🦙 **Meta** (Llama)
- 🔬 **DeepSeek**
- 🚀 **Mistral**
- 🎯 **Cohere**
- Y muchos más...

---

## ✅ Ventajas de OpenRouter

### 1. **Acceso Unificado**
- Una sola API key para 400+ modelos
- Interfaz compatible con OpenAI
- Cambio de modelo sin cambiar código

### 2. **Costos Optimizados**
- Precios competitivos
- Pay-as-you-go sin suscripciones
- Algunos modelos gratuitos (ej: Gemini 2.0 Flash)
- Sin compromiso mínimo

### 3. **Flexibilidad**
- Prueba diferentes modelos fácilmente
- Failover automático
- Rate limiting inteligente
- Selección automática del mejor modelo

### 4. **Características Avanzadas**
- Tracking de costos por modelo
- Analytics detallados
- Streaming de respuestas
- Tool calling (function calling)
- Multimodalidad (texto, imágenes)

---

## ⚙️ Configuración

### 1. Obtener API Key de OpenRouter

1. Ve a [https://openrouter.ai/](https://openrouter.ai/)
2. Crea una cuenta (gratis)
3. Ve a [Settings → Keys](https://openrouter.ai/settings/keys)
4. Haz clic en "Create Key"
5. Asigna un nombre y copia la key

### 2. Configurar Variables de Entorno

Agrega a tu archivo `.env.local`:

```bash
# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# (Opcional) Mantén X.AI para fallback
XAI_API_KEY=xai-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Verificar Instalación

Las dependencias ya están instaladas:
```json
{
  "ai": "^4.0.0",
  "@ai-sdk/openai": "^1.0.0",
  "@ai-sdk/xai": "^1.0.0"
}
```

---

## 🎯 Modelos Disponibles

Los modelos más recomendados para APIDevs están preconfigurados:

### **1. Claude 3.5 Sonnet** (Recomendado 🌟)
```
anthropic/claude-3.5-sonnet
```
- ✅ **Excelente con tools/functions**
- ✅ 200K tokens de contexto
- ✅ Respuestas muy precisas
- 💰 ~$3/1M tokens input, ~$15/1M output
- **Mejor para:** Consultas administrativas, function calling

### **2. GPT-4o**
```
openai/gpt-4o
```
- ✅ Multimodal (texto, imágenes)
- ✅ 128K tokens de contexto
- ✅ Muy rápido
- 💰 ~$2.50/1M tokens input, ~$10/1M output
- **Mejor para:** Respuestas generales, multimodal

### **3. GPT-4o Mini** (Económico ⚡)
```
openai/gpt-4o-mini
```
- ✅ Más rápido y económico
- ✅ 128K tokens de contexto
- ✅ Buena calidad
- 💰 ~$0.15/1M tokens input, ~$0.60/1M output
- **Mejor para:** Consultas simples, alta frecuencia

### **4. Gemini 2.0 Flash** (Gratuito 🎁)
```
google/gemini-2.0-flash-exp:free
```
- ✅ **Completamente gratis**
- ✅ 1M tokens de contexto
- ✅ Muy rápido
- 💰 $0 (límites de rate)
- **Mejor para:** Testing, desarrollo, producción de bajo costo

### **5. Llama 3.3 70B**
```
meta-llama/llama-3.3-70b-instruct
```
- ✅ Open-source
- ✅ 128K tokens de contexto
- ✅ Buena calidad
- 💰 ~$0.60/1M tokens
- **Mejor para:** Balance precio/calidad

### **6. DeepSeek Chat**
```
deepseek/deepseek-chat
```
- ✅ Muy económico
- ✅ 64K tokens de contexto
- ✅ Buena calidad
- 💰 ~$0.14/1M tokens input, ~$0.28/1M output
- **Mejor para:** Alta frecuencia de uso, costos mínimos

---

## 🏗️ Arquitectura

### Flujo de Datos

```
┌─────────────────────┐
│   Usuario (Chat)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  API Route          │
│  /api/chat/route.ts │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  lib/ai/providers.ts│
│  - getAIModel()     │
│  - getDefaultModel()│
└──────────┬──────────┘
           │
           ├─────────────┐
           │             │
           ▼             ▼
    ┌──────────┐  ┌──────────────┐
    │   X.AI   │  │  OpenRouter  │
    │  (Grok)  │  │  (400+ AI)   │
    └──────────┘  └──────────────┘
           │             │
           └─────┬───────┘
                 │
                 ▼
          ┌────────────┐
          │  Response  │
          └────────────┘
```

### Componentes Clave

#### 1. **`lib/ai/providers.ts`**
```typescript
// Sistema de providers multi-modelo
export function getAIModel(config: ModelConfig) {
  switch (config.provider) {
    case 'xai':
      return xai(config.model);
    
    case 'openrouter':
      return openai(config.model, {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY,
      });
  }
}
```

#### 2. **`app/api/chat/route.ts`**
```typescript
// Leer configuración de BD
const { data: aiConfig } = await supabase
  .from('ai_configuration')
  .select('model_provider, model_name')
  .eq('is_active', true)
  .single();

// Obtener modelo configurado
const modelConfig = {
  provider: aiConfig.model_provider, // 'xai' o 'openrouter'
  model: aiConfig.model_name
};

const aiModel = getAIModel(modelConfig);

// Usar con AI SDK
const result = await streamText({
  model: aiModel,
  system: systemPrompt,
  messages,
  tools: availableTools,
});
```

#### 3. **`components/admin/ia-config/ModelConfiguration.tsx`**
```typescript
// UI para seleccionar provider y modelo
const modelProviders = [
  {
    value: 'xai',
    label: 'X.AI (Grok)',
    models: ['grok-3', 'grok-2-1212']
  },
  {
    value: 'openrouter',
    label: 'OpenRouter (400+ Modelos)',
    models: [
      'anthropic/claude-3.5-sonnet',
      'openai/gpt-4o',
      // ... más modelos
    ]
  }
];
```

---

## 🚀 Uso

### En el Admin Panel

1. Ve a **Admin → Asistente IA → Configuración**
2. Selecciona **OpenRouter** como proveedor
3. Elige el modelo específico (ej: `anthropic/claude-3.5-sonnet`)
4. Ajusta temperatura y otros parámetros
5. Haz clic en **Guardar Configuración**

### Configuración se guarda en:
```sql
-- Tabla: ai_configuration
model_provider: 'openrouter'
model_name: 'anthropic/claude-3.5-sonnet'
is_active: true
```

### El chatbot automáticamente usa la configuración guardada.

---

## ⚖️ Comparación: X.AI vs OpenRouter

| Característica | X.AI (Grok) | OpenRouter |
|---|---|---|
| **Modelos** | Grok-3, Grok-2 | 400+ modelos |
| **Proveedores** | Solo X.AI | Anthropic, OpenAI, Google, Meta, etc. |
| **Costo** | ~$5/1M tokens | Variable, desde $0 (gratis) |
| **Tools/Functions** | ⚠️ Limitado | ✅ Excelente (Claude, GPT-4) |
| **Velocidad** | ⚡ Muy rápido | ⚡ Variable |
| **Contexto** | 131K tokens | Hasta 1M tokens (Gemini) |
| **Flexibilidad** | Baja | ⭐ Muy alta |
| **Fallback** | ❌ No | ✅ Automático |
| **Analytics** | Limitado | ✅ Completo |

### Recomendación:

- **Usa X.AI (Grok)** para:
  - Respuestas rápidas
  - Consultas generales
  - Alto volumen de tráfico

- **Usa OpenRouter** para:
  - Consultas administrativas (Claude 3.5 Sonnet)
  - Multimodal (GPT-4o)
  - Desarrollo/testing (Gemini gratis)
  - Optimización de costos (DeepSeek, GPT-4o Mini)
  - Máxima flexibilidad

---

## 📚 Mejores Prácticas

### 1. **Selección de Modelo según Caso de Uso**

```typescript
// Para consultas administrativas con tools
model: 'anthropic/claude-3.5-sonnet' // Mejor con function calling

// Para consultas generales rápidas
model: 'openai/gpt-4o-mini' // Rápido y económico

// Para desarrollo y testing
model: 'google/gemini-2.0-flash-exp:free' // Gratis

// Para alto volumen
model: 'deepseek/deepseek-chat' // Muy económico
```

### 2. **Monitoring de Costos**

- Revisa el dashboard de OpenRouter regularmente
- Configura alertas de presupuesto
- Usa modelos gratuitos para desarrollo
- Optimiza temperatura y max_tokens

### 3. **Fallback Strategy**

```typescript
// Configuración recomendada en .env.local
OPENROUTER_API_KEY=sk-or-v1-xxx  # Primary
XAI_API_KEY=xai-xxx               # Fallback
```

### 4. **Testing de Modelos**

Antes de cambiar en producción:
1. Prueba el modelo en el chat
2. Verifica que responda correctamente a:
   - Consultas personales (username, email)
   - Consultas de planes/precios
   - Tools administrativas (si es admin)
3. Valida la velocidad de respuesta
4. Revisa los costos estimados

### 5. **Optimización de Tokens**

```typescript
// Reduce tokens en system prompt si usas modelos caros
// Para Claude/GPT-4: sistema más detallado
// Para modelos económicos: sistema más conciso

const shortPrompt = config.model_name.includes('mini') || 
                    config.model_name.includes('deepseek');
```

---

## 🔗 Enlaces Útiles

- [OpenRouter Dashboard](https://openrouter.ai/)
- [OpenRouter Docs](https://openrouter.ai/docs)
- [OpenRouter Models List](https://openrouter.ai/models)
- [OpenRouter Pricing](https://openrouter.ai/models?order=newest)
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)

---

## 🐛 Troubleshooting

### Error: "Invalid API Key"
```bash
# Verifica que la key esté en .env.local
echo $OPENROUTER_API_KEY

# Debe empezar con: sk-or-v1-
```

### Error: "Model not found"
```bash
# Verifica el nombre del modelo en:
# https://openrouter.ai/models

# Formato correcto: provider/model-name
# ✅ anthropic/claude-3.5-sonnet
# ❌ claude-3.5-sonnet
```

### Error: "Rate limit exceeded"
```bash
# OpenRouter tiene rate limits por modelo
# Cambia a otro modelo o espera
# Gemini gratis tiene límites más estrictos
```

### Tools no funcionan
```bash
# Claude 3.5 Sonnet es el mejor para tools
# GPT-4o también funciona bien
# Evita usar Llama o Gemini gratis para tools
```

---

## 📝 Conclusión

OpenRouter proporciona **flexibilidad y control** sobre los modelos AI que usa tu chatbot. Puedes:

- ✅ Probar diferentes modelos sin cambiar código
- ✅ Optimizar costos usando modelos económicos
- ✅ Usar modelos gratuitos para desarrollo
- ✅ Acceder a los mejores modelos (Claude, GPT-4) cuando los necesites
- ✅ Failover automático si un modelo falla

**Recomendación final:** Usa **Claude 3.5 Sonnet** (`anthropic/claude-3.5-sonnet`) para producción y **Gemini 2.0 Flash** (`google/gemini-2.0-flash-exp:free`) para desarrollo/testing.

