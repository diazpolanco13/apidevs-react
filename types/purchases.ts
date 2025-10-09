// ==================== TYPES & INTERFACES ====================
// Types para el Dashboard de Compras Admin
// Fecha: 2 octubre 2025

export type PurchaseStatus = 'completed' | 'pending' | 'refunded' | 'failed' | 'processing';
export type PurchaseType = 'subscription' | 'one-time' | 'lifetime';
export type PurchaseSource = 'purchase' | 'renewal' | 'refund' | 'chargeback';
export type PaymentMethod = 'stripe' | 'manual' | 'paypal';
export type RefundReason = 'requested_by_customer' | 'duplicate' | 'fraudulent';

// ==================== PURCHASE ====================
export interface Purchase {
  id: string;
  order_number: string;
  customer_id: string;
  customer_email: string;
  customer_name: string;
  customer_country?: string;
  amount: number;
  amount_refunded?: number;
  currency: string;
  status: PurchaseStatus;
  type: PurchaseType;
  purchase_type?: PurchaseSource; // Diferenciar entre compra inicial y renovación
  product_id?: string;
  product_name: string;
  payment_method: PaymentMethod;
  created_at: string;
  updated_at?: string;
  invoice_url?: string;
  invoice_number?: string;
  stripe_payment_id?: string;
  stripe_invoice_id?: string;
  subscription_id?: string;
  discount_applied?: number;
  metadata?: Record<string, any>;
}

// ==================== METRICS ====================
export interface PurchaseMetrics {
  // Core Metrics
  totalRevenue: number;
  totalPurchases: number;
  averageTicket: number;
  mrr: number; // Monthly Recurring Revenue
  
  // Comparativas (Month over Month)
  monthOverMonth: {
    revenue: number; // % change
    purchases: number; // % change
    mrr: number; // % change
    averageTicket: number; // % change
  };
  
  // Desglose por tipo
  breakdown: {
    subscription: {
      count: number;
      revenue: number;
    };
    oneTime: {
      count: number;
      revenue: number;
    };
    lifetime: {
      count: number;
      revenue: number;
    };
  };
  
  // Periodo de cálculo
  period: {
    from: string;
    to: string;
  };
}

// ==================== FILTERS ====================
export interface PurchaseFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: PurchaseStatus[];
  type?: PurchaseType[];
  paymentMethod?: PaymentMethod[];
  minAmount?: number;
  maxAmount?: number;
  customerId?: string;
  productId?: string;
  hasRefund?: boolean;
}

// ==================== PAGINATION ====================
export interface PurchasePagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

// ==================== SORT ====================
export type PurchaseSortField = 'created_at' | 'amount' | 'customer_name' | 'product_name';
export type PurchaseSortDirection = 'asc' | 'desc';

export interface PurchaseSort {
  field: PurchaseSortField;
  direction: PurchaseSortDirection;
}

// ==================== SUBSCRIPTION SPECIFIC ====================
export interface SubscriptionMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churnRate: number; // %
  avgLTV: number; // Average Lifetime Value
  activeSubscriptions: number;
  trialingSubscriptions: number;
  canceledThisMonth: number;
  netRevenueRetention: number; // %
}

// ==================== REFUND ====================
export interface Refund {
  id: string;
  purchase_id: string;
  amount: number;
  currency: string;
  reason: RefundReason;
  status: 'pending' | 'succeeded' | 'failed';
  created_at: string;
  processed_by?: string; // Admin email
  notes?: string;
  stripe_refund_id?: string;
}

export interface RefundMetrics {
  totalRefunded: number;
  refundRate: number; // %
  avgProcessingTime: number; // hours
  topReason: RefundReason;
  byReason: {
    requested_by_customer: number;
    duplicate: number;
    fraudulent: number;
  };
}

// ==================== ANALYTICS ====================
export interface AnalyticsKPIs {
  arpu: number; // Average Revenue Per User
  cac: number; // Customer Acquisition Cost
  ltvCacRatio: number; // LTV:CAC Ratio
  paybackPeriod: number; // months
  netRevenueRetention: number; // %
  grossMargin: number; // %
}

export interface CohortData {
  cohort: string; // Month/Year
  users: number;
  retention: {
    month1: number; // %
    month2: number;
    month3: number;
    month6: number;
    month12: number;
  };
}

// ==================== BREAKDOWN CARDS ====================
export interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  percentage: number;
}

export interface PaymentMethodBreakdown {
  method: PaymentMethod;
  count: number;
  revenue: number;
  percentage: number;
}

export interface CountryBreakdown {
  country: string;
  countryCode: string;
  flag: string;
  sales: number;
  revenue: number;
}

export interface ConversionFunnel {
  step: string;
  value: number;
  percentage: number;
  dropOff?: number; // % respecto al paso anterior
}

// ==================== CHART DATA ====================
export interface RevenueTimelineData {
  date: string;
  revenue: number;
  purchases: number;
  averageTicket: number;
}

export interface TrendComparison {
  label: string;
  subscription: number;
  oneTime: number;
  lifetime: number;
}

// ==================== REQUEST/RESPONSE ====================
export interface GetPurchasesParams {
  filters?: PurchaseFilters;
  sort?: PurchaseSort;
  pagination: PurchasePagination;
}

export interface GetPurchasesResponse {
  purchases: Purchase[];
  pagination: PurchasePagination;
  metrics?: PurchaseMetrics;
}

// ==================== PURCHASE DETAIL ====================
export interface PurchaseDetail extends Purchase {
  customer: {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    country?: string;
    city?: string;
    phone?: string;
    totalPurchases: number;
    lifetimeValue: number;
  };
  product: {
    id: string;
    name: string;
    description?: string;
    basePrice: number;
    finalPrice: number;
    discount?: number;
    duration?: string;
  };
  payment: {
    stripePaymentId?: string;
    stripeInvoiceId?: string;
    cardBrand?: string;
    cardLast4?: string;
    billingAddress?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
    receiptSent: boolean;
    receiptEmail?: string;
  };
  refunds?: Refund[];
  timeline: {
    created: string;
    processing?: string;
    completed?: string;
    refunded?: string;
  };
}

// ==================== HELPER TYPES ====================
export type MetricCard = {
  id: string;
  label: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: any; // Lucide icon
  gradient: string;
  iconColor: string;
  borderColor: string;
  subtitle?: string;
};

export type TabConfig = {
  id: string;
  label: string;
  icon: any;
  count?: number;
  component: React.ComponentType<any>;
};

