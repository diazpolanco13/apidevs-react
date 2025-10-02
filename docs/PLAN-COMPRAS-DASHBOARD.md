# 🛒 PLAN DE IMPLEMENTACIÓN: Dashboard de Compras Admin

**Fecha de Creación:** 2 de Octubre 2025  
**Estrategia:** Opción C → A → B (Funcionalidad básica → Overview → Tabs avanzados)  
**Tiempo Estimado Total:** 30-40 horas  
**Nivel de Calidad:** Enterprise Premium (consistente con Dashboard Usuarios Activos)

---

## 📋 ÍNDICE DE FASES

```
FUNDACIÓN (Fases 1-5)    → 11-16 horas → Funcionalidad Básica [✅ 100% - 5/5 completadas]
EXPANSION (Fases 6-8)    → 9-12 horas  → Overview + Tabs Core [🟢 33% - 1/3 completadas]
AVANZADO (Fases 9-10)    → 8-10 horas  → Analytics + Features Premium [⏳ Pendiente]
FINALIZACIÓN (Fases 11-12) → 5-7 horas   → Testing + Docs [⏳ Pendiente]
```

**PROGRESO GLOBAL: 50% (6 de 12 fases completadas) - Tiempo invertido: ~16 horas**

---

## 🎯 FASE 1: FUNDACIÓN - ESTRUCTURA BASE
**Tiempo:** 2-3 horas  
**Estado:** ✅ COMPLETADA (2 Oct 2025)

### Objetivos:
- ✅ Crear ruta `/admin/compras`
- ✅ Layout principal con header de métricas
- ✅ Navegación de tabs funcional (6 tabs)
- ✅ Breadcrumbs funcionales

### Archivos a Crear:
```
app/admin/compras/
└── page.tsx

components/admin/purchases/
├── PurchasesTabs.tsx
└── PurchasesHeader.tsx

types/
└── purchases.ts
```

### Código Base:
```typescript
// types/purchases.ts
export interface Purchase {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'refunded' | 'failed';
  type: 'subscription' | 'one-time' | 'lifetime';
  product_name: string;
  payment_method: string;
  created_at: string;
  invoice_url?: string;
  stripe_payment_id?: string;
}

export interface PurchaseMetrics {
  totalRevenue: number;
  totalPurchases: number;
  averageTicket: number;
  mrr: number;
  monthOverMonth: {
    revenue: number;
    purchases: number;
  };
}

export interface PurchaseFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  type?: string[];
  paymentMethod?: string[];
  minAmount?: number;
  maxAmount?: number;
}
```

### Resultado Esperado:
✅ Página accesible en `/admin/compras`  
✅ Header con 4 cards de métricas implementadas  
✅ Estructura de tabs con 6 tabs: Overview, Todas las Compras, Suscripciones, One-Time, Reembolsos, Analytics  
✅ Diseño consistente con dashboard de Usuarios

**Archivos Creados:**
- ✅ `app/admin/compras/page.tsx`
- ✅ `components/admin/purchases/PurchasesTabs.tsx`
- ✅ `components/admin/purchases/PurchasesHeader.tsx`
- ✅ `types/purchases.ts`

---

## 🔌 FASE 2: DATOS - QUERY BUILDER
**Tiempo:** 2-3 horas  
**Estado:** ✅ COMPLETADA (2 Oct 2025)
**Dependencias:** Fase 1

### Objetivos:
- ✅ Crear funciones de query a Supabase
- ✅ Implementar lógica de deduplicación
- ✅ Calcular métricas en tiempo real
- ✅ Optimizar con índices

### Archivos a Crear:
```
utils/supabase/
└── purchases.ts
```

### Funciones Principales:
```typescript
// utils/supabase/purchases.ts
export async function getPurchases(filters: PurchaseFilters) {
  // Combinar purchases + payment_intents + invoices
  // Evitar duplicados con lógica de timestamp ±5s
  // Aplicar filtros
  // Ordenar y paginar
}

export async function getPurchaseMetrics() {
  // Revenue Total = SUM(amount_paid - amount_refunded)
  // Total Compras = COUNT(unique purchases)
  // Ticket Promedio = Revenue / Compras
  // MRR = SUM(monthly subscriptions activas)
  // Comparativa vs mes anterior
}

export async function getPurchaseById(id: string) {
  // Fetch detalle completo con relaciones:
  // - Cliente (users)
  // - Producto (products/prices)
  // - Payment Intent
  // - Invoice
  // - Refunds
}
```

