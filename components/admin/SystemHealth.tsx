import { createClient } from '@/utils/supabase/server';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  message: string;
  lastCheck: string;
  responseTime?: number;
}

async function checkSupabaseHealth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  try {
    const supabase = createClient();
    
    // Simple query para verificar conectividad
    const { error } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        name: 'Supabase Database',
        status: 'down',
        message: `Error: ${error.message}`,
        lastCheck: new Date().toISOString(),
        responseTime
      };
    }
    
    // Check si está lento (rate limiting?)
    if (responseTime > 2000) {
      return {
        name: 'Supabase Database',
        status: 'degraded',
        message: `Respuesta lenta (${responseTime}ms) - posible rate limiting`,
        lastCheck: new Date().toISOString(),
        responseTime
      };
    }
    
    return {
      name: 'Supabase Database',
      status: 'operational',
      message: `Conectado (${responseTime}ms)`,
      lastCheck: new Date().toISOString(),
      responseTime
    };
  } catch (error: any) {
    return {
      name: 'Supabase Database',
      status: 'down',
      message: `Error de conexión: ${error?.message || 'Unknown'}`,
      lastCheck: new Date().toISOString(),
      responseTime: Date.now() - startTime
    };
  }
}

async function checkStripeHealth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  try {
    // Verificar que las keys de Stripe están configuradas
    const hasStripeKeys = !!(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
      process.env.STRIPE_SECRET_KEY
    );
    
    if (!hasStripeKeys) {
      return {
        name: 'Stripe API',
        status: 'down',
        message: 'Keys de Stripe no configuradas',
        lastCheck: new Date().toISOString()
      };
    }
    
    // Verificar que hay productos en la base de datos (indicador de sincronización)
    const supabase = createClient();
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const responseTime = Date.now() - startTime;
    
    if (error || !count || count === 0) {
      return {
        name: 'Stripe API',
        status: 'degraded',
        message: 'Sin productos sincronizados',
        lastCheck: new Date().toISOString(),
        responseTime
      };
    }
    
    return {
      name: 'Stripe API',
      status: 'operational',
      message: `${count} productos sincronizados`,
      lastCheck: new Date().toISOString(),
      responseTime
    };
  } catch (error: any) {
    return {
      name: 'Stripe API',
      status: 'down',
      message: `Error: ${error?.message || 'Unknown'}`,
      lastCheck: new Date().toISOString(),
      responseTime: Date.now() - startTime
    };
  }
}

async function checkTradingViewService(): Promise<ServiceStatus> {
  const startTime = Date.now();
  try {
    const microserviceUrl = process.env.TRADINGVIEW_MICROSERVICE_URL || 'http://185.218.124.241:5001';
    
    // Hacer un fetch al endpoint de health del microservicio
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
    
    const response = await fetch(`${microserviceUrl}/`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        name: 'TradingView Service',
        status: 'down',
        message: `HTTP ${response.status}`,
        lastCheck: new Date().toISOString(),
        responseTime
      };
    }
    
    const data = await response.json();
    
    return {
      name: 'TradingView Service',
      status: 'operational',
      message: `${data.version || 'v2.0.0'} - ${responseTime}ms`,
      lastCheck: new Date().toISOString(),
      responseTime
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    if (error.name === 'AbortError') {
      return {
        name: 'TradingView Service',
        status: 'down',
        message: 'Timeout (>5s)',
        lastCheck: new Date().toISOString(),
        responseTime
      };
    }
    
    return {
      name: 'TradingView Service',
      status: 'down',
      message: `Error de conexión: ${error?.message || 'Unknown'}`,
      lastCheck: new Date().toISOString(),
      responseTime
    };
  }
}

async function checkSupabaseAuth(): Promise<ServiceStatus> {
  const startTime = Date.now();
  try {
    const supabase = createClient();
    
    // Verificar que el servicio de auth está disponible
    const { error } = await supabase.auth.getSession();
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        name: 'Supabase Auth',
        status: 'degraded',
        message: error.message,
        lastCheck: new Date().toISOString(),
        responseTime
      };
    }
    
    return {
      name: 'Supabase Auth',
      status: 'operational',
      message: `Servicio activo (${responseTime}ms)`,
      lastCheck: new Date().toISOString(),
      responseTime
    };
  } catch (error: any) {
    return {
      name: 'Supabase Auth',
      status: 'down',
      message: `Error: ${error?.message || 'Unknown'}`,
      lastCheck: new Date().toISOString(),
      responseTime: Date.now() - startTime
    };
  }
}

export default async function SystemHealth() {
  // Ejecutar todos los health checks en paralelo
  const [supabaseHealth, stripeHealth, tradingViewHealth, authHealth] = await Promise.all([
    checkSupabaseHealth(),
    checkStripeHealth(),
    checkTradingViewService(),
    checkSupabaseAuth()
  ]);

  const allServices = [supabaseHealth, stripeHealth, tradingViewHealth, authHealth];
  const operationalCount = allServices.filter(s => s.status === 'operational').length;
  const degradedCount = allServices.filter(s => s.status === 'degraded').length;
  const downCount = allServices.filter(s => s.status === 'down').length;

  // Determinar estado general del sistema
  const systemStatus = downCount > 0 
    ? 'critical' 
    : degradedCount > 0 
    ? 'warning' 
    : 'healthy';

  const statusConfig = {
    healthy: {
      color: 'green',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
      borderColor: 'border-green-500/30',
      icon: '✓',
      iconBg: 'bg-green-500',
      title: 'Sistema Operativo al 100%',
      textColor: 'text-green-400'
    },
    warning: {
      color: 'yellow',
      bgGradient: 'from-yellow-500/10 to-orange-500/10',
      borderColor: 'border-yellow-500/30',
      icon: '⚠',
      iconBg: 'bg-yellow-500',
      title: 'Sistema con Degradación Parcial',
      textColor: 'text-yellow-400'
    },
    critical: {
      color: 'red',
      bgGradient: 'from-red-500/10 to-rose-500/10',
      borderColor: 'border-red-500/30',
      icon: '✕',
      iconBg: 'bg-red-500',
      title: 'Sistema con Servicios Caídos',
      textColor: 'text-red-400'
    }
  };

  const config = statusConfig[systemStatus];

  return (
    <div className={`bg-gradient-to-r ${config.bgGradient} border ${config.borderColor} rounded-2xl p-6`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-bold text-xl">{config.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">
            {config.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {allServices.map((service) => {
              const ServiceIcon = 
                service.status === 'operational' ? CheckCircle2 :
                service.status === 'degraded' ? AlertCircle : XCircle;
              
              const iconColor = 
                service.status === 'operational' ? 'text-green-400' :
                service.status === 'degraded' ? 'text-yellow-400' : 'text-red-400';
              
              return (
                <div 
                  key={service.name}
                  className="bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <ServiceIcon className={`w-4 h-4 ${iconColor} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {service.name}
                      </p>
                      <p className={`text-xs ${iconColor} truncate`}>
                        {service.message}
                      </p>
                    </div>
                  </div>
                  {service.responseTime && (
                    <p className="text-xs text-gray-500">
                      Latencia: {service.responseTime}ms
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>{operationalCount} operacionales</span>
            </div>
            {degradedCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                <span>{degradedCount} degradados</span>
              </div>
            )}
            {downCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <span>{downCount} caídos</span>
              </div>
            )}
            <div className="ml-auto text-gray-500 text-xs">
              Última verificación: {new Date().toLocaleTimeString('es-ES')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

