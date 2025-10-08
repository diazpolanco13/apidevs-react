# Plan de Testing: Renovaciones Automáticas PRO

**Estado:** ✅ COMPLETADO (8 Oct 2025)  
**Ver resultados:** `docs/RESUMEN-TESTING-8-OCT-2025.md`

## ⚠️ IMPORTANTE: Leer Primero

Antes de ejecutar este plan, lee:
1. **`docs/FIX-TEMPORAL-MANAGESUBSCRIPTION-TESTCLOCK.md`** - Fix crítico necesario
2. **`docs/STRIPE-CLI-TESTING-QUICK.md`** - Scripts optimizados listos para usar

## Contexto Actual

El sistema de auto-grant ya está implementado en `app/api/webhooks/route.ts` (líneas 360-421) y detecta renovaciones mediante el evento `invoice.payment_succeeded` con `billing_reason: 'subscription_cycle'`.

**Producto PRO:** `prod_T9sIrlhYUtHPT3`

- Plan Mensual: `price_1SDYXpBUKmGwbE6IyejpKBSa` - $39.00/mes → Duración: 30D
- Plan Anual: `price_1SDYXqBUKmGwbE6Iza5zhYSa` - $390.00/año → Duración: 1Y

**Configuración actual:**

- Mapeo en `auto-grant-access.ts` línea 29-34: planes PRO dan acceso a 'all' (free + premium)
- Webhook escucha: `invoice.payment_succeeded`
- Dashboard de historial: `http://localhost:3000/admin/indicadores` (tab Historial)

**⚠️ Problema Conocido:**
- Indicadores FREE heredan duración del plan (deberían ser lifetime)
- Ver: `docs/PENDIENTE-INDICADORES-FREE-LIFETIME.md`

## Fase 1: Preparación del Entorno

### 🚨 1.0 CRÍTICO: Deshabilitar Webhook de Vercel

**PROBLEMA:** Vercel y Local procesarán los mismos webhooks → duplicados en BD

**SOLUCIÓN OBLIGATORIA:**

```bash
# 1. Verificar webhooks activos
stripe webhook_endpoints list

# 2. Deshabilitar Vercel durante testing local
stripe webhook_endpoints update we_1SDYuwBUKmGwbE6IPlxmNICm --disabled

# 3. Verificar que status = "disabled"
stripe webhook_endpoints list | grep -A 5 "we_1SDYuwBUKmGwbE6IPlxmNICm"
```

⚠️ **RECORDAR:** Reactivar después del testing:
```bash
stripe webhook_endpoints update we_1SDYuwBUKmGwbE6IPlxmNICm --enabled
```

### 1.1 Price IDs Identificados

**✅ YA IDENTIFICADOS:**

- **Mensual:** `price_1SDYXpBUKmGwbE6IyejpKBSa` ($39/mes → 30D)
- **Anual:** `price_1SDYXqBUKmGwbE6Iza5zhYSa` ($390/año → 1Y)

No es necesario buscarlos de nuevo.

### 1.2 Preparar Usuario de Prueba Real

**⚠️ IMPORTANTE:** No usar usuarios ficticios. Usar usuarios registrados legítimamente en la plataforma.

**Requisitos del usuario de prueba:**

1. ✅ **Registrado en la plataforma** (`/register`)
2. ✅ **Username de TradingView verificado** durante onboarding
3. ✅ **Existe en tabla `users`** de Supabase
4. ✅ **Tiene `tradingview_username` válido**

**Verificar en Supabase:**

```sql
SELECT 
  id, 
  email, 
  tradingview_username,
  created_at
FROM users 
WHERE email = 'tu-email-de-prueba@ejemplo.com';

-- DEBE RETORNAR:
-- - id: UUID válido
-- - tradingview_username: Username real de TradingView
-- - created_at: Fecha de registro
```

**Si no existe usuario adecuado:**

1. Ir a `http://localhost:3000/register`
2. Completar registro con email de prueba
3. Ingresar username real de TradingView durante onboarding
4. Verificar que el usuario esté en Supabase antes de continuar

**Anotar para usar en pruebas:**
- Email del usuario: `_____________`
- User ID (UUID): `_____________`
- TradingView username: `_____________`

### 1.3 Indicadores Activos Confirmados

**✅ TOTAL: 6 indicadores**

- **2 FREE:** Watermark, ADX DEF (deberían ser lifetime `1L` ⚠️)
- **4 PREMIUM:** RSI PRO+ OVERLAY, RSI SCANNER, RSI PRO+ Stochastic, POSITION SIZE

**Esperado por renovación:** 6 indicadores concedidos