### Lógica de Deduplicación:
```typescript
// Reutilizar lógica de ActiveUserBilling.tsx
function deduplicatePurchases(invoices, paymentIntents) {
  const allPayments = [...invoices, ...paymentIntents];
  const unique = [];
  
  allPayments.forEach(payment => {
    const isDuplicate = unique.some(existing => {
      const timeDiff = Math.abs(existing.timestamp - payment.timestamp);
      const amountMatch = existing.amount === payment.amount;
      return amountMatch && timeDiff <= 5; // ±5 segundos
    });
    
    if (!isDuplicate) unique.push(payment);
  });
  
  return unique;
}
```

### Resultado Esperado:
✅ Funciones de queries implementadas en `app/admin/compras/page.tsx`
✅ Métricas calculadas correctamente (Revenue, Total Compras, Ticket Promedio, MRR)
✅ Deduplicación funcionando con lógica de ±5 segundos
✅ Performance optimizado con Promise.race y timeouts de 5s
✅ Manejo robusto de errores para evitar loops infinitos

**Implementación Destacada:**
- Query builder con SSR (Server Components)
- Lógica de deduplicación inteligente
- Cálculo de MoM (Month over Month) comparatives
- Manejo de rate limits de Supabase

---

## 📊 FASE 3: TABLA MAESTRA
**Tiempo:** 3-4 horas  
**Estado:** ✅ COMPLETADA (2 Oct 2025)
**Dependencias:** Fase 1, 2

### Objetivos:
- ✅ Tabla principal con todas las compras
- ✅ Filtros avanzados funcionales
- ✅ Ordenamiento dinámico
- ✅ Paginación server-side
- ✅ Responsive design

### Archivos a Crear:
```
components/admin/purchases/
├── PurchasesTable.tsx
├── PurchaseFilters.tsx
└── PurchaseRow.tsx (opcional)
```

### Columnas de la Tabla:
```
| ID/Número | Fecha | Cliente | Producto | Monto | Estado | Tipo | Acciones |
```

### Filtros Implementados:
```typescript
interface Filters {
  search: string;              // Búsqueda por cliente, email, transaction ID
  dateRange: [Date, Date];     // Date picker de rango
  status: string[];            // Multi-select: completed, pending, refunded
  type: string[];              // Multi-select: subscription, one-time, lifetime
  paymentMethod: string[];     // Multi-select: stripe, manual, paypal
  amountRange: [number, number]; // Slider de rango de monto
}
```

### Estados con Badges:
```typescript
const statusConfig = {
  completed: { color: 'green', label: 'Completado', icon: CheckCircle },
  pending: { color: 'yellow', label: 'Pendiente', icon: Clock },
  refunded: { color: 'red', label: 'Reembolsado', icon: XCircle },
  failed: { color: 'gray', label: 'Fallido', icon: AlertCircle }
};
```

### Responsive Design:
```typescript
// Desktop: Tabla completa
<table className="hidden md:table">...</table>

// Mobile: Cards
<div className="md:hidden space-y-4">
  {purchases.map(purchase => (
    <PurchaseCard key={purchase.id} purchase={purchase} />
  ))}
</div>
```

### Resultado Esperado:
✅ Tabla funcional con datos reales (`PurchasesTable.tsx`)
✅ Filtros de búsqueda y estado funcionando
✅ Paginación de 10 items/página implementada
✅ Badges de estado con colores (Completado, Pendiente, Reembolsado, Fallido)
✅ Badges de tipo (Suscripción, One-Time, Lifetime)

**Archivos Creados:**
- ✅ `components/admin/purchases/overview/PurchasesTable.tsx`
- ✅ `components/admin/purchases/tabs/AllPurchasesTab.tsx`

**Features Implementadas:**
- Búsqueda por email, nombre, producto, order_number
- Filtro por estado (multi-select)
- Paginación con navegación avanzada
- Botón "Ver" para detalles (placeholder)

---

## 💳 FASE 4: MÉTRICAS HEADER
**Tiempo:** 1-2 horas  
**Estado:** ✅ COMPLETADA (2 Oct 2025)
**Dependencias:** Fase 2

### Objetivos:
- ✅ 4 cards de métricas visuales
- ✅ Animación de contadores
- ✅ Comparativa vs mes anterior
- ✅ Diseño glassmorphism

