# 📚 Sistema de Gestión de Accesos a Indicadores TradingView

**Fecha:** 3 de Octubre 2025  
**Estado:** Fase 1 y 2 completadas ✅ | Fase 3 y 4 pendientes ⏳  
**Commits principales:** `fb75600`, `684b529`, `5b06613`

---

## 🎯 Objetivo General

Sistema administrativo completo para gestionar accesos de usuarios a indicadores privados de TradingView, con capacidad de:
- Conceder/revocar accesos individuales
- Operaciones masivas (bulk)
- Segmentación por tiers de clientes
- Auditoría y tracking de operaciones
- Renovación automática basada en suscripciones

---

## 🏗️ Arquitectura del Sistema

### **Stack Tecnológico**
- **Frontend:** Next.js 14 + React + TypeScript
- **Backend:** Next.js API Routes
- **Base de datos:** Supabase (PostgreSQL)
- **Microservicio externo:** TradingView Access Management API (Python/Flask)
- **Autenticación:** Supabase Auth (restringido a `api@apidevs.io`)

### **Tablas de Base de Datos**

#### 1. `indicators` - Catálogo de Indicadores
```sql
- id (uuid)
- pine_id (text, unique) -- Formato: PUB;xxxxx
- name (text)
- description (text)
- category (text) -- 'indicador', 'escaner', 'tools'
- status (text) -- 'activo', 'desactivado', 'desarrollo'
- type (text) -- 'privado', 'publico'
- access_tier (text) -- 'free', 'premium'
- tradingview_url (text)
- public_script_url (text)
- image_1, image_2, image_3 (text)
- features (jsonb)
- tags (text[])
- total_users, active_users (integer)
- created_at, updated_at (timestamptz)
```

#### 2. `indicator_access` - Control de Accesos
```sql
- id (uuid)
- user_id (uuid) → users.id
- indicator_id (uuid) → indicators.id
- tradingview_username (text)
- status (text) -- 'pending', 'granted', 'active', 'expired', 'revoked', 'failed'
- granted_at (timestamptz)
- expires_at (timestamptz)
- revoked_at (timestamptz)
- duration_type (text) -- '7D', '30D', '1Y', '1L'
- subscription_id (text) -- Stripe subscription
- payment_intent_id (text) -- Stripe payment
- tradingview_operation_id (text)
- tradingview_response (jsonb)
- error_message (text)
- granted_by (uuid) -- Admin que concedió
- revoked_by (uuid)
- access_source (text) -- 'manual', 'purchase', 'trial', 'bulk', 'renewal', 'promo'
- auto_renew (boolean)
- last_renewed_at (timestamptz)
- renewal_count (integer)
- notes (text)
- created_at, updated_at (timestamptz)

-- Índice único
UNIQUE(user_id, indicator_id)
```

#### 3. `users` - Usuarios Registrados
```sql
- id (uuid)
- email (text, unique)
- full_name (text)
- tradingview_username (text, unique)
- customer_tier (text) -- 'diamond', 'platinum', 'gold', 'silver', 'bronze', 'free'
- is_legacy_user (boolean) -- Si vino de WordPress
- total_lifetime_spent (numeric)
- purchase_count (integer)
- customer_since (timestamp)
- first_purchase_date (timestamp)
- last_purchase_date (timestamp)
```

#### 4. `legacy_users` - Usuarios de WordPress NO Registrados
```sql
- id (uuid)
- email (text, unique)
- full_name (text)
- customer_tier (text) -- Calculado por script
- total_lifetime_spent (numeric) -- Calculado por script
- purchase_count (integer) -- Calculado por script
- first_purchase_date (timestamp)
- last_purchase_date (timestamp)
- reactivation_status (text) -- 'pending', 'contacted', 'reactivated', 'churned_final'
- created_at, updated_at (timestamp)
```

### **Microservicio TradingView**

**URL Producción:** `http://89.116.30.133:5555`  
**Documentación:** `/utils/bot-pinescript/ECOMMERCE_API_GUIDE.md`

#### Endpoints Principales:

**1. Acceso Individual (NO requiere API key)**
```bash
POST /api/access/:username
Headers: Content-Type: application/json
Body: {
  "pine_ids": ["PUB;xxxxx"],
  "duration": "7D" | "30D" | "1Y" | "1L"
}
```

**2. Acceso Bulk (Requiere API key)**
```bash
POST /api/access/bulk
Headers: 
  Content-Type: application/json
  X-API-Key: your-secret-key
Body: {
  "usernames": ["user1", "user2"],
  "pine_ids": ["PUB;xxxxx"],
  "duration": "30D"
}
```

**3. Revocar Acceso**
```bash
DELETE /api/access/:username
Body: {
  "pine_ids": ["PUB;xxxxx"]
}
```

**4. Verificar Acceso**
```bash
GET /api/access/:username/check?pine_id=PUB;xxxxx
```

---

## ✅ FASE 1: GESTIÓN DE USUARIOS (COMPLETADA)

### **Ubicación:** `/admin/indicadores` → Tab "Gestión de Usuarios"

