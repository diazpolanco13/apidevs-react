# 🐛 FIX: System Prompt del Admin NO se Estaba Usando

## 🚨 Problema Identificado

El usuario reportó que editó el **System Prompt** en el admin panel (cambiando el nombre del asistente a "Charti" y modificando el comportamiento), pero **la IA no reflejaba estos cambios**.

### Causa Raíz

El sistema de construcción de prompts (`lib/ai/prompt-builder.ts`) **NO estaba leyendo** el campo `system_prompt` de la base de datos `ai_configuration`. 

**Línea problemática (antes):**
```typescript
// lib/ai/prompt-builder.ts:315
prompt += `Eres el asistente virtual de ${aiConfig.platform_info?.name || 'APIDevs Trading Platform'}.\n\n`;
```

Esto **hardcodeaba** la introducción del asistente, ignorando completamente lo que el administrador configuraba en `/admin/ia-config`.

### Flujo Incorrecto (antes)

```
Admin edita System Prompt en /admin/ia-config
        ↓
Guarda en ai_configuration.system_prompt ✅
        ↓
API /api/chat/route.ts lee ai_configuration ✅
        ↓
Pasa config a buildSystemPrompt() ✅
        ↓
buildSystemPrompt() IGNORA system_prompt ❌
        ↓
Genera prompt genérico hardcodeado ❌
        ↓
IA recibe prompt genérico (sin personalización) ❌
```

---

## ✅ Solución Implementada

### 1. Actualizar Interface `AIConfiguration`

**Archivo:** `lib/ai/prompt-builder.ts`

```typescript
export interface AIConfiguration {
  system_prompt?: string | null; // ✅ AGREGADO
  custom_greeting?: string | null; // ✅ AGREGADO
  platform_info?: {
    name: string;
    description: string;
    features: string[];
  };
  // ... resto de campos
}
```

### 2. Modificar `buildSystemPrompt()` para Usar el System Prompt Personalizado

**Archivo:** `lib/ai/prompt-builder.ts`

```typescript
export function buildSystemPrompt(
  aiConfig: AIConfiguration,
  userProfile: UserProfile | null,
  adminAccessData: AdminAccessData | null = null
): string {
  let prompt = '';
  
  // 🔥 PRIORIDAD 1: Si hay un system_prompt personalizado desde el admin, usarlo COMPLETO
  if (aiConfig.system_prompt && aiConfig.system_prompt.trim().length > 0) {
    prompt += aiConfig.system_prompt.trim();
    prompt += '\n\n';
    prompt += '--- INFORMACIÓN DE CONTEXTO ---\n\n';
  } else {
    // Fallback: Introducción genérica (solo si NO hay system_prompt personalizado)
    prompt += `Eres el asistente virtual de ${aiConfig.platform_info?.name || 'APIDevs Trading Platform'}.\n\n`;
  }
  
  // Resto del prompt (datos de usuario, plataforma, precios, etc.)
  // ...
}
```

### 3. Pasar `system_prompt` desde la BD

**Archivo:** `app/api/chat/route.ts`

```typescript
// Extraer configuración AI
const aiConfiguration: AIConfiguration = {
  system_prompt: (aiConfig as any).system_prompt, // ✅ AGREGADO
  custom_greeting: (aiConfig as any).custom_greeting, // ✅ AGREGADO
  platform_info: (aiConfig as any).platform_info,
  pricing_config: (aiConfig as any).pricing_config,
  user_type_configs: (aiConfig as any).user_type_configs,
  response_templates: (aiConfig as any).response_templates,
  behavior_rules: (aiConfig as any).behavior_rules,
  admin_instructions: (aiConfig as any).admin_instructions,
};
```

---

## ✅ Flujo Correcto (después)

```
Admin edita System Prompt en /admin/ia-config
        ↓
Guarda en ai_configuration.system_prompt ✅
        ↓
API /api/chat/route.ts lee ai_configuration ✅
        ↓
Extrae system_prompt y lo pasa a buildSystemPrompt() ✅
        ↓
buildSystemPrompt() DETECTA system_prompt personalizado ✅
        ↓
USA el system_prompt personalizado COMPLETO ✅
        ↓
Agrega contexto adicional (datos usuario, precios, etc.) ✅
        ↓
IA recibe prompt PERSONALIZADO del admin ✅
```

