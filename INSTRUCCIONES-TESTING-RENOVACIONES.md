# 🧪 Instrucciones para Testing de Renovaciones Automáticas

**Fecha:** 8 de Octubre 2025  
**Última actualización:** 8 de Octubre 2025 - 23:30 UTC  
**Estado:** ✅ PROBADO Y FUNCIONANDO

---

## ✅ Resumen de Testing Completado

### **Pruebas Exitosas:**
- ✅ Renovación Plan Mensual ($39/mes → 30D)
- ✅ Renovación Plan Anual ($390/año → 1Y)
- ✅ Sin duplicados (webhook Vercel deshabilitado durante testing local)

### **Problema Resuelto:**
🚨 **Duplicación de registros**: Se identificó que Vercel y Local estaban procesando los mismos webhooks.  
✅ **Solución**: Deshabilitar temporalmente el webhook de Vercel durante testing local.

---

## 📋 Información Recopilada

### Price IDs de Stripe:
- **Plan Mensual:** `price_1SDYXpBUKmGwbE6IyejpKBSa` ($39.00/mes → 30D)
- **Plan Anual:** `price_1SDYXqBUKmGwbE6Iza5zhYSa` ($390.00/año → 1Y)
- **Producto:** `prod_T9sIrlhYUtHPT3`

### Usuario de Prueba (Testing Local):
- **Email:** `pro-mensual@test.com` / `pro-anual@test.com`
- **User ID:** `6b89d9ba-fbac-4883-a773-befe02e47713`
- **TradingView Username:** `ManuEl`

### Indicadores Activos:
- **Total:** 6 indicadores (2 FREE + 4 PREMIUM)
- Los planes PRO conceden TODOS los indicadores (free + premium)
- ⚠️ **PENDIENTE**: Indicadores FREE deberían mantener lifetime (`1L`) en renovaciones

---

## 🔧 CONFIGURACIÓN PREVIA (CRÍTICO)

### **Deshabilitar Webhook de Vercel**

Para evitar procesamiento duplicado de eventos Stripe:

```bash
# Verificar webhooks activos
stripe webhook_endpoints list

# Deshabilitar Vercel durante testing local
stripe webhook_endpoints update we_1SDYuwBUKmGwbE6IPlxmNICm --disabled

# ✅ Verificar que status = "disabled"
```

⚠️ **RECORDAR:** Reactivar después del testing:
```bash
stripe webhook_endpoints update we_1SDYuwBUKmGwbE6IPlxmNICm --enabled
```

---

## 🚀 PASO 1: Iniciar Stripe Listen

En una terminal, ejecuta:

```bash
stripe listen --forward-to localhost:3000/api/webhooks
```

**⚠️ IMPORTANTE:** Copia el `webhook signing secret` que aparece (empieza con `whsec_`)

**Output esperado:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (^C to quit)
```

---

## 🚀 PASO 2: Iniciar Servidor Next.js

En una **SEGUNDA terminal**, exporta el webhook secret y ejecuta el servidor:

```bash




```

**Reemplaza `whsec_xxxxxx` con el secret que copiaste en el paso anterior.**

**Output esperado:**
```
▲ Next.js 14.2.3
- Local:        http://localhost:3002
- ready in 2.1s
```

---

## 🧪 FASE 2: Testing Plan Mensual ($39/mes - 30D)

### 2.1 Crear Test Clock y Suscripción Mensual

En una **TERCERA terminal**, ejecuta estos comandos:

```bash
# 1. Crear Test Clock
CLOCK_ID=$(stripe test_helpers test_clocks create \
  --frozen-time $(date +%s) \
  --name "Test Renovación Mensual" \
  | grep -o 'clock_[a-zA-Z0-9]*' | head -1)
echo "✅ Clock ID: $CLOCK_ID"

# 2. Crear Customer con Test Clock
CUSTOMER_ID=$(stripe customers create \
  -d email="test-monthly@apidevs.io" \
  -d name="Test Monthly Renewal" \
  -d test_clock="$CLOCK_ID" \
  -d "metadata[user_id]=71b7b58f-6c9d-4133-88e5-c69972dea205" \
  | grep -o 'cus_[a-zA-Z0-9]*' | head -1)