### **Componentes:**
- `components/admin/indicators/GestionUsuariosTab.tsx`
- `components/admin/indicators/GrantAccessModal.tsx`
- `components/admin/indicators/QuickActionsDropdown.tsx`

### **Funcionalidades Implementadas:**

#### 1. **Búsqueda de Usuarios**
```typescript
GET /api/admin/users/search?q={query}&limit={limit}
```
- Busca en `users` + `legacy_users`
- Combina resultados y elimina duplicados
- Filtra por email, nombre completo
- Retorna hasta 1000 usuarios

**Campos retornados:**
```typescript
{
  id: string
  email: string
  full_name: string
  tradingview_username: string | null
  customer_tier: string
  is_legacy_user: boolean
  total_lifetime_spent: number
  purchase_count: number
  source: 'registered' | 'legacy_table' // Para debug
}
```

#### 2. **Ver Accesos de Usuario**
```typescript
GET /api/admin/users/[id]/indicator-access
```
- Lista todos los accesos del usuario
- Join con tabla `indicators`
- Calcula stats: total, activos, pendientes, expirados, revocados, fallidos

#### 3. **Conceder Acceso Individual**
```typescript
POST /api/admin/users/[id]/grant-access
Body: {
  indicator_id: string
  duration_type: '7D' | '30D' | '1Y' | '1L'
}
```

**Flujo:**
1. Valida que el usuario tenga `tradingview_username`
2. Verifica que no exista acceso activo y no expirado
3. Llama al endpoint individual de TradingView (sin API key)
4. Si existe registro previo en `indicator_access` → UPDATE
5. Si no existe → INSERT
6. Registra respuesta de TradingView en `tradingview_response`

#### 4. **Acciones Rápidas (Quick Actions)**

**a) Conceder Todos Free**
```typescript
POST /api/admin/users/[id]/grant-all-free
```
- Busca todos los indicadores con `access_tier = 'free'` y `status = 'active'`
- Llama al endpoint bulk de TradingView
- Concede acceso `1L` (lifetime)
- Crea registros en `indicator_access` con `access_source = 'admin_bulk'`

**b) Conceder Todos Premium**
```typescript
POST /api/admin/users/[id]/grant-all-premium
```
- Similar a Free pero `access_tier = 'premium'`
- Duración: `1Y` (1 año)

**c) Renovar Todos Activos**
```typescript
POST /api/admin/users/[id]/renew-all-active
```
- Busca accesos con `status = 'active'`
- Llama a endpoint individual POST (añade días)
- Actualiza `expires_at`, incrementa `renewal_count`
- Registra `last_renewed_at`

**d) Revocar Todos**
```typescript
POST /api/admin/users/[id]/revoke-all
```
- Busca accesos activos
- Llama a endpoint DELETE individual de TradingView
- Actualiza `status = 'revoked'`, `revoked_at = now()`

### **Estados Visuales de Usuarios:**

1. **⭐ Recuperado** (morado)
   - Condición: `source === 'registered' && is_legacy_user === true && purchase_count > 0`
   - Significado: Usuario legacy que se registró en nueva plataforma Y compró

2. **Legacy** (amarillo)
   - Condición: `is_legacy_user === true` (resto de casos)
   - Significado: Usuario de WordPress que NO se ha registrado en nueva plataforma

3. **Activo** (verde)
   - Condición: `is_legacy_user === false`
   - Significado: Usuario registrado directamente en nueva plataforma

---

## ✅ FASE 2: ASIGNACIÓN MASIVA (COMPLETADA)

### **Ubicación:** `/admin/indicadores` → Tab "Asignación Masiva"

### **Componentes:**
- `components/admin/indicators/BulkAssignmentTab.tsx` (Wizard principal)
- `components/admin/indicators/UserSelectionStep.tsx` (Paso 1)
- `components/admin/indicators/IndicatorSelectionStep.tsx` (Paso 2)
- `components/admin/indicators/ConfigurationStep.tsx` (Paso 3)

### **Wizard de 3 Pasos:**

#### **Paso 1: Selección de Usuarios**

**Filtros Disponibles:**
- **Por Tier:** Todos, Diamond, Platinum, Gold, Silver, Bronze, Free
- **Por Tipo:**
  - Todos
  - Usuarios Activos (Nuevos)
  - Legacy (Sin compras)
  - ⭐ Recuperados (Legacy que compró)
- **Búsqueda en tiempo real:** Email, nombre, tradingview_username

**Acciones:**
- Seleccionar todos filtrados
- Deseleccionar todos
- Checkbox individual por usuario

**Visualización:**
- Tabla con: Usuario, Email, TradingView, Tier, Estado
- Contador: "X usuarios seleccionados de Y filtrados"

#### **Paso 2: Selección de Indicadores**

**Filtros:**
- Por Tier: Free, Premium
- Por Categoría: Indicador, Escaner, Tools
- Búsqueda por nombre

**Quick Actions:**
- 🎁 Todos Free (N)
- 💎 Todos Premium (N)
- Seleccionar filtrados (N)
- Deseleccionar todos

**Visualización:**
- Grid de cards con checkbox
- Badge de tier (Free/Premium)
- Badge de categoría

#### **Paso 3: Configuración y Ejecución**

