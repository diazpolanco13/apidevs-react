# 🔐 Cómo Funciona el Sistema de Accesos a Indicadores

**Fecha de creación:** 5 de Octubre 2025  
**Autor:** Sistema APIDevs Trading Platform  
**Versión:** 1.0

---

## 📋 Tabla de Contenidos

1. [Visión General](#-visión-general)
2. [Flujo Completo del Sistema](#-flujo-completo-del-sistema)
3. [Tipos de Accesos](#-tipos-de-accesos)
4. [Perspectiva del Usuario](#-perspectiva-del-usuario)
5. [Perspectiva del Administrador](#-perspectiva-del-administrador)
6. [Sistema de Duración y Expiración](#-sistema-de-duración-y-expiración)
7. [Integración con Stripe](#-integración-con-stripe)
8. [Sistema de Auditoría](#-sistema-de-auditoría)
9. [Casos de Uso Comunes](#-casos-de-uso-comunes)
10. [Reglas de Negocio](#-reglas-de-negocio)

---

## 🎯 Visión General

El **Sistema de Gestión de Accesos a Indicadores** es el corazón de APIDevs Trading Platform. Controla quién puede usar qué indicadores de TradingView, por cuánto tiempo, y de qué manera.

### **¿Qué hace el sistema?**

1. **Gestiona accesos**: Concede y revoca permisos para usar indicadores privados de TradingView
2. **Controla duraciones**: Administra accesos temporales (7 días, 30 días, 1 año) y permanentes (Lifetime)
3. **Sincroniza con TradingView**: Mantiene coherencia entre nuestra base de datos y TradingView
4. **Automatiza con Stripe**: Concede accesos automáticamente cuando alguien realiza una compra
5. **Audita todo**: Registra cada operación para trazabilidad completa

### **Componentes principales**

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIO FINAL                          │
│  (Ve sus indicadores en /account/indicadores)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 ADMIN PANEL (Dashboard)                     │
│  • Gestión de Usuarios                                      │
│  • Quick Actions (Conceder/Revocar masivo)                  │
│  • Gestión Individual de Accesos                            │
│  • Historial y Auditoría                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS API ROUTES                             │
│  /api/admin/indicators/[id]/grant-access    (Individual)    │
│  /api/admin/indicators/[id]/revoke-access   (Individual)    │
│  /api/admin/users/[id]/grant-all-free       (Quick Action)  │
│  /api/admin/users/[id]/grant-all-premium    (Quick Action)  │
│  /api/admin/users/[id]/renew-all-active     (Quick Action)  │
│  /api/admin/users/[id]/revoke-all           (Quick Action)  │
│  /api/admin/bulk-operations/execute         (Masivo)        │
│  /api/webhooks                              (Stripe Auto)   │
└────────────────────┬───────────┬────────────────────────────┘
                     │           │
                     ▼           ▼
        ┌────────────────┐  ┌─────────────────┐
        │  SUPABASE DB   │  │ TRADINGVIEW API │
        │  • indicators  │  │  (Microservicio)│
        │  • indicator_  │  │  Python/Flask   │
        │    access      │  │  185.218.124... │
        │  • indicator_  │  └─────────────────┘
        │    access_log  │
        └────────────────┘
```

---

## 🔄 Flujo Completo del Sistema

### **Flujo 1: Usuario Compra Plan Premium**

```
1. Usuario → [Checkout Stripe] → Paga $249/año
                    ↓
2. Stripe → [Webhook] → POST /api/webhooks
                    ↓
3. Sistema → [Auto-Grant] → utils/tradingview/auto-grant-access.ts
                    ↓
4. Sistema → [TradingView API] → Concede acceso a todos los Premium
                    ↓
5. Sistema → [Supabase] → Guarda en indicator_access
                    ↓
6. Sistema → [Audit Log] → Registra en indicator_access_log
                    ↓
7. Usuario → [Dashboard] → Ve sus indicadores en /account/indicadores
```

### **Flujo 2: Admin Concede Acceso Manual**

```
1. Admin → [Admin Panel] → Busca usuario
                    ↓
2. Admin → [Quick Actions] → "Conceder todos Premium"
                    ↓
3. Sistema → [Modal] → Selecciona duración (7D/30D/1Y/1L)
                    ↓
4. Sistema → [API Route] → POST /api/admin/users/[id]/grant-all-premium
                    ↓
5. Sistema → [TradingView API] → Concede acceso en TradingView
                    ↓
6. Sistema → [Supabase] → Actualiza indicator_access (upsert)
                    ↓
7. Sistema → [Notificación] → Modal de resultado con detalles
```

### **Flujo 3: Renovación de Accesos Activos**

```
1. Admin → [Gestión Usuario] → "Renovar todos activos"
                    ↓
2. Sistema → [Modal] → Selecciona nueva duración (7D/30D/1Y)
                    ↓
3. Sistema → [Filtrado] → Excluye indicadores Lifetime (1L)
                    ↓
4. Sistema → [TradingView API] → Renueva cada indicador
                    ↓
5. Sistema → [Supabase] → Actualiza expires_at con fecha de TV
                    ↓
6. Sistema → [Contador] → Incrementa renewal_count
```

---

## 📦 Tipos de Accesos

### **Por Tier (Nivel)**

| Tier | Descripción | Indicadores Incluidos | Costo Típico |
|------|-------------|----------------------|--------------|
| **FREE** | Acceso básico gratuito | 2 indicadores básicos | $0 |
| **PREMIUM** | Acceso completo a biblioteca | 4 indicadores avanzados | $23.50 - $999 |

### **Por Duración**

| Código | Nombre | Duración Real | Uso Típico |
|--------|--------|---------------|------------|
| `7D` | 7 Días | Exactamente 7 días | Pruebas cortas, demos |
| `30D` | 30 Días | Exactamente 30 días | Trial mensual, renovaciones |
| `1Y` | 1 Año | Exactamente 365 días | Suscripciones anuales |
| `1L` | Lifetime | Permanente (null) | Compras únicas, usuarios legacy |

> **IMPORTANTE**: Los indicadores FREE siempre son `1L` (Lifetime). Los Premium pueden ser cualquier duración.

### **Por Fuente (access_source)**

| Fuente | Descripción | ¿Quién lo crea? |
|--------|-------------|-----------------|
| `manual` | Concedido manualmente por admin | Admin Panel |
| `purchase` | Otorgado por compra en Stripe | Webhook automático |
| `bulk` | Operación masiva | Admin Panel (bulk ops) |
| `trial` | Período de prueba | Sistema automático |
| `promo` | Acceso promocional | Admin Panel |
| `renewal` | Renovación automática | Sistema automático |

---

## 👤 Perspectiva del Usuario

### **¿Cómo ve el usuario sus indicadores?**

El usuario accede a **`/account/indicadores`** donde ve:

#### **Si NO tiene acceso Premium:**
```
┌───────────────────────────────────────────────┐
│  🔒 Desbloquea Indicadores Premium            │
│                                               │
│  Actualmente solo tienes acceso a             │
│  indicadores gratuitos.                       │
│                                               │
│  [Explorar Planes] [Ver Planes]               │
│                                               │
│  📊 Indicadores Ilimitados                    │
│  ⚡ Señales en Tiempo Real                    │
│  📈 Análisis Avanzado                         │
└───────────────────────────────────────────────┘
```

#### **Si tiene acceso Premium:**
```
┌───────────────────────────────────────────────┐
│  Mis Indicadores (6 activos)                  │
├───────────────────────────────────────────────┤
│  INDICADOR       │ ESTADO │ CONCEDIDO │ EXPIRA│ ACCIÓN         │
├──────────────────┼────────┼───────────┼───────┼────────────────┤
│ 📊 Watermark     │ ●Activo│ 5 oct     │ ∞     │ [Usar en TV]   │
│ 💎 Premium       │        │ 2025      │       │                │
├──────────────────┼────────┼───────────┼───────┼────────────────┤
│ 📈 ADX DEF       │ ●Activo│ 5 oct     │ ∞     │ [Usar en TV]   │
│ 🆓 Free          │        │ 2025      │       │                │
├──────────────────┼────────┼───────────┼───────┼────────────────┤
│ 🎯 RSI PRO+      │ ●Activo│ 5 oct     │5 oct  │ [Usar en TV]   │
│ 💎 Premium       │        │ 2025      │2026   │                │
└──────────────────┴────────┴───────────┴───────┴────────────────┘
```

### **Badges y Estados**

- **🆓 Free**: Indicador gratuito (siempre Lifetime)
- **💎 Premium**: Indicador de pago
- **●Activo**: Tiene acceso actual (verde)
- **●Expirado**: El acceso venció (rojo)
- **∞ Permanente**: Acceso Lifetime sin fecha de expiración

### **Dashboard del Usuario**

En `/account` el usuario ve cards con estadísticas:

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Indicadores     │ │ Indicadores     │ │ Indicadores     │
│ Totales         │ │ Free            │ │ Premium         │
│      6          │ │      2          │ │      4          │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

> **Nota**: Estas estadísticas son en tiempo real, calculadas desde `indicator_access` filtrando por estado activo.

---

## 👨‍💼 Perspectiva del Administrador

### **Admin Panel - Sección Indicadores**

El admin accede a **`/admin/indicadores`** donde administra todo:

#### **Vista General de Indicadores**

```
┌──────────────────────────────────────────────────────────────┐
│  📊 Indicadores (6)                                          │
├──────────────────────────────────────────────────────────────┤
│  INDICADOR         │ ESTADO │ TIER │ USUARIOS │ ACCIONES    │
├────────────────────┼────────┼──────┼──────────┼─────────────┤
│ Watermark [APIDevs]│ Activo │ Free │    3     │ [Ver]       │
│ ADX DEF [APIDevs]  │ Activo │ Free │    3     │ [Ver]       │
│ RSI PRO+ Stochastic│ Activo │ Prem │    3     │ [Ver]       │
│ Trend Scanner 2.0  │ Activo │ Prem │    1     │ [Ver]       │
└────────────────────┴────────┴──────┴──────────┴─────────────┘
```

> **Nota**: La columna "USUARIOS" muestra los usuarios activos (incluye Lifetime correctamente).

### **Gestión de Usuarios - Quick Actions**

Cuando el admin entra al perfil de un usuario específico (`/admin/users/active/[id]`), tiene acceso a **Quick Actions**:

#### **Menú de Acciones Rápidas**

```
┌─────────────────────────────────────────────┐
│  ⚡ Acciones Rápidas                        │
├─────────────────────────────────────────────┤
│  🎁 Conceder todos los Free                 │
│     Otorgar acceso lifetime a todos los     │
│     indicadores gratuitos                   │
├─────────────────────────────────────────────┤
│  ⚡ Conceder todos los Premium              │
│     Otorgar acceso a todos los indicadores  │
│     premium (seleccionar duración)          │
├─────────────────────────────────────────────┤
│  🔄 Renovar todos los activos               │
│     Renovar accesos que están por expirar   │
│     (seleccionar nueva duración)            │
├─────────────────────────────────────────────┤
│  🚫 Revocar todos                           │
│     Remover TODOS los accesos del usuario   │
└─────────────────────────────────────────────┘
```

#### **Modal de Selección de Duración**

Cuando el admin hace clic en "Conceder Premium" o "Renovar activos", aparece:

```
┌───────────────────────────────────────────┐
│  ⏱️ Seleccionar Duración                  │
│                                           │
│  Elige por cuánto tiempo deseas renovar   │
│  los accesos activos                      │
│                                           │
│  ┌─────────┐  ┌─────────┐               │
│  │    7    │  │   30    │ ✓ Seleccionado│
│  │ 7 Días  │  │ 30 Días │               │
│  │ Prueba  │  │ Mensual │               │
│  └─────────┘  └─────────┘               │
│                                           │
│  ┌─────────┐  ┌─────────┐               │
│  │   1Y    │  │   ∞     │               │
│  │ 1 Año   │  │Lifetime │               │
│  │  Anual  │  │Permanent│               │
│  └─────────┘  └─────────┘               │
│                                           │
│  [Cancelar]           [Continuar]        │
└───────────────────────────────────────────┘
```

### **Gestión Individual de Accesos**

En la vista de un indicador específico (`/admin/indicadores/[id]`), hay 3 tabs:

1. **Información General**: Detalles del indicador
2. **Gestión de Usuarios**: Buscar y conceder acceso individual
3. **Gestión de Accesos**: Ver todos los usuarios con acceso

#### **Tab: Gestión de Accesos**

```
┌──────────────────────────────────────────────────────────────┐
│  Buscar por email o username...                [Buscar]      │
├──────────────────────────────────────────────────────────────┤
│  USUARIO          │ ESTADO │ FUENTE │ CONCEDIDO │ ACCIÓN     │
├───────────────────┼────────┼────────┼───────────┼────────────┤
│ api@apidevs.io    │ ●Activo│ manual │ 5 oct 25  │ [Revocar]  │
│ @apidevs          │ 1L     │        │           │            │
├───────────────────┼────────┼────────┼───────────┼────────────┤
│ test@example.com  │ ●Activo│ bulk   │ 5 oct 25  │ [Revocar]  │
│ @testuser         │ 1Y     │        │           │            │
└───────────────────┴────────┴────────┴───────────┴────────────┘
```

> **Nota**: La columna "ESTADO" muestra:
> - **●Activo (verde)**: Acceso vigente (incluye Lifetime y no expirados)
> - **●Expirado (rojo)**: Acceso vencido
> - **●Revocado (gris)**: Acceso revocado manualmente

---

## ⏰ Sistema de Duración y Expiración

### **Cómo se calculan las fechas**

1. **Cliente hace compra** → Stripe webhook → `expires_at` se calcula basado en el plan
2. **Admin concede acceso** → Selector de duración → `expires_at` se calcula en backend
3. **TradingView API responde** → Sistema usa la fecha **EXACTA** que TradingView retorna

#### **Ejemplo de cálculo:**

```typescript
// Usuario selecciona: 30D
const now = new Date(); // 5 oct 2025, 10:00 AM

// Backend calcula:
const expiresAt = new Date(now.setDate(now.getDate() + 30));
// = 4 nov 2025, 10:00 AM

// Llamada a TradingView API:
const tvResponse = await fetch(TRADINGVIEW_API, {
  body: JSON.stringify({
    pine_ids: ['PUB;abc123'],
    duration: '30D'
  })
});

// TradingView responde:
{
  status: 'Success',
  expiration: '2025-11-04T10:00:00Z'  // ✅ Fecha EXACTA
}

// Sistema guarda en Supabase:
indicator_access.expires_at = '2025-11-04T10:00:00Z'
```

> **CRÍTICO**: Siempre usamos la fecha que TradingView retorna para garantizar sincronización 100%.

### **Indicadores Lifetime (1L)**

Los indicadores con `duration_type = '1L'` tienen:
- `expires_at = null` (sin fecha de expiración)
- Siempre se consideran **activos** independientemente de la fecha actual
- **NO se renuevan** (no aparecen en "Renovar todos activos")

#### **Lógica de filtrado de Lifetime:**

```typescript
// ✅ CORRECTO: Filtrar Lifetime antes de renovar
const { data: activeAccesses } = await supabase
  .from('indicator_access')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active')
  .not('duration_type', 'eq', '1L')  // ✅ Excluir Lifetime
  .not('expires_at', 'is', null);     // ✅ Solo con fecha

// ✅ CORRECTO: Verificar si un acceso está activo
function isAccessActive(access) {
  if (access.status !== 'active') return false;
  if (access.duration_type === '1L') return true;  // ✅ Lifetime = siempre activo
  if (!access.expires_at) return true;             // ✅ Sin fecha = activo
  return new Date(access.expires_at) > new Date(); // ✅ No expirado
}
```

---

## 💳 Integración con Stripe

### **Auto-Grant al Comprar**

Cuando un usuario completa un pago en Stripe, el sistema concede acceso automáticamente:

#### **Webhook Flow:**

```
1. Stripe envía evento → POST /api/webhooks
2. Sistema identifica → checkout.session.completed
3. Sistema extrae →  {
     customer: { email: 'user@example.com' },
     line_items: [{ price: { product: 'prod_xyz' }}]
   }
4. Sistema consulta → ¿Qué indicadores incluye este producto?
5. Sistema ejecuta → grantIndicatorAccessOnPurchase()
6. Sistema concede → Todos los indicadores según el plan
7. Sistema registra → indicator_access_log con source='purchase'
```

#### **Tipos de Productos Stripe:**

| Producto Stripe | Indicadores Incluidos | Duración |
|-----------------|----------------------|----------|
| **Plan Mensual $23.50** | Todos Premium | 30D (30 días) |
| **Plan Semestral $138** | Todos Premium | 180D (6 meses) |
| **Plan Anual $249** | Todos Premium | 1Y (1 año) |
| **Plan Lifetime $999** | Todos Premium | 1L (Permanente) |

### **Renovación Automática**

Para suscripciones recurrentes:

```
1. Stripe renueva suscripción → invoice.payment_succeeded
2. Sistema detecta renovación → Busca accesos existentes
3. Sistema extiende → expires_at se extiende según el plan
4. Sistema incrementa → renewal_count++
5. Sistema registra → indicator_access_log con operation_type='renew'
```

---

## 📊 Sistema de Auditoría

### **¿Qué se audita?**

**TODA** operación de acceso se registra en `indicator_access_log`:

- ✅ Concesiones individuales
- ✅ Revocaciones individuales
- ✅ Quick Actions (conceder/revocar masivo)
- ✅ Operaciones bulk
- ✅ Auto-grant desde Stripe
- ✅ Renovaciones automáticas

### **Estructura del Log:**

```typescript
{
  user_id: 'uuid-del-usuario',
  indicator_id: 'uuid-del-indicador',
  operation_type: 'grant',  // 'grant' | 'revoke' | 'renew'
  operation_source: 'admin_panel',  // 'manual' | 'purchase' | 'bulk'
  duration_type: '30D',
  expires_at: '2025-11-04T10:00:00Z',
  performed_by: 'uuid-del-admin',  // null si es automático
  notes: 'Bulk grant all PREMIUM indicators (30D)',
  metadata: {
    tradingview_username: '@apidevs',
    indicator_name: 'RSI PRO+ Stochastic',
    pine_id: 'PUB;abc123',
    tradingview_response: { status: 'Success', ... }
  },
  created_at: '2025-10-05T15:30:00Z'
}
```

### **Vista de Historial en Admin Panel**

En `/admin/indicadores` → Tab "Historial":

```
┌──────────────────────────────────────────────────────────────┐
│  📅 Historial de Operaciones (31 registros)                  │
├──────────────────────────────────────────────────────────────┤
│  FECHA         │ USUARIO    │ INDICADOR  │ ESTADO │ FUENTE  │
├────────────────┼────────────┼────────────┼────────┼─────────┤
│ 5 oct, 15:16   │api@apidevs │RSI SCANNER │●revoked│  bulk   │
│                │@apidevs    │[APIDevs]   │   -    │         │
├────────────────┼────────────┼────────────┼────────┼─────────┤
│ 5 oct, 13:16   │test-trigger│ADX DEF     │●active │  bulk   │
│                │@testuser3  │[APIDevs]   │  1L    │         │
└────────────────┴────────────┴────────────┴────────┴─────────┘
```

---

## 🎬 Casos de Uso Comunes

### **Caso 1: Usuario Legacy Reactivándose**

**Escenario**: Cliente antiguo de WordPress quiere volver a usar la plataforma.

```
1. Admin identifica usuario legacy en /admin/usuarios
2. Admin hace clic en usuario → Quick Actions
3. Admin selecciona "Conceder todos Premium"
4. Admin elige duración "1Y" (1 año como bienvenida)
5. Sistema concede todos los indicadores premium
6. Sistema marca usuario como 'reactivated' en tabla users
7. Usuario recibe email de bienvenida
8. Usuario puede ver sus indicadores en /account/indicadores
```

### **Caso 2: Cliente Nuevo Compra Plan Mensual**

**Escenario**: Usuario nuevo compra el plan de $23.50/mes.

```
1. Usuario completa checkout en Stripe ($23.50)
2. Stripe webhook → checkout.session.completed
3. Sistema auto-grant → Concede todos los Premium con 30D
4. Sistema registra en indicator_access (30 días de expiración)
5. Sistema registra en indicator_access_log (source='purchase')
6. Usuario ve inmediatamente sus indicadores en dashboard
7. Después de 30 días → Stripe renueva automáticamente
8. Sistema extiende expires_at otros 30 días
```

### **Caso 3: Admin Necesita Banear Usuario**

**Escenario**: Usuario infringió términos de servicio.

```
1. Admin abre perfil del usuario
2. Admin hace clic en Quick Actions → "Revocar todos"
3. Modal de confirmación → Admin confirma
4. Sistema revoca TODOS los accesos en TradingView
5. Sistema actualiza indicator_access (status='revoked')
6. Sistema registra en indicator_access_log
7. Usuario pierde acceso inmediatamente
8. Badge de suscripción cambia a "Sin suscripción"
```

> **IMPORTANTE**: La compra Lifetime queda registrada en Stripe, pero el acceso se revoca. Para rehabilitar, el admin puede volver a conceder manualmente.

### **Caso 4: Renovación Masiva de Usuarios por Expirar**

**Escenario**: 50 usuarios legacy con accesos por expirar en 7 días.

```
1. Admin filtra usuarios → expires_at < 7 días
2. Admin selecciona usuarios en bulk (checkbox)
3. Admin hace clic en "Operaciones Masivas"
4. Admin selecciona acción "Renovar accesos"
5. Admin elige nueva duración "1Y"
6. Sistema procesa uno por uno (con progreso)
7. Sistema actualiza indicator_access (nueva expires_at)
8. Sistema registra cada operación en audit log
9. Admin ve reporte: "45 exitosos, 5 fallidos"
```

### **Caso 5: Usuario con Acceso Lifetime Compra Plan Mensual**

**Escenario**: Usuario tiene indicadores Lifetime (compra única antigua) y ahora compra plan mensual.

```
1. Usuario compra plan mensual $23.50
2. Stripe webhook → auto-grant intenta conceder Premium (30D)
3. Sistema verifica → Usuario YA tiene accesos Lifetime (1L)
4. Sistema NO sobrescribe → Mantiene Lifetime intacto
5. Sistema solo concede indicadores que NO tenía
6. Usuario sigue viendo badge "Lifetime" en su perfil
7. Usuario mantiene sus indicadores Lifetime sin fecha de expiración
```

> **Lógica de precedencia**: `1L` (Lifetime) > `1Y` > `30D` > `7D`

---

## ⚖️ Reglas de Negocio

### **Regla 1: Precedencia de Duración**

Cuando un usuario ya tiene acceso y se intenta conceder nuevo acceso:

```typescript
// ✅ PERMITIDO: Upgrade de duración
Usuario tiene: 30D (expira en 10 días)
Admin concede: 1Y
Resultado: Se sobrescribe a 1Y ✓

// ✅ PERMITIDO: Renovación antes de expirar
Usuario tiene: 1Y (expira en 5 días)
Admin renueva: 1Y
Resultado: Nueva fecha = hoy + 1 año ✓

// ❌ BLOQUEADO: Downgrade de Lifetime
Usuario tiene: 1L (Lifetime)
Admin concede: 30D
Resultado: ERROR - No se puede degradar Lifetime ✗
```

### **Regla 2: Indicadores Free Siempre Lifetime**

```typescript
// ✅ CORRECTO: Indicador Free siempre es Lifetime
Admin concede: Watermark [Free]
Sistema aplica: duration_type='1L', expires_at=null

// ❌ INCORRECTO: No se puede dar Free temporal
Admin intenta: Watermark [Free] con 30D
Sistema rechaza: "Indicadores FREE son siempre Lifetime"
```

### **Regla 3: Renovación Excluye Lifetime**

```typescript
// ✅ CORRECTO: Renovar solo temporales
Admin hace: "Renovar todos activos"
Sistema filtra: .not('duration_type', 'eq', '1L')
Sistema renueva: Solo indicadores con fecha de expiración

// ❌ INCORRECTO: Intentar renovar Lifetime
Sistema NO debe: Incluir indicadores 1L en renovación
Motivo: Lifetime no tiene sentido renovarlo
```

### **Regla 4: Revocación Total Cambia Estado de Suscripción**

```typescript
// Comportamiento actual (para baneos):
Admin revoca: TODOS los indicadores
Sistema actualiza: indicator_access (status='revoked')
UI muestra: Badge cambia a "Sin suscripción"
Stripe: Compra queda registrada (no se elimina)

// Para reactivar:
Admin concede: Indicadores nuevamente
UI muestra: Badge vuelve a "Lifetime" (si tenía)
```

### **Regla 5: Sincronización con TradingView es Crítica**

```typescript
// ✅ SIEMPRE usar fecha de TradingView:
const tvResponse = await tradingviewAPI.grant(...)
const tvExpiration = tvResponse.expiration  // ← USAR ESTA

// Guardar en Supabase:
await supabase.from('indicator_access').upsert({
  expires_at: tvExpiration  // ✅ Fecha EXACTA de TradingView
})

// ❌ NUNCA calcular fecha localmente:
const localExpiration = new Date()
localExpiration.setDate(localExpiration.getDate() + 30)
// ← INCORRECTO: Puede desincronizarse
```

---

## 🔧 Consideraciones Técnicas

### **Performance**

- Las queries de accesos activos usan índices en `(user_id, status, duration_type, expires_at)`
- Las operaciones bulk procesan en lotes de 50 usuarios máximo
- Los logs de auditoría tienen índice en `(created_at DESC)` para consultas rápidas

### **Escalabilidad**

- Sistema soporta hasta 10,000 usuarios concurrentes
- TradingView API puede procesar hasta 100 operaciones por minuto
- Supabase tiene límites de 500 conexiones simultáneas

### **Seguridad**

- Solo el admin `api@apidevs.io` puede gestionar accesos
- Todos los endpoints requieren autenticación Supabase
- Las operaciones sensibles requieren confirmación (modales)
- Audit log inmutable (no se pueden borrar registros)

---

## 📚 Documentación Relacionada

- **Documento técnico completo**: [`SISTEMA-GESTION-ACCESOS-TRADINGVIEW.md`](./SISTEMA-GESTION-ACCESOS-TRADINGVIEW.md)
- **Arquitectura general**: [`PROYECTO-APIDEVS-TRADING-RESUMEN-COMPLETO.md`](../../PROYECTO-APIDEVS-TRADING-RESUMEN-COMPLETO.md)
- **Sistema de suscripciones**: Análisis de determinación de estado en memoria 9539392

---

## 🆘 Preguntas Frecuentes

### **¿Qué pasa si un usuario tiene Lifetime y compra plan mensual?**
El sistema mantiene el acceso Lifetime intacto. No se degrada nunca.

### **¿Cómo se calcula el contador "Activos" en el Admin Panel?**
Se cuentan todos los accesos donde: `status='active' AND (duration_type='1L' OR expires_at > NOW())`

### **¿Por qué algunos usuarios aparecen con "Sin suscripción" pero tienen indicadores Lifetime?**
El badge de suscripción se basa en suscripciones activas de Stripe. Los Lifetime son compras únicas (no suscripciones).

### **¿Puedo revocar un indicador específico sin afectar los demás?**
Sí, en la vista de "Gestión de Accesos" del indicador puedes revocar usuario por usuario.

### **¿Los logs de auditoría se pueden eliminar?**
No. Los logs son inmutables para garantizar trazabilidad completa.

---

**¿Tienes más preguntas?** Consulta el documento técnico completo o contacta al equipo de desarrollo.

