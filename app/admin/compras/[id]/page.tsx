import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import PurchaseInfoCard from '@/components/admin/purchases/detail/PurchaseInfoCard';
import CustomerInfoCard from '@/components/admin/purchases/detail/CustomerInfoCard';
import ProductInfoCard from '@/components/admin/purchases/detail/ProductInfoCard';
import PaymentDetailsCard from '@/components/admin/purchases/detail/PaymentDetailsCard';
import RefundsCard from '@/components/admin/purchases/detail/RefundsCard';
import AdminActionsCard from '@/components/admin/purchases/detail/AdminActionsCard';

interface PurchaseDetailPageProps {
  params: {
    id: string;
  };
}

interface Purchase {
  id: string;
  order_number: string;
  customer_email: string;
  order_date: string;
  order_status: string;
  order_total_cents: number;
  transaction_id?: string;
  gateway_transaction_id?: string;
  legacy_user_id?: string;
  refund_amount_cents?: number;
  [key: string]: any;
}

export async function generateMetadata({ params }: PurchaseDetailPageProps): Promise<Metadata> {
  return {
    title: `Compra #${params.id} | Admin Dashboard`,
    description: 'Vista detallada de la compra'
  };
}

// ==================== DATA FETCHING ====================

async function getPurchaseDetail(id: string) {
  try {
    const supabase = createClient();

    // 🚀 TIMEOUT WRAPPER: Evita queries colgadas  
    const withTimeout = (promise: any, ms = 5000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), ms)
        )
      ]);
    };

    // ✅ PASO 1: Fetch purchase básico (crítico)
    const { data: purchase, error } = await withTimeout(
      supabase
        .from('purchases')
        .select('*')
        .eq('id', id)
        .single()
    ) as any;

    if (error || !purchase) {
      console.error('Error fetching purchase:', error);
      return null;
    }

    const typedPurchase = purchase as Purchase;
    const stripePaymentId = typedPurchase.transaction_id || typedPurchase.gateway_transaction_id;

    // 🔥 PASO 2: Ejecutar TODAS las queries restantes EN PARALELO
    // Esto reduce el tiempo total de 6 queries secuenciales (~6s) a 1 query paralela (~1s)
    const [
      customerResult,
      paymentIntentResult,
      userIdResult,
      invoicesResult,
      refundsResult
    ] = await Promise.allSettled([
      // Query 1: Customer info - buscar por legacy_user_id O por email
      typedPurchase.legacy_user_id 
        ? withTimeout(
            supabase
              .from('users')
              .select('id, email, total_lifetime_spent, purchase_count, city, country')
              .eq('id', typedPurchase.legacy_user_id)
              .single()
          )
        : typedPurchase.customer_email
          ? withTimeout(
              supabase
                .from('users')
                .select('id, email, total_lifetime_spent, purchase_count, city, country')
                .eq('email', typedPurchase.customer_email)
                .single()
            )
          : Promise.resolve({ data: null, error: null }),

      // Query 2: Payment intent
      stripePaymentId
        ? withTimeout(
            supabase
              .from('payment_intents')
              .select('*')
              .eq('stripe_payment_intent_id', stripePaymentId)
              .single()
          )
        : Promise.resolve({ data: null, error: null }),

      // Query 3: User ID por email (fallback)
      !typedPurchase.legacy_user_id && typedPurchase.customer_email
        ? withTimeout(
            supabase
              .from('users')
              .select('id')
              .eq('email', typedPurchase.customer_email)
              .single()
          )
        : Promise.resolve({ data: null, error: null }),

      // Query 4: Invoices (solo si tenemos userId)
      typedPurchase.legacy_user_id
        ? withTimeout(
            supabase
              .from('invoices')
              .select('*')
              .eq('user_id', typedPurchase.legacy_user_id)
              .order('created', { ascending: false })
              .limit(1)
          )
        : Promise.resolve({ data: null, error: null }),

      // Query 5: Refunds
      typedPurchase.refund_amount_cents && typedPurchase.refund_amount_cents > 0 && stripePaymentId
        ? withTimeout(
            supabase
              .from('payment_intents')
              .select('*')
              .eq('stripe_payment_intent_id', stripePaymentId)
              .gt('refund_amount_cents', 0)
          )
        : Promise.resolve({ data: null, error: null })
    ]);

    // Extraer datos de forma segura
    const customerInfo = customerResult.status === 'fulfilled' && (customerResult.value as any)?.data 
      ? (customerResult.value as any).data 
      : null;

    const paymentIntent = paymentIntentResult.status === 'fulfilled' && (paymentIntentResult.value as any)?.data
      ? (paymentIntentResult.value as any).data
      : null;

    // Determinar userId final - priorizar customerInfo.id si existe
    let userId = customerInfo?.id || typedPurchase.legacy_user_id;
    if (!userId && userIdResult.status === 'fulfilled' && (userIdResult.value as any)?.data) {
      userId = ((userIdResult.value as any).data as any).id;
    }

    // Invoice (puede venir del query 4, o necesitamos fetch adicional)
    let invoice = null;
    if (invoicesResult.status === 'fulfilled' && (invoicesResult.value as any)?.data) {
      const invoices = Array.isArray((invoicesResult.value as any).data) 
        ? (invoicesResult.value as any).data 
        : [(invoicesResult.value as any).data];
      if (invoices.length > 0) {
        invoice = invoices[0];
      }
    } else if (userId && !typedPurchase.legacy_user_id) {
      // Fallback: si userId viene del email, fetch invoice aparte
      try {
        const { data: invoices } = await withTimeout(
          supabase
            .from('invoices')
            .select('*')
            .eq('user_id', userId)
            .order('created', { ascending: false })
            .limit(1)
        ) as any;
        if (invoices && invoices.length > 0) {
          invoice = invoices[0];
        }
      } catch (e) {
        // Ignorar error silenciosamente
      }
    }

    const refunds = refundsResult.status === 'fulfilled' && (refundsResult.value as any)?.data
      ? (Array.isArray((refundsResult.value as any).data) ? (refundsResult.value as any).data : [(refundsResult.value as any).data])
      : [];

    return {
      purchase: typedPurchase,
      customerInfo,
      paymentIntent,
      invoice,
      refunds
    };

  } catch (error) {
    console.error('Error in getPurchaseDetail:', error);
    return null;
  }
}

