# Content Creator AI - Progreso y Estado Actual

## 📋 Resumen del Proyecto

**Objetivo**: Crear un módulo de creación de contenido con IA integrado con Sanity CMS para el sistema APIDevs Trading Platform.

**Estado**: 85% completado - Funcionalidad principal implementada, pendiente corrección de persistencia de API key.

---

## ✅ FUNCIONALIDADES COMPLETADAS

### 1. **Infraestructura Base** ✅
- **Tab "Content Creator"** agregado al panel de administración IA
- **Sistema de permisos** implementado con `ContentCreatorPermissions`
- **Hooks personalizados**:
  - `useAIContentSettings` - Gestión de configuración
  - `useSanityIntegration` - Integración con Sanity CMS
  - `useGrokImageGeneration` - Generación de imágenes (actualizado para OpenAI)

### 2. **Base de Datos** ✅
- **Tabla `ai_content_settings`** - Configuración singleton del Content Creator
- **Tabla `ai_content_queue`** - Cola de contenido generado por IA
- **Constraint actualizado** para incluir `'image'` en `content_type`
- **Migración de `system_configuration`** con restricción única en `key`

### 3. **Integración con Sanity CMS** ✅
- **API routes**:
  - `/api/admin/content-creator/sanity/config` - GET/POST configuración
  - `/api/admin/content-creator/sanity/test` - Test de conexión
  - `/api/admin/content-creator/sanity` - Crear contenido
- **Configuración persistente** de Project ID, Dataset, API Version, Token
- **Test de conexión** funcional

### 4. **Generación de Imágenes con DALL-E 3** ✅
- **API route**: `/api/admin/content-creator/grok/images`
- **Integración con OpenAI** (no OpenRouter - solo soporta texto)
- **Modal `GrokImageGenerator`** para generación manual y automática
- **Configuración de estilos**: realistic, artistic, cartoon, abstract
- **Configuración de tamaños**: 1024x1024, 1024x1792, 1792x1024
- **Configuración de calidad**: standard, hd

### 5. **UI/UX Completa** ✅
- **3 sub-tabs**:
  - Configuración Creator
  - Cola de Contenido
  - Templates
- **Formularios de configuración** con validación
- **Indicadores visuales** de estado (configurado/no configurado)
- **Botones de test** para conexiones
- **Modal de creación de contenido** con generación de imágenes

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 1. **API Key de OpenAI NO se persiste** 🔴
**Problema**: La API key se guarda en `system_configuration` pero no se carga correctamente en la UI.

**Síntomas**:
- Test funciona (pasa API key en body)
- Modal funciona (obtiene API key de configuración)
- UI no muestra que está configurada al refrescar
- Campo aparece vacío después de guardar

**Código problemático**:
```typescript
// En CreadorContenidoTab.tsx línea 582
defaultValue={sanityConfig?.openai_api_key === '***configured***' ? '' : (sanityConfig?.openai_api_key || '')}
```

**Archivos involucrados**:
- `components/admin/ia-config/CreadorContenidoTab.tsx`
- `hooks/useSanityIntegration.ts`
- `app/api/admin/content-creator/sanity/config/route.ts`

---

## 🔧 ARCHIVOS CLAVE DEL PROYECTO

### **Componentes Principales**
```
components/admin/ia-config/
├── CreadorContenidoTab.tsx          # Tab principal del Content Creator
├── ContentCreatorPermissions.tsx    # Sistema de permisos
├── CreateContentModal.tsx           # Modal para crear contenido
└── GrokImageGenerator.tsx           # Modal para generar imágenes
```

### **Hooks**
```
hooks/
├── useAIContentSettings.ts          # Gestión de configuración AI
├── useSanityIntegration.ts          # Integración con Sanity
└── useGrokImageGeneration.ts        # Generación de imágenes
```

### **API Routes**
```
app/api/admin/content-creator/
├── sanity/
│   ├── config/route.ts              # Configuración Sanity + OpenAI
│   └── test/route.ts                # Test conexión Sanity
├── grok/images/route.ts             # Generación imágenes DALL-E 3
└── create/route.ts                  # Crear contenido en cola
```

### **Base de Datos**
```sql
-- Tabla de configuración AI
CREATE TABLE ai_content_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN DEFAULT false,
  default_language TEXT DEFAULT 'es',
  -- ... más campos
);

-- Tabla de cola de contenido
CREATE TABLE ai_content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT CHECK (content_type = ANY (ARRAY['blog', 'doc', 'indicator', 'translation', 'image'])),
  -- ... más campos
);

-- Configuración del sistema
CREATE TABLE system_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category TEXT DEFAULT 'general'
);
```

