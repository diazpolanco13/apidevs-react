# 🎯 Guía Completa: Testing de Compras y Renovaciones con Stripe CLI

Esta guía explica cómo configurar y usar Stripe CLI para probar webhooks, compras y renovaciones automáticas en un entorno de desarrollo local.

---

## 📋 **Tabla de Contenidos**

1. [Prerrequisitos](#prerrequisitos)
2. [Instalación de Stripe CLI](#instalación-de-stripe-cli)
3. [Configuración Inicial](#configuración-inicial)
4. [Testing de Webhooks Locales](#testing-de-webhooks-locales)
5. [Simulación de Renovaciones con Test Clocks](#simulación-de-renovaciones-con-test-clocks)
6. [Comandos Útiles](#comandos-útiles)
7. [Troubleshooting](#troubleshooting)

---

## 📦 **Prerrequisitos**

- ✅ Cuenta de Stripe (modo Test)
- ✅ Node.js y npm instalados
- ✅ Proyecto Next.js con webhook configurado
- ✅ Acceso a terminal/consola

---

## 🔧 **Instalación de Stripe CLI**

### **Linux (Ubuntu/Debian)**
```bash
# Descargar e instalar
wget -qO- https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe
```

### **macOS**
```bash
brew install stripe/stripe-cli/stripe
```

### **Windows**
```powershell
# Usando Scoop
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

### **Verificar Instalación**
```bash
stripe --version
# Output: stripe version 1.x.x
```

---

## 🔐 **Configuración Inicial**

### **1. Autenticar con Stripe**

```bash
stripe login
```

Esto abrirá tu navegador para autorizar el CLI. Presiona **Allow access** en el navegador.

**Output esperado:**
```
Your pairing code is: word-word-word
This pairing code verifies your authentication with Stripe.
Press Enter to open the browser or visit https://dashboard.stripe.com/stripecli/confirm_auth?t=xxxxx

Done! The Stripe CLI is configured for Account with account id acct_xxxxx
```

### **2. Verificar Configuración**

```bash
# Ver cuenta actual
stripe config --list

# Listar productos de prueba
stripe products list --limit 3
```

---

## 🎯 **Testing de Webhooks Locales**

### **Paso 1: Iniciar tu Servidor Next.js**

```bash
cd /ruta/a/tu/proyecto
npm run dev
```

**Output esperado:**
```
▲ Next.js 14.2.3
- Local:        http://localhost:3000
- ready in 2.1s
```

> **Nota:** Verifica en qué puerto corre tu servidor (puede ser 3000, 3001, 3002, etc.)

---

### **Paso 2: Iniciar Stripe Listen**

En una **nueva terminal**, ejecuta:

```bash
stripe listen --forward-to localhost:3000/api/webhooks
```

> **IMPORTANTE:** Reemplaza `3000` con el puerto donde corre tu servidor.

**Output esperado:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (^C to quit)

2025-10-08 20:30:15   --> customer.created [evt_xxxxx]
2025-10-08 20:30:15  <--  [200] POST http://localhost:3000/api/webhooks [evt_xxxxx]
```

**⚠️ CRÍTICO:** Copia el `webhook signing secret` (empieza con `whsec_`).

---

### **Paso 3: Configurar el Webhook Secret**

Detén tu servidor Next.js (Ctrl+C) y reinícialo con el webhook secret:

```bash
cd /ruta/a/tu/proyecto
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx npm run dev
```

**O bien, agrégalo a tu `.env.local`:**

```env
# .env.local
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Y reinicia el servidor:
```bash
npm run dev
```

---

### **Paso 4: Probar un Webhook**

En una **tercera terminal**, dispara un evento de prueba:

```bash
stripe trigger payment_intent.succeeded
```

**Verificación:**
- ✅ En la terminal de `stripe listen`: `<-- [200] POST`
- ✅ En la terminal de `npm run dev`: logs del webhook procesado
- ✅ Sin errores 400 o 401

---

## 🔄 **Simulación de Renovaciones con Test Clocks**

Los **Test Clocks** permiten simular el paso del tiempo para probar renovaciones automáticas sin esperar 1 mes real.

### **Paso 1: Crear un Test Clock**

```bash
stripe test_helpers test_clocks create \
  --frozen-time $(date +%s) \
  --name "Test Renovación Usuario"
```

**Output:**
```json
{
  "id": "clock_xxxxxxxxxxxxxx",
  "object": "test_helpers.test_clock",
  "frozen_time": 1759954570,
  "status": "ready",
  ...
}
```

**Guarda el `clock_id`** (empieza con `clock_`).

---

### **Paso 2: Crear un Customer con Test Clock**

```bash
stripe customers create \
  -d email="test-renewal@test.com" \
  -d name="Test Renewal User" \
  -d test_clock="clock_xxxxxxxxxxxxxx" \
  -d "metadata[user_id]=uuid-del-usuario" \
  -d "metadata[tradingview_username]=TestUser"
```

**Output:**
```json
{
  "id": "cus_xxxxxxxxxxxxxx",
  "email": "test-renewal@test.com",
  "test_clock": "clock_xxxxxxxxxxxxxx",
  ...
}
```

**Guarda el `customer_id`** (empieza con `cus_`).

---

### **Paso 3: Agregar Método de Pago al Customer**

```bash
# Adjuntar tarjeta de prueba
stripe payment_methods attach pm_card_visa -d customer=cus_xxxxxxxxxxxxxx

# Verificar que se adjuntó
stripe payment_methods list -d customer=cus_xxxxxxxxxxxxxx --limit 1
```

---

### **Paso 4: Crear una Suscripción**

```bash
# Primero, obtén el price_id de tu producto PRO mensual
stripe prices list --limit 5

# Luego, crea la suscripción
stripe subscriptions create \
  -d customer=cus_xxxxxxxxxxxxxx \
  -d "items[0][price]=price_xxxxxxxxxxxxxx" \
  -d default_payment_method=pm_card_visa
```

**Output:**
```json
{
  "id": "sub_xxxxxxxxxxxxxx",
  "customer": "cus_xxxxxxxxxxxxxx",
  "status": "active",
  "current_period_end": 1762632970,
  ...
}
```

**Verificación:**
- ✅ En `stripe listen`: evento `invoice.payment_succeeded`
- ✅ En `npm run dev`: logs de "RENOVACIÓN DETECTADA" o "AUTO-GRANT"
- ✅ En tu dashboard: nueva compra registrada

---

### **Paso 5: Avanzar el Test Clock (Simular Renovación)**

```bash
# Avanzar 31 días (2678400 segundos)
stripe test_helpers test_clocks advance clock_xxxxxxxxxxxxxx \
  --frozen-time $((CURRENT_TIME + 2678400))
```

> **Nota:** Reemplaza `CURRENT_TIME` con el `frozen_time` actual del clock.

**Método automático:**
```bash
# Obtener el frozen_time actual
CURRENT_TIME=$(stripe test_helpers test_clocks retrieve clock_xxxxxxxxxxxxxx | grep -o '"frozen_time": [0-9]*' | grep -o '[0-9]*')

# Avanzar 31 días
stripe test_helpers test_clocks advance clock_xxxxxxxxxxxxxx \
  --frozen-time $((CURRENT_TIME + 2678400))
```

**Esperar a que termine:**
```bash
# Verificar status
stripe test_helpers test_clocks retrieve clock_xxxxxxxxxxxxxx

# Status debe ser "ready" cuando termine
```

**Verificación:**
- ✅ En `stripe listen`: nuevo evento `invoice.payment_succeeded` con `billing_reason: subscription_cycle`
- ✅ En `npm run dev`: logs de "🔄 RENOVACIÓN DETECTADA"
- ✅ En tu dashboard: nueva compra con badge "Renovación"
- ✅ Indicadores concedidos automáticamente

---

## 📚 **Comandos Útiles**

### **Ver Eventos Recientes**
```bash
# Últimos 10 eventos
stripe events list --limit 10

# Solo eventos de invoice.payment_succeeded
stripe events list --limit 5 --type "invoice.payment_succeeded"
```

### **Ver Subscriptions**
```bash
# Listar subscriptions de un customer
stripe subscriptions list --customer cus_xxxxxxxxxxxxxx

# Ver detalles de una subscription
stripe subscriptions retrieve sub_xxxxxxxxxxxxxx
```

### **Ver Invoices**
```bash
# Últimas 5 invoices
stripe invoices list --limit 5

# Invoices de un customer específico
stripe invoices list --customer cus_xxxxxxxxxxxxxx --limit 10
```

### **Ver Test Clocks**
```bash
# Listar todos los test clocks
stripe test_helpers test_clocks list

# Ver detalles de un test clock
stripe test_helpers test_clocks retrieve clock_xxxxxxxxxxxxxx

# Eliminar un test clock
stripe test_helpers test_clocks delete clock_xxxxxxxxxxxxxx
```

### **Simular Eventos Manualmente**
```bash
# Disparar eventos de prueba
stripe trigger payment_intent.succeeded
stripe trigger invoice.payment_succeeded
stripe trigger customer.subscription.created
stripe trigger checkout.session.completed
```

### **Ver Productos y Precios**
```bash
# Listar productos
stripe products list --limit 10

# Listar precios de un producto
stripe prices list --product prod_xxxxxxxxxxxxxx

# Ver detalles de un precio
stripe prices retrieve price_xxxxxxxxxxxxxx
```

---

## 🔍 **Troubleshooting**

### **Problema 1: Webhooks retornan 400**

**Síntoma:**
```
2025-10-08 20:30:15  <--  [400] POST http://localhost:3000/api/webhooks
```

**Solución:**
1. Verifica que `STRIPE_WEBHOOK_SECRET` está correctamente configurado
2. Reinicia el servidor con el secret correcto:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxx npm run dev
   ```

---

### **Problema 2: Renovaciones no se disparan**

**Síntoma:**
- El Test Clock avanza pero no ves eventos en `stripe listen`

**Causa:**
- `stripe listen` NO está corriendo

**Solución:**
1. Verifica que `stripe listen` está activo en una terminal separada
2. Verifica que está forwarding al puerto correcto:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks
   ```

---

### **Problema 3: Duplicación de indicadores**

**Síntoma:**
- Se conceden indicadores duplicados (6 + 6 = 12 en lugar de 6)

**Causa:**
- Múltiples eventos de Stripe disparan el auto-grant
- El servidor se reinició y perdió el estado de deduplicación en memoria

**Solución:**
- ✅ **Ya implementado:** Sistema de deduplicación persistente en BD (tabla `auto_grant_log`)
- La deduplicación sobrevive reinicios del servidor
- Verifica en logs: `⏭️ Skipping duplicate auto-grant...`

---

### **Problema 4: Eventos muy antiguos se siguen procesando**

**Síntoma:**
```
2025-10-08 20:30:15   --> invoice.payment_succeeded [evt_xxxxx]
# Evento de hace 2 horas
```

**Causa:**
- Stripe reenvía eventos antiguos cuando inicias `stripe listen`

**Solución:**
- Es normal, ignora los eventos antiguos
- Solo presta atención a eventos nuevos después de iniciar `stripe listen`

---

### **Problema 5: Test Clock se queda "advancing"**

**Síntoma:**
```json
{
  "status": "advancing",
  "status_details": {
    "advancing": {
      "target_frozen_time": 1762632970
    }
  }
}
```

**Solución:**
- Espera 10-15 segundos más
- Verifica el status nuevamente:
  ```bash
  stripe test_helpers test_clocks retrieve clock_xxxxxxxxxxxxxx
  ```
- Si sigue "advancing" después de 30 segundos, puede haber un error. Crea un nuevo Test Clock.

---

## ✅ **Checklist de Verificación Completa**

Antes de probar renovaciones, verifica:

- [ ] `npm run dev` está corriendo
- [ ] `stripe listen` está corriendo en otra terminal
- [ ] `STRIPE_WEBHOOK_SECRET` está configurado correctamente
- [ ] Ves eventos en `stripe listen` con status `[200]`
- [ ] El customer tiene `test_clock` asociado
- [ ] La subscription tiene `test_clock` asociado
- [ ] El Test Clock está en status `ready`

---

## 📊 **Flujo Completo: De Principio a Fin**

### **Terminal 1: Servidor Next.js**
```bash
cd /home/ea22/proyectos/apidevs-react
STRIPE_WEBHOOK_SECRET=whsec_xxxxxx npm run dev
```

### **Terminal 2: Stripe Listen**
```bash
stripe listen --forward-to localhost:3002/api/webhooks
```

### **Terminal 3: Comandos Stripe**
```bash
# 1. Crear Test Clock
CLOCK_ID=$(stripe test_helpers test_clocks create --frozen-time $(date +%s) --name "Test" | grep -o 'clock_[a-zA-Z0-9]*' | head -1)
echo "Clock ID: $CLOCK_ID"

# 2. Crear Customer
CUSTOMER_ID=$(stripe customers create -d email="test@test.com" -d name="Test User" -d test_clock="$CLOCK_ID" | grep -o 'cus_[a-zA-Z0-9]*' | head -1)
echo "Customer ID: $CUSTOMER_ID"

# 3. Adjuntar método de pago
stripe payment_methods attach pm_card_visa -d customer="$CUSTOMER_ID"

# 4. Crear Subscription (reemplaza PRICE_ID con tu precio real)
PRICE_ID="price_xxxxxxxxxxxxxx"
SUB_ID=$(stripe subscriptions create -d customer="$CUSTOMER_ID" -d "items[0][price]=$PRICE_ID" -d default_payment_method=pm_card_visa | grep -o 'sub_[a-zA-Z0-9]*' | head -1)
echo "Subscription ID: $SUB_ID"

# 5. Esperar 10 segundos para que se procese el checkout
sleep 10

# 6. Avanzar 31 días
CURRENT_TIME=$(stripe test_helpers test_clocks retrieve "$CLOCK_ID" | grep -o '"frozen_time": [0-9]*' | grep -o '[0-9]*')
stripe test_helpers test_clocks advance "$CLOCK_ID" --frozen-time $((CURRENT_TIME + 2678400))

# 7. Esperar a que termine
sleep 15

# 8. Verificar que completó
stripe test_helpers test_clocks retrieve "$CLOCK_ID"
```

---

## 🎓 **Notas para IA/Desarrolladores**

### **Conceptos Clave:**

1. **Test Clock**: Herramienta de Stripe para simular el paso del tiempo sin esperar 30 días reales
2. **stripe listen**: Forwardea webhooks de Stripe a tu localhost
3. **Webhook Secret**: Token de seguridad que valida que los webhooks vienen de Stripe
4. **billing_reason**: 
   - `subscription_create`: Primera compra (checkout)
   - `subscription_cycle`: Renovación automática mensual/anual
   - `subscription_update`: Cambio en la suscripción

### **Errores Comunes a Evitar:**

- ❌ NO usar subscriptions sin Test Clock para probar renovaciones
- ❌ NO avanzar el Test Clock si `stripe listen` no está corriendo
- ❌ NO reiniciar el servidor sin configurar `STRIPE_WEBHOOK_SECRET`
- ❌ NO usar el mismo Test Clock para múltiples usuarios de prueba

### **Best Practices:**

- ✅ Crear un Test Clock nuevo para cada prueba completa
- ✅ Usar emails únicos para cada customer de prueba
- ✅ Verificar logs en ambas terminales (`stripe listen` y `npm run dev`)
- ✅ Limpiar Test Clocks antiguos después de las pruebas
- ✅ Documentar los IDs de recursos creados durante las pruebas

---

## 🔗 **Referencias Útiles**

- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Test Clocks Guide](https://stripe.com/docs/billing/testing/test-clocks)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
- [Stripe Events Reference](https://stripe.com/docs/api/events/types)

---

## 📝 **Historial de Cambios**

- **2025-10-08**: Guía inicial creada
- **2025-10-08**: Agregada sección de deduplicación persistente
- **2025-10-08**: Agregado flujo completo automatizado

---

**¿Preguntas o problemas?** Revisa la sección de [Troubleshooting](#troubleshooting) o consulta los logs de `stripe listen` y `npm run dev` para más detalles.