echo "✅ Customer ID: $CUSTOMER_ID"

# 3. Adjuntar método de pago
stripe payment_methods attach pm_card_visa -d customer="$CUSTOMER_ID"
echo "✅ Payment method attached"

# 4. Crear Subscription MENSUAL
SUB_ID=$(stripe subscriptions create \
  -d customer="$CUSTOMER_ID" \
  -d "items[0][price]=price_1SDYXpBUKmGwbE6IyejpKBSa" \
  -d default_payment_method=pm_card_visa \
  | grep -o 'sub_[a-zA-Z0-9]*' | head -1)
echo "✅ Subscription ID: $SUB_ID"
```

### 2.2 Verificar Primera Compra

**En la terminal del servidor (Terminal 2), deberías ver:**
```
🔔 Webhook received: customer.subscription.created
🔔 Webhook received: invoice.payment_succeeded
ℹ️ Skipping auto-grant for subscription_create (handled by checkout.session.completed)
```

**⚠️ NOTA:** La primera compra NO se procesa aquí porque normalmente viene de `checkout.session.completed`. Para esta prueba, el auto-grant inicial puede no ejecutarse, pero la RENOVACIÓN sí debe funcionar.

### 2.3 Simular Renovación Mensual (Avanzar 31 días)

```bash
# Obtener tiempo actual del clock
CURRENT_TIME=$(stripe test_helpers test_clocks retrieve "$CLOCK_ID" \
  --format json 2>/dev/null \
  | grep -o '"frozen_time": [0-9]*' \
  | grep -o '[0-9]*')

# Avanzar 31 días (2,678,400 segundos)
NEW_TIME=$((CURRENT_TIME + 2678400))
echo "⏩ Avanzando de $(date -d @$CURRENT_TIME '+%Y-%m-%d') a $(date -d @$NEW_TIME '+%Y-%m-%d')"

stripe test_helpers test_clocks advance "$CLOCK_ID" --frozen-time $NEW_TIME

echo "⏳ Esperando 15 segundos para que se procese..."
sleep 15

# Verificar estado del clock
stripe test_helpers test_clocks retrieve "$CLOCK_ID"
```

### 2.4 Verificar Renovación Mensual

**En la terminal del servidor (Terminal 2), DEBES VER:**
```
🔔 Webhook received: invoice.payment_succeeded
🔄 ========== RENOVACIÓN DETECTADA ==========
📧 Invoice ID: in_xxxxx
🔖 Billing Reason: subscription_cycle
💰 Amount Paid: 39.0
📧 Customer Email: test-monthly@apidevs.io
📦 Product IDs: [...]
💰 Price ID: price_1SDYXpBUKmGwbE6IyejpKBSa
============================================

✅ AUTO-GRANT RESULT (renewal):
   Success: true
   Indicators Granted: 6
============================================
```

**✅ SI VES ESTO, LA RENOVACIÓN MENSUAL FUNCIONA CORRECTAMENTE!**

### 2.5 Verificar en Dashboard

1. Abre http://localhost:3000/admin/compras
2. Busca compras de `test-monthly@apidevs.io`
3. Debes ver:
   - Primera invoice (subscription_create)
   - **Segunda invoice (subscription_cycle) ← RENOVACIÓN**
   - Badge "Renovación" en la segunda compra

4. Abre http://localhost:3000/admin/indicadores → Tab "Historial"
5. Busca por email: `test-monthly@apidevs.io`
6. Debes ver las operaciones de auto-grant

---

## 🧪 FASE 3: Testing Plan Anual ($390/año - 1Y)

### 3.1 Crear Test Clock y Suscripción Anual

```bash
# 1. Crear Test Clock
CLOCK_ID_ANNUAL=$(stripe test_helpers test_clocks create \
  --frozen-time $(date +%s) \
  --name "Test Renovación Anual" \
  | grep -o 'clock_[a-zA-Z0-9]*' | head -1)