// ==================== PAGE ====================

export default async function PurchaseDetailPage({ params }: PurchaseDetailPageProps) {
  const data = await getPurchaseDetail(params.id);

  if (!data || !data.purchase) {
    notFound();
  }

  const { purchase, customerInfo, paymentIntent, invoice, refunds } = data;

  return (
    <div className="space-y-6">
      {/* Header con Breadcrumb */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/compras"
          className="p-2 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link href="/admin" className="hover:text-apidevs-primary transition-colors">
              Admin
            </Link>
            <span>/</span>
            <Link href="/admin/compras" className="hover:text-apidevs-primary transition-colors">
              Compras
            </Link>
            <span>/</span>
            <span className="text-white">#{purchase.order_number}</span>
          </div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-apidevs-primary" />
            Detalle de Compra
          </h1>
        </div>
      </div>

      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Info de la Compra */}
          <PurchaseInfoCard purchase={purchase} />

          {/* 3. Producto/Servicio */}
          <ProductInfoCard purchase={purchase} />

          {/* 4. Payment Details */}
          <PaymentDetailsCard 
            purchase={purchase} 
            paymentIntent={paymentIntent}
            invoice={invoice}
          />

          {/* 5. Refunds (solo si existen) */}
          {refunds.length > 0 && (
            <RefundsCard refunds={refunds} purchase={purchase} />
          )}
        </div>

        {/* Columna Lateral (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          {/* 2. Cliente */}
          <CustomerInfoCard 
            purchase={purchase}
            customerInfo={customerInfo}
          />

          {/* 6. Acciones Admin */}
          <AdminActionsCard 
            purchase={purchase}
            hasRefunds={refunds.length > 0}
            invoice={invoice}
          />
        </div>
      </div>
    </div>
  );
}

