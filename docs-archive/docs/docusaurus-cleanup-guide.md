# Implementación Docusaurus - Limpieza y Consolidación de Documentación

## 🎯 Problema a Resolver

**Situación actual en `/docs`:**
- Múltiples archivos .md amontonados sin estructura clara
- Documentación desactualizada mezclada con vigente
- Archivos duplicados sobre los mismos temas
- Cuando ingresa una nueva IA, no sabe qué leer ni qué está actualizado
- Imposible mantener consistencia
- **Sistema crítico de TradingView** ya tiene buena documentación, pero necesita estar en estructura accesible

**Ejemplo de documentación crítica existente:**
- `Sistema de Gestión de Accesos TradingView` - 500+ líneas, altamente técnico
- Incluye: arquitectura, endpoints, migraciones SQL, flujos completos
- Este nivel de detalle DEBE preservarse y organizarse

**Objetivo:**
Implementar Docusaurus para crear un **single source of truth** estructurado, donde cada sistema tenga UN SOLO archivo vigente, altamente detallado, y las IAs sepan exactamente qué leer.

---

## 📋 Fase 1: Auditoría Pre-implementación

**CRÍTICO: Antes de instalar Docusaurus, necesito que hagas un análisis completo de lo que existe:**

1. **Lista TODOS los archivos .md** en `/docs` con su tamaño y última modificación

2. **Identifica el contenido de cada uno**:
   - ¿Es documentación técnica tipo "Sistema TradingView" (arquitectura completa, SQL, endpoints)?
   - ¿Es documentación simple (notas rápidas, ideas)?
   - ¿Está desactualizado/obsoleto?

3. **Detecta duplicados y overlaps**:
   - Archivos que hablan del mismo sistema/feature
   - Información contradictoria entre archivos
   - Qué archivo tiene la info más completa/actualizada

4. **Propón consolidación CON DETALLE**:
   ```markdown
   ### Sistema: [Nombre]
   
   **Archivos encontrados:**
   - `archivo1.md` (500 líneas, última modificación: X)
     - Contiene: arquitectura completa, SQL schemas, problemas conocidos
     - Estado: VIGENTE ✅
   
   - `archivo2.md` (50 líneas, última modificación: Y) 
     - Contiene: notas iniciales del sistema
     - Estado: OBSOLETO (info incluida en archivo1)
   
   **Propuesta:**
   - Migrar `archivo1.md` → `docs/docs/systems/[nombre]/overview.md`
   - Dividir en subsecciones si supera 300 líneas:
     - `/database-schema.md` (tablas)
     - `/api-endpoints.md` (endpoints)
     - `/troubleshooting.md` (problemas conocidos)
   - Deprecar `archivo2.md` → mover a `deprecated/` con nota
   ```

5. **Identifica lo MÁS CRÍTICO**:
   - ¿Qué sistemas son fundamentales para el funcionamiento de la web?
   - ¿Qué docs tienen 300+ líneas de contenido técnico valioso?
   - Estos deben tener MÁXIMA prioridad en la migración

**Formato esperado del reporte:**

```markdown
# Auditoría de Documentación - [Fecha]

## Resumen Ejecutivo
- **Total archivos .md:** X
- **Documentación técnica crítica:** Y archivos
- **Documentación simple/notas:** Z archivos
- **Archivos obsoletos identificados:** W
- **Duplicados encontrados:** V

## Sistemas Críticos Identificados

### 1. Sistema de Gestión de Accesos TradingView
**Archivos:**
- `gestion-accesos-tradingview.md` ✅ VIGENTE (500+ líneas)
  
**Contenido:** Arquitectura completa, 4 fases, SQL schemas, microservicio Python, problemas conocidos con soluciones, guía de continuidad

**Propuesta migración:**
```
docs/docs/systems/tradingview-access/
├── overview.md              (objetivo, arquitectura)
├── database-schema.md       (todas las tablas)
├── phases.md                (fases 1-4 detalladas)
├── microservice.md          (integración Python)
├── troubleshooting.md       (9 problemas + soluciones)
└── continuity-guide.md      (para próxima IA)
```

**Archivos a deprecar:** [ninguno/lista]

### 2. [Siguiente Sistema]
[Repetir formato...]

## Documentación Simple (Features, Notas)

### [Nombre Feature]
**Archivos:** ...
**Propuesta:** ...

## Archivos Duplicados/Obsoletos

### Duplicado: [Tema]
- `archivo-viejo.md` → DEPRECAR
- `archivo-nuevo.md` → MANTENER
- **Razón:** [explicación]

## Plan de Migración Priorizado

### Prioridad 1 (CRÍTICO - migrar primero):
1. Sistema TradingView (depende toda la web)
2. [Otro sistema crítico]

### Prioridad 2 (IMPORTANTE):
[Lista]

### Prioridad 3 (NICE TO HAVE):
[Lista]
```