### 1.4 Iniciar Stripe Listen y Servidor

**Terminal 1 - Stripe Listen:**

```bash
stripe listen --forward-to localhost:3000/api/webhooks  # ⚠️ PUERTO 3000
```

**Copiar:** El `webhook signing secret` (whsec_xxxxx)

**Terminal 2 - Servidor Next.js:**

```bash
cd /home/ea22/proyectos/apidevs-react
STRIPE_WEBHOOK_SECRET=whsec_xxxxx npm run dev
```

**Verificar:** Servidor debe mostrar `✓ Ready in X.Xs` y `Local: http://localhost:3000`

## Fase 2: Testing Plan Mensual ($39/mes - 30D)

### ⚡ 2.1 Script Automatizado (RECOMENDADO)

**Ver:** `docs/STRIPE-CLI-TESTING-QUICK.md` - Script completo listo para copy/paste

**O ejecutar paso a paso:**

### 2.1 Crear Test Clock y Suscripción Mensual (Manual)

```bash
# 1. Crear Test Clock
CLOCK_ID=$(stripe test_helpers test_clocks create \
  --frozen-time $(date +%s) \
  --name "Test Mensual $(date +%H:%M:%S)" 2>/dev/null \
  | grep -o 'clock_[a-zA-Z0-9]*' | head -1)
echo "✅ Clock: $CLOCK_ID"

# 2. Crear Customer con metadatos del USUARIO REAL
# ⚠️ Reemplazar con los datos reales del paso 1.2
USER_EMAIL="tu-email@ejemplo.com"           # Email del usuario registrado
USER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # UUID de Supabase
TV_USERNAME="tu_username_tradingview"        # Username real de TradingView

CUSTOMER_ID=$(stripe customers create \
  -d email="$USER_EMAIL" \
  -d name="Test Renovación Mensual" \
  -d test_clock="$CLOCK_ID" \
  -d "metadata[user_id]=$USER_ID" \
  -d "metadata[tradingview_username]=$TV_USERNAME" 2>/dev/null \
  | grep -o 'cus_[a-zA-Z0-9]*' | head -1)
echo "✅ Customer: $CUSTOMER_ID"

# 3. Crear y adjuntar Payment Method
PM_ID=$(stripe payment_methods create \
  -d type=card \
  -d "card[token]=tok_visa" 2>/dev/null \
  | grep -o 'pm_[a-zA-Z0-9]*' | head -1)
stripe payment_methods attach $PM_ID -d customer="$CUSTOMER_ID" > /dev/null 2>&1
echo "✅ PM: $PM_ID"

# 4. Crear Subscription MENSUAL
SUB_ID=$(stripe subscriptions create \
  -d customer="$CUSTOMER_ID" \
  -d "items[0][price]=price_1SDYXpBUKmGwbE6IyejpKBSa" \
  -d default_payment_method="$PM_ID" 2>/dev/null \
  | grep -o 'sub_[a-zA-Z0-9]*' | head -1)
echo "✅ Subscription: $SUB_ID"

# 5. Esperar procesamiento
sleep 15
```

### 2.2 Verificar Primera Compra (Checkout)

**Objetivo:** Confirmar que el checkout inicial concedió acceso correctamente.

**Verificar logs del servidor (Terminal 2):**

```
🔔 Webhook received: invoice.payment_succeeded
ℹ️ Skipping auto-grant for subscription_create (handled by checkout.session.completed)
```

**Verificar en Supabase:**

```sql
-- Tabla indicator_access_log
SELECT 
  created_at,
  operation_type,
  access_source,
  billing_reason,
  indicators_granted
FROM indicator_access_log
WHERE customer_email = 'test-monthly@apidevs.io'
ORDER BY created_at DESC;

-- Debe mostrar: 1 registro con source='checkout', operation_type='grant'
```

**Verificar en Dashboard:**

- Ir a `http://localhost:3000/admin/compras`
- Buscar compra de `test-monthly@apidevs.io`
- Verificar: Estado "Completado", indicadores concedidos

### 2.3 Simular Renovación Mensual (Avanzar 31 días)

**Objetivo:** Disparar renovación automática y verificar auto-grant.

**Comandos:**

```bash
# Obtener tiempo actual del clock
CURRENT_TIME=$(stripe test_helpers test_clocks retrieve "$CLOCK_ID" \
  --format json 2>/dev/null \
  | grep -o '"frozen_time": [0-9]*' \
  | grep -o '[0-9]*')

# Avanzar 31 días (2,678,400 segundos)
NEW_TIME=$((CURRENT_TIME + 2678400))
echo "Avanzando de $(date -d @$CURRENT_TIME) a $(date -d @$NEW_TIME)"

stripe test_helpers test_clocks advance "$CLOCK_ID" --frozen-time $NEW_TIME

# Esperar 10-15 segundos
sleep 15
```

