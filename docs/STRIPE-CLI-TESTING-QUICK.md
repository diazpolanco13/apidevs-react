# Guía Rápida: Testing de Renovaciones con Stripe CLI

## 🎯 Configuración Inicial

### **IMPORTANTE: Deshabilitar webhook de Vercel durante testing local**
```bash
# Listar webhooks
stripe webhook_endpoints list

# Deshabilitar Vercel (evita procesamiento duplicado)
stripe webhook_endpoints update we_1SDYuwBUKmGwbE6IPlxmNICm --disabled

# Reactivar después del testing
stripe webhook_endpoints update we_1SDYuwBUKmGwbE6IPlxmNICm --enabled
```

### **Iniciar Stripe CLI Listener**
```bash
# Terminal 1: Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks

# Copiar el webhook secret y actualizar en Terminal 2
# Terminal 2: Next.js con webhook secret
STRIPE_WEBHOOK_SECRET=whsec_xxx npm run dev
```

---

## 📋 Testing Plan Mensual ($39/mes → 30D)

### **⚠️ Usuario de Prueba - DEBE SER REAL:**

**Requisitos:**
1. Usuario **registrado** en la plataforma (`/register`)
2. Con **TradingView username legítimo** obtenido durante onboarding
3. Verificar en Supabase que existe y tiene `tradingview_username`

**Datos necesarios:**
- Email: `[tu-email-registrado@ejemplo.com]`
- User ID: `[UUID de Supabase]`
- TradingView: `[username_real_tradingview]`
- Price ID: `price_1SDYXpBUKmGwbE6IyejpKBSa`

### **Script Completo (Una Sola Línea):**

**⚠️ ANTES DE EJECUTAR:** Reemplaza `USER_EMAIL`, `USER_ID`, `TV_USERNAME` con tus datos reales del paso anterior.

```bash
# Configurar variables con tus datos reales
USER_EMAIL="tu-email@ejemplo.com"
USER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
TV_USERNAME="tu_username_tradingview"

# Ejecutar script
CLOCK_ID=$(stripe test_helpers test_clocks create --frozen-time $(date +%s) --name "Test Mensual $(date +%H:%M:%S)" 2>/dev/null | grep -o 'clock_[a-zA-Z0-9]*' | head -1) && \
CUSTOMER_ID=$(stripe customers create -d email="$USER_EMAIL" -d name="Test Mensual" -d test_clock="$CLOCK_ID" -d "metadata[user_id]=$USER_ID" -d "metadata[tradingview_username]=$TV_USERNAME" 2>/dev/null | grep -o 'cus_[a-zA-Z0-9]*' | head -1) && \
PM_ID=$(stripe payment_methods create -d type=card -d "card[token]=tok_visa" 2>/dev/null | grep -o 'pm_[a-zA-Z0-9]*' | head -1) && \
stripe payment_methods attach $PM_ID -d customer="$CUSTOMER_ID" > /dev/null 2>&1 && \
SUB_ID=$(stripe subscriptions create -d customer="$CUSTOMER_ID" -d "items[0][price]=price_1SDYXpBUKmGwbE6IyejpKBSa" -d default_payment_method="$PM_ID" 2>/dev/null | grep -o 'sub_[a-zA-Z0-9]*' | head -1) && \
echo "✅ Suscripción creada: $SUB_ID" && \
sleep 15 && \
CURRENT_TIME=$(stripe test_helpers test_clocks retrieve "$CLOCK_ID" 2>/dev/null | grep -o '"frozen_time": [0-9]*' | grep -o '[0-9]*') && \
NEW_TIME=$((CURRENT_TIME + 2678400)) && \
stripe test_helpers test_clocks advance "$CLOCK_ID" --frozen-time $NEW_TIME > /dev/null 2>&1 && \
echo "✅ Clock avanzado 31 días" && \
sleep 20 && \
RENEWAL_INVOICE=$(stripe invoices list --customer "$CUSTOMER_ID" --limit 1 | grep -o 'in_[a-zA-Z0-9]*' | head -1) && \
stripe invoices pay "$RENEWAL_INVOICE" --payment-method "$PM_ID" > /dev/null 2>&1 && \
echo "✅ Renovación pagada: $RENEWAL_INVOICE" && \
sleep 5
```

---

## 📋 Testing Plan Anual ($390/año → 1Y)

### **⚠️ Usuario de Prueba - DEBE SER REAL:**

**Usar el mismo usuario registrado del plan mensual o uno diferente.**

**Datos necesarios:**
- Email: `[tu-email-registrado@ejemplo.com]`
- User ID: `[UUID de Supabase]`
- TradingView: `[username_real_tradingview]`
- Price ID: `price_1SDYXqBUKmGwbE6Iza5zhYSa`

### **Script Completo:**

