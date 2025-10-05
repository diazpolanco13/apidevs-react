# 🚀 Plan Unificado: Cookies + Tracking + Marketing

**Fecha**: Implementación 3 de octubre de 2025
**Tiempo Estimado**: 4-6 horas
**Objetivo**: Conectar sistema de cookies con base de datos y crear dashboard admin para marketing

---

## 🎯 **VISIÓN GENERAL**

Conectar 3 sistemas que ya existen pero están desconectados:

```
SimpleCookieBanner (✅ funcionando)
         ↓
    Supabase (🆕 guardar preferencias + eventos)
         ↓
    Admin Panel (🆕 tab de cookies + segmentación)
         ↓
    Campañas Marketing (🔥 audiencias personalizadas)
```

---

## ✅ **LO QUE YA TENEMOS**

1. ✅ `components/SimpleCookieBanner.tsx` - Banner premium funcionando
2. ✅ `utils/cookieConsent.ts` - Solo localStorage (local)
3. ✅ `hooks/useActivityTracker.ts` - Listo pero desactivado
4. ✅ Migración de `user_activity_log` lista
5. ✅ Admin Panel con 6 tabs funcionando

---

## 🔥 **LO QUE VAMOS A CREAR MAÑANA**

### **FASE 1: Base de Datos (30 min)**
- [ ] Aplicar migración `user_activity_log` en Supabase
- [ ] Crear tabla `user_cookie_preferences` con campos:
  - `user_id`, `essential`, `analytics`, `marketing`
  - `accepted_at`, `last_updated`
  - `ip_address`, `user_agent` (opcional)
- [ ] Configurar RLS policies (usuario ve sus datos, admin ve todo)
- [ ] Crear índices para búsquedas rápidas

---

### **FASE 2: Sincronización Supabase (1 hora)**
- [ ] Actualizar `utils/cookieConsent.ts`:
  - Agregar función `syncPreferencesToSupabase()` → guarda en DB
  - Agregar función `loadPreferencesFromSupabase()` → carga desde DB
  - Modificar `saveCookiePreferences()` para guardar en localStorage + Supabase
- [ ] Actualizar `components/SimpleCookieBanner.tsx`:
  - Al aceptar cookies → guardar en Supabase también
  - Al cargar banner → leer preferencias desde Supabase si usuario autenticado
  - Fallback a localStorage si no está autenticado

**Resultado**: Preferencias sincronizadas entre localStorage y Supabase

---

### **FASE 3: Activar Tracking (45 min)**
- [ ] Activar `useActivityTracker` en páginas principales:
  - Dashboard → `trackPageView('Dashboard')`
  - Pricing → `trackPageView('Precios')` + `trackCheckoutStart()`
  - Account → `trackPageView('Mi Cuenta')`
  - Indicadores → `trackCustomEvent('indicator_viewed')`
- [ ] Trackear eventos de autenticación:
  - Login → `trackLogin('email')`
  - Logout → `trackLogout()`
- [ ] Verificar que solo trackea si `analytics = true`

**Resultado**: Eventos reales guardándose en `user_activity_log`

---

### **FASE 4: Admin Panel - Tab Cookies (1.5 horas)**
- [ ] Crear `components/admin/active-users/ActiveUserCookies.tsx`
- [ ] Mostrar:
  - ✅ Estado de consentimiento (aceptado/fecha)
  - ✅ Preferencias detalladas (essential/analytics/marketing)
  - ✅ Estadísticas si analytics activo:
    - Total eventos
    - Eventos últimos 7/30 días
    - Páginas más visitadas (top 5)
    - Última actividad
  - ⚠️ Mensaje si analytics desactivado
- [ ] Agregar tab "Cookies" 🍪 en `app/admin/users/active/[id]/page.tsx`
- [ ] Diseño consistente con el resto del admin (blue/purple theme)

**Resultado**: Admin puede ver preferencias de cookies y actividad de cada usuario

---

### **FASE 5: Segmentación Marketing (30 min)**
- [ ] Crear `utils/marketing/segmentation.ts` con funciones:
  - `getUsersWithMarketingConsent()` → todos con marketing = true
  - `getUsersVisitedPricingNotPurchased()` → visitaron precios sin comprar
  - `getInactiveUsersWithAnalytics()` → usuarios inactivos (retargeting)
- [ ] Crear función SQL en Supabase:
  - `get_pricing_visitors_no_purchase(days_ago)` → retorna usuarios que vieron precios X veces pero no compraron
- [ ] Documentar cómo usar estas audiencias para campañas

**Resultado**: Queries listas para crear campañas de email/retargeting

---

### **FASE 6: Testing y Docs (30 min)**
- [ ] Probar flujo completo:
  1. Usuario nuevo acepta cookies → se guarda en Supabase ✅
  2. Usuario navega → se trackean eventos ✅
  3. Admin ve preferencias y estadísticas ✅
  4. Query de segmentación funciona ✅
- [ ] Actualizar `docs/SESSION-HANDOFF.md` con sistema completado
- [ ] Crear ejemplos de uso para marketing