**Configuración:**
- Selección de duración: 7 días, 30 días, 1 año, Lifetime
- Cards con iconos visuales

**Resumen:**
- 👥 Usuarios: N seleccionados, X con TradingView
- 📊 Indicadores: N seleccionados (🎁 Free / 💎 Premium)
- 🎯 Total operaciones: usuarios × indicadores
- ⏱️ Tiempo estimado: ~(total/2) segundos

**Vista previa:**
- Lista de primeros 10 usuarios (+ "X más")
- Lista de primeros 10 indicadores (+ "X más")

**Banner de advertencia:**
- Alerta de operación masiva
- Confirmación requerida

### **Endpoint de Ejecución:**

```typescript
POST /api/admin/bulk-operations/execute
Body: {
  user_ids: string[]
  indicator_ids: string[]
  duration: '7D' | '30D' | '1Y' | '1L'
}

Response: {
  success: boolean
  summary: {
    total: number
    successful: number
    failed: number
    users_processed: number
    users_skipped: number  // Sin tradingview_username
    indicators_processed: number
  }
  results: Array<{
    user_id: string
    indicator_id: string
    success: boolean
    error?: string
  }>
}
```

**Flujo de Ejecución:**

1. **Validaciones:**
   - Verifica que `user_ids` y `indicator_ids` no estén vacíos
   - Requiere autenticación admin

2. **Obtener datos:**
   - Fetch usuarios con `tradingview_username` (filtra los que no tienen)
   - Fetch indicadores activos

3. **Procesamiento:**
   - Loop: para cada usuario × cada indicador
   - Llama a endpoint individual POST de TradingView
   - Verifica respuesta: `Array.isArray() && result[0].status === 'Success'`
   - Calcula `expires_at` según duración

4. **Guardado en batch:**
   - Prepara array de registros para `indicator_access`
   - Upsert batch (500 registros max por lote)
   - Marca `access_source = 'admin_bulk'`

5. **Respuesta:**
   - Resumen de operación
   - Contador de éxitos/fallos
   - Array detallado de resultados

### **Sistema de Tiers para Legacy Users**

**Script:** `scripts/calculate-legacy-tiers.ts`

**Función:**
- Lee CSV de compras históricas de WordPress
- Agrupa por email y calcula:
  - Total gastado (`total_lifetime_spent`)
  - Número de compras (`purchase_count`)
  - Primera compra (`first_purchase_date`)
  - Última compra (`last_purchase_date`)
  - Tier correspondiente

**Umbrales de Tiers (Ajustados a Datos Reales):**
```typescript
{
  diamond: 500,   // $500+ (Top 0.5% - 7 clientes)
  platinum: 300,  // $300-$499 (Top 2-3% - 23 clientes)
  gold: 150,      // $150-$299 (Top 10% - 49 clientes)
  silver: 50,     // $50-$149 (Top 30% - 108 clientes)
  bronze: 20,     // $20-$49 (Top 45% - 84 clientes)
  free: 0         // <$20 (Resto - 4,867 clientes)
}
```

**Ejecución:**
```bash
npx tsx scripts/calculate-legacy-tiers.ts
```

**Proceso:**
1. Lee `data/compras_supabase_migradas.csv` (3,421 compras)
2. Agrupa por email (1,635 clientes únicos con compras)
3. Calcula tier para cada cliente
4. Muestra distribución y Top 10 clientes
5. Obtiene todos los `legacy_users` de Supabase (una sola query)
6. Prepara actualizaciones en batch
7. Actualiza en lotes de 100 usando `Promise.all`
8. Muestra resumen: actualizados, no encontrados, errores

**Resultado:**
- 222 usuarios actualizados en Supabase
- 1,413 emails de compras NO encontrados en `legacy_users`
- Tiempo de ejecución: ~10-20 segundos

**Migración SQL Aplicada:**
```sql
-- supabase/migrations/20251003_add_tier_columns_to_legacy_users.sql

ALTER TABLE legacy_users 
ADD COLUMN IF NOT EXISTS customer_tier TEXT DEFAULT 'free';

ALTER TABLE legacy_users 
ADD COLUMN IF NOT EXISTS total_lifetime_spent NUMERIC(10,2) DEFAULT 0.00;

ALTER TABLE legacy_users 
ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0;

ALTER TABLE legacy_users 
ADD COLUMN IF NOT EXISTS first_purchase_date TIMESTAMP;

ALTER TABLE legacy_users 
ADD COLUMN IF NOT EXISTS last_purchase_date TIMESTAMP;

-- Índices para optimización
CREATE INDEX idx_legacy_users_customer_tier ON legacy_users(customer_tier);
CREATE INDEX idx_legacy_users_total_spent ON legacy_users(total_lifetime_spent DESC);
CREATE INDEX idx_legacy_users_purchase_count ON legacy_users(purchase_count DESC);
```

---

## ⏳ FASE 3: HISTORIAL Y AUDITORÍA (PENDIENTE)

### **Objetivo:**
Sistema completo de auditoría para rastrear todas las operaciones de acceso realizadas en el sistema.

### **Componentes a Desarrollar:**

#### 1. **Tab "Historial"**
```
components/admin/indicators/HistorialTab.tsx
```

**Funcionalidades:**