**⚠️ ANTES DE EJECUTAR:** Configura las variables con tus datos reales.

```bash
# Configurar variables con tus datos reales
USER_EMAIL="tu-email@ejemplo.com"
USER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
TV_USERNAME="tu_username_tradingview"

# Ejecutar script
CLOCK_ID=$(stripe test_helpers test_clocks create --frozen-time $(date +%s) --name "Test Anual $(date +%H:%M:%S)" 2>/dev/null | grep -o 'clock_[a-zA-Z0-9]*' | head -1) && \
CUSTOMER_ID=$(stripe customers create -d email="$USER_EMAIL" -d name="Test Anual" -d test_clock="$CLOCK_ID" -d "metadata[user_id]=$USER_ID" -d "metadata[tradingview_username]=$TV_USERNAME" 2>/dev/null | grep -o 'cus_[a-zA-Z0-9]*' | head -1) && \
PM_ID=$(stripe payment_methods create -d type=card -d "card[token]=tok_visa" 2>/dev/null | grep -o 'pm_[a-zA-Z0-9]*' | head -1) && \
stripe payment_methods attach $PM_ID -d customer="$CUSTOMER_ID" > /dev/null 2>&1 && \
SUB_ID=$(stripe subscriptions create -d customer="$CUSTOMER_ID" -d "items[0][price]=price_1SDYXqBUKmGwbE6Iza5zhYSa" -d default_payment_method="$PM_ID" 2>/dev/null | grep -o 'sub_[a-zA-Z0-9]*' | head -1) && \
echo "✅ Suscripción anual creada: $SUB_ID" && \
sleep 15 && \
CURRENT_TIME=$(stripe test_helpers test_clocks retrieve "$CLOCK_ID" 2>/dev/null | grep -o '"frozen_time": [0-9]*' | grep -o '[0-9]*') && \
NEW_TIME=$((CURRENT_TIME + 31622400)) && \
stripe test_helpers test_clocks advance "$CLOCK_ID" --frozen-time $NEW_TIME > /dev/null 2>&1 && \
echo "✅ Clock avanzado 366 días" && \
sleep 20 && \
RENEWAL_INVOICE=$(stripe invoices list --customer "$CUSTOMER_ID" --limit 1 | grep -o 'in_[a-zA-Z0-9]*' | head -1) && \
stripe invoices pay "$RENEWAL_INVOICE" --payment-method "$PM_ID" > /dev/null 2>&1 && \
echo "✅ Renovación anual pagada: $RENEWAL_INVOICE" && \
sleep 5
```

---

## ✅ Verificación de Resultados

### **Verificar registros en BD:**
```bash
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  const { data: logs } = await supabase
    .from('indicator_access_log')
    .select('duration_type')
    .eq('user_id', '6b89d9ba-fbac-4883-a773-befe02e47713')
    .gte('created_at', new Date(Date.now() - 300000).toISOString())
    .order('created_at', { ascending: false });
  
  const grouped = {};
  logs?.forEach(log => {
    grouped[log.duration_type] = (grouped[log.duration_type] || 0) + 1;
  });
  
  console.log('📊 Últimos registros (5 min):');
  Object.entries(grouped).forEach(([dur, count]) => {
    console.log(\`  - \${dur}: \${count} registros\`);
  });
})();
"
```

### **Resultado Esperado:**
- **Plan Mensual**: 6 registros con `30D`, 0 con `1Y`
- **Plan Anual**: 6 registros con `1Y`, 0 con `30D`

---

## 🧹 Limpieza (Después de Testing)

```bash
# Revocar accesos
npx tsx -e "
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  const userId = '6b89d9ba-fbac-4883-a773-befe02e47713';
  await supabase.from('indicator_access').delete().eq('user_id', userId);
  console.log('✅ Accesos revocados');
})();
"

# Limpiar Test Clocks
stripe test_helpers test_clocks list | grep -o 'clock_[a-zA-Z0-9]*' | xargs -I {} stripe test_helpers test_clocks delete {}
```

---

## ⚠️ Problemas Conocidos

### **Duplicados en Logs**
**Causa**: Vercel y Local procesando los mismos webhooks.
**Solución**: Deshabilitar webhook de Vercel durante testing local.

### **Indicadores FREE con duración temporal**
**Pendiente**: Los indicadores FREE deberían mantenerse lifetime (`1L`) en renovaciones, no heredar la duración del plan (`30D` o `1Y`).

---

## 📦 IDs de Productos Stripe

- **Producto PRO**: `prod_T9sIrlhYUtHPT3`
  - Mensual: `price_1SDYXpBUKmGwbE6IyejpKBSa` ($39/mes → 30D)
  - Anual: `price_1SDYXqBUKmGwbE6Iza5zhYSa` ($390/año → 1Y)

