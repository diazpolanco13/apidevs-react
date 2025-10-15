import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import IAMainView from '@/components/admin/ia-config/IAMainView';
import { RefreshCw } from 'lucide-react';

export default async function AIConfigPage() {
  const supabase = await createClient();
  
  // Obtener configuración activa del chatbot
  // @ts-ignore - ai_configuration table not in types yet
  const { data: config, error } = await (supabase as any)
    .from('ai_configuration')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error loading AI configuration:', error);
  }

  return (
    <Suspense fallback={<ConfigLoadingSkeleton />}>
      <IAMainView initialConfig={config} />
    </Suspense>
  );
}

function ConfigLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main config skeleton */}
      <div className="lg:col-span-2 space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Sidebar skeleton */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-700 rounded w-2/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-10 bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Configuración IA - Admin Dashboard',
  description: 'Configuración del asistente de inteligencia artificial de APIDevs',
};

