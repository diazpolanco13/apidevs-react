# 📚 Documentación del Proyecto - APIDevs Trading

## 🎯 Punto de Entrada para la Próxima IA

**¿Primera vez trabajando en este proyecto?** Empieza aquí:

### **1. Lee PRIMERO:**
📄 **[RESUMEN-TESTING-8-OCT-2025.md](./RESUMEN-TESTING-8-OCT-2025.md)**  
→ Resumen ejecutivo del último trabajo realizado (8 Oct 2025)

---

## 🔥 Documentos Críticos (LEER ANTES DE TOCAR CÓDIGO)

### **⚠️ FIXES QUE NO SE DEBEN REVERTIR:**

1. **[FIX-TEMPORAL-MANAGESUBSCRIPTION-TESTCLOCK.md](./FIX-TEMPORAL-MANAGESUBSCRIPTION-TESTCLOCK.md)**  
   **Criticidad:** 🔴 ALTA  
   **Qué hace:** Permite testing con Stripe Test Clock  
   **Archivo afectado:** `utils/supabase/admin.ts`  
   **NO REVERTIR** sin documentar y tener una alternativa funcional

2. **[FIX-RATE-LIMIT-AUTH.md](./FIX-RATE-LIMIT-AUTH.md)**  
   **Criticidad:** 🔴 ALTA  
   **Qué hace:** Previene rate limiting (429) en páginas de admin  
   **Archivo afectado:** `app/admin/layout.tsx`  
   **NO REVERTIR** sin implementar otra solución de caché

---

## 📋 Guías de Testing

### **Testing de Renovaciones:**

1. **[STRIPE-CLI-TESTING-QUICK.md](./STRIPE-CLI-TESTING-QUICK.md)**  
   → Scripts listos para copy/paste (plan mensual y anual)

2. **[INSTRUCCIONES-TESTING-RENOVACIONES.md](../INSTRUCCIONES-TESTING-RENOVACIONES.md)**  
   → Guía paso a paso completa con troubleshooting

### **⚠️ IMPORTANTE para Testing:**

**SIEMPRE usar usuarios registrados legítimamente:**
- ✅ Registrados en `/register`
- ✅ Con TradingView username real verificado en onboarding
- ✅ Existentes en tabla `users` de Supabase
- ❌ NO usar datos hardcodeados o usuarios ficticios

**Script helper para obtener datos de usuario:**
```bash
npx tsx .testing-temp/get-user-data.ts usuario@ejemplo.com
```

---

## ⚠️ Problemas Conocidos / Pendientes

### **Alta Prioridad:**

1. **[PENDIENTE-INDICADORES-FREE-LIFETIME.md](./PENDIENTE-INDICADORES-FREE-LIFETIME.md)**  
   **Problema:** Indicadores FREE heredan duración del plan en renovaciones  
   **Esperado:** FREE siempre debe ser lifetime (`1L`)  
   **Impacto:** MEDIO - Usuarios pierden acceso FREE tras expiración del plan PRO

---

## 📁 Estructura de Documentación (Simplificada)

```
docs/
├── README.md                                    ← Estás aquí (índice principal)
├── RESUMEN-TESTING-8-OCT-2025.md               ← Resumen ejecutivo completo
├── STRIPE-CLI-TESTING-QUICK.md                 ← Scripts listos para usar
├── FIX-TEMPORAL-MANAGESUBSCRIPTION-TESTCLOCK.md ← ⚠️ Fix crítico (NO revertir)
└── PENDIENTE-INDICADORES-FREE-LIFETIME.md       ← Problema pendiente

Raíz del proyecto:
└── INSTRUCCIONES-TESTING-RENOVACIONES.md        ← Guía completa paso a paso
```

**Total:** 6 archivos (vs. 12 anteriores) ✨

---

## 🚀 Estado del Proyecto (8 Oct 2025)

### ✅ **Funcionalidades Implementadas y Testeadas:**
- ✅ Auto-grant de indicadores en compras iniciales
- ✅ Auto-grant en renovaciones automáticas (mensual y anual)
- ✅ Sistema de duración por plan (30D, 1Y, 1L)
- ✅ Testing con Stripe CLI y Test Clocks

### 🔄 **En Desarrollo:**
- Ninguno actualmente

### ⚠️ **Pendientes:**
- Indicadores FREE con lifetime en renovaciones (ver doc correspondiente)

---

## 🛠️ Archivos de Código Principales

### **Webhooks y Auto-Grant:**
- `app/api/webhooks/route.ts` - Handler principal de eventos Stripe
- `utils/tradingview/auto-grant-access.ts` - Lógica de concesión automática
- `utils/supabase/admin.ts` - Helpers Supabase (contiene fix crítico)

### **Componentes Admin:**
- `components/admin/indicators/HistorialTab.tsx` - Historial de accesos
- `components/admin/compras/` - Dashboard de compras

---

## 📊 IDs de Stripe (Producción)

### **Producto PRO:**
- **ID:** `prod_T9sIrlhYUtHPT3`
- **Precio Mensual:** `price_1SDYXpBUKmGwbE6IyejpKBSa` ($39/mes → 30D)
- **Precio Anual:** `price_1SDYXqBUKmGwbE6Iza5zhYSa` ($390/año → 1Y)

### **Webhook Endpoint:**
- **ID:** `we_1SDYuwBUKmGwbE6IPlxmNICm`
- **URL:** `https://apidevs-react.vercel.app/api/webhooks`
- **Nota:** Deshabilitar durante testing local

---

## 🎓 Lecciones Aprendidas

1. **Múltiples webhooks** (Vercel + Local) causan duplicación → Deshabilitar uno durante testing
2. **Test Clock customers** no se sincronizan a Supabase → Ver fix crítico
3. **Logs estructurados** con IDs únicos son esenciales para debugging
4. **Documentación concisa** > Documentación exhaustiva

---

## 📞 Contacto / Referencias

- **Usuario de Testing:** `pro-mensual@test.com` / `pro-anual@test.com`
- **User ID:** `6b89d9ba-fbac-4883-a773-befe02e47713`
- **TradingView Username:** `ManuEl`

---

**Última actualización:** 8 de Octubre 2025 - 23:55 UTC  
**Por:** AI Assistant (Claude Sonnet 4.5)

---

## 💡 Tip para la Próxima IA

**Antes de hacer cambios:**
1. Lee el resumen ejecutivo
2. Verifica que no estés revirtiendo un fix crítico
3. Consulta la documentación existente
4. Si algo no está claro, documenta por qué hiciste el cambio

**Recuerda:** Esta documentación existe para evitar trabajo duplicado y errores. ¡Úsala! 🚀