---

## 🚀 Fase 2: Instalación de Docusaurus

**Stack del proyecto:**
- Next.js 14.2.3 + Turbopack
- Tailwind CSS
- Deploy en Vercel

**Instalar Docusaurus en `/docs`** siguiendo estos criterios:

### Configuración base:
- Preset: classic con TypeScript
- Idioma: español
- Desactivar blog (no lo necesitamos)
- Habilitar Mermaid para diagramas
- Syntax highlighting: TypeScript, JSON, Bash, JSX

### Estructura de carpetas propuesta:
```
docs/docs/
├── intro.md                          # Página principal
│
├── systems/                          # ⭐ SISTEMAS CRÍTICOS
│   ├── _category_.json
│   ├── tradingview-access/           # Sistema completo TradingView
│   │   ├── overview.md               # Arquitectura general
│   │   ├── database-schema.md        # Todas las tablas detalladas
│   │   ├── api-endpoints.md          # Endpoints internos
│   │   ├── microservice-integration.md # Integración con microservicio Python
│   │   ├── user-management.md        # Fase 1: Gestión usuarios
│   │   ├── bulk-operations.md        # Fase 2: Asignación masiva
│   │   ├── audit-system.md           # Fase 3: Historial
│   │   ├── auto-renewals.md          # Fase 4: Renovaciones automáticas
│   │   ├── troubleshooting.md        # Problemas conocidos + soluciones
│   │   └── testing-guide.md          # Guía testing completa
│   │
│   ├── stripe-integration/           # Sistema de pagos
│   │   ├── overview.md
│   │   ├── webhooks.md
│   │   ├── products-prices.md
│   │   └── auto-grant-flow.md
│   │
│   └── geo-analytics/                # Otros sistemas críticos
│       └── ...
│
├── architecture/                      # Decisiones de arquitectura
│   ├── overview.md
│   ├── tech-stack.md
│   └── patterns.md
│
├── api/
│   ├── internal/                     # Endpoints de nuestra app
│   │   └── ...
│   └── external/                     # Microservicios externos
│       ├── tradingview-microservice.md
│       ├── stripe.md
│       └── ...
│
├── components/                       # Componentes clave
│   └── ...
│
└── deprecated/                       # ⚠️ Docs viejos (para referencia)
    └── ...
```

---

## 📝 Fase 3: Templates Estandarizados

Crear 3 templates para evitar documentación inconsistente:

### 1. Template: Sistema Crítico (`systems/[sistema]/[archivo].md`)

**Ejemplo basado en tu doc de TradingView:**

