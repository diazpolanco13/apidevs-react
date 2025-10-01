import Link from 'next/link';
import {
  UserPlusIcon,
  EnvelopeIcon,
  ChartPieIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function QuickActions() {
  const actions = [
    {
      name: 'Añadir Usuario Manual',
      description: 'Registrar un nuevo usuario o cliente legacy.',
      icon: UserPlusIcon,
      href: '/admin/users/add'
    },
    {
      name: 'Enviar Campaña Email',
      description: 'Crear y enviar un email a un segmento de usuarios.',
      icon: EnvelopeIcon,
      href: '/admin/campaigns/email/new'
    },
    {
      name: 'Ver Reporte de Ingresos',
      description: 'Acceder a un análisis detallado de los ingresos.',
      icon: ChartPieIcon,
      href: '/admin/analytics/revenue'
    },
    {
      name: 'Sincronizar Datos Stripe',
      description: 'Forzar una sincronización manual de productos y precios.',
      icon: ArrowPathIcon,
      href: '/admin/settings/sync-stripe'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Acciones Rápidas</h3>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-apidevs-primary/50 rounded-xl transition-all group"
          >
            <div className="w-10 h-10 bg-apidevs-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-apidevs-primary/30 transition-colors">
              <action.icon className="h-5 w-5 text-apidevs-primary" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white mb-0.5 group-hover:text-apidevs-primary transition-colors truncate">
                {action.name}
              </h4>
              <p className="text-sm text-gray-400 line-clamp-1">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}