### Cards a Implementar:

#### Card 1: Revenue Total
```typescript
{
  icon: DollarSign,
  label: 'Revenue Total',
  value: '$64,560.80',
  change: '+15.3%',
  trend: 'up',
  gradient: 'from-green-500/10 to-emerald-500/10',
  iconColor: 'text-green-400'
}
```

#### Card 2: Total Compras
```typescript
{
  icon: ShoppingCart,
  label: 'Total Compras',
  value: '2,873',
  change: '+23 este mes',
  gradient: 'from-blue-500/10 to-cyan-500/10',
  iconColor: 'text-blue-400'
}
```

#### Card 3: Ticket Promedio
```typescript
{
  icon: TrendingUp,
  label: 'Ticket Promedio',
  value: '$22.47',
  change: '-2.1%',
  trend: 'down',
  gradient: 'from-purple-500/10 to-pink-500/10',
  iconColor: 'text-purple-400'
}
```

#### Card 4: MRR
```typescript
{
  icon: Calendar,
  label: 'MRR',
  value: '$4,230',
  change: '+8.5%',
  trend: 'up',
  gradient: 'from-orange-500/10 to-red-500/10',
  iconColor: 'text-orange-400'
}
```

### Animación de Contador:
```typescript
// Reutilizar useCountAnimation de Hero
const displayValue = useCountAnimation(value, 2000);
```

### Resultado Esperado:
✅ 4 cards con métricas reales implementadas
✅ Comparativas MoM con colores e íconos
✅ Diseño glassmorphism con gradientes
✅ Consistente con dashboard de Usuarios

**Cards Implementadas:**
1. Revenue Total (verde) - con cambio porcentual MoM
2. Total Compras (azul) - con conteo y comparativa
3. Ticket Promedio (morado) - calculado dinámicamente
4. MRR (naranja) - solo suscripciones recurrentes

**Archivos:**
- ✅ `components/admin/purchases/PurchasesHeader.tsx`

---

## 🔍 FASE 5: VISTA DETALLE
**Tiempo:** 3-4 horas  
**Estado:** ✅ COMPLETADA (2 Oct 2025)
**Dependencias:** Fase 2, 3

### Objetivos:
- ✅ Página `/admin/compras/[id]`
- ✅ 6 secciones de información (Info Compra, Cliente, Producto, Payment Details, Refunds, Acciones Admin)
- ✅ Acciones administrativas (Reembolso, Email, Descargar PDF, Ver Stripe)
- ✅ Layout similar a User Detail
- ✅ Descarga de facturas PDF funcional desde Stripe

### Archivos a Crear:
```
app/admin/compras/[id]/
└── page.tsx

components/admin/purchases/
└── PurchaseDetailCard.tsx
```

### Secciones del Layout:

#### 1. Información de la Compra
```typescript
- Order Number con badge
- Transaction/Payment Intent ID
- Fecha y hora exacta
- Timeline de estados (Created → Processing → Completed)
- Método de pago con logo de card
```

#### 2. Cliente
```typescript
- Avatar circular
- Nombre completo
- Email con verificación badge
- País + Ciudad con bandera
- Link rápido: "Ver perfil completo →"
- Badge: "5ª compra de este cliente"
```

#### 3. Producto/Servicio
```typescript
- Nombre del producto con icon
- Precio base: $390.00
- Descuento aplicado: -$117.00 (30% legacy)
- Monto final: $273.00
- Duración: 1 año / Mensual / Lifetime
```

#### 4. Payment Details
```typescript
- Stripe Payment Intent ID (link externo)
- Invoice Number: GXBJDCJ3-0001 (link PDF)
- Card: Mastercard •••• 4444
- Billing Address completa
- Receipt email enviado: ✅
```

#### 5. Refunds (si existen)
```typescript
- Lista de reembolsos:
  - Fecha: 15 Oct 2025
  - Monto: $100.00
  - Razón: requested_by_customer
  - Estado: succeeded
  - Procesado por: admin@apidevs.io
```

#### 6. Acciones Admin
```typescript
Botones:
- [🔁] Procesar Reembolso (abre modal)
- [📧] Reenviar Invoice
- [📄] Descargar PDF
- [↗️] Ver en Stripe
- [❌] Cancelar Suscripción (si aplica)
- [✉️] Contactar Cliente
```

### Resultado Esperado:
✅ Vista detallada completa  
✅ Información clara y organizada  
✅ Acciones funcionales  
✅ Navegación fluida