### 2.4 Verificar Renovación Mensual

**Verificar logs del servidor (Terminal 2):**

```
🔔 Webhook received: invoice.payment_succeeded
🔄 ========== RENOVACIÓN DETECTADA ==========
🔖 Billing Reason: subscription_cycle
📧 Customer Email: test-monthly@apidevs.io
⏰ Duración: 30D
✅ AUTO-GRANTED X indicators to user_xxxxx
```

**Verificar en Supabase - indicator_access_log:**

```sql
SELECT 
  created_at,
  operation_type,
  access_source,
  billing_reason,
  invoice_id,
  indicators_granted,
  duration_type
FROM indicator_access_log
WHERE customer_email = 'test-monthly@apidevs.io'
ORDER BY created_at DESC
LIMIT 5;

-- ESPERADO:
-- 2 registros:
-- 1. source='checkout' (primera compra)
-- 2. source='renewal', billing_reason='subscription_cycle', duration_type='30D'
```

**Verificar en Supabase - indicator_access:**

```sql
SELECT 
  ia.tradingview_username,
  i.name as indicator_name,
  ia.status,
  ia.granted_at,
  ia.expires_at,
  ia.duration_type,
  ia.renewal_count,
  ia.last_renewed_at
FROM indicator_access ia
JOIN indicators i ON ia.indicator_id = i.id
WHERE ia.user_id = '71b7b58f-6c9d-4133-88e5-c69972dea205'
ORDER BY ia.expires_at DESC;

-- VERIFICAR:
-- - expires_at se EXTENDIÓ 30 días desde la fecha original
-- - renewal_count se incrementó
-- - last_renewed_at actualizado
```

**Verificar en Dashboard:**

- Ir a `http://localhost:3000/admin/compras`
- Debe haber una NUEVA compra registrada para la renovación
- Badge: "Renovación"
- Verificar: indicadores concedidos automáticamente

**Verificar en Dashboard - Tab Historial:**

- Ir a `http://localhost:3000/admin/indicadores` → Tab "Historial"
- Buscar por email: `test-monthly@apidevs.io`
- Debe mostrar 2 operaciones: checkout inicial + renovación

## Fase 3: Testing Plan Anual ($390/año - 1Y)

### 3.1 Crear Test Clock y Suscripción Anual

**Objetivo:** Simular suscripción anual y su primera renovación.

**Comandos:**

```bash
# 1. Crear Test Clock
CLOCK_ID_ANNUAL=$(stripe test_helpers test_clocks create \
  --frozen-time $(date +%s) \
  --name "Test Renovación Anual" \
  | grep -o 'clock_[a-zA-Z0-9]*' | head -1)
echo "Clock ID Annual: $CLOCK_ID_ANNUAL"

# 2. Crear Customer con Test Clock
CUSTOMER_ID_ANNUAL=$(stripe customers create \
  -d email="test-annual@apidevs.io" \
  -d name="Test Annual Renewal" \
  -d test_clock="$CLOCK_ID_ANNUAL" \
  -d "metadata[user_id]=71b7b58f-6c9d-4133-88e5-c69972dea205" \
  | grep -o 'cus_[a-zA-Z0-9]*' | head -1)
echo "Customer ID Annual: $CUSTOMER_ID_ANNUAL"

# 3. Adjuntar método de pago
stripe payment_methods attach pm_card_visa -d customer="$CUSTOMER_ID_ANNUAL"

# 4. Crear Subscription ANUAL (usar price_id del paso 1.1)
PRICE_ID_ANNUAL="price_yyyyy"  # Reemplazar con el real
SUB_ID_ANNUAL=$(stripe subscriptions create \
  -d customer="$CUSTOMER_ID_ANNUAL" \
  -d "items[0][price]=$PRICE_ID_ANNUAL" \
  -d default_payment_method=pm_card_visa \
  | grep -o 'sub_[a-zA-Z0-9]*' | head -1)
echo "Subscription ID Annual: $SUB_ID_ANNUAL"
```

### 3.2 Verificar Primera Compra Anual

**Verificar en Supabase:**

```sql
SELECT 
  created_at,
  operation_type,
  access_source,
  duration_type,
  indicators_granted
FROM indicator_access_log
WHERE customer_email = 'test-annual@apidevs.io'
ORDER BY created_at DESC;

-- Debe mostrar: 1 registro con source='checkout'
-- (duration_type podría ser '1Y' o '30D' dependiendo del mapeo)
```

