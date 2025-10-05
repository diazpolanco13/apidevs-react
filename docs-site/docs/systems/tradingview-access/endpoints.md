# 📡 Endpoints Críticos del Sistema TradingView

## 🎯 **ENDPOINTS PRINCIPALES DEL ADMIN PANEL**

### **1. Búsqueda de Usuarios**
```typescript
GET /api/admin/users/search?q={query}&limit=1000
```

**Funcionalidad:**
- Busca en tablas `users` + `legacy_users`
- Combina resultados y elimina duplicados
- Retorna campos críticos para gestión

**Campos retornados:**
```typescript
{
  id: string
  email: string
  full_name: string
  tradingview_username: string | null  // 🔥 CRÍTICO
  customer_tier: string
  is_legacy_user: boolean
  total_lifetime_spent: number
  purchase_count: number
  source: 'registered' | 'legacy_table'
}
```

### **2. Ver Accesos de Usuario**
```typescript
GET /api/admin/users/[id]/indicator-access
```

**Funcionalidad:**
- Lista todos los accesos del usuario
- JOIN con tabla `indicators`
- Calcula estadísticas en tiempo real

**Respuesta:**
```typescript
{
  accesses: Array<{
    id: string
    indicator: {
      name: string
      pine_id: string
      access_tier: string
    }
    status: string
    granted_at: string
    expires_at: string
    duration_type: string
  }>,
  stats: {
    total: number
    active: number
    expired: number
    revoked: number
  }
}
```

### **3. Conceder Acceso Individual**
```typescript
POST /api/admin/users/[id]/grant-access
Body: {
  indicator_id: string
  duration_type: '7D' | '30D' | '1Y' | '1L'
}
```

**Flujo crítico:**
1. ✅ Valida `tradingview_username` del usuario
2. ✅ Obtiene datos del indicador desde BD
3. 🔥 **Llama microservicio SIN API key:**
   ```typescript
   POST http://185.218.124.241:5001/api/access/{username}
   ```
4. ✅ Valida respuesta: `result[0].status === 'Success'`
5. ✅ **Usa fecha exacta de TradingView:** `result[0].expiration`
6. ✅ Verifica duplicados y hace UPDATE/INSERT apropiado
7. ✅ Registra en `indicator_access_log`

### **4. Acciones Rápidas**

#### **Conceder Todos Free**
```typescript
POST /api/admin/users/[id]/grant-all-free
```
- Busca indicadores con `access_tier = 'free'`
- Llama endpoint bulk del microservicio
- Concede `duration = '1L'` (lifetime)
- Registra `access_source = 'admin_bulk'`

#### **Conceder Todos Premium**
```typescript
POST /api/admin/users/[id]/grant-all-premium
```
- Similar pero `access_tier = 'premium'`
- `duration = '1Y'`

#### **Renovar Todos Activos**
```typescript
POST /api/admin/users/[id]/renew-all-active
```
- Busca accesos con `status = 'active'`
- Llama endpoint individual POST (TradingView suma días)
- Incrementa `renewal_count`
- Actualiza `last_renewed_at`

#### **Revocar Todos**
```typescript
POST /api/admin/users/[id]/revoke-all
```
- Busca accesos activos
- Llama endpoint DELETE del microservicio
- Actualiza `status = 'revoked'`, `revoked_at = now()`

### **5. Operaciones Masivas**
```typescript
POST /api/admin/bulk-operations/execute
Body: {
  user_ids: string[]
  indicator_ids: string[]
  duration: '7D' | '30D' | '1Y' | '1L'
  operation_type: 'grant' | 'revoke'  // 🔥 NUEVO
}
```

**Flujo bulk:**
1. ✅ Filtra usuarios con `tradingview_username`
2. ✅ Obtiene indicadores activos
3. 🔥 **Para grant:** Llama endpoint individual por usuario
4. 🔥 **Para revoke:** Llama DELETE por usuario
5. ✅ Guarda resultados en batch (500 registros/lote)
6. ✅ Registra en `indicator_access_log`

### **6. Historial y Auditoría**
```typescript
GET /api/admin/access-audit?page=1&limit=50&search={email}&filters={...}
```

**Funcionalidad:**
- Lista operaciones desde `indicator_access_log`
- Búsqueda por email/username
- Filtros avanzados (fecha, tipo, estado)
- JOIN con tablas relacionadas

### **7. Estadísticas Globales**
```typescript
GET /api/admin/access-stats?period=30d
```

**Métricas retornadas:**
```typescript
{
  total_operations: number
  successful_operations: number
  failed_operations: number
  success_rate: number
  unique_users: number
  unique_indicators: number
  active_accesses: number
  by_source: {
    manual: number
    bulk: number
    purchase: number
    trial: number
    renewal: number
  }
}
```

