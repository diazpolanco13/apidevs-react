# 🚧 PENDIENTE: Indicadores FREE deben mantener acceso Lifetime en renovaciones

## 📋 Problema Identificado

Actualmente, cuando un usuario PRO renueva su suscripción (mensual o anual), **TODOS los indicadores** (incluidos los FREE) reciben la duración del plan:

- Plan Mensual → **Todos** los indicadores con `30D` (incluidos FREE)
- Plan Anual → **Todos** los indicadores con `1Y` (incluidos FREE)

**Comportamiento Esperado:**
- Indicadores **FREE** deben mantener acceso **lifetime (`1L`)** siempre
- Indicadores **PREMIUM** deben recibir la duración del plan (`30D` o `1Y`)

---

## 🔧 Ubicación del Código

**Archivo**: `utils/tradingview/auto-grant-access.ts`

**Función afectada**: `grantIndicatorAccessOnPurchase()`

**Línea relevante (~150)**:
```typescript
// 4. Determinar duración del acceso
const duration = await getDurationFromPrice(priceId);
console.log(`   ⏰ Duración: ${duration}`);
```

Actualmente, `duration` se aplica **uniformemente** a todos los indicadores sin distinguir entre FREE y PREMIUM.

---

## ✅ Solución Propuesta

### **Opción 1: Diferenciar duración por tier (RECOMENDADO)**

```typescript
// 4. Determinar duración del acceso
const baseDuration = await getDurationFromPrice(priceId);
console.log(`   ⏰ Duración base del plan: ${baseDuration}`);

// 5. Conceder acceso en TradingView usando BULK API
// ... (llamada BULK API con baseDuration) ...

// 6. Procesar respuestas y actualizar Supabase
for (const tvIndicator of bulkResponse.results) {
  // ... buscar indicador en DB ...
  const indicator = dbIndicators?.find(ind => ind.pine_id === tvIndicator.pine_id);
  
  // 🔧 FIX: Indicadores FREE siempre con lifetime
  const finalDuration = indicator.access_tier === 'free' ? '1L' : baseDuration;
  
  const accessData = {
    // ...
    duration_type: finalDuration,  // ← Usar duración específica por tier
    // ...
  };
}
```

### **Opción 2: Concesión separada por tier**

Separar la concesión de indicadores FREE y PREMIUM en dos llamadas BULK diferentes:
1. **Primera llamada**: Indicadores FREE con `duration: '1L'`
2. **Segunda llamada**: Indicadores PREMIUM con `duration: baseDuration`

---

## 🧪 Cómo Verificar el Fix

### **Script de Verificación:**

```bash
# 1. Crear renovación de prueba (usar script de STRIPE-CLI-TESTING-QUICK.md)

# 2. Verificar duraciones en BD
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
  
  const { data: accesses } = await supabase
    .from('indicator_access')
    .select('indicator:indicators(name, access_tier), duration_type, expires_at')
    .eq('user_id', userId)
    .eq('status', 'active');
  
  console.log('📊 ACCESOS ACTIVOS:\\n');
  
  const freeIndicators = accesses?.filter(a => a.indicator.access_tier === 'free');
  const premiumIndicators = accesses?.filter(a => a.indicator.access_tier === 'premium');
  
  console.log('🆓 Indicadores FREE:');
  freeIndicators?.forEach(acc => {
    const isLifetime = acc.duration_type === '1L';
    const emoji = isLifetime ? '✅' : '❌';
    console.log(\`  \${emoji} \${acc.indicator.name}: \${acc.duration_type}\`);
  });
  
  console.log('\\n💎 Indicadores PREMIUM:');
  premiumIndicators?.forEach(acc => {
    const hasExpiration = acc.duration_type !== '1L';
    const emoji = hasExpiration ? '✅' : '❌';
    console.log(\`  \${emoji} \${acc.indicator.name}: \${acc.duration_type}\`);
  });
})();
"
```

### **Resultado Esperado:**

```
📊 ACCESOS ACTIVOS:

🆓 Indicadores FREE:
  ✅ Watermark [APIDEVs]: 1L
  ✅ ADX DEF [APIDEVS]: 1L

💎 Indicadores PREMIUM:
  ✅ RSI PRO+ OVERLAY [APIDEVS]: 30D  (o 1Y según el plan)
  ✅ RSI SCANNER [APIDEVs]: 30D
  ✅ RSI PRO+ Stochastic [APIDEVs]: 30D
  ✅ POSITION SIZE [APIDEVs]: 30D
```

---

## 📝 Notas Adicionales

- **Prioridad**: MEDIA
- **Impacto**: Los usuarios FREE actualmente pierden acceso tras la expiración del plan PRO
- **Testing Requerido**: Probar con plan mensual y anual
- **Backward Compatibility**: Verificar que usuarios con acceso FREE existente no se vean afectados

---

## ✅ Checklist de Implementación

- [ ] Modificar `grantIndicatorAccessOnPurchase()` para diferenciar duración por tier
- [ ] Actualizar logs para mostrar duración diferenciada
- [ ] Probar renovación mensual con indicadores FREE y PREMIUM
- [ ] Probar renovación anual con indicadores FREE y PREMIUM
- [ ] Verificar que accesos lifetime existentes no cambien
- [ ] Actualizar tests unitarios (si existen)
- [ ] Documentar cambio en changelog