```markdown
---
sidebar_position: 1
---

# Sistema de Gestión de Accesos TradingView

**Fecha:** [Fecha de última actualización]  
**Estado:** [Fase actual y progreso detallado]  
**Commits principales:** [Lista de commits relevantes]  

---

## 🎯 Objetivo General

[Descripción completa del sistema y qué resuelve]

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend:** [Tecnologías]
- **Backend:** [Tecnologías]
- **Base de datos:** [Sistema]
- **Microservicio externo:** [Descripción]
- **Autenticación:** [Sistema]

### Tablas de Base de Datos

#### 1. `tabla_nombre` - Descripción
```sql
-- Schema completo con comentarios
- campo (tipo) -- Explicación detallada
- UNIQUE constraint explicado
- Índices críticos
```

> 📝 **Nota importante:** [Contexto crítico sobre decisiones de diseño]

### Microservicio Externo (si aplica)

**URL:** [URL]  
**API Key:** [Cómo obtenerla]  
**Documentación:** [Link]

> ⚠️ **IMPORTANTE:** [Consideraciones críticas de seguridad/uso]

#### Endpoints Principales:

**1. [Nombre Endpoint]**
```bash
[Método] [URL]
Headers: [Headers necesarios]
Body: [Estructura]
```

---

## ✅ FASE X: [NOMBRE FASE] (ESTADO)

### Ubicación: [Rutas en la app]

### Componentes:
- [Lista de archivos/componentes]

### Funcionalidades Implementadas:

#### 1. **[Nombre Funcionalidad]**
```typescript
[Signature del endpoint o función]
```

**Flujo:**
1. [Paso detallado]
2. [Paso detallado]
3. [Código crítico si aplica]

> 🔧 **Fix importante (Commit `xxx`):** [Descripción del problema y solución]

---

## 🐛 PROBLEMAS CONOCIDOS Y SOLUCIONES

### **1. Error: `[mensaje exacto del error]`**
- **Fecha:** [Cuándo se descubrió]
- **Causa:** [Explicación técnica]
- **Solución:** [Cómo se resolvió]
- **Commit fix:** [Hash del commit]
- **Código:**
  ```typescript
  // Ejemplo de la solución
  ```

---

## 📊 Estadísticas Actuales del Sistema

### Base de Datos:
- **X** registros en tabla principal
- **Y** operaciones exitosas
- Distribución de [métrica clave]

### Métricas de Negocio:
- [Datos relevantes al negocio]

---

## ⚠️ CONSIDERACIONES CRÍTICAS PARA IA CONTINUADORA

### **1. [Aspecto Crítico]**
- **SIEMPRE** [regla absoluta]
- **NUNCA** [anti-patrón]
- Ver ejemplo en [archivo/línea]

### **2. [Otro Aspecto]**
[Explicación detallada]

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### Prioridad Alta:
1. [Tarea específica]
2. [Tarea específica]

### Prioridad Media:
[Lista de tareas]

---

## 📝 RESUMEN EJECUTIVO PARA CONTINUIDAD

### Lo que está funcionando:
✅ [Feature 1]  
✅ [Feature 2]  

### Lo que falta:
⏳ [Feature pendiente]  

### Archivos más importantes:
1. [Ruta y descripción]
2. [Ruta y descripción]

### Datos críticos del negocio:
- [Métrica clave]
- [Insight importante]

---

**Última actualización:** [Fecha y hora]  
**Mantenido por:** [Quién]  
**Commits clave:** [Lista]  
**Estado:** [Resumen ejecutivo]  
**Próxima IA:** [Instrucciones claras de qué leer primero]
```

### 2. Template: Feature/Módulo (`features/[feature].md`)

```markdown
---
sidebar_position: X
---

# [Nombre del Feature]

## Qué Hace
[Descripción clara del propósito y alcance]

## Componentes Involucrados
- **[Componente 1]**: `path/to/file.tsx` - [Propósito específico]
- **[Componente 2]**: `path/to/file.tsx` - [Propósito específico]

## APIs Utilizadas
- [Link a doc de API interna/externa]

## Configuración Necesaria
```bash
# Variables de entorno
VAR_NAME=value
VAR_2=value
```

## Flujo Técnico Detallado

### 1. [Paso inicial]
[Explicación técnica]

```typescript
// Código crítico
```

### 2. [Siguiente paso]
[Continuar con detalle...]

## Estados del Sistema
| Estado | Condición | Siguiente Acción |
|--------|-----------|------------------|
| ... | ... | ... |

## Ubicación en el Código
- **Componentes**: [paths específicos]
- **Lógica**: [paths]
- **Tests**: [paths]

## Decisiones Técnicas Importantes
- **[Decisión 1]**: [Por qué se tomó, alternativas consideradas]
- **[Decisión 2]**: [Contexto completo]

## Limitaciones Conocidas
- [Limitación 1 y workaround]
- [Limitación 2 y plan futuro]

## TODOs y Mejoras Futuras
- [ ] [Mejora específica]
- [ ] [Refactor necesario]
```