echo "✅ Clock ID Annual: $CLOCK_ID_ANNUAL"

# 2. Crear Customer con Test Clock
CUSTOMER_ID_ANNUAL=$(stripe customers create \
  -d email="test-annual@apidevs.io" \
  -d name="Test Annual Renewal" \
  -d test_clock="$CLOCK_ID_ANNUAL" \
  -d "metadata[user_id]=71b7b58f-6c9d-4133-88e5-c69972dea205" \
  | grep -o 'cus_[a-zA-Z0-9]*' | head -1)
echo "✅ Customer ID Annual: $CUSTOMER_ID_ANNUAL"

# 3. Adjuntar método de pago
stripe payment_methods attach pm_card_visa -d customer="$CUSTOMER_ID_ANNUAL"
echo "✅ Payment method attached"

# 4. Crear Subscription ANUAL
SUB_ID_ANNUAL=$(stripe subscriptions create \
  -d customer="$CUSTOMER_ID_ANNUAL" \
  -d "items[0][price]=price_1SDYXqBUKmGwbE6Iza5zhYSa" \
  -d default_payment_method=pm_card_visa \
  | grep -o 'sub_[a-zA-Z0-9]*' | head -1)
echo "✅ Subscription ID Annual: $SUB_ID_ANNUAL"
```

### 3.2 Simular Renovación Anual (Avanzar 366 días)

```bash
# Obtener tiempo actual del clock
CURRENT_TIME_ANNUAL=$(stripe test_helpers test_clocks retrieve "$CLOCK_ID_ANNUAL" \
  --format json 2>/dev/null \
  | grep -o '"frozen_time": [0-9]*' \
  | grep -o '[0-9]*')

# Avanzar 366 días (31,622,400 segundos)
NEW_TIME_ANNUAL=$((CURRENT_TIME_ANNUAL + 31622400))
echo "⏩ Avanzando de $(date -d @$CURRENT_TIME_ANNUAL '+%Y-%m-%d') a $(date -d @$NEW_TIME_ANNUAL '+%Y-%m-%d')"

stripe test_helpers test_clocks advance "$CLOCK_ID_ANNUAL" --frozen-time $NEW_TIME_ANNUAL

echo "⏳ Esperando 20 segundos para que se procese..."
sleep 20

# Verificar estado del clock
stripe test_helpers test_clocks retrieve "$CLOCK_ID_ANNUAL"
```

### 3.3 Verificar Renovación Anual

**En la terminal del servidor (Terminal 2), DEBES VER:**
```
🔔 Webhook received: invoice.payment_succeeded
🔄 ========== RENOVACIÓN DETECTADA ==========
📧 Invoice ID: in_xxxxx
🔖 Billing Reason: subscription_cycle
💰 Amount Paid: 390.0  ← VERIFICAR QUE SEA $390
📧 Customer Email: test-annual@apidevs.io
⏰ Duración: 1Y  ← VERIFICAR QUE DIGA 1Y, NO 30D
✅ AUTO-GRANTED 6 indicators to user_xxxxx
```

**✅ SI VES "⏰ Duración: 1Y", LA RENOVACIÓN ANUAL FUNCIONA CORRECTAMENTE!**

---

## 🧹 LIMPIEZA (Después de las pruebas)

### Eliminar Test Clocks

```bash
# Listar todos los test clocks
stripe test_helpers test_clocks list

# Eliminar los que creamos
stripe test_helpers test_clocks delete $CLOCK_ID
stripe test_helpers test_clocks delete $CLOCK_ID_ANNUAL

echo "✅ Test clocks eliminados"
```

### Limpiar Datos de Prueba (Opcional)

Si quieres limpiar los registros de prueba de Supabase, puedes ejecutar:

```sql
-- En Supabase SQL Editor
DELETE FROM indicator_access_log 
WHERE customer_email LIKE 'test-%@apidevs.io';