---

## 📈 FASE 6: TAB OVERVIEW
**Tiempo:** 4-5 horas  
**Estado:** ✅ COMPLETADA (2 Oct 2025)
**Dependencias:** Fase 1-5

### Objetivos:
- ✅ Gráfico de revenue timeline
- ✅ 4 cards de breakdown
- ✅ Integración de tabla maestra
- ✅ Dashboard ejecutivo completo

### Componente Principal:
```
components/admin/purchases/
├── PurchasesOverview.tsx
└── RevenueChart.tsx
```

### Revenue Timeline Chart:
```typescript
// Usando Recharts o Chart.js
<RevenueChart
  data={monthlyRevenue}
  period="30d" // 30d, 90d, 365d
  gradient="green"
  showComparison={true}
/>
```

### Breakdown Cards (Grid 2x2):

#### Card 1: Top 5 Productos
```typescript
[
  { name: 'APIDevs Pro Anual', sales: 234, percent: 45 },
  { name: 'Lifetime Access', sales: 123, percent: 24 },
  { name: 'Pro Mensual', sales: 89, percent: 17 },
  ...
]
// Con progress bars horizontales
```

#### Card 2: Métodos de Pago
```typescript
// Pie/Donut chart
[
  { method: 'Stripe', value: 95, color: '#635BFF' },
  { method: 'Manual', value: 5, color: '#00D4FF' }
]
```

#### Card 3: Top Países
```typescript
[
  { country: 'US', flag: '🇺🇸', sales: 456, revenue: '$23,456' },
  { country: 'VE', flag: '🇻🇪', sales: 234, revenue: '$12,345' },
  ...
]
```

#### Card 4: Funnel de Conversión
```typescript
[
  { step: 'Visitantes', value: 10000, percent: 100 },
  { step: 'Checkout', value: 1500, percent: 15 },
  { step: 'Completado', value: 850, percent: 8.5 }
]
// Con flechas visuales indicando drop-off
```

### Resultado Esperado:
✅ Tab Overview completo e implementado
✅ Gráfico de revenue timeline (30 días) con Recharts
✅ Breakdown por tipo (Suscripciones, One-Time, Lifetime) con progress bars animadas
✅ Top 5 productos con medallas y rankings
✅ Experiencia premium con diseño glassmorphism

**Archivos Creados:**
- ✅ `components/admin/purchases/tabs/OverviewTab.tsx`
- ✅ `components/admin/purchases/overview/RevenueChart.tsx`
- ✅ `components/admin/purchases/overview/TypeBreakdown.tsx`
- ✅ `components/admin/purchases/overview/TopProducts.tsx`

**Notas de Implementación:**
- Métricas NO se muestran en Overview (solo en otros tabs)
- Timeline con datos de últimos 30 días
- Tooltips personalizados en gráfico
- Animaciones smooth en progress bars

---

## 🔄 FASE 7: TAB SUSCRIPCIONES
**Tiempo:** 3-4 horas  
**Estado:** ⏳ Pendiente  
**Dependencias:** Fase 6

### Objetivos:
- ✅ Métricas específicas de suscripciones
- ✅ Tabla filtrada solo suscripciones
- ✅ Calendario de próximos cobros
- ✅ Acciones de gestión

### Archivos a Crear:
```
components/admin/purchases/
├── PurchasesSubscriptions.tsx
└── SubscriptionCalendar.tsx
```

### Métricas Específicas:
```typescript
{
  mrr: 4230,              // Monthly Recurring Revenue
  arr: 50760,             // Annual Recurring Revenue
  churnRate: 2.3,         // % últimos 30 días
  avgLTV: 456.78,         // Lifetime Value promedio
  activeSubscriptions: 127
}
```

### Tabla Suscripciones:
```
Columnas:
| Cliente | Plan | Estado | Inicio | Próximo Cobro | MRR | Acciones |
```

### Filtros Avanzados:
```typescript
- Estado: Activa, Trialing, Cancelada, Expirada
- Plan: FREE, PRO, LIFETIME
- Próximas renovaciones: 7/15/30 días
- En riesgo: Sin pago >45 días
```

### Calendario Visual:
```typescript
// Próximos 30 días de cobros programados
<SubscriptionCalendar>
  <Day date="2025-10-05">
    <Charge amount="$39" customer="John Doe" />
    <Charge amount="$390" customer="Jane Smith" />
  </Day>
  ...
</SubscriptionCalendar>
```