### 3. Template: Componente (`components/[componente].md`)

```markdown
---
sidebar_position: X
---

# [Componente]

## Propósito
[Qué hace y cuándo usarlo]

## Props/Parámetros
| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| ... | ... | ... | ... | ... |

## Ejemplo de Uso
```tsx
// Ejemplo realista
```

## Ubicación
- **Archivo**: [path]
- **Tests**: [path si existen]

## Dependencias Clave
- [Dependencia 1]
- [Dependencia 2]
```

---

## 🔄 Fase 4: Migración y Consolidación

**Proceso:**

1. **Por cada tema identificado en la auditoría:**
   - Crear archivo nuevo usando el template apropiado
   - Mergear información de archivos duplicados/viejos
   - Mantener SOLO la info vigente y útil
   - Agregar sección "Última actualización: [fecha]"

2. **Mover archivos obsoletos:**
   - NO borrarlos (puede haber info útil)
   - Moverlos a `docs/docs/deprecated/`
   - Agregar nota al inicio: "⚠️ DEPRECADO - Ver [link al archivo nuevo]"

3. **Validar completitud:**
   - Cada servicio externo tiene su doc
   - Cada feature crítico está documentado
   - No hay duplicados en la nueva estructura

---

## 🚢 Fase 5: Deploy en Vercel

Configurar para que Docusaurus se despliegue:

**Opción recomendada**: Subdomain `docs.apidevs-platform.com`

**Configuración necesaria:**
- Nuevo proyecto Vercel apuntando a `/docs`
- Build command: `npm run build`
- Output directory: `build`
- Variables de entorno (si aplica)

---

## 📐 Fase 6: Reglas de Uso Post-implementación

**Para evitar que se vuelva un desorden:**

### ✅ HACER:
- Usar los templates para nueva documentación
- Un archivo por concepto/servicio/feature
- Actualizar docs cuando cambia el código
- Marcar como deprecated (no borrar) lo obsoleto

### ❌ NO HACER:
- Crear .md fuera de Docusaurus
- Duplicar información en múltiples archivos
- Documentar cada pequeño cambio (solo lo significativo)
- Dejar docs desactualizados sin marcarlos

### Regla de oro:
**"Si vas a documentar algo, usa el template de Docusaurus. Si no vale la pena usar el template, probablemente no vale la pena documentarlo."**

---

## 🔍 Cómo una IA Usará Esta Documentación

**Escenario real basado en tu sistema TradingView:**

```
User: "Necesito agregar una nueva fase al sistema de accesos TradingView 
para enviar emails cuando se concede un acceso"

IA: 
1. Lee docs/docs/systems/tradingview-access/overview.md
   → Entiende arquitectura general, stack, ubicación de archivos

2. Lee docs/docs/systems/tradingview-access/phases/phase-1-user-management.md
   → Ve cómo funciona grant-access actual
   → Identifica endpoint: /api/admin/users/[id]/grant-access

3. Lee docs/docs/systems/tradingview-access/troubleshooting.md
   → Revisa problemas conocidos para no repetirlos
   → Ve que hubo issues con upsert vs update

4. Lee docs/docs/systems/tradingview-access/database-schema.md
   → Entiende tabla indicator_access
   → Ve que ya hay campos: granted_at, user_id, indicator_id

5. Implementa nueva funcionalidad:
   - Modifica route.ts para llamar a servicio de email después de grant
   - Usa datos correctos: user.email, indicator.name
   - Evita los anti-patrones documentados en troubleshooting
   - Sigue convenciones de código del proyecto

6. Actualiza documentación:
   - Agrega nueva sección en phase-1-user-management.md
   - Documenta nuevo servicio de email
   - Actualiza commits importantes
```