**A) Tabla de Operaciones**
- Paginación (50 registros por página)
- Columnas:
  - Fecha/Hora
  - Tipo de operación (Grant, Revoke, Renew, Bulk Grant, Bulk Revoke)
  - Usuario afectado (email + tradingview_username)
  - Indicador
  - Duración (si aplica)
  - Estado (Success, Failed)
  - Admin que ejecutó
  - Fuente (manual, bulk, purchase, trial, renewal, promo)
- Ordenamiento por fecha (desc por defecto)
- Expandir fila para ver detalles completos (JSON de respuesta TradingView)

**B) Filtros Avanzados**
```typescript
interface HistorialFilters {
  date_from?: string        // Fecha desde
  date_to?: string          // Fecha hasta
  operation_type?: string   // grant, revoke, renew
  access_source?: string    // manual, bulk, purchase, etc.
  status?: string           // active, expired, revoked, failed
  user_id?: string          // Filtrar por usuario específico
  indicator_id?: string     // Filtrar por indicador específico
  granted_by?: string       // Filtrar por admin
}
```

**C) Stats Dashboard**
```typescript
// Cards superiores con métricas
- Total operaciones (último mes)
- Operaciones exitosas (% éxito)
- Operaciones fallidas (% fallo)
- Usuarios únicos afectados
- Indicadores únicos asignados
- Accesos activos actualmente
- Accesos expirados (última semana)
- Accesos revocados (última semana)
```

**D) Gráficas (Opcional)**
- Línea de tiempo: Operaciones por día (últimos 30 días)
- Pie chart: Distribución por tipo de operación
- Pie chart: Distribución por fuente de acceso
- Bar chart: Top 10 indicadores más asignados

**E) Export a CSV**
```typescript
POST /api/admin/access-audit/export
Body: HistorialFilters
Response: CSV file download
```

Columnas CSV:
```
fecha,hora,operacion,usuario_email,tradingview_username,indicador_nombre,duracion,estado,error,admin_email,fuente
```

### **Endpoints a Crear:**

#### 1. Listar Historial
```typescript
GET /api/admin/access-audit?page=1&limit=50&filters={...}

Response: {
  total: number
  page: number
  limit: number
  records: Array<{
    id: string
    created_at: string
    operation_type: string
    user: {
      id: string
      email: string
      tradingview_username: string
      full_name: string
    }
    indicator: {
      id: string
      name: string
      pine_id: string
    }
    status: string
    duration_type?: string
    expires_at?: string
    granted_by: {
      id: string
      email: string
    }
    access_source: string
    tradingview_response?: object
    error_message?: string
  }>
}
```

**Implementación sugerida:**
```sql
SELECT 
  ia.id,
  ia.created_at,
  ia.status,
  ia.duration_type,
  ia.expires_at,
  ia.access_source,
  ia.tradingview_response,
  ia.error_message,
  u.email as user_email,
  u.tradingview_username,
  u.full_name as user_name,
  i.name as indicator_name,
  i.pine_id,
  admin.email as granted_by_email
FROM indicator_access ia
LEFT JOIN users u ON ia.user_id = u.id
LEFT JOIN indicators i ON ia.indicator_id = i.id
LEFT JOIN users admin ON ia.granted_by = admin.id
WHERE 
  ($1::timestamp IS NULL OR ia.created_at >= $1) AND
  ($2::timestamp IS NULL OR ia.created_at <= $2) AND
  ($3::text IS NULL OR ia.access_source = $3) AND
  ($4::text IS NULL OR ia.status = $4)
ORDER BY ia.created_at DESC
LIMIT $5 OFFSET $6;
```

#### 2. Stats Globales
```typescript
GET /api/admin/access-stats?period=30d

Response: {
  period_days: number
  total_operations: number
  successful_operations: number
  failed_operations: number
  success_rate: number  // Porcentaje
  unique_users: number
  unique_indicators: number
  active_accesses: number
  expired_accesses: number
  revoked_accesses: number
  by_source: {
    manual: number
    bulk: number
    purchase: number
    trial: number
    renewal: number
    promo: number
  }
  by_operation: {
    grants: number
    revokes: number
    renewals: number
  }
  timeline: Array<{
    date: string  // YYYY-MM-DD
    operations: number
  }>
}
```

#### 3. Export CSV
```typescript
POST /api/admin/access-audit/export
Body: HistorialFilters

Response: CSV file (Content-Type: text/csv)
```

**Implementación sugerida:**
```typescript
import { stringify } from 'csv-stringify/sync';

const records = await fetchFilteredRecords(filters);

const csv = stringify(records, {
  header: true,
  columns: [
    { key: 'created_at', header: 'Fecha' },
    { key: 'user_email', header: 'Usuario Email' },
    { key: 'tradingview_username', header: 'TradingView' },
    { key: 'indicator_name', header: 'Indicador' },
    { key: 'duration_type', header: 'Duración' },
    { key: 'status', header: 'Estado' },
    { key: 'access_source', header: 'Fuente' },
    { key: 'granted_by_email', header: 'Admin' }
  ]
});

return new Response(csv, {
  headers: {
    'Content-Type': 'text/csv',
    'Content-Disposition': `attachment; filename="historial-accesos-${Date.now()}.csv"`
  }
});
```

