# 🚫 TIPOS DE CANCELACIÓN DE SUSCRIPCIONES

## 📋 **RESUMEN EJECUTIVO**

Existen **DOS TIPOS** de cancelación de suscripciones, cada uno con propósitos y consecuencias diferentes:

---

## 1️⃣ **CANCELACIÓN AL FINAL DEL PERÍODO** ✅ (Recomendado)

### **Uso:**
- Cancelaciones normales por parte del usuario
- Cuando el usuario decide no renovar
- Situaciones donde el usuario pagó y merece su tiempo completo

### **Comportamiento:**
```
✅ Usuario MANTIENE acceso hasta el final del período pagado
✅ Si pagó por 1 mes, tiene 1 mes completo de acceso
✅ Al llegar la fecha de renovación, NO se cobra
✅ Suscripción pasa a status "canceled" automáticamente
✅ Stripe maneja todo automáticamente
```

### **Stripe:**
```typescript
stripe.subscriptions.update(subscriptionId, {
  cancel_at_period_end: true
});
```

### **Base de Datos:**
```sql
UPDATE subscriptions 
SET cancel_at_period_end = true,
    cancel_reason = 'Canceled by user'
WHERE id = subscriptionId;

-- El status se mantiene como 'active' hasta la fecha
```

### **Ejemplo:**
```
Usuario compra el 1 de Enero por $99/mes
Usuario cancela el 15 de Enero
→ Mantiene acceso hasta el 31 de Enero
→ El 1 de Febrero: NO se cobra, status → 'canceled'
```

---

## 2️⃣ **CANCELACIÓN INMEDIATA** ⚠️ (Solo casos graves)

### **Uso:**
- Fraude detectado
- Violación grave de términos de servicio
- Abuso del sistema
- Chargeback / disputa
- Solicitud urgente de reembolso

### **Comportamiento:**
```
⚠️ Usuario PIERDE acceso INMEDIATAMENTE
❌ No importa cuánto tiempo pagó
❌ Acceso revocado ahora mismo
❌ Suscripción pasa a status "canceled" al instante
❌ No hay vuelta atrás
```

### **Stripe:**
```typescript
stripe.subscriptions.cancel(subscriptionId, {
  invoice_now: false,
  prorate: false
});
```

### **Base de Datos:**
```sql
UPDATE subscriptions 
SET status = 'canceled',
    canceled_at = NOW(),
    cancel_reason = 'Canceled by admin'
WHERE id = subscriptionId;
```

### **Ejemplo:**
```
Usuario compra el 1 de Enero por $99/mes
Admin detecta fraude el 15 de Enero
→ Admin cancela INMEDIATAMENTE
→ Usuario pierde acceso el 15 de Enero
→ Sin reembolso (a menos que se procese manualmente)
```

---

## 🎯 **COMPARACIÓN DIRECTA**

| Aspecto | Al Final del Período | Inmediata |
|---------|---------------------|-----------|
| **Acceso** | Mantiene hasta vencimiento | Pierde AHORA |
| **Uso típico** | Usuario cancela | Admin por fraude |
| **Stripe API** | `update()` + `cancel_at_period_end: true` | `cancel()` |
| **Status DB** | Permanece 'active' | Pasa a 'canceled' |
| **Reembolso** | No aplica (tuvo su tiempo) | Considerar reembolso manual |
| **Reversible** | Sí (hasta la fecha límite) | No |
| **Experiencia usuario** | Justa y profesional | Abrupta |

---

## 🔌 **IMPLEMENTACIÓN EN APIDEVS**

### **Endpoint Admin:**
```
POST /api/admin/cancel-subscription

Body:
{
  "subscriptionId": "sub_xxx",
  "reason": "Motivo opcional",
  "cancelType": "end_of_period" | "immediate"
}
```

### **Endpoint Usuario:**
```
POST /api/user/cancel-subscription

Body:
{
  "subscriptionId": "sub_xxx"
}

→ SIEMPRE usa cancel_at_period_end: true
```

---

## 🧠 **LÓGICA DE DECISIÓN PARA ADMINS**

```
¿Es fraude, violación grave o abuso?
├─ SÍ → Cancelación INMEDIATA
│         + Considerar reembolso si aplica
│         + Bloquear cuenta si es necesario
│
└─ NO → Cancelación AL FINAL DEL PERÍODO
          → Usuario merece su tiempo pagado
          → Experiencia profesional
          → Evita disputas innecesarias
```

---

## 📊 **WEBHOOKS DE STRIPE**

### **Eventos a escuchar:**

```typescript
// Cuando se programa cancelación
'customer.subscription.updated'
  → event.data.object.cancel_at_period_end === true

// Cuando se ejecuta la cancelación
'customer.subscription.deleted'
  → Suscripción finalmente cancelada
  → Actualizar status en DB
  → Revocar accesos
```

---

## ✅ **MEJORES PRÁCTICAS**

1. **Default: AL FINAL DEL PERÍODO**
   - Siempre que sea posible
   - Mejor experiencia de usuario
   - Evita quejas y disputas

2. **Inmediata: Solo casos justificados**
   - Documentar siempre la razón
   - Considerar reembolso proporcional
   - Comunicar al usuario por email

3. **Cancelación por usuario**
   - NUNCA usar cancelación inmediata
   - Siempre `cancel_at_period_end: true`
   - Enviar email de confirmación

4. **Monitoreo**
   - Trackear tipo de cancelación
   - Analizar razones
   - Métricas de churn

---

## 🔧 **TROUBLESHOOTING**

### **"Usuario no debería tener acceso pero lo tiene"**
```
→ Verificar cancel_at_period_end en Stripe
→ Verificar current_period_end
→ Si está antes de esa fecha, es correcto
```

### **"Usuario perdió acceso antes de tiempo"**
```
→ Verificar si se usó cancelación inmediata por error
→ Reactivar suscripción si fue error:
   stripe.subscriptions.update(id, { cancel_at_period_end: false })
```

### **"No se ejecutó la cancelación programada"**
```
→ Verificar webhooks de Stripe
→ Verificar customer.subscription.deleted
→ Ejecutar sync manual si es necesario
```

---

## 📝 **LOGS PARA DEBUGGING**

```typescript
console.log('Cancelación:', {
  type: cancelType,
  subscription_id: subscriptionId,
  current_period_end: subscription.current_period_end,
  cancel_at_period_end: subscription.cancel_at_period_end,
  status: subscription.status,
  user_retains_access: cancelType === 'end_of_period'
});
```

---

## 🎓 **RESUMEN PARA SOPORTE AL CLIENTE**

**Si un usuario cancela:**
- Mantiene acceso completo hasta la fecha de renovación
- No se le cobrará en la próxima fecha
- Puede reactivar en cualquier momento antes de la fecha límite

**Si el admin cancela (al final del período):**
- Mismo comportamiento que cancelación de usuario
- Usado para casos normales

**Si el admin cancela (inmediata):**
- Pierde acceso inmediatamente
- Solo para casos graves (fraude, violación, etc.)
- Considerar reembolso según el caso

---

## 🔗 **REFERENCIAS**

- [Stripe Subscriptions API](https://stripe.com/docs/api/subscriptions)
- [Stripe Cancel at Period End](https://stripe.com/docs/billing/subscriptions/cancel#cancel-at-period-end)
- [Stripe Subscription Lifecycle](https://stripe.com/docs/billing/subscriptions/overview#subscription-lifecycle)

---

**Fecha de creación:** 1 de Octubre, 2025  
**Última actualización:** 1 de Octubre, 2025  
**Autor:** APIDevs Development Team

