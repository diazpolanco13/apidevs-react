# 🚀 Ejecutar Testing de Renovaciones - SIMPLIFICADO

## ⚡ OPCIÓN RÁPIDA: Scripts Automatizados

He creado scripts que automatizan todo el proceso. Solo necesitas:

### 1️⃣ Preparación (Una sola vez)

**Terminal 1 - Stripe Listen:**
```bash
stripe listen --forward-to localhost:3002/api/webhooks
```
**📝 Copia el webhook secret que aparece**

**Terminal 2 - Servidor:**
```bash
cd /home/ea22/proyectos/apidevs-react
STRIPE_WEBHOOK_SECRET=whsec_xxxxx npm run dev
```
(Reemplaza `whsec_xxxxx` con el secret que copiaste)

---

### 2️⃣ Testing Plan Mensual (Terminal 3)

```bash
cd /home/ea22/proyectos/apidevs-react
./.testing-temp/run-monthly-test.sh
```

Este script automáticamente:
- ✅ Crea Test Clock
- ✅ Crea Customer con metadata
- ✅ Adjunta método de pago
- ✅ Crea suscripción mensual ($39/mes)
- ✅ Avanza 31 días
- ✅ Espera a que se procese la renovación

**⏱️ Duración:** ~40 segundos

**Qué verificar en Terminal 2 (servidor):**
```
🔄 ========== RENOVACIÓN DETECTADA ==========
⏰ Duración: 30D
✅ AUTO-GRANTED 6 indicators
```

---

### 3️⃣ Verificar Resultados

```bash
npx tsx .testing-temp/verify-renewal-results.ts
```

Este script muestra:
- 📋 Registros en `indicator_access_log`
- 💰 Compras registradas
- ✅ Resumen de validación

---

### 4️⃣ Testing Plan Anual (Terminal 3)

```bash
./.testing-temp/run-annual-test.sh
```

Este script automáticamente:
- ✅ Crea Test Clock anual
- ✅ Crea Customer con metadata
- ✅ Adjunta método de pago
- ✅ Crea suscripción anual ($390/año)
- ✅ Avanza 366 días
- ✅ Espera a que se procese la renovación

**⏱️ Duración:** ~45 segundos

**Qué verificar en Terminal 2 (servidor):**
```
🔄 ========== RENOVACIÓN DETECTADA ==========
⏰ Duración: 1Y  ← DEBE SER 1Y, NO 30D!
✅ AUTO-GRANTED 6 indicators
```

---

### 5️⃣ Verificar Resultados Nuevamente

```bash
npx tsx .testing-temp/verify-renewal-results.ts
```

---

### 6️⃣ Limpieza (Después de las pruebas)

```bash
# Listar Test Clocks creados
stripe test_helpers test_clocks list

# Eliminar cada uno (reemplaza con IDs reales que te dieron los scripts)
stripe test_helpers test_clocks delete clock_xxxxx
stripe test_helpers test_clocks delete clock_yyyyy
```

---

## 🎯 Checklist Rápido

### Plan Mensual
- [ ] Script ejecutado sin errores
- [ ] Logs muestran "RENOVACIÓN DETECTADA" con `30D`
- [ ] Script de verificación confirma 2 registros en log
- [ ] Dashboard muestra compra con badge "Renovación"

### Plan Anual
- [ ] Script ejecutado sin errores
- [ ] Logs muestran "RENOVACIÓN DETECTADA" con `1Y` (NO 30D)
- [ ] Script de verificación confirma 2 registros en log
- [ ] Dashboard muestra compra de renovación anual

---

## 🐛 Si algo falla

1. **"Error: No se pudo crear el Test Clock"**
   - Verifica que `stripe listen` está corriendo
   - Verifica que estás autenticado: `stripe config --list`

2. **"No se ve la renovación en logs"**
   - Espera 30 segundos más después del script
   - Verifica que el servidor está corriendo
   - Verifica que el `STRIPE_WEBHOOK_SECRET` es correcto

3. **"Duración es 30D en lugar de 1Y para el plan anual"**
   - 🚨 Hay un bug en el código
   - Revisar `utils/tradingview/auto-grant-access.ts`
   - La función `getDurationFromPrice()` no está detectando bien el interval

---

## 📊 Resultados Esperados

Al finalizar ambos tests:

- ✅ 4 registros en `indicator_access_log`:
  - 2 para `test-monthly@apidevs.io` (checkout + renewal 30D)
  - 2 para `test-annual@apidevs.io` (checkout + renewal 1Y)

- ✅ 4 compras en dashboard:
  - 2 para plan mensual
  - 2 para plan anual

- ✅ Logs claros mostrando cada renovación

- ✅ 6 indicadores concedidos en cada renovación (2 FREE + 4 PREMIUM)

---

**¡Listo para ejecutar! 🚀**

Los scripts están en:
- `.testing-temp/run-monthly-test.sh`
- `.testing-temp/run-annual-test.sh`
- `.testing-temp/verify-renewal-results.ts`