### Acciones:
```typescript
[
  { label: 'Cancelar Suscripción', action: cancelSubscription },
  { label: 'Cambiar Plan', action: changePlan },
  { label: 'Aplicar Descuento', action: applyDiscount },
  { label: 'Ver en Stripe', action: openStripe }
]
```

### Resultado Esperado:
✅ Gestión completa de suscripciones  
✅ Métricas MRR/ARR/Churn  
✅ Calendario visual útil  
✅ Acciones administrativas

---

## 💰 FASE 8: TAB ONE-TIME
**Tiempo:** 2-3 horas  
**Estado:** ⏳ Pendiente  
**Dependencias:** Fase 7

### Objetivos:
- ✅ Análisis de compras únicas
- ✅ Métricas de Lifetime purchases
- ✅ Comparativa vs suscripciones
- ✅ Tabla especializada

### Archivos a Crear:
```
components/admin/purchases/
└── PurchasesOneTime.tsx
```

### Métricas One-Time:
```typescript
{
  totalOneTime: 12345.67,     // Total ventas one-time
  aov: 234.56,                // Average Order Value
  lifetimeSold: 45,           // Productos Lifetime vendidos
  upsells: 23                 // Upsells realizados
}
```

### Gráfico Comparativo:
```typescript
// Line chart: Lifetime vs Suscripciones
<TrendComparison
  data={{
    lifetime: [100, 150, 200, 250],
    subscription: [500, 600, 700, 800]
  }}
  labels={['Ene', 'Feb', 'Mar', 'Abr']}
/>
```

### Tabla Especializada:
```
Columnas:
| Cliente | Producto | Precio Base | Descuento | Pagado | Método | Acciones |
```

### Highlights:
```typescript
- Mostrar descuentos aplicados de forma visual
- Badge especial para Lifetime purchases
- AOV calculado en tiempo real
- Detección de upsells (compras múltiples mismo día)
```

### Resultado Esperado:
✅ Análisis de one-time completo  
✅ Comparativa visual útil  
✅ Identificación de patterns  
✅ Datos para estrategia

---

## 🔄 FASE 9: TAB REEMBOLSOS
**Tiempo:** 3-4 horas  
**Estado:** ⏳ Pendiente  
**Dependencias:** Fase 8

### Objetivos:
- ✅ Dashboard de refunds
- ✅ Procesamiento de reembolsos
- ✅ Tracking de motivos
- ✅ Integración Stripe API

### Archivos a Crear:
```
components/admin/purchases/
├── PurchasesRefunds.tsx
└── RefundModal.tsx
```

### Métricas Refunds:
```typescript
{
  totalRefunded: 1234.56,     // Monto total reembolsado
  refundRate: 3.2,            // % de compras reembolsadas
  avgProcessingTime: 24,      // Horas promedio
  topReason: 'requested_by_customer'
}
```

### Gráfico de Motivos:
```typescript
// Bar chart horizontal
[
  { reason: 'Solicitado por cliente', count: 45 },
  { reason: 'Duplicado', count: 12 },
  { reason: 'Fraudulento', count: 3 }
]
```

### Tabla Refunds:
```
Columnas:
| Fecha | Cliente | Monto | Motivo | Estado | Admin | Acciones |
```

### Modal de Reembolso:
```typescript
<RefundModal>
  <RadioGroup name="refundType">
    <Radio value="partial">Reembolso Parcial</Radio>
    <Radio value="full">Reembolso Completo</Radio>
  </RadioGroup>
  
  {type === 'partial' && (
    <Input
      type="number"
      label="Monto a reembolsar"
      max={originalAmount}
    />
  )}
  
  <Select label="Motivo">
    <Option value="requested_by_customer">Solicitado</Option>
    <Option value="duplicate">Duplicado</Option>
    <Option value="fraudulent">Fraude</Option>
  </Select>
  
  <Textarea label="Notas internas" />
  
  <Button onClick={processRefund}>
    Procesar Reembolso
  </Button>
</RefundModal>
```

### Integración Stripe:
```typescript
async function processRefund(paymentIntentId, amount, reason) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount * 100, // convertir a centavos
    reason: reason,
    metadata: {
      admin_user: currentAdmin.email,
      notes: notes
    }
  });
  
  // Actualizar en Supabase
  await upsertPaymentIntentRecord(refund);
  
  return refund;
}
```