### **Consideraciones:**
- Los registros de `indicator_access` ya tienen toda la info necesaria
- NO se necesita crear tabla nueva, usar `indicator_access` directamente
- Implementar paginación eficiente para no cargar miles de registros
- Cache de stats (actualizar cada 5 minutos)

---

## ⏳ FASE 4: RENOVACIONES AUTOMÁTICAS (PENDIENTE)

### **Objetivo:**
Sistema de reglas para renovar automáticamente accesos basándose en suscripciones activas de Stripe.

### **Tablas Nuevas a Crear:**

#### 1. `renewal_rules` - Reglas de Renovación
```sql
CREATE TABLE renewal_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificación
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  
  -- Condiciones de la regla
  subscription_status TEXT[], -- ['active', 'trialing']
  customer_tier TEXT[],        -- ['gold', 'platinum', 'diamond']
  stripe_price_ids TEXT[],     -- Específicos price_ids de Stripe
  
  -- Indicadores a renovar
  indicator_ids UUID[],         -- Array de IDs o NULL para "todos premium"
  include_all_premium BOOLEAN DEFAULT false,
  include_all_free BOOLEAN DEFAULT false,
  
  -- Configuración de renovación
  renewal_duration TEXT DEFAULT '30D', -- '7D', '30D', '1Y', '1L'
  days_before_expiration INTEGER DEFAULT 7, -- Renovar X días antes
  
  -- Metadata
  priority INTEGER DEFAULT 0,  -- Para resolver conflictos (mayor = prioritario)
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0
);

CREATE INDEX idx_renewal_rules_active ON renewal_rules(is_active);
```

#### 2. `renewal_executions` - Log de Ejecuciones
```sql
CREATE TABLE renewal_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES renewal_rules(id),
  
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Resultados
  total_users_checked INTEGER,
  total_accesses_renewed INTEGER,
  total_failures INTEGER,
  
  -- Detalles
  users_affected UUID[],
  indicators_renewed UUID[],
  errors JSONB,
  
  execution_time_ms INTEGER
);

CREATE INDEX idx_renewal_executions_rule ON renewal_executions(rule_id);
CREATE INDEX idx_renewal_executions_date ON renewal_executions(executed_at DESC);
```

### **Componentes a Desarrollar:**

#### 1. **Tab "Renovaciones Automáticas"**
```
components/admin/indicators/RenovacionesTab.tsx
```

**Funcionalidades:**

**A) Lista de Reglas**
- Tabla con todas las reglas creadas
- Columnas:
  - Nombre
  - Estado (Activa/Inactiva) con toggle switch
  - Condiciones resumidas
  - Última ejecución
  - Total renovaciones
  - Acciones (Editar, Eliminar, Ejecutar ahora)

**B) Crear/Editar Regla**
Modal o página con formulario:

```typescript
interface RenewalRuleForm {
  // Básico
  name: string
  description?: string
  is_active: boolean
  
  // Paso 1: Condiciones de usuarios
  subscription_status: string[]  // Multi-select
  customer_tier: string[]        // Multi-select
  stripe_price_ids?: string[]    // Optional, multi-input
  
  // Paso 2: Indicadores a renovar
  selection_mode: 'specific' | 'all_premium' | 'all_free' | 'mixed'
  indicator_ids?: string[]       // Multi-select si mode = 'specific'
  include_all_premium?: boolean
  include_all_free?: boolean
  
  // Paso 3: Configuración de renovación
  renewal_duration: '7D' | '30D' | '1Y' | '1L'
  days_before_expiration: number  // Slider 1-30
  priority: number                // Input numérico
}
```

**Ejemplo de regla:**
```
Nombre: "Renovación Automática Gold+"
Descripción: "Renueva todos los premium para usuarios Gold o superior con suscripción activa"

Condiciones:
  - Suscripción: Active, Trialing
  - Tier: Gold, Platinum, Diamond
  
Indicadores:
  - Todos los Premium
  
Renovación:
  - Duración: 30 días
  - Renovar 7 días antes de expirar
  - Prioridad: 10
```

**C) Historial de Ejecuciones**
- Tabla con últimas 50 ejecuciones
- Filtros por regla
- Detalles expandibles:
  - Cuántos usuarios se procesaron
  - Cuántos accesos se renovaron
  - Errores (si hubo)
  - Tiempo de ejecución

**D) Ejecutar Regla Manualmente**
- Botón "▶ Ejecutar Ahora" por cada regla
- Modal de confirmación con preview:
  - Usuarios que califican: X
  - Accesos a renovar: Y
  - Estimación de operaciones: Z
- Ejecuta la regla inmediatamente (sin esperar cron)

### **Endpoints a Crear:**

#### 1. Listar Reglas
```typescript
GET /api/admin/renewal-rules

Response: {
  rules: Array<{
    id: string
    name: string
    description?: string
    is_active: boolean
    subscription_status: string[]
    customer_tier: string[]
    stripe_price_ids: string[]
    indicator_ids: string[]
    include_all_premium: boolean
    include_all_free: boolean
    renewal_duration: string
    days_before_expiration: number
    priority: number
    created_at: string
    last_executed_at?: string
    execution_count: number
  }>
}
```