---

## 📊 **CASOS DE USO MARKETING**

### 1️⃣ **Retargeting a usuarios que vieron precios**
```sql
-- Usuarios que visitaron /pricing 3+ veces pero no compraron
SELECT * FROM get_pricing_visitors_no_purchase(30);
```
→ Enviar email: "¿Dudas sobre nuestros planes? Aquí tienes 20% descuento"

### 2️⃣ **Usuarios con marketing habilitado sin suscripción**
```sql
-- Usuarios que aceptaron marketing pero no son clientes
SELECT u.email, u.id
FROM user_cookie_preferences cp
JOIN users u ON cp.user_id = u.id
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE cp.marketing = true
  AND (s.status IS NULL OR s.status != 'active');
```
→ Campaña: "Activa tu cuenta PRO - 30% descuento primer mes"

### 3️⃣ **Usuarios inactivos para re-engagement**
```sql
-- Usuarios que no han visitado en 30+ días
SELECT u.email, MAX(ual.created_at) as last_visit
FROM users u
JOIN user_activity_log ual ON u.id = ual.user_id
GROUP BY u.email
HAVING MAX(ual.created_at) < NOW() - INTERVAL '30 days';
```
→ Email: "Te echamos de menos! Nuevos indicadores disponibles"

---

## 🎯 **ARQUITECTURA FINAL**

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO VISITA SITIO                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│          SimpleCookieBanner aparece (solo primera vez)      │
│  [ Aceptar Todas ] [ Solo Esenciales ] [ Personalizar ]    │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                  ┌──────────────────────┐
│   localStorage   │                  │  Supabase Database   │
│  (navegador)     │                  │ user_cookie_prefs    │
│                  │◄────sync────────►│                      │
└──────────────────┘                  └──────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│              useActivityTracker (activado)                  │
│   ✅ Solo trackea si analytics = true                       │
│   ✅ Respeta preferencias del usuario                       │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│           Supabase: user_activity_log                       │
│   - page_view, button_click, checkout_start, etc.          │
│   - Metadata: device, browser, OS, session_id              │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│             Admin Panel - Tab "Cookies" 🍪                  │
│   ✅ Ver preferencias del usuario                           │
│   ✅ Estadísticas de actividad                              │
│   ✅ Páginas más visitadas                                  │
└─────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────┐
│           Segmentación para Marketing                       │
│   🎯 Retargeting (visitó precios, no compró)               │
│   🎯 Re-engagement (usuarios inactivos)                     │
│   🎯 Upsell (clientes básicos → premium)                   │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚡ **ORDEN DE IMPLEMENTACIÓN MAÑANA**

1. **Empezar con Fase 1** (Base de Datos) → ejecutar SQL en Supabase
2. **Fase 2** (Sincronización) → actualizar código existente
3. **Fase 3** (Activar Tracking) → descomentar código, agregar en páginas
4. **Probar que todo funciona** → abrir en incógnito, aceptar cookies, navegar, ver en Supabase
5. **Fase 4** (Admin Panel) → crear componente nuevo, agregar tab
6. **Fase 5** (Segmentación) → crear queries SQL
7. **Fase 6** (Testing final) → checklist completo

---

## 📁 **ARCHIVOS A MODIFICAR**

### Crear nuevos:
- `supabase/migrations/20251003000000_create_user_cookie_preferences.sql`
- `components/admin/active-users/ActiveUserCookies.tsx`
- `utils/marketing/segmentation.ts`

### Modificar existentes:
- `utils/cookieConsent.ts` (agregar sync con Supabase)
- `components/SimpleCookieBanner.tsx` (llamar a sync)
- `hooks/useActivityTracker.ts` (descomentar código)
- `app/admin/users/active/[id]/page.tsx` (agregar tab)
- `app/dashboard/page.tsx` (activar tracking)
- `app/pricing/page.tsx` (activar tracking)

---

## 🚨 **NOTAS IMPORTANTES**

- ✅ **Cookie banner YA funciona** → no romper lo que ya está
- ✅ **Activity tracker YA está creado** → solo activarlo
- ✅ **Admin panel YA funciona** → solo agregar un tab más
- ⚠️ **Respetar GDPR** → solo trackear si analytics = true
- ⚠️ **Probar con usuario de prueba** → no con datos reales primero
- ⚠️ **Backup antes de empezar** → por si algo se rompe

---

## ✅ **RESULTADO FINAL**

Al terminar mañana tendremos:

✅ Sistema de cookies sincronizado con Supabase  
✅ Tracking de eventos real funcionando  
✅ Admin puede ver preferencias y actividad de cada usuario  
✅ Queries listas para campañas de marketing brutales  
✅ Todo funcionando en compliance con GDPR/CCPA/LGPD  

---

**¡Listo para implementar mañana! 🚀**

*Este plan unifica:*
- *ACTIVITY-TRACKER-IMPLEMENTATION.md*
- *SESSION-HANDOFF.md*
- *COOKIE-BANNER-INTEGRATION.md*
- *COOKIES-POLICY.md*

