import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';
import PurchaseInfoCard from '@/components/admin/purchases/detail/PurchaseInfoCard';
// @ts-expect-error - Component exists, TS declaration missing
import CustomerInfoCard from '@/components/admin/purchases/detail/CustomerInfoCard';
// @ts-expect-error - Component exists, TS declaration missing
import ProductInfoCard from '@/components/admin/purchases/detail/ProductInfoCard';
// @ts-expect-error - Component exists, TS declaration missing
import PaymentDetailsCard from '@/components/admin/purchases/detail/PaymentDetailsCard';
// @ts-expect-error - Component exists, TS declaration missing
import RefundsCard from '@/components/admin/purchases/detail/RefundsCard';
// @ts-expect-error - Component exists, TS declaration missing
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

    // Fetch purchase básico
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !purchase) {
      console.error('Error fetching purchase:', error);
      return null;
    }

    const typedPurchase = purchase as Purchase;

    // Fetch customer info (si hay legacy_user_id)
    let customerInfo = null;
    if (typedPurchase.legacy_user_id) {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, total_lifetime_spent, purchase_count, city, country')
        .eq('id', typedPurchase.legacy_user_id)
        .single();
      
      if (user) {
        customerInfo = user;
      }
    }

    // Fetch related payment intents
    let paymentIntent = null;
    const stripePaymentId = typedPurchase.transaction_id || typedPurchase.gateway_transaction_id;
    
    if (stripePaymentId) {
      const { data: pi } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('stripe_payment_intent_id', stripePaymentId)
        .single();
      
      if (pi) {
        paymentIntent = pi;
      }
    }

    // Fetch invoice del usuario
    let invoice = null;
    let userId = typedPurchase.legacy_user_id;
    
    if (!userId && typedPurchase.customer_email) {
      const { data: activeUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', typedPurchase.customer_email)
        .single();
      
      if (activeUser && (activeUser as any).id) {
        userId = (activeUser as any).id;
      }
    }
    
    if (userId) {
      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created', { ascending: false});
      
      if (invoices && invoices.length > 0) {
        invoice = invoices[0];
      }
    }

    // Fetch refunds (si hay refund_amount)
    const refunds: any[] = [];
    if (typedPurchase.refund_amount_cents && typedPurchase.refund_amount_cents > 0 && stripePaymentId) {
      // Buscar en payment_intents con refund_amount > 0
      const { data: refundData } = await supabase
        .from('payment_intents')
        .select('*')
        .eq('stripe_payment_intent_id', stripePaymentId)
        .gt('refund_amount_cents', 0);
      
      if (refundData) {
        refunds.push(...refundData);
      }
    }

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