**Sin Docusaurus (situación actual):**
```
IA: "No sé qué archivo leer, hay 15 .md sobre TradingView en /docs.
¿Cuál está actualizado? ¿Cuál tiene la info completa?"
→ Pierde 20 minutos buscando
→ Puede usar info desactualizada
→ Repite errores ya resueltos
```

**Con Docusaurus:**
```
IA: Lee el sidebar, ve estructura clara:
systems/tradingview-access/ tiene TODO lo necesario
→ Implementa en 10 minutos
→ Con contexto completo
→ Sin repetir errores conocidos
```

---

## ✅ Checklist de Implementación

### Pre-implementación:
- [ ] Auditoría de archivos .md actuales
- [ ] Identificar duplicados
- [ ] Proponer consolidación

### Instalación:
- [ ] Instalar Docusaurus en `/docs`
- [ ] Configurar docusaurus.config.ts
- [ ] Crear estructura de carpetas
- [ ] Configurar sidebar
- [ ] Instalar plugin Mermaid

### Templates:
- [ ] Crear template de servicio externo
- [ ] Crear template de feature
- [ ] Crear template de componente

### Migración:
- [ ] Consolidar docs usando templates
- [ ] Mover obsoletos a `/deprecated`
- [ ] Validar que no haya duplicados

### Deploy:
- [ ] Configurar Vercel
- [ ] Verificar build exitoso
- [ ] Configurar dominio

### Documentación inicial (prioridad):
- [ ] **Sistema TradingView completo** (EL MÁS CRÍTICO)
  - Migrar preservando TODAS las 500+ líneas
  - Dividir en subsecciones lógicas si es necesario
  - Mantener: SQL schemas, problemas conocidos, guía de continuidad, commits
- [ ] **Otros sistemas críticos** identificados en auditoría
- [ ] **Integraciones externas principales** (Stripe, etc.)
- [ ] **Features core** del negocio

---

## 🎯 Resultado Esperado

**Antes:**
```
docs/
├── stripe-old.md              ← ¿Vigente?
├── stripe-integration.md      ← ¿Vigente?
├── tradingview-v1.md          ← ¿Obsoleto?
├── tradingview.md             ← ¿Actual?
├── gestion-accesos.md         ← 500 líneas ¡CRÍTICO! Pero mezclado
└── ...                        ← Caos total
```

**Después (Basado en tu sistema real):**
```
docs/docs/
├── intro.md                   ← Punto de entrada claro
│
├── systems/
│   └── tradingview-access/    ← Sistema COMPLETO organizado
│       ├── overview.md         (arquitectura, stack, objetivo)
│       ├── database-schema.md  (SQL completo, 4 tablas, índices)
│       ├── microservice-integration.md (API Python, endpoints)
│       ├── phases/
│       │   ├── phase-1-user-management.md
│       │   ├── phase-2-bulk-assignment.md
│       │   ├── phase-2.5-revocation.md
│       │   ├── phase-3-audit.md
│       │   ├── phase-4-autorenewal.md
│       │   └── phase-5-webhooks.md
│       ├── troubleshooting.md  (9 problemas + soluciones)
│       ├── statistics.md       (métricas actuales)
│       └── continuity-guide.md (para próxima IA)
│
└── deprecated/                 ← Archivo histórico claro
    ├── tradingview-old.md     (con nota: "Ver systems/tradingview-access/")
    └── stripe-v1.md
```

**Para las IAs:**
- ✅ Sidebar muestra estructura clara del sistema TradingView
- ✅ 500 líneas preservadas pero organizadas en subsecciones lógicas
- ✅ Cada fase tiene su propio archivo (fácil de navegar)
- ✅ Troubleshooting separado (consulta rápida de errores)
- ✅ Carpeta deprecated = no confusión
- ✅ Enlaces cruzados entre fases y componentes

---

## 💡 Principios Clave de la Documentación