### 3.3 Simular Renovación Anual (Avanzar 366 días)

**Objetivo:** Disparar renovación anual y verificar auto-grant con duración 1Y.

**Comandos:**

```bash
# Obtener tiempo actual del clock
CURRENT_TIME_ANNUAL=$(stripe test_helpers test_clocks retrieve "$CLOCK_ID_ANNUAL" \
  --format json 2>/dev/null \
  | grep -o '"frozen_time": [0-9]*' \
  | grep -o '[0-9]*')

# Avanzar 366 días (31,622,400 segundos)
NEW_TIME_ANNUAL=$((CURRENT_TIME_ANNUAL + 31622400))
echo "Avanzando de $(date -d @$CURRENT_TIME_ANNUAL) a $(date -d @$NEW_TIME_ANNUAL)"

stripe test_helpers test_clocks advance "$CLOCK_ID_ANNUAL" --frozen-time $NEW_TIME_ANNUAL

# Esperar 15-20 segundos
sleep 20
```

### 3.4 Verificar Renovación Anual

**Verificar logs del servidor:**

```
🔔 Webhook received: invoice.payment_succeeded
🔄 ========== RENOVACIÓN DETECTADA ==========
🔖 Billing Reason: subscription_cycle
📧 Customer Email: test-annual@apidevs.io
⏰ Duración: 1Y  # <-- VERIFICAR QUE DIGA 1Y, NO 30D
✅ AUTO-GRANTED X indicators to user_xxxxx
```

**Verificar en Supabase:**

```sql
SELECT 
  created_at,
  operation_type,
  access_source,
  billing_reason,
  duration_type,
  indicators_granted
FROM indicator_access_log
WHERE customer_email = 'test-annual@apidevs.io'
ORDER BY created_at DESC
LIMIT 5;

-- ESPERADO:
-- 2 registros:
-- 1. source='checkout' (primera compra)
-- 2. source='renewal', billing_reason='subscription_cycle', duration_type='1Y'
```

**Verificar en Dashboard:**

- Ir a `http://localhost:3000/admin/compras`
- Debe haber una NUEVA compra para la renovación anual
- Verificar: indicadores concedidos, duración 1 año

## Fase 4: Validación de Deduplicación

### 4.1 Reiniciar Servidor Durante Renovación

**Objetivo:** Verificar que la deduplicación persistente evita duplicados.

**Acciones:**

1. Crear una nueva suscripción con Test Clock
2. Durante el avance del clock, DETENER el servidor (Ctrl+C en Terminal 2)
3. REINICIAR el servidor antes de que termine el avance
4. Stripe reenviará el webhook cuando el servidor vuelva

**Verificar:**

```sql
SELECT COUNT(*) as total_registros
FROM indicator_access_log
WHERE customer_email = 'test-dedup@apidevs.io'
AND billing_reason = 'subscription_cycle';

-- DEBE SER: 1 (no duplicados)
```

## Fase 5: Checklist de Validación Completa

### Plan Mensual ($39/mes - 30D)

- [ ] Suscripción inicial creada correctamente
- [ ] Primera compra registrada en dashboard
- [ ] Indicadores concedidos en checkout inicial
- [ ] Test Clock avanzado 31 días sin errores
- [ ] Webhook `invoice.payment_succeeded` recibido con `billing_reason: subscription_cycle`
- [ ] Logs muestran "🔄 RENOVACIÓN DETECTADA"
- [ ] Duración detectada: 30D
- [ ] Auto-grant ejecutado correctamente
- [ ] Nueva compra registrada en dashboard con badge "Renovación"
- [ ] `indicator_access_log` tiene 2 registros (checkout + renewal)
- [ ] `indicator_access` actualizado: `expires_at` extendido, `renewal_count` incrementado
- [ ] Tab Historial muestra ambas operaciones

### Plan Anual ($390/año - 1Y)

- [ ] Suscripción anual creada correctamente
- [ ] Primera compra registrada en dashboard
- [ ] Indicadores concedidos en checkout inicial
- [ ] Test Clock avanzado 366 días sin errores
- [ ] Webhook recibido con `billing_reason: subscription_cycle`
- [ ] Logs muestran "🔄 RENOVACIÓN DETECTADA"
- [ ] Duración detectada: 1Y (NO 30D)
- [ ] Auto-grant ejecutado correctamente
- [ ] Nueva compra registrada en dashboard
- [ ] `indicator_access_log` tiene 2 registros con `duration_type='1Y'`
- [ ] `indicator_access` actualizado con fecha +1 año
- [ ] Tab Historial muestra ambas operaciones