#### 2. Crear Regla
```typescript
POST /api/admin/renewal-rules
Body: RenewalRuleForm

Response: { rule: RenewalRule }
```

#### 3. Actualizar Regla
```typescript
PUT /api/admin/renewal-rules/[id]
Body: Partial<RenewalRuleForm>

Response: { rule: RenewalRule }
```

#### 4. Eliminar Regla
```typescript
DELETE /api/admin/renewal-rules/[id]

Response: { success: boolean }
```

#### 5. Ejecutar Regla
```typescript
POST /api/admin/renewal-rules/[id]/execute

Response: {
  execution_id: string
  users_checked: number
  accesses_renewed: number
  failures: number
  errors?: Array<{
    user_id: string
    indicator_id: string
    error: string
  }>
  execution_time_ms: number
}
```

**Lógica de ejecución:**

```typescript
async function executeRenewalRule(ruleId: string) {
  const rule = await getRuleById(ruleId);
  
  // 1. Obtener usuarios que califican
  const eligibleUsers = await supabase
    .from('users')
    .select('*, subscriptions(*)')
    .in('subscriptions.status', rule.subscription_status)
    .in('customer_tier', rule.customer_tier);
  
  // Filtrar por stripe_price_ids si aplica
  const filteredUsers = eligibleUsers.filter(user => {
    if (rule.stripe_price_ids.length === 0) return true;
    return user.subscriptions.some(sub => 
      rule.stripe_price_ids.includes(sub.price_id)
    );
  });
  
  // 2. Determinar indicadores a renovar
  let indicators = [];
  if (rule.include_all_premium) {
    indicators.push(...await getIndicators({ access_tier: 'premium' }));
  }
  if (rule.include_all_free) {
    indicators.push(...await getIndicators({ access_tier: 'free' }));
  }
  if (rule.indicator_ids.length > 0) {
    indicators.push(...await getIndicators({ id: rule.indicator_ids }));
  }
  
  // 3. Para cada usuario, renovar accesos que estén por expirar
  const results = [];
  for (const user of filteredUsers) {
    // Obtener accesos activos del usuario
    const accesses = await getActiveAccessesByUser(user.id);
    
    // Filtrar por indicadores de la regla
    const accessesToRenew = accesses.filter(access => 
      indicators.some(ind => ind.id === access.indicator_id)
    );
    
    // Filtrar por días antes de expiración
    const expiringAccesses = accessesToRenew.filter(access => {
      const daysUntilExpiration = daysBetween(new Date(), access.expires_at);
      return daysUntilExpiration <= rule.days_before_expiration;
    });
    
    // Renovar cada acceso
    for (const access of expiringAccesses) {
      try {
        await renewAccess(user.id, access.indicator_id, rule.renewal_duration);
        results.push({ success: true, user_id: user.id, indicator_id: access.indicator_id });
      } catch (error) {
        results.push({ success: false, user_id: user.id, indicator_id: access.indicator_id, error });
      }
    }
  }
  
  // 4. Guardar log de ejecución
  await saveExecutionLog(rule.id, results);
  
  return results;
}
```

#### 6. Historial de Ejecuciones
```typescript
GET /api/admin/renewal-rules/[id]/executions?limit=50

Response: {
  executions: Array<{
    id: string
    executed_at: string
    total_users_checked: number
    total_accesses_renewed: number
    total_failures: number
    execution_time_ms: number
  }>
}
```

### **Cron Job / Scheduled Task:**

**Opción A: Vercel Cron (Recomendado para producción)**

```typescript
// app/api/cron/renewal-rules/route.ts

export async function GET(request: Request) {
  // Verificar que sea llamada desde Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  // Ejecutar todas las reglas activas
  const activeRules = await getActiveRules();
  
  const results = [];
  for (const rule of activeRules) {
    const result = await executeRenewalRule(rule.id);
    results.push({ rule_id: rule.id, ...result });
  }
  
  return Response.json({ executed: results });
}
```

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/renewal-rules",
    "schedule": "0 2 * * *"  // Diario a las 2 AM
  }]
}
```

**Opción B: GitHub Actions (Backup)**

```yaml
# .github/workflows/renewal-cron.yml

name: Renewal Rules Cron

on:
  schedule:
    - cron: '0 2 * * *'  # Diario a las 2 AM UTC
  workflow_dispatch:     # Permitir ejecución manual