---

## 🚀 PRÓXIMAS FASES PENDIENTES

### **Fase 1: Arreglar Persistencia API Key** 🔴 URGENTE
1. **Debuggear carga de configuración**:
   - Verificar que `sanityConfig.openai_api_key` se carga correctamente
   - Revisar si el problema está en el GET de la API route
   - Verificar que el valor se guarda correctamente en `system_configuration`

2. **Posibles soluciones**:
   - Usar `useEffect` para cargar configuración al montar componente
   - Cambiar `defaultValue` por `value` controlado
   - Verificar que la API route devuelve `openai_api_key` correctamente

### **Fase 2: Cola de Contenido** 🟡 PENDIENTE
- **Implementar vista de cola** con filtros y búsqueda
- **Acciones de aprobación/rechazo** para contenido pendiente
- **Sistema de notificaciones** para admins
- **Historial de cambios** y auditoría

### **Fase 3: Traducción Automática** 🟡 PENDIENTE
- **Integración con servicio de traducción** (Google Translate API o similar)
- **Traducción automática** ES ↔ EN
- **Configuración de idiomas** objetivo
- **Validación de calidad** de traducciones

### **Fase 4: Templates de Contenido** 🟡 PENDIENTE
- **Editor de templates** para diferentes tipos de contenido
- **Variables dinámicas** en templates
- **Preview de templates** antes de usar
- **Importar/exportar** templates

### **Fase 5: Integración Completa** 🟡 PENDIENTE
- **Flujo completo** desde prompt hasta publicación
- **Integración con sistema de usuarios** existente
- **Métricas y analytics** de contenido generado
- **Optimización SEO** automática

---

## 🔍 DEBUGGING - API Key Persistence

### **Para la próxima IA - Pasos de debugging**:

1. **Verificar que se guarda**:
   ```sql
   SELECT * FROM system_configuration WHERE key = 'openai_api_key';
   ```

2. **Verificar que se carga**:
   - Revisar logs de `/api/admin/content-creator/sanity/config` GET
   - Verificar que `openai_api_key` está en la respuesta

3. **Verificar UI**:
   - Revisar si `sanityConfig` se actualiza correctamente
   - Verificar que el `useEffect` carga la configuración

4. **Posible fix**:
   ```typescript
   // En lugar de defaultValue, usar value controlado
   const [openaiApiKey, setOpenaiApiKey] = useState('');
   
   useEffect(() => {
     if (sanityConfig?.openai_api_key) {
       setOpenaiApiKey(sanityConfig.openai_api_key === '***configured***' ? '' : sanityConfig.openai_api_key);
     }
   }, [sanityConfig]);
   ```

---

## 📊 ESTADO ACTUAL DEL SISTEMA

### **Funcionalidades Operativas** ✅
- ✅ Configuración de Sanity CMS
- ✅ Test de conexión Sanity
- ✅ Generación de imágenes DALL-E 3
- ✅ Modal de generación de imágenes
- ✅ Sistema de permisos
- ✅ Base de datos configurada
- ✅ UI completa

### **Funcionalidades con Problemas** ⚠️
- ⚠️ Persistencia de API key OpenAI (se guarda pero no se muestra)

### **Funcionalidades Pendientes** ❌
- ❌ Cola de contenido funcional
- ❌ Traducción automática
- ❌ Templates de contenido
- ❌ Flujo completo de publicación

---

## 🎯 OBJETIVO FINAL

**Sistema completo de creación de contenido con IA** que permita:
1. **Generar contenido** automáticamente (blog, docs, indicators)
2. **Generar imágenes** con DALL-E 3
3. **Traducir contenido** automáticamente
4. **Revisar y aprobar** contenido en cola
5. **Publicar en Sanity** automáticamente
6. **Templates personalizables** para diferentes tipos de contenido

---

## 💡 NOTAS TÉCNICAS IMPORTANTES

- **OpenRouter NO soporta generación de imágenes** - usar OpenAI directamente
- **Sanity MCP tools** disponibles para integración
- **Sistema de permisos granular** ya implementado
- **Base de datos Supabase** con RLS habilitado
- **Next.js 14** con App Router
- **TypeScript** estricto habilitado

---

**Última actualización**: 18 de octubre de 2025
**Estado**: 85% completado - Pendiente arreglar persistencia API key
**Próximo paso**: Debuggear y arreglar carga de `openai_api_key` en la UI