### Deduplicación

- [ ] No hay registros duplicados en `indicator_access_log`
- [ ] Reinicio del servidor no causa duplicados
- [ ] Sistema sobrevive múltiples webhooks del mismo evento

## Fase 6: Limpieza

### 6.1 Eliminar Test Clocks

```bash
# Listar todos los test clocks
stripe test_helpers test_clocks list

# Eliminar cada uno
stripe test_helpers test_clocks delete $CLOCK_ID
stripe test_helpers test_clocks delete $CLOCK_ID_ANNUAL
```

### 6.2 Limpiar Datos de Prueba (Opcional)

```sql
-- Eliminar registros de prueba de indicator_access_log
DELETE FROM indicator_access_log 
WHERE customer_email LIKE 'test-%@apidevs.io';

-- Eliminar registros de prueba de purchases
DELETE FROM purchases 
WHERE customer_email LIKE 'test-%@apidevs.io';
```

## Criterios de Éxito

El testing será considerado exitoso si:

1. **Renovación Mensual:** Se conceden indicadores automáticamente con duración 30D
2. **Renovación Anual:** Se conceden indicadores automáticamente con duración 1Y
3. **Dashboard actualizado:** Cada renovación crea una nueva compra visible
4. **Historial completo:** Tab Historial muestra todas las operaciones
5. **Sin duplicados:** Sistema de deduplicación persistente funciona
6. **Fechas correctas:** `expires_at` se extiende según el plan
7. **Logs claros:** Todas las operaciones logueadas correctamente

## Archivos Clave Involucrados

- `app/api/webhooks/route.ts` (líneas 360-421): Maneja `invoice.payment_succeeded`
- `utils/tradingview/auto-grant-access.ts`: Lógica de auto-grant
- `utils/supabase/admin.ts`: **Contiene fix crítico** (`.maybeSingle()`)
- `docs/STRIPE-CLI-TESTING-QUICK.md`: Scripts optimizados
- Dashboard: `http://localhost:3000/admin/compras`
- Dashboard: `http://localhost:3000/admin/indicadores` (Tab Historial)

---

## 🎓 Lecciones Aprendidas (8 Oct 2025)

### **1. Problema: Duplicación de Registros**

**Causa:** Vercel y Local procesando los mismos webhooks de Stripe

**Síntoma:**
- 12 registros en `indicator_access_log` (6 con `1Y` + 6 con `30D`)
- Logs del servidor mostraban solo 1 ejecución

**Solución:**
```bash
# Deshabilitar webhook de Vercel durante testing local
stripe webhook_endpoints update we_1SDYuwBUKmGwbE6IPlxmNICm --disabled
```

### **2. Problema: Test Clock Customers No Sincronizados**

**Causa:** Customers creados con Test Clock no se sincronizan a Supabase automáticamente

**Síntoma:**
- Webhook `customer.subscription.created` falla con `[400]`
- Error: "Cannot coerce the result to a single JSON object"

**Solución:** Fix en `utils/supabase/admin.ts`
```typescript
// Cambio de .single() a .maybeSingle() en manageSubscriptionStatusChange()
const { data: customerData } = await supabaseAdmin
  .from('customers')
  .select('id')
  .eq('stripe_customer_id', customerId)
  .maybeSingle(); // ✅ Permite continuar sin customer en Supabase
```

**Documentado en:** `docs/FIX-TEMPORAL-MANAGESUBSCRIPTION-TESTCLOCK.md`

### **3. Refinamientos Implementados**

✅ **Logs optimizados** con execution IDs para tracking  
✅ **Scripts automatizados** para testing rápido  
✅ **Documentación consolidada** (6 archivos vs. 12 anteriores)  
✅ **Fix crítico documentado** para evitar regresiones  

### **4. Problema Pendiente: Indicadores FREE Lifetime**

**Comportamiento actual:** Indicadores FREE heredan duración del plan (`30D` o `1Y`)  
**Comportamiento esperado:** FREE siempre debe ser `1L` (lifetime)

**Ver solución:** `docs/PENDIENTE-INDICADORES-FREE-LIFETIME.md`

---

## 📚 Referencias Adicionales

- **Resumen completo:** `docs/RESUMEN-TESTING-8-OCT-2025.md`
- **Índice principal:** `docs/README.md`
- **Scripts rápidos:** `docs/STRIPE-CLI-TESTING-QUICK.md`
- **Fix crítico:** `docs/FIX-TEMPORAL-MANAGESUBSCRIPTION-TESTCLOCK.md`