### Resultado Esperado:
✅ Gestión completa de refunds  
✅ Modal funcional  
✅ Integración Stripe real  
✅ Tracking de motivos

---

## 📊 FASE 10: TAB ANALYTICS
**Tiempo:** 4-5 horas  
**Estado:** ⏳ Pendiente  
**Dependencias:** Fase 9

### Objetivos:
- ✅ Analytics nivel enterprise
- ✅ KPIs ejecutivos
- ✅ Cohort analysis
- ✅ Insights automáticos

### Archivos a Crear:
```
components/admin/purchases/
├── PurchasesAnalytics.tsx
├── CohortAnalysis.tsx
├── ExecutiveKPIs.tsx
└── AutoInsights.tsx
```

### Gráficos Principales:

#### 1. Revenue por Mes (12 meses)
```typescript
<BarChart
  data={monthlyRevenue}
  colors={['#10B981', '#3B82F6', '#8B5CF6']}
  stacked={false}
/>
```

#### 2. Cohort Analysis
```typescript
// Matriz de retención
Mes 1: [100%, 85%, 72%, 65%, ...]
Mes 2: [100%, 88%, 75%, ...]
...
```

#### 3. CLV por Segmento
```typescript
[
  { segment: 'Legacy Users', clv: 567.89 },
  { segment: 'New Users', clv: 234.56 },
  { segment: 'Power Users', clv: 1234.56 }
]
```

#### 4. Funnel de Conversión
```typescript
Visitantes → Registro → Onboarding → Checkout → Pago → Activo
Con % de conversión en cada paso
```

### KPIs Ejecutivos:
```typescript
{
  arpu: 45.67,                // Average Revenue Per User
  cac: 23.45,                 // Customer Acquisition Cost
  ltvCacRatio: 3.5,           // LTV:CAC Ratio (ideal >3)
  paybackPeriod: 8.2,         // Meses para recuperar CAC
  netRevenueRetention: 108,   // % (>100 = expansión)
  grossMargin: 87.5           // %
}
```

### Comparativas:
```typescript
// Month over Month
{
  revenue: { current: 4567, previous: 3890, change: +17.4% },
  purchases: { current: 123, previous: 110, change: +11.8% },
  mrr: { current: 4230, previous: 3890, change: +8.7% }
}

// Year over Year
{
  revenue: { current: 54000, previous: 42000, change: +28.6% },
  ...
}
```

### Insights Automáticos:
```typescript
function generateInsights(data) {
  const insights = [];
  
  if (data.mrrGrowth > 10) {
    insights.push({
      type: 'positive',
      icon: TrendingUp,
      message: `MRR creció ${data.mrrGrowth}% este mes 🚀`,
      action: 'Ver detalles'
    });
  }
  
  if (data.churnRiskUsers > 0) {
    insights.push({
      type: 'warning',
      icon: AlertTriangle,
      message: `${data.churnRiskUsers} clientes en riesgo de cancelar`,
      action: 'Tomar acción'
    });
  }
  
  if (data.bestDay) {
    insights.push({
      type: 'info',
      icon: Calendar,
      message: `Mejor día de la semana: ${data.bestDay}`,
      action: 'Ver patrón'
    });
  }
  
  return insights;
}
```

### Selector de Rangos:
```typescript
<DateRangePicker
  presets={[
    { label: 'Últimos 7 días', value: 7 },
    { label: 'Últimos 30 días', value: 30 },
    { label: 'Últimos 90 días', value: 90 },
    { label: 'Este año', value: 'ytd' },
    { label: 'Custom', value: 'custom' }
  ]}
  onChange={handleRangeChange}
/>
```

### Resultado Esperado:
✅ Analytics completo  
✅ KPIs ejecutivos calculados  
✅ Insights accionables  
✅ Herramienta de toma de decisiones

---

## ⚡ FASE 11: FEATURES PREMIUM
**Tiempo:** 3-4 horas  
**Estado:** ⏳ Pendiente  
**Dependencias:** Fase 10

### Objetivos:
- ✅ Exportación avanzada
- ✅ Búsqueda inteligente
- ✅ Acciones bulk
- ✅ Keyboard shortcuts
- ✅ Notificaciones en tiempo real

### 1. Exportación Avanzada

#### Archivo a Crear:
```
utils/exports/
└── exportPurchases.ts
```

