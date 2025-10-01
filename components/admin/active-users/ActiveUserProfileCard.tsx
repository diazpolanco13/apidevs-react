'use client';

import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  User, 
  Shield,
  ExternalLink,
  CreditCard
} from 'lucide-react';

interface AuthUser {
  user?: {
    email?: string;
    email_confirmed_at?: string;
    app_metadata?: {
      provider?: string;
    };
  };
}

interface ActiveUserProfileCardProps {
  user: {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    country: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    address: string | null;
    timezone: string | null;
    tradingview_username: string | null;
    telegram_username: string | null;
    onboarding_completed: boolean | null;
    customer_tier: string | null;
    loyalty_discount_percentage: number | null;
  };
  authUser: AuthUser | null;
  primaryEmail: string;
  emailVerified: boolean;
  stripeCustomerId?: string | null;
}

export default function ActiveUserProfileCard({
  user,
  authUser,
  primaryEmail,
  emailVerified,
  stripeCustomerId
}: ActiveUserProfileCardProps) {
  
  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
      
      {/* Avatar y Nombre */}
      <div className="text-center">
        {user.avatar_url ? (
          <img 
            src={user.avatar_url} 
            alt={user.full_name || 'Avatar'}
            className="w-28 h-28 rounded-full border-4 border-apidevs-primary mx-auto mb-4 object-cover"
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-apidevs-primary to-green-400 flex items-center justify-center text-black text-4xl font-bold mx-auto mb-4 shadow-xl">
            {(user.full_name || user.email || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        
        <h3 className="text-xl font-bold text-white mb-1">
          {user.full_name || 'Usuario sin nombre'}
        </h3>
        
        {user.customer_tier && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30 text-xs font-medium">
            <Shield className="w-3 h-3" />
            {user.customer_tier}
            {user.loyalty_discount_percentage && (
              <span className="ml-1">• {user.loyalty_discount_percentage}% OFF</span>
            )}
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>

      {/* Información de Contacto */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-apidevs-primary" />
          Información Personal
        </h4>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-gray-400 text-xs mb-0.5">Email</p>
              <p className="text-white font-medium break-all">{primaryEmail}</p>
              {authUser && primaryEmail !== 'Sin email' && (
                <span className={`text-xs ${emailVerified ? 'text-green-400' : 'text-yellow-400'}`}>
                  {emailVerified ? '✓ Verificado' : '⚠ Sin verificar'}
                </span>
              )}
            </div>
          </div>

          {user.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs mb-0.5">Teléfono</p>
                <p className="text-white">{user.phone}</p>
              </div>
            </div>
          )}

          {(user.city || user.country) && (
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs mb-0.5">Ubicación</p>
                <p className="text-white">
                  {[user.address, user.city, user.state, user.country]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {user.postal_code && (
                  <p className="text-gray-500 text-xs mt-0.5">CP: {user.postal_code}</p>
                )}
              </div>
            </div>
          )}

          {user.timezone && (
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-gray-400 text-xs mb-0.5">Timezone</p>
                <p className="text-white">{user.timezone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cuentas Conectadas */}
      {(user.tradingview_username || user.telegram_username) && (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-apidevs-primary" />
              Cuentas Conectadas
            </h4>
            
            <div className="space-y-2 text-sm">
              {user.tradingview_username && (
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-xs">TradingView</p>
                    <p className="text-white font-mono text-xs">@{user.tradingview_username}</p>
                  </div>
                  <a
                    href={`https://www.tradingview.com/u/${user.tradingview_username}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-apidevs-primary hover:text-green-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {user.telegram_username && (
                <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-gray-400 text-xs">Telegram</p>
                    <p className="text-white font-mono text-xs">@{user.telegram_username}</p>
                  </div>
                  <a
                    href={`https://t.me/${user.telegram_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-apidevs-primary hover:text-green-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Información Técnica */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
      
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-apidevs-primary" />
          Información Técnica
        </h4>
        
        <div className="space-y-2 text-xs">
          {authUser && (
            <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
              <span className="text-gray-400">Proveedor Auth</span>
              <span className="text-white font-medium capitalize">
                {authUser.user?.app_metadata?.provider || 'email'}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
            <span className="text-gray-400">User ID</span>
            <code className="text-apidevs-primary text-[10px]" title={user.id}>
              {user.id.slice(0, 8)}...
            </code>
          </div>

          {stripeCustomerId && (
            <div className="flex flex-col gap-1 p-2 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" />
                  Stripe Customer
                </span>
              </div>
              <code className="text-purple-400 text-[10px] break-all" title={stripeCustomerId}>
                {stripeCustomerId}
              </code>
              <a
                href={`https://dashboard.stripe.com/customers/${stripeCustomerId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1 mt-1"
              >
                Ver en Stripe
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