---

## 🧪 Cómo Probarlo

### 1. Editar System Prompt en Admin

1. Ir a `/admin/ia-config`
2. Tab "Configuración"
3. Sub-tab "Prompt & Comportamiento"
4. Editar el **System Prompt** con algo distintivo:

```
Te llamas Charti y eres el asistente virtual de APIDevs. Ayudas con consultas sobre planes, 
indicadores, suscripciones y soporte técnico. Mantén un tono profesional pero amigable.
```

5. Hacer clic en **"Guardar Cambios"**

### 2. Probar en el Chat

1. Abrir el chatbot
2. Preguntar: **"¿Cómo te llamas?"**
3. **Respuesta esperada:** "Me llamo Charti" (o similar)
4. ✅ **Verificar** que use la identidad configurada

### 3. Verificar Logs del Servidor

Buscar en la consola del servidor:

```bash
📝 System prompt generado dinámicamente (XXXX caracteres)
```

El número de caracteres debería incluir tu system prompt personalizado + contexto adicional.

---

## 📊 Estructura del Prompt Final

Con este fix, el prompt que recibe la IA tiene esta estructura:

```
[1] SYSTEM PROMPT PERSONALIZADO (desde admin)
    ↓
    Te llamas Charti y eres el asistente virtual de APIDevs...

[2] SEPARADOR
    ↓
    --- INFORMACIÓN DE CONTEXTO ---

[3] INFORMACIÓN DE PLATAFORMA
    ↓
    INFORMACIÓN SOBRE APIDEVS TRADING PLATFORM:
    - Plataforma de indicadores de TradingView
    - Features...

[4] PRECIOS
    ↓
    - Planes disponibles: FREE (gratis), PRO Mensual ($39/mes)...

[5] DATOS DEL USUARIO ACTUAL
    ↓
    DATOS DEL USUARIO ACTUAL:
    - Nombre: Carlos Díaz
    - Email: api@apidevs.io
    - Plan actual: pro (active)
    ...

[6] DATOS LEGACY (si aplica)
    ↓
    🚀 INFORMACIÓN LEGACY (CLIENTES DE WORDPRESS):
    - Es cliente legacy: SÍ
    - Porcentaje de descuento legacy: 25%
    ...

[7] DATOS ADMINISTRATIVOS PRE-FETCHED (si aplica)
    ↓
    DATOS DE ACCESOS ADMINISTRATIVOS CONSULTADOS:
    - Usuario consultado: ...
    - Total de indicadores activos: ...
    ...

[8] ROL Y COMPORTAMIENTO SEGÚN TIPO DE USUARIO
    ↓
    TU ROL Y COMPORTAMIENTO:
    - Tipo de usuario: Admin Master
    - Tono de conversación: profesional
    ...

[9] EJEMPLOS DE RESPUESTAS
    ↓
    EJEMPLOS DE RESPUESTAS SOBRE PRECIOS:
    ...

[10] INSTRUCCIONES CRÍTICAS
    ↓
    🚨 INSTRUCCIONES CRÍTICAS:
    - Si ves "DATOS DE ACCESOS ADMINISTRATIVOS CONSULTADOS" arriba...
    - NO digas "déjame consultar" - los datos YA ESTÁN AHÍ...
    ...
```

---

## 🎯 Beneficios del Fix

### 1. **Control Total del Admin**
- ✅ El administrador puede definir **completamente** la identidad del asistente
- ✅ Puede cambiar el nombre, tono, personalidad, instrucciones específicas
- ✅ Los cambios se reflejan **inmediatamente** en el chatbot

### 2. **Flexibilidad**
- ✅ Permite múltiples "personalidades" del asistente
- ✅ A/B testing de diferentes system prompts
- ✅ Adaptación rápida según feedback de usuarios