#### Funcionalidad:
```typescript
export async function exportToCSV(purchases, filters) {
  const csv = Papa.unparse(purchases, {
    columns: ['order_number', 'date', 'customer', 'product', 'amount', 'status'],
    header: true
  });
  
  downloadFile(csv, `purchases-${Date.now()}.csv`, 'text/csv');
}

export async function exportToPDF(purchases, metrics) {
  const doc = new jsPDF();
  
  // Header con métricas
  doc.text('Reporte de Compras', 10, 10);
  doc.text(`Revenue Total: $${metrics.totalRevenue}`, 10, 20);
  
  // Tabla con autoTable
  doc.autoTable({
    head: [['#', 'Fecha', 'Cliente', 'Monto']],
    body: purchases.map(p => [p.order_number, p.date, p.customer, p.amount])
  });
  
  doc.save(`purchases-report-${Date.now()}.pdf`);
}
```

### 2. Búsqueda Inteligente

```typescript
function useSmartSearch(query: string) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedSearch = useMemo(
    () => debounce(async (q) => {
      setLoading(true);
      
      // Buscar en múltiples campos
      const results = await supabase
        .from('purchases_view')
        .select('*')
        .or(`
          order_number.ilike.%${q}%,
          customer_email.ilike.%${q}%,
          customer_name.ilike.%${q}%,
          transaction_id.ilike.%${q}%,
          invoice_number.ilike.%${q}%
        `)
        .limit(10);
      
      setResults(results.data);
      setLoading(false);
    }, 300),
    []
  );
  
  useEffect(() => {
    if (query) debouncedSearch(query);
  }, [query]);
  
  return { results, loading };
}
```

### 3. Acciones Bulk

```typescript
function BulkActions({ selectedPurchases }) {
  return (
    <div className="flex gap-2">
      <Button onClick={() => exportSelected(selectedPurchases)}>
        Exportar Selección ({selectedPurchases.length})
      </Button>
      
      <Button onClick={() => markAsReviewed(selectedPurchases)}>
        Marcar como Revisado
      </Button>
      
      <Button onClick={() => sendInvoices(selectedPurchases)}>
        Reenviar Invoices
      </Button>
    </div>
  );
}
```

### 4. Keyboard Shortcuts

```typescript
function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Buscar
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openSearchModal();
      }
      
      // Cmd/Ctrl + E: Exportar
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        exportCurrentView();
      }
      
      // Cmd/Ctrl + F: Filtros
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        openFilters();
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
```

### 5. Notificaciones en Tiempo Real (opcional)

```typescript
// Con Supabase Realtime
function useRealtimePurchases() {
  useEffect(() => {
    const subscription = supabase
      .channel('purchases')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'purchases'
      }, (payload) => {
        toast.success(`Nueva compra: ${payload.new.customer_name} - $${payload.new.amount}`);
        // Actualizar lista
        refetchPurchases();
      })
      .subscribe();
    
    return () => subscription.unsubscribe();
  }, []);
}
```

### Resultado Esperado:
✅ Exportación CSV/PDF funcional  
✅ Búsqueda rápida e inteligente  
✅ Acciones bulk eficientes  
✅ Shortcuts aumentan productividad  
✅ Notificaciones opcionales

---

## 🧪 FASE 12: TESTING Y DOCUMENTACIÓN
**Tiempo:** 2-3 horas  
**Estado:** ⏳ Pendiente  
**Dependencias:** Todas las anteriores

### Objetivos:
- ✅ Testing exhaustivo
- ✅ Documentación completa
- ✅ Troubleshooting guide
- ✅ Actualización de docs generales

### 1. Testing Checklist

```markdown
## Funcionalidad Core
- [ ] Métricas calculan correctamente
- [ ] Deduplicación funciona (invoice + payment_intent)
- [ ] Filtros responden correctamente
- [ ] Paginación server-side optimizada
- [ ] Ordenamiento funciona
- [ ] Búsqueda encuentra resultados

## Vista Detallada
- [ ] Todos los datos se muestran
- [ ] Links a Stripe funcionan
- [ ] PDF de invoice se descarga
- [ ] Acciones admin funcionan

## Tabs
- [ ] Overview muestra gráficos correctos
- [ ] Suscripciones filtra correctamente
- [ ] One-Time muestra solo compras únicas
- [ ] Refunds procesa correctamente
- [ ] Analytics calcula KPIs correctos

## Responsive
- [ ] Tabla → Cards en mobile
- [ ] Métricas apiladas en mobile
- [ ] Filtros accesibles en mobile
- [ ] Gráficos responsive

## Performance
- [ ] Carga inicial <2s
- [ ] Filtros responden <500ms
- [ ] Gráficos renderizan smooth
- [ ] No memory leaks
```

