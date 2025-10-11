export interface CancellationDetail {
  id: string;
  subscription_id: string;
  reason: string;
  feedback: string;
  action: string;
  created_at: string;
  user_email: string;
  subscription_created: string;
  subscription_status: string;
  product_name: string;
  unit_amount: number;
  currency: string;
  days_active: number;
  revenue_lost: number;
}

export interface CancellationAnalytics {
  totalCancellations: number;
  avgDaysActive: number;
  churnRate: number;
  revenueLost: number;
  topReasons: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
  }>;
}

export interface CancellationFilters {
  dateFrom?: string;
  dateTo?: string;
  reason?: string;
  search?: string;
  sortBy?: 'created_at' | 'days_active' | 'revenue_lost';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export const CANCELLATION_REASONS = [
  { value: 'too_expensive', label: 'Es muy costoso' },
  { value: 'not_using', label: 'No lo estoy usando' },
  { value: 'missing_features', label: 'Faltan funcionalidades que necesito' },
  { value: 'switching_competitor', label: 'Cambié a un competidor' },
  { value: 'technical_issues', label: 'Problemas técnicos' },
  { value: 'temporary_pause', label: 'Solo quiero pausar temporalmente' },
  { value: 'other', label: 'Otro motivo' }
] as const;

export type CancellationReason = typeof CANCELLATION_REASONS[number]['value'];