jobs:
  execute-renewals:
    runs-on: ubuntu-latest
    steps:
      - name: Execute Renewal Rules
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://tu-dominio.com/api/cron/renewal-rules
```

### **Consideraciones:**

1. **Prevención de duplicados:**
   - Verificar `last_renewed_at` antes de renovar
   - No renovar si se renovó en las últimas 24 horas

2. **Rate limiting:**
   - No ejecutar más de 100 operaciones por minuto
   - Pausas entre batches

3. **Notificaciones (Opcional):**
   - Email al admin si hay más de X fallos
   - Slack/Discord webhook con resumen diario

4. **Prioridad de reglas:**
   - Si un usuario califica para múltiples reglas, ejecutar solo la de mayor prioridad
   - O ejecutar todas (configurable)

5. **Dry run:**
   - Opción para simular ejecución sin cambiar datos
   - Útil para testing

---

## 📊 Estadísticas Actuales del Sistema

### **Base de Datos:**
- **5,138** legacy_users con tiers calculados
- **8** usuarios registrados (users table)
- **2** indicadores activos
- **2** accesos registrados en indicator_access

### **Distribución de Tiers (Legacy Users):**
| Tier | Usuarios | % | Gasto Promedio | Compras Promedio |
|------|----------|---|----------------|------------------|
| 💎 Diamond | 7 | 0.14% | $587 | 11 |
| 🏆 Platinum | 23 | 0.45% | $407 | 10 |
| 🥇 Gold | 49 | 0.95% | $231 | 4 |
| 🥈 Silver | 108 | 2.10% | $166 | 4 |
| 🥉 Bronze | 84 | 1.63% | $35 | 2 |
| 🆓 Free | 4,867 | 94.72% | $0.12 | ~0 |

### **Archivos Modificados (Total):**
- **27 archivos** en Fase 1 (Sistema CRUD Indicadores)
- **7 archivos** en Fase 2 (Quick Actions)
- **10 archivos** en Fase 3 (Asignación Masiva + Tiers)
- **Total: ~44 archivos, +7,000 líneas de código**

---

## 🚀 Guía de Continuación para Otra IA

### **Contexto Necesario:**

1. **Tecnologías:**
   - Next.js 14 con App Router
   - TypeScript estricto
   - Supabase (cliente server-side)
   - Tailwind CSS para estilos
   - Componentes en `components/admin/indicators/`

2. **Autenticación:**
   - Solo `api@apidevs.io` puede acceder a endpoints `/api/admin/*`
   - Verificar en cada endpoint:
   ```typescript
   const supabase = await createClient();
   const { data: { user } } = await supabase.auth.getUser();
   if (!user || user.email !== 'api@apidevs.io') {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   ```

3. **Microservicio TradingView:**
   - Ver documentación completa en `/utils/bot-pinescript/ECOMMERCE_API_GUIDE.md`
   - Endpoints individuales NO requieren API key
   - Endpoints bulk SÍ requieren header `X-API-Key`

### **Prioridades Recomendadas:**

1. **Fase 3: Historial** (más urgente)
   - Los usuarios ya pueden gestionar accesos
   - Necesitan ver qué se ha hecho
   - Auditoría y compliance

2. **Fase 4: Renovaciones** (automatización)
   - Reduce trabajo manual
   - Mejora experiencia de usuario
   - Suscripciones activas → acceso automático

### **Pasos para Fase 3:**

1. Crear `components/admin/indicators/HistorialTab.tsx`
2. Crear endpoint `GET /api/admin/access-audit`
3. Crear endpoint `GET /api/admin/access-stats`
4. Crear endpoint `POST /api/admin/access-audit/export`
5. Integrar tab en `IndicadoresMainView.tsx`
6. Testing y refinamiento

### **Pasos para Fase 4:**

1. Crear migraciones SQL para `renewal_rules` y `renewal_executions`
2. Crear `components/admin/indicators/RenovacionesTab.tsx`
3. Crear componente `RenewalRuleForm.tsx` (modal o página)
4. Crear endpoints CRUD para reglas
5. Crear endpoint de ejecución `POST /api/admin/renewal-rules/[id]/execute`
6. Crear cron job `GET /api/cron/renewal-rules`
7. Configurar Vercel Cron en `vercel.json`
8. Testing exhaustivo de lógica de renovación

### **Comandos Útiles:**

```bash
# Ver estructura de tablas
npx supabase db dump --schema public

# Ejecutar migraciones locales
npx supabase db reset

# Ejecutar script de tiers (si se necesita recalcular)
npx tsx scripts/calculate-legacy-tiers.ts

# Ver logs de desarrollo
npm run dev

# Crear nueva migración
npx supabase migration new nombre_migracion
```

### **Testing Sugerido:**

1. **Fase 3:**
   - Crear varios accesos manualmente
   - Verificar que aparezcan en historial
   - Probar filtros (fecha, tipo, usuario)
   - Exportar CSV y verificar formato
   - Verificar stats (totales, porcentajes)

2. **Fase 4:**
   - Crear regla de prueba
   - Ejecutar manualmente
   - Verificar que renueve accesos correctos
   - Probar con usuarios sin suscripción (no deben renovar)
   - Probar cron job local
   - Verificar logs de ejecución

---

## 📚 Referencias y Documentación

### **Archivos Clave:**
- `/utils/bot-pinescript/ECOMMERCE_API_GUIDE.md` - Documentación API TradingView
- `/supabase/migrations/` - Migraciones de base de datos
- `/scripts/calculate-legacy-tiers.ts` - Script de cálculo de tiers
- `/components/admin/indicators/` - Todos los componentes del admin

### **Endpoints API Existentes:**
```
# Indicadores
GET    /api/admin/indicators
POST   /api/admin/indicators
GET    /api/admin/indicators/[id]
PUT    /api/admin/indicators/[id]
DELETE /api/admin/indicators/[id]

# Usuarios
GET    /api/admin/users/search
GET    /api/admin/users/[id]/indicator-access
POST   /api/admin/users/[id]/grant-access
POST   /api/admin/users/[id]/grant-all-free
POST   /api/admin/users/[id]/grant-all-premium
POST   /api/admin/users/[id]/renew-all-active
POST   /api/admin/users/[id]/revoke-all

# Bulk Operations
POST   /api/admin/bulk-operations/execute
```

### **Convenciones de Código:**
- Usar TypeScript estricto
- Componentes client: `'use client'` al inicio
- API routes: validar auth, manejar errores, logs detallados
- Estilos: Tailwind CSS, tema oscuro con acentos verdes (`apidevs-primary`)
- Estados de loading: mostrar spinners
- Mensajes de éxito/error: usar alerts o toasts

---

## ✅ Checklist de Completitud

### **Fase 1: Gestión de Usuarios** ✅
- [x] Búsqueda de usuarios
- [x] Ver accesos de usuario
- [x] Conceder acceso individual
- [x] Modal de concesión
- [x] Quick Actions dropdown
- [x] Conceder todos Free
- [x] Conceder todos Premium
- [x] Renovar todos activos
- [x] Revocar todos
- [x] Estados visuales (Recuperado, Legacy, Activo)

### **Fase 2: Asignación Masiva** ✅
- [x] Wizard de 3 pasos
- [x] Paso 1: Selección usuarios con filtros
- [x] Paso 2: Selección indicadores
- [x] Paso 3: Configuración y resumen
- [x] Endpoint bulk operations
- [x] Script de cálculo de tiers
- [x] Migración SQL para legacy_users
- [x] Endpoint search mejorado (users + legacy_users)

### **Fase 3: Historial y Auditoría** ⏳
- [ ] Componente HistorialTab
- [ ] Tabla de operaciones con paginación
- [ ] Filtros avanzados
- [ ] Stats dashboard
- [ ] Endpoint GET /api/admin/access-audit
- [ ] Endpoint GET /api/admin/access-stats
- [ ] Endpoint POST /api/admin/access-audit/export
- [ ] Gráficas (opcional)
- [ ] Export CSV funcional

### **Fase 4: Renovaciones Automáticas** ⏳
- [ ] Migración SQL (renewal_rules, renewal_executions)
- [ ] Componente RenovacionesTab
- [ ] Formulario crear/editar regla
- [ ] Lista de reglas con toggle activo/inactivo
- [ ] Endpoint GET /api/admin/renewal-rules
- [ ] Endpoint POST /api/admin/renewal-rules
- [ ] Endpoint PUT /api/admin/renewal-rules/[id]
- [ ] Endpoint DELETE /api/admin/renewal-rules/[id]
- [ ] Endpoint POST /api/admin/renewal-rules/[id]/execute
- [ ] Lógica de ejecución de reglas
- [ ] Cron job (Vercel Cron o GitHub Actions)
- [ ] Historial de ejecuciones
- [ ] Prevención de duplicados
- [ ] Notificaciones (opcional)

---

## 🎓 Notas Finales

### **Lecciones Aprendidas:**

1. **Separación users/legacy_users:**
   - Los legacy_users NO tienen `tradingview_username` hasta que se registren
   - No se les puede conceder acceso hasta que completen registro
   - Útil para segmentación de campañas de reactivación

2. **Tiers realistas:**
   - Los umbrales iniciales ($5000+) eran irreales
   - Ajustar a datos reales ($500+ Diamond) mejoró distribución
   - Top 1% de clientes genera ~40-50% del revenue

3. **Optimización de queries:**
   - Batch updates vs updates individuales: 100x más rápido
   - Cargar todos los usuarios de una vez para lookup local
   - Índices en columnas más filtradas

4. **UX del wizard:**
   - 3 pasos: no muy largo, no muy corto
   - Preview antes de ejecutar: reduce errores
   - Botones de quick action: ahorran clics

### **Mejoras Futuras (Post-Fase 4):**

1. **Notificaciones a usuarios:**
   - Email cuando se les concede acceso
   - Email cuando acceso está por expirar (3 días antes)
   - Email cuando acceso expira

2. **Dashboard de métricas:**
   - Usuarios activos con acceso
   - Indicadores más usados
   - Tasa de conversión (legacy → registrado)
   - Revenue por tier

3. **Integración Stripe Webhooks:**
   - Auto-conceder acceso en `checkout.session.completed`
   - Auto-revocar en `customer.subscription.deleted`
   - Auto-renovar en `invoice.paid`

4. **Testing automatizado:**
   - Unit tests para endpoints críticos
   - Integration tests para flujo completo
   - E2E tests con Playwright

5. **Logs avanzados:**
   - Centralizar en servicio externo (Sentry, LogRocket)
   - Alertas automáticas si tasa de fallos > 10%
   - Monitoring de performance

---

**Última actualización:** 3 de Octubre 2025  
**Mantenido por:** Claude (Anthropic) + Usuario APIDevs  
**Commits clave:** `fb75600`, `684b529`, `5b06613`

---

¡Buena suerte con las Fases 3 y 4! 🚀