DELETE FROM purchases 
WHERE customer_email LIKE 'test-%@apidevs.io';
```

---

## ✅ Checklist de Validación

### Plan Mensual ($39/mes)
- [ ] Suscripción inicial creada
- [ ] Test Clock avanzado 31 días sin errores
- [ ] Webhook `invoice.payment_succeeded` recibido
- [ ] Logs muestran "🔄 RENOVACIÓN DETECTADA"
- [ ] Logs muestran "Billing Reason: subscription_cycle"
- [ ] Duración detectada: 30D
- [ ] Auto-grant ejecutado: 6 indicadores
- [ ] Nueva compra visible en dashboard
- [ ] Badge "Renovación" presente

### Plan Anual ($390/año)
- [ ] Suscripción anual creada
- [ ] Test Clock avanzado 366 días sin errores
- [ ] Webhook recibido con `billing_reason: subscription_cycle`
- [ ] Logs muestran "🔄 RENOVACIÓN DETECTADA"
- [ ] **Duración detectada: 1Y (NO 30D)** ← CRÍTICO
- [ ] Auto-grant ejecutado: 6 indicadores
- [ ] Nueva compra visible en dashboard

---

## 🐛 Troubleshooting

### Problema: Webhooks no se reciben

**Solución:**
1. Verifica que `stripe listen` está corriendo
2. Verifica que el servidor Next.js está en el puerto correcto (3002)
3. Verifica que copiaste bien el `STRIPE_WEBHOOK_SECRET`

### Problema: "Skipping auto-grant for subscription_create"

**Esto es NORMAL para la primera compra.** Solo la RENOVACIÓN (subscription_cycle) debe ejecutar el auto-grant en este test.

### Problema: Test Clock se queda "advancing"

**Solución:** Espera 30-60 segundos más. Stripe puede tardar en procesar Test Clocks con intervalos largos (366 días).

---

## 📊 Resultados Esperados

Al finalizar el testing exitosamente, deberías tener:

1. **2 suscripciones de prueba creadas** (mensual + anual)
2. **2 renovaciones procesadas** (una de cada tipo)
3. **Logs claros** mostrando detección de renovación y auto-grant
4. **Compras registradas** en el dashboard con badge "Renovación"
5. **6 indicadores concedidos** en cada renovación (2 FREE + 4 PREMIUM)
6. **Duraciones correctas:** 30D para mensual, 1Y para anual

---

## 📚 Documentación Relacionada

### **Para la Próxima IA / Desarrollador:**

1. **[STRIPE-CLI-TESTING-QUICK.md](./docs/STRIPE-CLI-TESTING-QUICK.md)**  
   → Scripts listos para copy/paste para testing rápido de renovaciones (mensual y anual)

2. **[FIX-TEMPORAL-MANAGESUBSCRIPTION-TESTCLOCK.md](./docs/FIX-TEMPORAL-MANAGESUBSCRIPTION-TESTCLOCK.md)**  
   → ⚠️ **CRÍTICO** - Fix que permite testing con Test Clock (NO revertir sin documentar)

3. **[PENDIENTE-INDICADORES-FREE-LIFETIME.md](./docs/PENDIENTE-INDICADORES-FREE-LIFETIME.md)**  
   → Problema conocido y solución propuesta para indicadores FREE en renovaciones

4. **[RESUMEN-TESTING-8-OCT-2025.md](./docs/RESUMEN-TESTING-8-OCT-2025.md)**  
   → Resumen ejecutivo completo del testing realizado

5. **Archivos de Código Relevantes:**
   - `app/api/webhooks/route.ts` - Handler de eventos Stripe
   - `utils/tradingview/auto-grant-access.ts` - Lógica de auto-grant
   - `utils/supabase/admin.ts` - Fix crítico en `manageSubscriptionStatusChange()`

---

**¡Buena suerte con las pruebas! 🚀**

Si encuentras algún problema o algo no funciona como se espera, revisa los logs del servidor y compáralos con los outputs esperados en esta guía.