1. **Nivel de detalle según criticidad del sistema:**
   - Sistemas críticos (como TradingView): 500+ líneas, SQL completo, todos los problemas conocidos
   - Features secundarios: Documentación concisa pero completa
   - Componentes simples: Solo lo esencial

2. **Preservar contexto histórico:**
   - Commits importantes con hashes
   - Fechas de cambios críticos
   - Por qué se tomaron ciertas decisiones técnicas
   - Problemas resueltos (para no repetirlos)

3. **Consolidación sin pérdida de información:**
   - Mergear duplicados conservando TODO lo útil
   - No eliminar, deprecar (mover a /deprecated con explicación)
   - Si un archivo tiene 500 líneas de valor → dividir en subsecciones, no resumir

4. **Estructura navegable para IAs:**
   - Un sistema = una carpeta con subsecciones
   - Sidebar muestra jerarquía clara
   - Enlaces cruzados entre documentos relacionados
   - Búsqueda global funcional

5. **Actualización continua:**
   - Al modificar código → actualizar doc correspondiente
   - Commits importantes → agregar a lista de commits del sistema
   - Nuevo problema resuelto → agregar a troubleshooting
   - No dejar docs desactualizados sin marcarlos

**Tu archivo actual** (`gestion-accesos-tradingview.md`) es **PERFECTO** y debe migrar a Docusaurus manteniendo su estructura:

```
docs/docs/systems/tradingview-access/
├── overview.md
│   # Incluye:
│   - 🎯 Objetivo General
│   - 🏗️ Arquitectura del Sistema
│   - Stack Tecnológico
│   - Ubicación de componentes
│
├── database-schema.md
│   # Incluye:
│   - Tabla indicators (con schema SQL completo)
│   - Tabla indicator_access (con unique constraints)
│   - Tabla indicator_access_log (auditoría)
│   - Tabla users y legacy_users
│   - Índices críticos
│   - 📝 Notas sobre decisiones de diseño
│
├── microservice-integration.md
│   # Incluye:
│   - URL y API Key del microservicio Python
│   - Endpoints principales con ejemplos
│   - ⚠️ IMPORTANTE: Qué endpoints requieren API key
│   - Códigos de respuesta y formato
│
├── phases/
│   ├── phase-1-user-management.md
│   │   # Incluye:
│   │   - Búsqueda de usuarios
│   │   - Ver accesos
│   │   - Conceder acceso individual
│   │   - Quick Actions
│   │   - Estados visuales (Recuperado, Legacy, Activo)
│   │
│   ├── phase-2-bulk-assignment.md
│   │   # Incluye:
│   │   - Wizard de 3 pasos
│   │   - Sistema de tiers
│   │   - Script calculate-legacy-tiers.ts
│   │   - Endpoint bulk operations
│   │
│   ├── phase-2.5-revocation.md
│   │   # Incluye:
│   │   - Sistema de revocación masiva
│   │   - Modal de progreso
│   │   - Tabla indicator_access_log
│   │
│   ├── phase-3-audit.md
│   │   # Estado: PARCIAL
│   │
│   ├── phase-4-autorenewal.md
│   │   # Estado: PENDIENTE
│   │
│   └── phase-5-stripe-webhooks.md
│       # Incluye:
│       - Flujo end-to-end completo
│       - Código de implementación
│       - Checklist de testing
│
├── troubleshooting.md
│   # Incluye los 9+ problemas conocidos:
│   - Error: column users.created_at does not exist
│   - Error: Invalid API key
│   - Error: duplicate key constraint
│   - Cada uno con: Fecha, Causa, Solución, Commit fix, Código
│
├── statistics.md
│   # Incluye:
│   - Datos de BD actuales
│   - Distribución de tiers
│   - Archivos modificados por commit
│   - Métricas de negocio
│
└── continuity-guide.md
    # Incluye:
    - ⚠️ CONSIDERACIONES CRÍTICAS PARA IA
    - 🎯 PRÓXIMOS PASOS RECOMENDADOS
    - 📝 RESUMEN EJECUTIVO
    - Comandos útiles
    - Checklist de completitud
```

**Este nivel de detalle es OBLIGATORIO para sistemas críticos.**