### 3. **Fallback Inteligente**
- ✅ Si `system_prompt` está vacío o null → usa el prompt genérico
- ✅ No rompe nada si la configuración no está completa
- ✅ Mantiene compatibilidad con configuraciones antiguas

### 4. **Contexto Enriquecido**
- ✅ El system prompt personalizado se combina con:
  - Datos del usuario (nombre, email, plan)
  - Precios de la plataforma
  - Información legacy (si aplica)
  - Datos administrativos pre-fetched (si el admin consulta otro usuario)
- ✅ La IA tiene TODO el contexto necesario para responder correctamente

---

## 🔄 Próximos Pasos Recomendados

### 1. **Usar `custom_greeting` en el Frontend**

El campo `custom_greeting` también se agregó a la interfaz pero **aún no se usa** en el componente del chat (`components/chat-widget.tsx`).

**Implementación sugerida:**
```typescript
// En chat-widget.tsx
const [greetingMessage, setGreetingMessage] = useState<string>('');

useEffect(() => {
  // Fetch custom_greeting desde ai_configuration
  const fetchGreeting = async () => {
    const { data } = await supabase
      .from('ai_configuration')
      .select('custom_greeting')
      .eq('is_active', true)
      .single();
    
    if (data?.custom_greeting) {
      setGreetingMessage(data.custom_greeting);
    }
  };
  
  fetchGreeting();
}, []);
```

### 2. **Variables Dinámicas en System Prompt**

Permitir que el admin use variables en el system prompt:

```
Te llamas {bot_name} y trabajas para {platform_name}. 
Hoy es {current_date}.
```

Y reemplazarlas automáticamente en `buildSystemPrompt()`.

### 3. **Preview en Tiempo Real**

Agregar un botón "Preview" en el editor de System Prompt que:
- Muestra cómo se vería el prompt final
- Incluye los datos de contexto simulados
- Permite probar antes de guardar

### 4. **Historial de System Prompts**

Guardar versiones anteriores del system prompt para:
- Poder hacer rollback si algo no funciona
- Comparar rendimiento entre versiones
- Auditoría de cambios

---

## 📝 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `lib/ai/prompt-builder.ts` | - Agregado `system_prompt` y `custom_greeting` a `AIConfiguration`<br>- Modificado `buildSystemPrompt()` para usar el prompt personalizado<br>- Agregado separador "INFORMACIÓN DE CONTEXTO" |
| `app/api/chat/route.ts` | - Agregado extracción de `system_prompt` y `custom_greeting` desde BD<br>- Pasado al `buildSystemPrompt()` |

---

## ✅ Estado Actual

- ✅ **System Prompt del admin se usa correctamente**
- ✅ **Fallback a prompt genérico funcional**
- ✅ **Contexto adicional se agrega automáticamente**
- ✅ **Sin errores de TypeScript**
- ✅ **Cambios reflejados inmediatamente en el chat**

---

## 🧪 Test Cases

### Test 1: System Prompt Personalizado
```
Given: System prompt = "Te llamas Charti"
When: Usuario pregunta "¿Cómo te llamas?"
Then: IA responde "Me llamo Charti" o similar
```

### Test 2: System Prompt Vacío (Fallback)
```
Given: System prompt = null o ""
When: Usuario pregunta "¿Quién eres?"
Then: IA usa identidad genérica: "Asistente virtual de APIDevs Trading Platform"
```

### Test 3: Contexto Combinado
```
Given: System prompt = "Te llamas Charti" + Usuario legacy con 25% descuento
When: Usuario pregunta "¿Cuánto cuesta PRO?"
Then: IA responde con descuento legacy aplicado
```

### Test 4: Cambio en Vivo
```
Given: System prompt = "Te llamas Charti"
When: Admin cambia a "Te llamas Botty" y guarda
Then: Siguiente mensaje del chat usa "Botty"
```

---

**Fecha de implementación:** 15 de octubre de 2025  
**Reportado por:** Usuario (Carlos Díaz)  
**Estado:** ✅ Resuelto y funcional