---

## 🚀 **ENDPOINTS DE WEBHOOKS STRIPE**

### **Auto-Grant en Compras**
```typescript
POST /api/webhooks
Headers: {
  'stripe-signature': '...'
}
```

**Eventos procesados:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `invoice.payment_succeeded`

**Flujo de auto-grant:**
1. ✅ Verifica firma de Stripe
2. ✅ Extrae `customer_email`, `product_ids`, `price_id`
3. ✅ Busca usuario en Supabase por email
4. ✅ Valida `tradingview_username`
5. ✅ Determina duración desde `price_id`:
   ```typescript
   const PRICE_DURATION_MAP = {
     'month': '30D',
     'year': '1Y',
     'one_time': '1L',
     'lifetime': '1L'
   }
   ```
6. 🔥 **Llama microservicio TradingView**
7. ✅ Guarda en BD con `access_source = 'purchase'`
8. ✅ Registra en log de auditoría

---

## 🔧 **ENDPOINTS DE GESTIÓN DE INDICADORES**

### **CRUD de Indicadores**
```typescript
GET    /api/admin/indicators              # Lista paginada
POST   /api/admin/indicators              # Crear nuevo
GET    /api/admin/indicators/[id]         # Ver detalles
PUT    /api/admin/indicators/[id]         # Actualizar
DELETE /api/admin/indicators/[id]         # Eliminar
```

**Campos críticos al actualizar:**
```typescript
// NO olvidar estos campos al hacer PUT
{
  access_tier: string        // 🔥 CRÍTICO para lógica de acceso
  tradingview_url: string
  public_script_url: string
  features: object
  tags: string[]
}
```

### **Script de Cálculo de Tiers**
```bash
npx tsx scripts/calculate-legacy-tiers.ts
```

**Funcionalidad:**
- Lee CSV de compras históricas
- Calcula tiers basados en gasto total
- Actualiza tabla `legacy_users` en batch
- Umbrales: Diamond ≥$500, Platinum $300-499, etc.

---

## ⚠️ **CONSIDERACIONES CRÍTICAS**

### **1. Autenticación Admin**
```typescript
// TODOS los endpoints requieren esta validación
const { data: { user } } = await supabase.auth.getUser();
if (!user || user.email !== 'api@apidevs.io') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### **2. Gestión de Duplicados**
```typescript
// SIEMPRE verificar antes de INSERT
const { data: existing } = await supabase
  .from('indicator_access')
  .select('id')
  .eq('user_id', userId)
  .eq('indicator_id', indicatorId)
  .maybeSingle();

if (existing) {
  // UPDATE existente
  await supabase.from('indicator_access').update(data).eq('id', existing.id);
} else {
  // INSERT nuevo
  await supabase.from('indicator_access').insert(data);
}
```

### **3. Fechas de TradingView**
```typescript
// NUNCA calcular fechas localmente
// SIEMPRE usar la respuesta exacta de TradingView
const expiresAt = tvResponse[0].expiration; // ← Fecha EXACTA
```

### **4. Estados de Usuario**
```typescript
// Lógica exacta para clasificación
const isRecovered = source === 'registered' && is_legacy_user && purchase_count > 0;
const isLegacy = is_legacy_user && !isRecovered;
const isActive = !is_legacy_user;
```

### **5. Batch Operations**
- Usar `Promise.all()` para updates en lotes de 100
- Evitar loops secuenciales (muy lentos)
- Incluir manejo de errores por registro

---

## 🐛 **TROUBLESHOOTING ENDPOINTS**

### **Error: `column users.created_at does not exist`**
- **Solución:** Usar `customer_since` en lugar de `created_at`

### **Error: `Invalid API key`**
- **Causa:** Usando endpoint bulk sin header `X-API-Key`
- **Solución:** Endpoints individuales NO requieren API key

### **Error: `duplicate key value violates unique constraint`**
- **Causa:** Intentando INSERT sin verificar existencia previa
- **Solución:** Implementar lógica UPDATE/INSERT condicional

### **Error: `tradingview_username is null`**
- **Causa:** Usuario legacy sin completar onboarding
- **Solución:** Filtrar usuarios sin username en operaciones bulk

---

## 📊 **MÉTRICAS DE USO**

**Queries para monitoreo:**
```sql
-- Operaciones por día
SELECT DATE(created_at), COUNT(*) as operations
FROM indicator_access_log
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- Tasa de éxito
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'active') as successful,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'active')::numeric / COUNT(*) * 100, 2
  ) as success_rate
FROM indicator_access_log
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
```

---

**Última actualización:** 4 de Octubre 2025
**Documentación:** Completa y validada
**Estado:** ✅ Crítico para funcionamiento del sistema