Docusaurus simplemente organiza este contenido en una estructura navegable con sidebar, búsqueda y enlaces cruzados.

---

# 📊 **AUDITORÍA DE DOCUMENTACIÓN - [5 de Octubre 2025]**

## Resumen Ejecutivo
- **Total archivos .md:** 13
- **Documentación técnica crítica:** 4 archivos (TradingView, Compras, Geo-analytics, Proyecto)
- **Documentación de planes/implementación:** 4 archivos
- **Documentación técnica específica:** 5 archivos
- **Archivos obsoletos identificados:** 0 (todo está vigente)
- **Duplicados encontrados:** 0 (cada archivo tiene propósito único)
- **Líneas totales de documentación:** ~8,000+

## Sistemas Críticos Identificados

### 1. Sistema de Gestión de Accesos TradingView
**Archivos:**
- `gestion-accesos/SISTEMA-GESTION-ACCESOS-TRADINGVIEW.md` ✅ VIGENTE (2,645 líneas)
  - Contiene: Arquitectura completa, 4 fases, SQL schemas, microservicio Python, problemas conocidos
  - Estado: 100% COMPLETADO (Fase 5 testing)
- `gestion-accesos/COMO-FUNCIONA-SISTEMA-ACCESOS.md` ✅ VIGENTE (724 líneas)
  - Contiene: Visión funcional, flujos de usuario, tipos de accesos, integración Stripe

**Contenido total:** 3,369 líneas de documentación técnica completa

**Propuesta migración:**
```
docs/docs/systems/tradingview-access/
├── overview.md                    (arquitectura, stack, objetivo)
├── database-schema.md            (4 tablas con SQL completo)
├── phases/
│   ├── phase-1-user-management.md
│   ├── phase-2-bulk-operations.md
│   ├── phase-3-audit-system.md
│   ├── phase-4-renewals.md
│   └── phase-5-webhooks.md
├── troubleshooting.md            (9+ problemas con soluciones)
├── api-endpoints.md             (endpoints internos + microservicio)
├── statistics.md                (métricas actuales, 81 usuarios legacy)
└── continuity-guide.md          (para próxima IA)
```

**Archivos a deprecar:** [ninguno - ambos son complementarios y vigentes]

### 2. Sistema de Compras y Dashboard Admin
**Archivos:**
- `compras/PLAN-COMPRAS-DASHBOARD.md` ✅ VIGENTE (1,417 líneas)
  - Contiene: 12 fases completadas, arquitectura, componentes, SQL, troubleshooting

**Contenido:** Documentación técnica completa del sistema de compras

**Propuesta migración:**
```
docs/docs/systems/purchases/
├── overview.md              (dashboard admin, métricas)
├── implementation-phases.md (12 fases con código)
├── database-schema.md       (tablas purchases, invoices)
├── api-endpoints.md         (endpoints de compras)
├── components.md            (PurchasesTabs, etc.)
├── refunds-system.md        (sincronización refunds)
└── testing-guide.md         (validación sistema)
```

### 3. Sistema Geo-Analytics
**Archivos:**
- `geoanalitic/GEO-ANALYTICS-COMPLETE-GUIDE.md` ✅ VIGENTE (446 líneas)
- `geoanalitic/GEO-ANALYTICS-BUSINESS-STRATEGY.md`
- `geoanalitic/GEO-ANALYTICS-INTEGRATION.md`
- `geoanalitic/GEO-ANALYTICS-TESTING.md`
- `geoanalitic/PLAN-GEO-ANALYTICS.md`

**Contenido:** Sistema completo de tracking geográfico y marketing

**Propuesta migración:**
```
docs/docs/systems/geo-analytics/
├── overview.md              (funcionalidades, dashboard)
├── business-strategy.md     (estrategia de negocio)
├── implementation.md        (cómo integrar)
├── testing.md              (guía de testing)
└── api-reference.md        (endpoints)
```

