import { 
  UserIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  CalendarIcon,
  ShieldCheckIcon,
  TagIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  full_name: string;
  country: string;
  city: string;
  phone: string;
  postal_code: string;
  address: string;
  wordpress_username: string;
  billing_email: string;
  wordpress_created_at: string;
  migration_status: string;
  migrated_at: string;
  customer_type: string;
  wordpress_customer_id: string;
  reactivation_status: string;
  reactivated_at: string;
  first_new_subscription_id: string;
  reactivation_campaign: string;
  days_to_reactivation: number;
  created_at: string;
  updated_at: string;
  legacy_benefits: {
    early_access: boolean;
    priority_support: boolean;
    exclusive_indicators: boolean;
    grandfathered_pricing: boolean;
  };
  legacy_discount_percentage: number;
}

interface UserProfileCardProps {
  user: User;
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      contacted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      reactivated: 'bg-green-500/20 text-green-400 border-green-500/30',
      declined: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    const labels = {
      pending: 'Pendiente',
      contacted: 'Contactado',
      reactivated: 'Reactivado',
      declined: 'Rechazado'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg p-6">
        {/* Header with avatar */}
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-apidevs-primary to-green-400 rounded-full flex items-center justify-center mr-4">
            <span className="text-black font-bold text-xl">
              {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {user.full_name || 'Usuario sin nombre'}
            </h2>
            <p className="text-sm text-gray-400">@{user.wordpress_username}</p>
            <p className="text-xs text-gray-500">ID: {user.wordpress_customer_id}</p>
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-6">
          {getStatusBadge(user.reactivation_status)}
        </div>

        {/* Contact information */}
        <div className="space-y-4">
          <div className="flex items-start text-sm">
            <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white">{user.email}</p>
              {user.billing_email && user.billing_email !== user.email && (
                <p className="text-gray-400 text-xs">Facturación: {user.billing_email}</p>
              )}
            </div>
          </div>

          {user.phone && (
            <div className="flex items-center text-sm">
              <PhoneIcon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
              <p className="text-white">{user.phone}</p>
            </div>
          )}

          {(user.country || user.city) && (
            <div className="flex items-start text-sm">
              <MapPinIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white">
                  {user.city && user.country ? `${user.city}, ${user.country}` : user.country || user.city}
                </p>
                {user.postal_code && (
                  <p className="text-gray-400 text-xs">CP: {user.postal_code}</p>
                )}
                {user.address && (
                  <p className="text-gray-400 text-xs">{user.address}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center text-sm">
            <CalendarIcon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
            <div>
              <p className="text-white">
                Registro: {new Date(user.wordpress_created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-gray-400 text-xs">
                WordPress: {new Date(user.wordpress_created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          <div className="flex items-center text-sm">
            <UserIcon className="h-4 w-4 text-gray-400 mr-3 flex-shrink-0" />
            <p className="text-white capitalize">{user.customer_type}</p>
          </div>
        </div>
      </div>

      {/* Migration Info Card */}
      <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ArrowPathIcon className="h-4 w-4 text-blue-400 mr-2" />
          <h3 className="text-sm font-semibold text-white">Información de Migración</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Estado:</span>
            <span className="text-white capitalize">{user.migration_status}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Migrado:</span>
            <span className="text-white">
              {new Date(user.migrated_at).toLocaleDateString('es-ES')}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">WordPress ID:</span>
            <span className="text-white font-mono text-xs">{user.wordpress_customer_id}</span>
          </div>
          {user.reactivation_campaign && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Campaña:</span>
              <span className="text-white text-xs">{user.reactivation_campaign}</span>
            </div>
          )}
        </div>
      </div>

      {/* Legacy Benefits Card */}
      {user.legacy_benefits && (
        <div className="bg-black/30 backdrop-blur-xl border border-white/10 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-4 w-4 text-apidevs-primary mr-2" />
            <h3 className="text-sm font-semibold text-white">Beneficios Legacy</h3>
          </div>
          <div className="space-y-3">
            {user.legacy_benefits.early_access && (
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3 flex-shrink-0"></div>
                <span className="text-green-400">Acceso temprano a productos</span>
              </div>
            )}
            {user.legacy_benefits.priority_support && (
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-3 flex-shrink-0"></div>
                <span className="text-blue-400">Soporte prioritario 24/7</span>
              </div>
            )}
            {user.legacy_benefits.exclusive_indicators && (
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-purple-400 rounded-full mr-3 flex-shrink-0"></div>
                <span className="text-purple-400">Indicadores exclusivos</span>
              </div>
            )}
            {user.legacy_benefits.grandfathered_pricing && (
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3 flex-shrink-0"></div>
                <span className="text-yellow-400">Precios grandfathered</span>
              </div>
            )}
          </div>
          
          {user.legacy_discount_percentage && (
            <div className="mt-4 p-3 bg-apidevs-primary/10 border border-apidevs-primary/20 rounded-md">
              <div className="flex items-center">
                <TagIcon className="h-5 w-5 text-apidevs-primary mr-2 flex-shrink-0" />
                <div>
                  <span className="text-sm font-semibold text-apidevs-primary">
                    {user.legacy_discount_percentage}% descuento legacy
                  </span>
                  <p className="text-xs text-apidevs-primary/70 mt-1">
                    Aplicable a todos los productos nuevos
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