### 2. Documentación

#### Crear PURCHASES-DASHBOARD.md:
```markdown
# Dashboard de Compras - Documentación

## Arquitectura

### Componentes Principales
- PurchasesOverview: Tab principal con gráficos
- PurchasesTable: Tabla maestra con filtros
- PurchaseDetailCard: Vista individual
- RefundModal: Procesamiento de reembolsos

### Queries SQL
...

### Lógica de Deduplicación
...

### Cálculo de Métricas
...

## Guía de Uso

### Para Admins
...

### Para Finance Team
...

## Troubleshooting
...
```

### 3. Actualizar Documentación General

#### Archivo: PROYECTO-APIDEVS-TRADING-RESUMEN-COMPLETO.md
```markdown
## Sección Nueva: Dashboard de Compras

### Features Implementadas
- ✅ Tab Overview con analytics
- ✅ Gestión de suscripciones
- ✅ Procesamiento de refunds
- ✅ KPIs ejecutivos
- ✅ Exportación avanzada

### Métricas Calculadas
- Revenue Total, MRR, ARR
- Churn Rate, LTV, CAC
- ARPU, Gross Margin

### Componentes Creados (18)
...

### Tiempo Total: 35 horas
...
```

### Resultado Esperado:
✅ Sistema completamente testeado  
✅ Documentación exhaustiva  
✅ Guía de troubleshooting  
✅ Docs actualizadas  
✅ Listo para producción

---

## 📊 RESUMEN EJECUTIVO

### Tiempo Total Estimado: 30-40 horas

| Fase | Tiempo | Componentes | Estado |
|------|--------|-------------|--------|
| 1-5 (Fundación) | 11-16h | 8 componentes | 🟢 80% (4/5 - Falta Fase 5) |
| 6-8 (Expansión) | 9-12h | 6 componentes | 🟡 33% (1/3 - Overview completada) |
| 9-10 (Avanzado) | 8-10h | 7 componentes | ⏳ Pendiente |
| 11-12 (Finalización) | 5-7h | 3 componentes | ⏳ Pendiente |

### Progreso Actual:
- **Componentes Creados:** 10 de 24 (42%)
- **Archivos Nuevos:** 12 creados
- **Lines of Code:** ~1,500 de ~3,500 (43%)
- **Tiempo Invertido:** ~12 horas de 30-40 horas (35%)

### Componentes Completados:
1. ✅ PurchasesTabs.tsx
2. ✅ PurchasesHeader.tsx
3. ✅ PurchasesTable.tsx
4. ✅ AllPurchasesTab.tsx
5. ✅ OverviewTab.tsx
6. ✅ RevenueChart.tsx
7. ✅ TypeBreakdown.tsx
8. ✅ TopProducts.tsx
9. ✅ SubscriptionsTab.tsx (placeholder)
10. ✅ OneTimeTab.tsx (placeholder)
11. ✅ RefundsTab.tsx (placeholder)
12. ✅ AnalyticsTab.tsx (placeholder)

---

## 🎯 MÉTRICAS DE ÉXITO

### Funcionales:
✅ Deduplicación 100% precisa  
✅ Métricas calculadas correctamente  
✅ Filtros responden <500ms  
✅ Exportación funcional  
✅ Refunds procesados sin errores

### UX:
✅ Carga inicial <2s  
✅ Responsive en todos los dispositivos  
✅ Diseño consistente con Users  
✅ Accesibilidad AAA  
✅ Keyboard shortcuts funcionando

### Negocio:
✅ KPIs ejecutivos precisos  
✅ Insights accionables  
✅ Ahorro de tiempo admin >50%  
✅ Reducción de errores manuales  
✅ Mejora en toma de decisiones

---

## 🚀 PRÓXIMOS PASOS

1. **Revisar y aprobar plan** ✅ (tú decides)
2. **Empezar Fase 1** → Estructura base
3. **Implementar fase por fase** → Desarrollo iterativo
4. **Testing continuo** → Cada fase se prueba
5. **Documentar avances** → Actualizar memorias

---

**¿Listo para comenzar con la Fase 1?** 🎯