### 4. Sistema de Cookies y Tracking
**Archivos:**
- `cookies/PLAN-COOKIES-TRACKING-MARKETING.md` ✅ VIGENTE (258 líneas)
- `cookies/TRACKING-SYSTEM.md`

**Contenido:** Plan de implementación para cookies, tracking y marketing

**Propuesta migración:**
```
docs/docs/systems/cookies-tracking/
├── overview.md              (plan completo cookies + tracking)
├── implementation.md        (cómo implementar)
├── database-schema.md       (user_cookie_preferences)
├── marketing-segmentation.md (segmentación con queries SQL)
└── admin-integration.md     (tab en admin panel)
```

## Documentación General del Proyecto

### Proyecto APIDevs Trading - Resumen Completo
**Archivos:**
- `PROYECTO-APIDEVS-TRADING-RESUMEN-COMPLETO.md` ✅ VIGENTE (1,217 líneas)

**Propuesta:** Migrar como documentación general del proyecto
```
docs/docs/project/
├── overview.md              (descripción, objetivos)
├── tech-stack.md           (Next.js, Supabase, Stripe)
├── architecture.md         (arquitectura completa)
├── migration.md            (de WordPress a Next.js)
└── deployment.md           (Vercel, GitHub)
```

## Documentación Técnica Específica

### Optimización de Middleware
**Archivo:** `MIDDLEWARE-OPTIMIZATION.md` ✅ VIGENTE (123 líneas)
**Propuesta:** `docs/docs/architecture/middleware-optimization.md`

### Sistema de Estados del Navbar
**Archivo:** `NAVBAR-STATUS-SYSTEM.md` ✅ VIGENTE (346 líneas)
**Propuesta:** `docs/docs/components/navbar-status-system.md`

### Tipos de Cancelación de Suscripciones
**Archivo:** `TIPOS-CANCELACION-SUSCRIPCIONES.md` ✅ VIGENTE (268 líneas)
**Propuesta:** `docs/docs/api/stripe/subscription-cancellation.md`

### Guía OpenMemory MCP
**Archivo:** `openmemory-guie.md` ✅ VIGENTE (124 líneas)
**Propuesta:** `docs/docs/development/openmemory-guide.md`

## Archivos Duplicados/Obsoletos

**Resultado:** ❌ NO SE ENCONTRARON DUPLICADOS
- Cada archivo tiene propósito único y complementario
- Toda la documentación está actualizada y vigente
- No hay archivos obsoletos identificados

## Plan de Migración Priorizado

### Prioridad 1 (CRÍTICO - migrar primero):
1. **Sistema TradingView** (3,369 líneas - corazón del negocio)
2. **Sistema de Compras** (1,417 líneas - monetización)
3. **Proyecto - Resumen Completo** (1,217 líneas - contexto general)

### Prioridad 2 (IMPORTANTE):
4. **Sistema Geo-Analytics** (múltiples archivos - analítica de negocio)
5. **Sistema Cookies/Tracking** (planes de implementación)

### Prioridad 3 (NICE TO HAVE):
6. **Documentación técnica específica** (middleware, navbar, cancelaciones, openmemory)

## ✅ Checklist de Implementación

### Pre-implementación:
- [x] **Auditoría completa de archivos .md**
- [x] **Identificación de sistemas críticos**
- [x] **Propuesta de consolidación detallada**

### Instalación:
- [ ] Instalar Docusaurus en `/docs`
- [ ] Configurar docusaurus.config.ts
- [ ] Crear estructura de carpetas
- [ ] Configurar sidebar
- [ ] Instalar plugin Mermaid

### Templates:
- [ ] Crear template de sistema crítico
- [ ] Crear template de feature
- [ ] Crear template de componente

### Migración:
- [ ] **Sistema TradingView completo** (EL MÁS CRÍTICO)
- [ ] **Sistema de Compras**
- [ ] **Proyecto - Resumen completo**
- [ ] Otros sistemas críticos
- [ ] Documentación técnica específica

### Deploy:
- [ ] Configurar Vercel
- [ ] Verificar build exitoso
- [ ] Configurar dominio docs.apidevs-platform.com